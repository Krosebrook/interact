import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useUserData } from '@/components/hooks/useUserData';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import WellnessInsightsPanel from '@/components/wellness/WellnessInsightsPanel';
import TeamWellnessLeaderboard from '@/components/wellness/TeamWellnessLeaderboard';
import { Activity, TrendingUp, Users, Calendar, Target } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function WellnessAnalyticsReport() {
  const { user, loading: userLoading } = useUserData(true, true);
  
  const { data: challenges } = useQuery({
    queryKey: ['wellnessChallenges'],
    queryFn: () => base44.entities.WellnessChallenge.filter({})
  });
  
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['wellnessAnalytics'],
    queryFn: async () => {
      const logs = await base44.asServiceRole.entities.WellnessLog.filter({});
      const goals = await base44.asServiceRole.entities.WellnessGoal.filter({});
      const participations = await base44.asServiceRole.entities.Participation.filter({});
      const recognitions = await base44.asServiceRole.entities.Recognition.filter({});
      
      // Aggregate by date
      const dailyActivity = logs.reduce((acc, log) => {
        const date = log.log_date;
        if (!acc[date]) {
          acc[date] = { date, steps: 0, meditation: 0, hydration: 0, logs: 0 };
        }
        acc[date].logs += 1;
        if (log.activity_type === 'steps') acc[date].steps += log.value;
        if (log.activity_type === 'meditation') acc[date].meditation += log.value;
        if (log.activity_type === 'hydration') acc[date].hydration += log.value;
        return acc;
      }, {});
      
      const dailyData = Object.values(dailyActivity)
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(-30);
      
      // User engagement correlation
      const userStats = {};
      logs.forEach(log => {
        if (!userStats[log.user_email]) {
          userStats[log.user_email] = {
            wellnessLogs: 0,
            events: 0,
            recognitions: 0
          };
        }
        userStats[log.user_email].wellnessLogs += 1;
      });
      
      participations.forEach(p => {
        if (userStats[p.user_email]) {
          userStats[p.user_email].events += 1;
        }
      });
      
      recognitions.forEach(r => {
        if (userStats[r.sender_email]) {
          userStats[r.sender_email].recognitions += 1;
        }
      });
      
      const correlationData = Object.entries(userStats).map(([email, stats]) => ({
        email,
        ...stats
      }));
      
      return {
        totalLogs: logs.length,
        activeUsers: new Set(logs.map(l => l.user_email)).size,
        completedGoals: goals.filter(g => g.status === 'completed').length,
        totalGoals: goals.length,
        dailyData,
        correlationData: correlationData.slice(0, 10)
      };
    },
    enabled: !!user
  });
  
  if (userLoading || isLoading) return <LoadingSpinner />;
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-int-navy">Wellness Analytics</h1>
        <p className="text-slate-600">Comprehensive wellness activity and engagement insights</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="h-4 w-4 text-int-orange" />
              Total Logs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{analytics?.totalLogs?.toLocaleString()}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">{analytics?.activeUsers}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="h-4 w-4 text-green-600" />
              Completed Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{analytics?.completedGoals}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-purple-600">
              {analytics?.totalGoals > 0 
                ? Math.round((analytics.completedGoals / analytics.totalGoals) * 100) 
                : 0}%
            </p>
          </CardContent>
        </Card>
      </div>
      
      <WellnessInsightsPanel />
      
      <Card>
        <CardHeader>
          <CardTitle>30-Day Activity Trends</CardTitle>
          <CardDescription>Daily wellness activity across all users</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics?.dailyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="steps" stroke="#D97230" name="Steps" />
              <Line type="monotone" dataKey="meditation" stroke="#8B5CF6" name="Meditation (min)" />
              <Line type="monotone" dataKey="hydration" stroke="#06B6D4" name="Hydration (glasses)" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Wellness vs. Engagement Correlation</CardTitle>
          <CardDescription>Top 10 most active wellness participants</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics?.correlationData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="email" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="wellnessLogs" fill="#D97230" name="Wellness Logs" />
              <Bar dataKey="events" fill="#3B82F6" name="Events Attended" />
              <Bar dataKey="recognitions" fill="#10B981" name="Recognitions" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      {challenges?.map(challenge => (
        <TeamWellnessLeaderboard key={challenge.id} challengeId={challenge.id} />
      ))}
    </div>
  );
}