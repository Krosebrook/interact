import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import TierBadge from '@/components/gamification/TierBadge';

const COLORS = ['#cd7f32', '#c0c0c0', '#ffd700', '#e5e4e2', '#b9f2ff'];

export default function TierPerformanceChart({ usersByTier, allTiers, allUserPoints, pointsLedger }) {
  // Prepare data for distribution chart
  const tierDistributionData = allTiers?.map(tier => ({
    name: tier.display_name,
    users: usersByTier[tier.tier_name] || 0,
    minPoints: tier.min_points_required,
  })) || [];

  // Top performers by tier
  const topPerformers = allTiers?.map(tier => {
    const usersInTier = allUserPoints?.filter(up => up.current_tier_id === tier.id) || [];
    const topUser = usersInTier.sort((a, b) => b.total_points - a.total_points)[0];
    
    return {
      tier: tier.display_name,
      tierName: tier.tier_name,
      topUserEmail: topUser?.user_email || 'N/A',
      topUserPoints: topUser?.total_points || 0,
      avgPoints: usersInTier.length > 0 
        ? Math.round(usersInTier.reduce((sum, u) => sum + u.total_points, 0) / usersInTier.length)
        : 0,
    };
  }) || [];

  // Points activity over time (last 30 days)
  const last30Days = pointsLedger?.filter(entry => {
    const entryDate = new Date(entry.created_date);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return entryDate >= thirtyDaysAgo && entry.points > 0;
  }) || [];

  const activityByDay = {};
  last30Days.forEach(entry => {
    const date = new Date(entry.created_date).toLocaleDateString();
    activityByDay[date] = (activityByDay[date] || 0) + entry.points;
  });

  const activityData = Object.entries(activityByDay)
    .map(([date, points]) => ({ date, points }))
    .slice(-14); // Last 14 days

  return (
    <>
      {/* Tier Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User Distribution by Tier</CardTitle>
            <CardDescription>How users are spread across achievement tiers</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={tierDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, users }) => `${name}: ${users}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="users"
                >
                  {tierDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Points by Tier</CardTitle>
            <CardDescription>Average point totals for users in each tier</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topPerformers}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="tier" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="avgPoints" fill="#D97230" name="Avg Points" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Points Activity Over Time */}
      <Card>
        <CardHeader>
          <CardTitle>Points Activity (Last 14 Days)</CardTitle>
          <CardDescription>Daily point awards across the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="points" stroke="#D97230" strokeWidth={2} name="Points Awarded" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Performers by Tier */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performers by Tier</CardTitle>
          <CardDescription>Highest-scoring users in each achievement tier</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topPerformers.map((performer, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <TierBadge tier={{ tier_name: performer.tierName, display_name: performer.tier }} size="medium" />
                  <div>
                    <p className="font-semibold text-slate-900">{performer.tier}</p>
                    <p className="text-sm text-slate-600">Avg: {performer.avgPoints} points</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-600">Top User</p>
                  <p className="font-semibold text-slate-900">{performer.topUserPoints.toLocaleString()} pts</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}