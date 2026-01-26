import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useUserData } from '@/components/hooks/useUserData';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { Activity, Droplet, Brain, Moon, Trophy, TrendingUp, Users, Calendar, Award } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const ACTIVITY_ICONS = {
  steps: Activity,
  hydration: Droplet,
  meditation: Brain,
  sleep: Moon,
  exercise: Activity
};

const ACTIVITY_COLORS = {
  steps: 'from-blue-500 to-cyan-500',
  hydration: 'from-cyan-500 to-blue-400',
  meditation: 'from-purple-500 to-pink-500',
  sleep: 'from-indigo-500 to-purple-500',
  exercise: 'from-green-500 to-emerald-500'
};

export default function WellnessDashboard() {
  const { user, loading: userLoading } = useUserData();
  const [logDate, setLogDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [logValues, setLogValues] = useState({});
  const queryClient = useQueryClient();
  
  const { data: challenges = [], isLoading: challengesLoading } = useQuery({
    queryKey: ['wellnessChallenges', 'active'],
    queryFn: () => base44.entities.WellnessChallenge.filter({ status: 'active' })
  });
  
  const { data: myGoals = [] } = useQuery({
    queryKey: ['wellnessGoals', user?.email],
    queryFn: () => base44.entities.WellnessGoal.filter({ user_email: user.email }),
    enabled: !!user?.email
  });
  
  const { data: todayLogs = [] } = useQuery({
    queryKey: ['wellnessLogs', user?.email, logDate],
    queryFn: () => base44.entities.WellnessLog.filter({ 
      user_email: user.email,
      log_date: logDate
    }),
    enabled: !!user?.email
  });
  
  const { data: leaderboard = [] } = useQuery({
    queryKey: ['wellnessLeaderboard'],
    queryFn: async () => {
      const logs = await base44.entities.WellnessLog.filter({});
      const userStats = logs.reduce((acc, log) => {
        if (!acc[log.user_email]) {
          acc[log.user_email] = { total: 0, logs: 0 };
        }
        acc[log.user_email].total += log.value;
        acc[log.user_email].logs += 1;
        return acc;
      }, {});
      
      return Object.entries(userStats)
        .map(([email, stats]) => ({ email, total: stats.total, count: stats.logs }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 10);
    }
  });
  
  const logMutation = useMutation({
    mutationFn: async (logData) => {
      const log = await base44.entities.WellnessLog.create(logData);
      
      // Update goal progress
      const goal = myGoals.find(g => g.challenge_id === logData.challenge_id);
      if (goal) {
        const newProgress = goal.current_progress + logData.value;
        const progressPercentage = Math.min(100, (newProgress / goal.target_value) * 100);
        
        await base44.entities.WellnessGoal.update(goal.id, {
          current_progress: newProgress,
          progress_percentage: progressPercentage,
          status: progressPercentage >= 100 ? 'completed' : 'in_progress'
        });
        
        // Award points if goal completed
        if (progressPercentage >= 100 && goal.status !== 'completed') {
          const challenge = challenges.find(c => c.id === logData.challenge_id);
          if (challenge?.points_reward) {
            const [userPoints] = await base44.entities.UserPoints.filter({ user_email: user.email });
            await base44.entities.UserPoints.update(userPoints.id, {
              total_points: (userPoints.total_points || 0) + challenge.points_reward
            });
            
            toast.success(`Goal completed! Earned ${challenge.points_reward} points!`);
          }
        }
      }
      
      return log;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['wellnessLogs']);
      queryClient.invalidateQueries(['wellnessGoals']);
      queryClient.invalidateQueries(['wellnessLeaderboard']);
      queryClient.invalidateQueries(['userPoints']);
      toast.success('Activity logged!');
      setLogValues({});
    }
  });
  
  const joinChallengeMutation = useMutation({
    mutationFn: async (challengeId) => {
      const challenge = challenges.find(c => c.id === challengeId);
      
      await base44.entities.WellnessGoal.create({
        user_email: user.email,
        challenge_id: challengeId,
        goal_type: challenge.challenge_type,
        target_value: challenge.goal_value,
        current_progress: 0,
        status: 'in_progress',
        started_at: new Date().toISOString()
      });
      
      await base44.entities.WellnessChallenge.update(challengeId, {
        participant_count: (challenge.participant_count || 0) + 1
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['wellnessGoals']);
      queryClient.invalidateQueries(['wellnessChallenges']);
      toast.success('Joined challenge!');
    }
  });
  
  if (userLoading || challengesLoading) return <LoadingSpinner />;
  
  const activeGoals = myGoals.filter(g => g.status === 'in_progress');
  const completedGoals = myGoals.filter(g => g.status === 'completed');
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-int-navy">Wellness Dashboard</h1>
          <p className="text-slate-600">Track your health goals and compete with your team</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-int-orange hover:bg-int-orange-dark">
              Log Activity
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Log Wellness Activity</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Date</Label>
                <Input
                  type="date"
                  value={logDate}
                  onChange={(e) => setLogDate(e.target.value)}
                />
              </div>
              
              {activeGoals.map(goal => {
                const challenge = challenges.find(c => c.id === goal.challenge_id);
                if (!challenge) return null;
                
                const Icon = ACTIVITY_ICONS[goal.goal_type];
                
                return (
                  <div key={goal.id} className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {challenge.title} ({goal.goal_type})
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder={`Enter ${challenge.goal_unit}`}
                        value={logValues[goal.id] || ''}
                        onChange={(e) => setLogValues({
                          ...logValues,
                          [goal.id]: parseInt(e.target.value) || 0
                        })}
                      />
                      <span className="flex items-center text-sm text-slate-600">
                        {challenge.goal_unit}
                      </span>
                    </div>
                  </div>
                );
              })}
              
              <Button
                onClick={() => {
                  Object.entries(logValues).forEach(([goalId, value]) => {
                    if (value > 0) {
                      const goal = myGoals.find(g => g.id === goalId);
                      const challenge = challenges.find(c => c.id === goal.challenge_id);
                      
                      logMutation.mutate({
                        user_email: user.email,
                        challenge_id: goal.challenge_id,
                        log_date: logDate,
                        activity_type: goal.goal_type,
                        value,
                        unit: challenge.goal_unit,
                        source: 'manual'
                      });
                    }
                  });
                }}
                disabled={logMutation.isLoading}
                className="w-full"
              >
                {logMutation.isLoading ? 'Logging...' : 'Log Activities'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      <Tabs defaultValue="my-goals">
        <TabsList>
          <TabsTrigger value="my-goals">My Goals ({activeGoals.length})</TabsTrigger>
          <TabsTrigger value="challenges">Available Challenges</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>
        
        <TabsContent value="my-goals" className="space-y-4">
          {activeGoals.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Activity className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                <p className="text-slate-600">No active wellness goals. Join a challenge to get started!</p>
              </CardContent>
            </Card>
          ) : (
            activeGoals.map(goal => {
              const challenge = challenges.find(c => c.id === goal.challenge_id);
              if (!challenge) return null;
              
              const Icon = ACTIVITY_ICONS[goal.goal_type];
              const colorClass = ACTIVITY_COLORS[goal.goal_type];
              
              return (
                <Card key={goal.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-lg bg-gradient-to-br ${colorClass}`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <CardTitle>{challenge.title}</CardTitle>
                          <CardDescription>
                            Goal: {challenge.goal_value} {challenge.goal_unit} {challenge.frequency}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-int-orange">
                          {Math.round(goal.progress_percentage)}%
                        </p>
                        <p className="text-xs text-slate-500">Complete</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Progress: {goal.current_progress} / {goal.target_value}</span>
                        <span>Streak: {goal.streak_days} days</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full bg-gradient-to-r ${colorClass} transition-all`}
                          style={{ width: `${goal.progress_percentage}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
          
          {completedGoals.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-int-gold" />
                Completed Goals ({completedGoals.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {completedGoals.map(goal => {
                  const challenge = challenges.find(c => c.id === goal.challenge_id);
                  return (
                    <Card key={goal.id} className="border-int-gold/30 bg-int-gold/5">
                      <CardHeader>
                        <CardTitle className="text-base">{challenge?.title}</CardTitle>
                        <CardDescription>
                          Completed {format(new Date(goal.completed_at), 'MMM d, yyyy')}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="challenges" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {challenges.map(challenge => {
              const isJoined = myGoals.some(g => g.challenge_id === challenge.id);
              const Icon = ACTIVITY_ICONS[challenge.challenge_type];
              const colorClass = ACTIVITY_COLORS[challenge.challenge_type];
              
              return (
                <Card key={challenge.id} className="hover-lift">
                  <CardHeader>
                    <div className={`p-3 rounded-lg bg-gradient-to-br ${colorClass} w-fit mb-3`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle>{challenge.title}</CardTitle>
                    <CardDescription>{challenge.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-slate-500" />
                        <span className="text-slate-600">
                          {format(new Date(challenge.start_date), 'MMM d')} - {format(new Date(challenge.end_date), 'MMM d')}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-slate-500" />
                        <span className="text-slate-600">{challenge.participant_count} participants</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-int-orange" />
                        <span className="font-semibold text-int-orange">{challenge.points_reward} pts</span>
                      </div>
                    </div>
                    
                    <div className="pt-2 border-t">
                      <p className="text-sm font-semibold mb-1">Goal:</p>
                      <p className="text-2xl font-bold">
                        {challenge.goal_value} <span className="text-base text-slate-500">{challenge.goal_unit}</span>
                      </p>
                      <p className="text-xs text-slate-500 capitalize">{challenge.frequency}</p>
                    </div>
                    
                    {isJoined ? (
                      <Button variant="outline" disabled className="w-full">
                        Already Joined
                      </Button>
                    ) : (
                      <Button
                        onClick={() => joinChallengeMutation.mutate(challenge.id)}
                        disabled={joinChallengeMutation.isLoading}
                        className="w-full bg-int-orange hover:bg-int-orange-dark"
                      >
                        Join Challenge
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
        
        <TabsContent value="leaderboard" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-int-gold" />
                Wellness Leaderboard
              </CardTitle>
              <CardDescription>Top performers across all wellness activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {leaderboard.map((entry, index) => (
                  <div
                    key={entry.email}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      entry.email === user.email ? 'bg-int-orange/10 border border-int-orange/30' : 'bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        index === 0 ? 'bg-int-gold text-white' :
                        index === 1 ? 'bg-slate-400 text-white' :
                        index === 2 ? 'bg-amber-600 text-white' :
                        'bg-slate-200 text-slate-600'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold">{entry.email}</p>
                        <p className="text-xs text-slate-500">{entry.count} activities logged</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-int-orange">{entry.total.toLocaleString()}</p>
                      <p className="text-xs text-slate-500">total activity</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}