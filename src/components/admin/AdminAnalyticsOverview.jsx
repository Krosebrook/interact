import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { TrendingUp, Users, Award, BookOpen, Target, Activity } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';
import { format, subDays, startOfDay } from 'date-fns';

const COLORS = ['#D97230', '#14294D', '#8B5CF6', '#10B981', '#F59E0B', '#EC4899'];

export default function AdminAnalyticsOverview() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: async () => {
      const [users, points, learningProgress, recognitions, challenges, challengeParticipations, learningPaths, participations] = await Promise.all([
        base44.asServiceRole.entities.User.list(),
        base44.asServiceRole.entities.UserPoints.list(),
        base44.entities.LearningPathProgress.list(),
        base44.entities.Recognition.list(),
        base44.entities.PersonalChallenge.list(),
        base44.entities.ChallengeParticipation.list(),
        base44.entities.LearningPath.list(),
        base44.entities.Participation.list()
      ]);

      // User engagement trend (last 30 days)
      const engagementTrend = Array.from({ length: 30 }, (_, i) => {
        const date = startOfDay(subDays(new Date(), 29 - i));
        const dateStr = format(date, 'yyyy-MM-dd');
        
        const dailyRecognitions = recognitions.filter(r => 
          format(new Date(r.created_date), 'yyyy-MM-dd') === dateStr
        ).length;
        
        const dailyParticipations = participations.filter(p => 
          p.check_in_time && format(new Date(p.check_in_time), 'yyyy-MM-dd') === dateStr
        ).length;

        return {
          date: format(date, 'MMM d'),
          recognitions: dailyRecognitions,
          activities: dailyParticipations,
          total: dailyRecognitions + dailyParticipations
        };
      });

      // Points by activity type
      const pointsByActivity = {
        recognitions: recognitions.length * 10,
        challenges: challengeParticipations.filter(c => c.status === 'completed').reduce((sum, c) => sum + (c.points_earned || 0), 0),
        learning: learningProgress.filter(l => l.status === 'completed').length * 100,
        events: participations.filter(p => p.attendance_status === 'attended').length * 5
      };

      // Learning path details
      const learningPathDetails = learningPaths.map(path => {
        const enrollments = learningProgress.filter(lp => lp.learning_path_id === path.id);
        const completed = enrollments.filter(lp => lp.status === 'completed').length;
        const inProgress = enrollments.filter(lp => lp.status === 'in_progress').length;
        const avgProgress = enrollments.reduce((sum, lp) => sum + (lp.progress_percentage || 0), 0) / (enrollments.length || 1);

        return {
          name: path.title,
          enrollments: enrollments.length,
          completed,
          inProgress,
          completionRate: enrollments.length > 0 ? (completed / enrollments.length * 100) : 0,
          avgProgress: Math.round(avgProgress)
        };
      }).sort((a, b) => b.enrollments - a.enrollments).slice(0, 5);

      // Challenge trends (last 30 days)
      const challengeTrend = Array.from({ length: 30 }, (_, i) => {
        const date = startOfDay(subDays(new Date(), 29 - i));
        const dateStr = format(date, 'yyyy-MM-dd');
        
        const joined = challengeParticipations.filter(cp => 
          format(new Date(cp.joined_date), 'yyyy-MM-dd') === dateStr
        ).length;
        
        const completed = challengeParticipations.filter(cp => 
          cp.completed_date && format(new Date(cp.completed_date), 'yyyy-MM-dd') === dateStr
        ).length;

        return {
          date: format(date, 'MMM d'),
          joined,
          completed
        };
      });

      // Points distribution
      const pointsDistribution = points.reduce((acc, p) => {
        const tier = p.tier || 'Bronze';
        acc[tier] = (acc[tier] || 0) + 1;
        return acc;
      }, {});

      // Top learners
      const topLearners = points
        .sort((a, b) => (b.total_points || 0) - (a.total_points || 0))
        .slice(0, 5)
        .map(p => ({
          email: p.user_email,
          points: p.total_points || 0
        }));

      // Recognition trends
      const recognitionsByType = recognitions.reduce((acc, r) => {
        const category = r.category || 'General';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {});

      return {
        totalUsers: users.length,
        activeUsers: users.filter(u => u.status !== 'inactive').length,
        pointsDistribution: Object.entries(pointsDistribution).map(([name, value]) => ({ name, value })),
        topLearners,
        recognitionsByType: Object.entries(recognitionsByType).map(([name, value]) => ({ name, value })),
        avgPointsPerUser: points.reduce((sum, p) => sum + (p.total_points || 0), 0) / (points.length || 1),
        totalRecognitions: recognitions.length,
        activeChallenges: challenges.filter(c => c.status === 'active').length,
        engagementTrend,
        pointsByActivity: Object.entries(pointsByActivity).map(([name, value]) => ({ name, value })),
        learningPathDetails,
        challengeTrend,
        totalChallengeParticipants: new Set(challengeParticipations.map(cp => cp.user_email)).size,
        challengeCompletionRate: challengeParticipations.length > 0 ? 
          (challengeParticipations.filter(cp => cp.status === 'completed').length / challengeParticipations.length * 100) : 0
      };
    }
  });

  if (isLoading) return <LoadingSpinner message="Loading analytics..." />;

  return (
    <Tabs defaultValue="overview" className="space-y-6">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="engagement">Engagement Trends</TabsTrigger>
        <TabsTrigger value="learning">Learning Paths</TabsTrigger>
        <TabsTrigger value="challenges">Challenges</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <Users className="h-8 w-8 text-blue-600 mb-2" />
            <p className="text-2xl font-bold">{analytics?.activeUsers || 0}</p>
            <p className="text-sm text-slate-600">Active Users</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <Award className="h-8 w-8 text-amber-600 mb-2" />
            <p className="text-2xl font-bold">{Math.round(analytics?.avgPointsPerUser || 0)}</p>
            <p className="text-sm text-slate-600">Avg Points/User</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <TrendingUp className="h-8 w-8 text-green-600 mb-2" />
            <p className="text-2xl font-bold">{analytics?.totalRecognitions || 0}</p>
            <p className="text-sm text-slate-600">Total Recognition</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <BookOpen className="h-8 w-8 text-purple-600 mb-2" />
            <p className="text-2xl font-bold">{analytics?.activeChallenges || 0}</p>
            <p className="text-sm text-slate-600">Active Challenges</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Points Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>User Tier Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={analytics?.pointsDistribution || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analytics?.pointsDistribution?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Points by Activity Type */}
        <Card>
          <CardHeader>
            <CardTitle>Points Distribution by Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analytics?.pointsByActivity || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Learners */}
      <Card>
        <CardHeader>
          <CardTitle>Top Point Earners</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics?.topLearners?.map((learner, idx) => (
              <div key={learner.email} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge className={
                    idx === 0 ? 'bg-amber-500' :
                    idx === 1 ? 'bg-slate-400' :
                    idx === 2 ? 'bg-amber-700' : 'bg-slate-300'
                  }>
                    #{idx + 1}
                  </Badge>
                  <span className="font-medium">{learner.email}</span>
                </div>
                <Badge variant="outline">{learner.points.toLocaleString()} pts</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      </TabsContent>

      <TabsContent value="engagement" className="space-y-6">
        {/* Engagement Trend */}
        <Card>
          <CardHeader>
            <CardTitle>30-Day User Engagement Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analytics?.engagementTrend || []}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D97230" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#D97230" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="recognitions" stackId="1" stroke="#8B5CF6" fill="#8B5CF6" />
                <Area type="monotone" dataKey="activities" stackId="1" stroke="#10B981" fill="#10B981" />
                <Area type="monotone" dataKey="total" stroke="#D97230" fillOpacity={1} fill="url(#colorTotal)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recognition by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Recognition Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analytics?.recognitionsByType || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#D97230" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="learning" className="space-y-6">
        {/* Learning Path Completion Rates */}
        <Card>
          <CardHeader>
            <CardTitle>Learning Path Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics?.learningPathDetails?.map((path, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium">{path.name}</p>
                      <div className="flex gap-4 text-xs text-slate-600 mt-1">
                        <span>{path.enrollments} enrolled</span>
                        <span>{path.completed} completed</span>
                        <span>{path.inProgress} in progress</span>
                      </div>
                    </div>
                    <Badge>{path.completionRate.toFixed(0)}% completion</Badge>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${path.completionRate}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-600">{path.avgProgress}% avg</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="challenges" className="space-y-6">
        {/* Challenge Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6">
              <Target className="h-8 w-8 text-purple-600 mb-2" />
              <p className="text-2xl font-bold">{analytics?.totalChallengeParticipants || 0}</p>
              <p className="text-sm text-slate-600">Total Participants</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <Activity className="h-8 w-8 text-green-600 mb-2" />
              <p className="text-2xl font-bold">{analytics?.challengeCompletionRate?.toFixed(1) || 0}%</p>
              <p className="text-sm text-slate-600">Completion Rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Challenge Participation Trend */}
        <Card>
          <CardHeader>
            <CardTitle>30-Day Challenge Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics?.challengeTrend || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="joined" stroke="#8B5CF6" strokeWidth={2} name="Joined" />
                <Line type="monotone" dataKey="completed" stroke="#10B981" strokeWidth={2} name="Completed" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}