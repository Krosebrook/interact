import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BarChart, 
  Bar, 
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { Users, Trophy, BookOpen, TrendingUp, Award, Download, Calendar } from 'lucide-react';
import { format, subDays, startOfDay } from 'date-fns';
import LoadingSpinner from '../common/LoadingSpinner';
import { toast } from 'sonner';

const COLORS = ['#D97230', '#8B5CF6', '#10B981', '#3B82F6', '#F59E0B'];

export default function TeamPerformanceDashboard({ teamId }) {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['team-analytics', teamId],
    queryFn: async () => {
      const [team, memberships, allUsers, points, participations, challengeParticipations, learningProgress, recognitions] = await Promise.all([
        base44.entities.Team.get(teamId),
        base44.entities.TeamMembership.filter({ team_id: teamId }),
        base44.asServiceRole.entities.User.list(),
        base44.entities.UserPoints.list(),
        base44.entities.Participation.list(),
        base44.entities.ChallengeParticipation.list(),
        base44.entities.LearningPathProgress.list(),
        base44.entities.Recognition.list()
      ]);

      const memberEmails = memberships.map(m => m.user_email);
      
      // Filter data for team members only
      const teamPoints = points.filter(p => memberEmails.includes(p.user_email));
      const teamParticipations = participations.filter(p => memberEmails.includes(p.user_email));
      const teamChallenges = challengeParticipations.filter(cp => memberEmails.includes(cp.user_email));
      const teamLearning = learningProgress.filter(lp => memberEmails.includes(lp.user_email));
      const teamRecognitions = recognitions.filter(r => 
        memberEmails.includes(r.sender_email) || memberEmails.includes(r.recipient_email)
      );

      // Engagement trend (last 30 days)
      const engagementTrend = Array.from({ length: 30 }, (_, i) => {
        const date = startOfDay(subDays(new Date(), 29 - i));
        const dateStr = format(date, 'yyyy-MM-dd');
        
        const activities = teamParticipations.filter(p => 
          p.check_in_time && format(new Date(p.check_in_time), 'yyyy-MM-dd') === dateStr
        ).length;
        
        const recognitions = teamRecognitions.filter(r => 
          format(new Date(r.created_date), 'yyyy-MM-dd') === dateStr
        ).length;

        return {
          date: format(date, 'MMM d'),
          activities,
          recognitions,
          total: activities + recognitions
        };
      });

      // Member performance
      const memberPerformance = memberEmails.map(email => {
        const user = allUsers.find(u => u.email === email);
        const userPoints = teamPoints.find(p => p.user_email === email);
        const userParticipations = teamParticipations.filter(p => p.user_email === email);
        const userChallenges = teamChallenges.filter(cp => cp.user_email === email);
        const userLearning = teamLearning.filter(lp => lp.user_email === email);

        return {
          name: user?.full_name || email,
          email,
          points: userPoints?.total_points || 0,
          activities: userParticipations.filter(p => p.attendance_status === 'attended').length,
          challenges: userChallenges.filter(cp => cp.status === 'completed').length,
          learningCompleted: userLearning.filter(lp => lp.status === 'completed').length,
          tier: userPoints?.tier || 'Bronze'
        };
      }).sort((a, b) => b.points - a.points);

      // Challenge participation breakdown
      const challengeStats = {
        active: teamChallenges.filter(cp => cp.status === 'active').length,
        completed: teamChallenges.filter(cp => cp.status === 'completed').length,
        failed: teamChallenges.filter(cp => cp.status === 'failed').length
      };

      // Learning path stats
      const learningStats = {
        enrolled: teamLearning.length,
        inProgress: teamLearning.filter(lp => lp.status === 'in_progress').length,
        completed: teamLearning.filter(lp => lp.status === 'completed').length,
        avgProgress: teamLearning.reduce((sum, lp) => sum + (lp.progress_percentage || 0), 0) / (teamLearning.length || 1)
      };

      // Tier distribution
      const tierDistribution = teamPoints.reduce((acc, p) => {
        const tier = p.tier || 'Bronze';
        acc[tier] = (acc[tier] || 0) + 1;
        return acc;
      }, {});

      return {
        team,
        memberCount: memberEmails.length,
        totalPoints: teamPoints.reduce((sum, p) => sum + (p.total_points || 0), 0),
        avgPointsPerMember: teamPoints.reduce((sum, p) => sum + (p.total_points || 0), 0) / (teamPoints.length || 1),
        totalActivities: teamParticipations.filter(p => p.attendance_status === 'attended').length,
        totalRecognitions: teamRecognitions.length,
        engagementTrend,
        memberPerformance,
        challengeStats: Object.entries(challengeStats).map(([name, value]) => ({ name, value })),
        learningStats,
        tierDistribution: Object.entries(tierDistribution).map(([name, value]) => ({ name, value }))
      };
    },
    enabled: !!teamId
  });

  const handleExportReport = async () => {
    try {
      const { data } = await base44.functions.invoke('generateTeamReport', { 
        teamId,
        analytics 
      });
      
      // Create download link
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `team-${analytics?.team?.name}-report-${format(new Date(), 'yyyy-MM-dd')}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      
      toast.success('Report exported successfully');
    } catch (error) {
      toast.error('Failed to export report');
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{analytics?.team?.name} Performance</h2>
          <p className="text-slate-600">{analytics?.memberCount} team members</p>
        </div>
        <Button onClick={handleExportReport} className="bg-int-orange hover:bg-[#C46322]">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Trophy className="h-8 w-8 text-amber-600" />
              <div>
                <p className="text-2xl font-bold">{analytics?.totalPoints?.toLocaleString() || 0}</p>
                <p className="text-sm text-slate-600">Total Points</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{Math.round(analytics?.avgPointsPerMember || 0)}</p>
                <p className="text-sm text-slate-600">Avg per Member</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{analytics?.totalActivities || 0}</p>
                <p className="text-sm text-slate-600">Activities</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Award className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{analytics?.totalRecognitions || 0}</p>
                <p className="text-sm text-slate-600">Recognitions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="engagement" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="challenges">Challenges</TabsTrigger>
          <TabsTrigger value="learning">Learning</TabsTrigger>
        </TabsList>

        <TabsContent value="engagement" className="space-y-6">
          {/* Engagement Trend */}
          <Card>
            <CardHeader>
              <CardTitle>30-Day Team Engagement Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analytics?.engagementTrend || []}>
                  <defs>
                    <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D97230" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#D97230" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="activities" stackId="1" stroke="#8B5CF6" fill="#8B5CF6" />
                  <Area type="monotone" dataKey="recognitions" stackId="1" stroke="#10B981" fill="#10B981" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Tier Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Team Tier Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={analytics?.tierDistribution || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {analytics?.tierDistribution?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Member Performance Leaderboard</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics?.memberPerformance?.map((member, idx) => (
                  <div key={member.email} className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border hover:shadow-md transition-shadow">
                    <Badge className={
                      idx === 0 ? 'bg-amber-500' :
                      idx === 1 ? 'bg-slate-400' :
                      idx === 2 ? 'bg-amber-700' : 'bg-slate-300'
                    }>
                      #{idx + 1}
                    </Badge>
                    <div className="flex-1">
                      <p className="font-semibold">{member.name}</p>
                      <div className="flex gap-4 text-xs text-slate-600 mt-1">
                        <span>{member.activities} activities</span>
                        <span>{member.challenges} challenges</span>
                        <span>{member.learningCompleted} courses</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-int-orange">{member.points.toLocaleString()}</p>
                      <Badge variant="outline">{member.tier}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="challenges" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Challenge Participation</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={analytics?.challengeStats || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8B5CF6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="learning" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Learning Path Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{analytics?.learningStats?.enrolled || 0}</p>
                  <p className="text-sm text-slate-600">Enrolled</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">{analytics?.learningStats?.inProgress || 0}</p>
                  <p className="text-sm text-slate-600">In Progress</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{analytics?.learningStats?.completed || 0}</p>
                  <p className="text-sm text-slate-600">Completed</p>
                </div>
                <div className="text-center p-4 bg-amber-50 rounded-lg">
                  <p className="text-2xl font-bold text-amber-600">{Math.round(analytics?.learningStats?.avgProgress || 0)}%</p>
                  <p className="text-sm text-slate-600">Avg Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}