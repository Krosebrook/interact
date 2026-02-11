import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trophy, Award, Target, Star, Pin, Plus, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export default function GamificationShowcase({ userEmail, isOwnProfile }) {
  const queryClient = useQueryClient();
  const [showGoalDialog, setShowGoalDialog] = useState(false);
  const [goalTitle, setGoalTitle] = useState('');
  const [goalTarget, setGoalTarget] = useState(10);

  // Fetch user points
  const { data: userPoints } = useQuery({
    queryKey: ['user-points', userEmail],
    queryFn: async () => {
      const points = await base44.entities.UserPoints.filter({ user_email: userEmail });
      return points[0] || null;
    },
    enabled: !!userEmail
  });

  // Fetch badges
  const { data: badgeAwards = [] } = useQuery({
    queryKey: ['badge-awards', userEmail],
    queryFn: () => base44.entities.BadgeAward.filter({ user_email: userEmail }),
    enabled: !!userEmail
  });

  // Fetch all badges to get details
  const { data: allBadges = [] } = useQuery({
    queryKey: ['all-badges'],
    queryFn: () => base44.entities.Badge.list()
  });

  // Fetch challenge completions
  const { data: challengeCompletions = [] } = useQuery({
    queryKey: ['challenge-completions', userEmail],
    queryFn: () => base44.entities.ChallengeParticipation.filter({ 
      user_email: userEmail,
      status: 'completed'
    }),
    enabled: !!userEmail
  });

  // Fetch personal goals
  const { data: personalGoals = [] } = useQuery({
    queryKey: ['personal-goals', userEmail],
    queryFn: () => base44.entities.PersonalGoal.filter({ user_email: userEmail }),
    enabled: !!userEmail
  });

  // Create goal mutation
  const createGoalMutation = useMutation({
    mutationFn: (goalData) => base44.entities.PersonalGoal.create(goalData),
    onSuccess: () => {
      queryClient.invalidateQueries(['personal-goals']);
      setShowGoalDialog(false);
      setGoalTitle('');
      setGoalTarget(10);
      toast.success('Goal created!');
    }
  });

  // Toggle pin mutation
  const togglePinMutation = useMutation({
    mutationFn: ({ id, isPinned }) => base44.entities.BadgeAward.update(id, { is_pinned: !isPinned }),
    onSuccess: () => {
      queryClient.invalidateQueries(['badge-awards']);
      toast.success('Badge pinned updated');
    }
  });

  const earnedBadges = badgeAwards.map(award => ({
    ...award,
    badge: allBadges.find(b => b.id === award.badge_id)
  })).filter(a => a.badge);

  const pinnedBadges = earnedBadges.filter(a => a.is_pinned);
  
  // Calculate level progress
  const currentXP = userPoints?.xp || 0;
  const currentLevel = userPoints?.level || 1;
  const xpForNextLevel = currentLevel * 1000;
  const levelProgress = ((currentXP % 1000) / 1000) * 100;

  const handleCreateGoal = () => {
    createGoalMutation.mutate({
      user_email: userEmail,
      title: goalTitle,
      category: 'engagement',
      target_value: goalTarget,
      target_unit: 'activities',
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'suggested',
      ai_generated: false
    });
  };

  return (
    <div className="space-y-6">
      {/* Level & Tier Card */}
      <Card className="bg-gradient-to-br from-int-orange/10 to-purple-500/10 border-2 border-int-orange/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-slate-600">Current Level</p>
              <p className="text-3xl font-bold text-int-navy">Level {currentLevel}</p>
            </div>
            <Badge className="bg-int-orange text-white text-lg px-4 py-2">
              {userPoints?.tier || 'Bronze'}
            </Badge>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Progress to Level {currentLevel + 1}</span>
              <span className="font-semibold">{currentXP % 1000} / {xpForNextLevel} XP</span>
            </div>
            <Progress value={levelProgress} className="h-3" />
          </div>
          <div className="mt-4 text-sm text-slate-600">
            Total Points: <span className="font-bold text-int-orange">{userPoints?.total_points?.toLocaleString() || 0}</span>
          </div>
        </CardContent>
      </Card>

      {/* Pinned Achievements */}
      {pinnedBadges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Pin className="h-5 w-5 text-int-orange" />
              Pinned Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {pinnedBadges.map(({ badge, earned_date, id, is_pinned }) => (
                <div key={id} className="relative p-4 bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg border-2 border-amber-300 text-center">
                  {isOwnProfile && (
                    <button
                      onClick={() => togglePinMutation.mutate({ id, isPinned: is_pinned })}
                      className="absolute top-2 right-2 text-amber-600 hover:text-amber-800"
                    >
                      <Pin className="h-4 w-4 fill-current" />
                    </button>
                  )}
                  <div className="text-4xl mb-2">{badge.icon_url || '🏆'}</div>
                  <p className="font-semibold text-sm">{badge.badge_name}</p>
                  <Badge variant="outline" className="mt-1 text-xs">
                    {badge.rarity}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Badges */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-int-orange" />
              Earned Badges ({earnedBadges.length})
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {earnedBadges.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {earnedBadges.map(({ badge, earned_date, id, is_pinned }) => (
                <div key={id} className="relative p-3 bg-slate-50 rounded-lg border hover:shadow-md transition-shadow text-center group">
                  {isOwnProfile && (
                    <button
                      onClick={() => togglePinMutation.mutate({ id, isPinned: is_pinned })}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Pin className={`h-4 w-4 ${is_pinned ? 'fill-int-orange text-int-orange' : 'text-slate-400'}`} />
                    </button>
                  )}
                  <div className="text-3xl mb-2">{badge.icon_url || '🏅'}</div>
                  <p className="font-medium text-xs">{badge.badge_name}</p>
                  <Badge className={`mt-1 text-xs ${
                    badge.rarity === 'legendary' ? 'bg-purple-600' :
                    badge.rarity === 'epic' ? 'bg-blue-600' :
                    badge.rarity === 'rare' ? 'bg-green-600' : 'bg-slate-500'
                  }`}>
                    {badge.rarity}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <Award className="h-12 w-12 mx-auto mb-2 text-slate-300" />
              <p>No badges earned yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Challenge Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-int-orange" />
            Challenge Achievements ({challengeCompletions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {challengeCompletions.length > 0 ? (
            <div className="space-y-2">
              {challengeCompletions.slice(0, 5).map((completion) => (
                <div key={completion.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Challenge Completed</span>
                  </div>
                  <Badge className="bg-green-600 text-white">
                    +{completion.points_earned} pts
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <Trophy className="h-12 w-12 mx-auto mb-2 text-slate-300" />
              <p>No challenges completed yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Personal Goals */}
      {isOwnProfile && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-int-orange" />
                My Skill Development Goals
              </CardTitle>
              <Button 
                onClick={() => setShowGoalDialog(true)}
                size="sm"
                className="bg-int-orange hover:bg-[#C46322]"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Goal
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {personalGoals.length > 0 ? (
              <div className="space-y-4">
                {personalGoals.filter(g => g.status !== 'dismissed').map((goal) => (
                  <div key={goal.id} className="p-4 bg-slate-50 rounded-lg border">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-medium">{goal.title}</p>
                        <p className="text-xs text-slate-600 mt-1">{goal.description}</p>
                      </div>
                      <Badge className={
                        goal.status === 'completed' ? 'bg-green-600' :
                        goal.status === 'active' ? 'bg-blue-600' : 'bg-slate-400'
                      }>
                        {goal.status}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-slate-600">
                        <span>Progress</span>
                        <span>{goal.current_progress || 0} / {goal.target_value}</span>
                      </div>
                      <Progress value={goal.progress_percentage || 0} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <Target className="h-12 w-12 mx-auto mb-2 text-slate-300" />
                <p>No active goals. Set one to start tracking progress!</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create Goal Dialog */}
      <Dialog open={showGoalDialog} onOpenChange={setShowGoalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Skill Development Goal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Goal Title</Label>
              <Input
                value={goalTitle}
                onChange={(e) => setGoalTitle(e.target.value)}
                placeholder="e.g., Attend 10 learning events"
              />
            </div>
            <div>
              <Label>Target Value</Label>
              <Input
                type="number"
                value={goalTarget}
                onChange={(e) => setGoalTarget(parseInt(e.target.value))}
                min="1"
              />
            </div>
            <Button 
              onClick={handleCreateGoal}
              className="w-full bg-int-orange hover:bg-[#C46322]"
              disabled={!goalTitle || createGoalMutation.isPending}
            >
              Create Goal
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}