import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '../components/auth/AuthProvider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, BookOpen, BarChart3, TrendingUp } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import UserManagementPanel from '../components/admin/UserManagementPanel';
import LearningPathManager from '../components/admin/LearningPathManager';
import AdminAnalyticsOverview from '../components/admin/AdminAnalyticsOverview';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('analytics');

  // Quick stats for header
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [users, learningPaths, points, activities] = await Promise.all([
        base44.asServiceRole.entities.User.list(),
        base44.entities.LearningPath.list(),
        base44.asServiceRole.entities.UserPoints.list(),
        base44.entities.Participation.list()
      ]);
      
      return {
        totalUsers: users.length,
        activeUsers: users.filter(u => u.role !== 'inactive').length,
        totalLearningPaths: learningPaths.length,
        totalPoints: points.reduce((sum, p) => sum + (p.total_points || 0), 0),
        totalActivities: activities.length
      };
    }
  });

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-600">Access denied. Admin only.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-int-navy">Admin Dashboard</h1>
        <p className="text-slate-600 mt-1">Manage users, content, and view analytics</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="pt-6">
            <Users className="h-8 w-8 text-blue-600 mb-2" />
            <p className="text-2xl font-bold text-blue-900">{stats?.activeUsers || 0}</p>
            <p className="text-sm text-blue-700">Active Users</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="pt-6">
            <BookOpen className="h-8 w-8 text-purple-600 mb-2" />
            <p className="text-2xl font-bold text-purple-900">{stats?.totalLearningPaths || 0}</p>
            <p className="text-sm text-purple-700">Learning Paths</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardContent className="pt-6">
            <TrendingUp className="h-8 w-8 text-amber-600 mb-2" />
            <p className="text-2xl font-bold text-amber-900">{stats?.totalPoints?.toLocaleString() || 0}</p>
            <p className="text-sm text-amber-700">Total Points</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
          <CardContent className="pt-6">
            <BarChart3 className="h-8 w-8 text-emerald-600 mb-2" />
            <p className="text-2xl font-bold text-emerald-900">{stats?.totalActivities || 0}</p>
            <p className="text-sm text-emerald-700">Activities</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="analytics">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="users">
            <Users className="h-4 w-4 mr-2" />
            Users
          </TabsTrigger>
          <TabsTrigger value="learning">
            <BookOpen className="h-4 w-4 mr-2" />
            Learning Paths
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="mt-6">
          <AdminAnalyticsOverview />
        </TabsContent>

        <TabsContent value="users" className="mt-6">
          <UserManagementPanel />
        </TabsContent>

        <TabsContent value="learning" className="mt-6">
          <LearningPathManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}