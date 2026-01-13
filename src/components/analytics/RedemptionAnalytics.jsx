import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';

const CATEGORY_COLORS = {
  time_off: '#10B981',
  swag: '#F59E0B',
  gift_card: '#8B5CF6',
  experience: '#EC4899',
  donation: '#06B6D4',
  other: '#64748B',
};

export default function RedemptionAnalytics({ redemptions = [], userPoints = [] }) {
  // Redemptions by category
  const categoryData = {};
  redemptions?.forEach(r => {
    const category = r.item_name?.split(' ')[0] || 'other';
    categoryData[category] = (categoryData[category] || 0) + 1;
  });

  const categoryChartData = Object.entries(categoryData).map(([category, count]) => ({
    category,
    count,
  }));

  // Redemptions by status
  const statusData = {
    pending: redemptions?.filter(r => r.status === 'pending').length || 0,
    approved: redemptions?.filter(r => r.status === 'approved').length || 0,
    fulfilled: redemptions?.filter(r => r.status === 'fulfilled').length || 0,
    rejected: redemptions?.filter(r => r.status === 'rejected').length || 0,
  };

  const statusChartData = Object.entries(statusData).map(([status, count]) => ({
    status: status.charAt(0).toUpperCase() + status.slice(1),
    count,
  }));

  // Points spent analysis
  const totalPointsSpent = redemptions?.reduce((sum, r) => sum + (r.points_spent || 0), 0) || 0;
  const avgPointsPerRedemption = redemptions?.length > 0 
    ? Math.round(totalPointsSpent / redemptions.length) 
    : 0;

  // Top redeemers
  const redemptionsByUser = {};
  redemptions?.forEach(r => {
    redemptionsByUser[r.user_email] = (redemptionsByUser[r.user_email] || 0) + 1;
  });

  const topRedeemers = Object.entries(redemptionsByUser)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([email, count]) => ({
      email: email.split('@')[0],
      redemptions: count,
      totalPoints: userPoints?.find(up => up.user_email === email)?.total_points || 0,
    }));

  // Conversion rate (users who redeemed vs total users)
  const usersWhoRedeemed = new Set(redemptions?.map(r => r.user_email)).size;
  const conversionRate = userPoints?.length > 0 
    ? Math.round((usersWhoRedeemed / userPoints.length) * 100) 
    : 0;

  return (
    <>
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600">Total Redemptions</p>
            <p className="text-3xl font-bold text-slate-900">{redemptions?.length || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600">Points Spent</p>
            <p className="text-3xl font-bold text-slate-900">{totalPointsSpent.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600">Avg Points/Redemption</p>
            <p className="text-3xl font-bold text-slate-900">{avgPointsPerRedemption}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600">User Participation</p>
            <div className="flex items-center gap-2">
              <p className="text-3xl font-bold text-slate-900">{conversionRate}%</p>
              {conversionRate > 50 ? (
                <TrendingUp className="h-5 w-5 text-green-500" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-500" />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Redemptions by Category</CardTitle>
            <CardDescription>Most popular reward types</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8B5CF6" name="Redemptions" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Redemptions by Status</CardTitle>
            <CardDescription>Processing pipeline health</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ status, count }) => `${status}: ${count}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#F59E0B', '#10B981', '#06B6D4', '#EF4444'][index]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Redeemers */}
      <Card>
        <CardHeader>
          <CardTitle>Top Redeemers</CardTitle>
          <CardDescription>Most active reward participants</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topRedeemers.map((user, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-int-orange flex items-center justify-center text-white font-bold">
                    {idx + 1}
                  </div>
                  <p className="font-medium text-slate-900">{user.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-600">{user.redemptions} redemptions</p>
                  <p className="text-xs text-slate-500">{user.totalPoints} points remaining</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}