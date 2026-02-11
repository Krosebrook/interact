import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  Legend
} from 'recharts';
import { TrendingUp, Users, Award, BookOpen } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';

const COLORS = ['#D97230', '#14294D', '#8B5CF6', '#10B981', '#F59E0B', '#EC4899'];

export default function AdminAnalyticsOverview() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: async () => {
      const [users, points, learningProgress, recognitions, challenges] = await Promise.all([
        base44.asServiceRole.entities.User.list(),
        base44.asServiceRole.entities.UserPoints.list(),
        base44.entities.LearningPathProgress.list(),
        base44.entities.Recognition.list(),
        base44.entities.PersonalChallenge.list()
      ]);

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

      // Learning path popularity
      const pathPopularity = learningProgress.reduce((acc, lp) => {
        const pathId = lp.learning_path_id;
        if (!acc[pathId]) {
          acc[pathId] = { id: pathId, enrollments: 0, completions: 0 };
        }
        acc[pathId].enrollments++;
        if (lp.status === 'completed') acc[pathId].completions++;
        return acc;
      }, {});

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
        pathPopularity: Object.values(pathPopularity).slice(0, 5),
        recognitionsByType: Object.entries(recognitionsByType).map(([name, value]) => ({ name, value })),
        avgPointsPerUser: points.reduce((sum, p) => sum + (p.total_points || 0), 0) / (points.length || 1),
        totalRecognitions: recognitions.length,
        activeChallenges: challenges.filter(c => c.status === 'active').length
      };
    }
  });

  if (isLoading) return <LoadingSpinner message="Loading analytics..." />;

  return (
    <div className="space-y-6">
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
    </div>
  );
}