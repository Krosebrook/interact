import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, TrendingDown, Activity, Users } from 'lucide-react';

export default function FeatureUsageDashboard() {
  const { data: events, isLoading } = useQuery({
    queryKey: ['analytics-events-feature-usage'],
    queryFn: async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      return await base44.entities.AnalyticsEvent.filter({
        event_type: 'feature_use',
        created_date: { $gte: thirtyDaysAgo.toISOString() }
      });
    },
    staleTime: 60000 // 1 minute
  });

  const featureStats = useMemo(() => {
    if (!events) return [];

    const featureMap = {};
    
    events.forEach(event => {
      const feature = event.feature_name;
      if (!featureMap[feature]) {
        featureMap[feature] = {
          name: feature,
          users: new Set(),
          total: 0,
          byDay: {}
        };
      }
      
      featureMap[feature].users.add(event.user_email);
      featureMap[feature].total += 1;
      
      const day = new Date(event.created_date).toISOString().split('T')[0];
      featureMap[feature].byDay[day] = (featureMap[feature].byDay[day] || 0) + 1;
    });

    return Object.values(featureMap)
      .map(f => ({
        name: f.name,
        uniqueUsers: f.users.size,
        totalUses: f.total,
        avgUsesPerUser: (f.total / f.users.size).toFixed(1),
        trend: calculateTrend(f.byDay)
      }))
      .sort((a, b) => b.totalUses - a.totalUses);
  }, [events]);

  const topFeatures = featureStats.slice(0, 10);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-purple-600" />
            Feature Usage (Last 30 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topFeatures.map((feature, idx) => (
              <div key={feature.name} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="font-mono">#{idx + 1}</Badge>
                    <h4 className="font-medium text-slate-900">{formatFeatureName(feature.name)}</h4>
                    {feature.trend > 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : feature.trend < 0 ? (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    ) : null}
                  </div>
                  <div className="flex gap-4 mt-2 text-sm text-slate-600">
                    <span>
                      <Users className="h-3 w-3 inline mr-1" />
                      {feature.uniqueUsers} users
                    </span>
                    <span>{feature.totalUses} total uses</span>
                    <span>{feature.avgUsesPerUser} avg uses/user</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Feature Usage Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topFeatures}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tickFormatter={formatFeatureName} angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip formatter={(value) => value.toLocaleString()} />
              <Bar dataKey="uniqueUsers" fill="#8b5cf6" name="Unique Users" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

function formatFeatureName(name) {
  return name.split(/(?=[A-Z])/).join(' ').replace(/^./, str => str.toUpperCase());
}

function calculateTrend(byDay) {
  const days = Object.keys(byDay).sort();
  if (days.length < 2) return 0;
  
  const mid = Math.floor(days.length / 2);
  const firstHalf = days.slice(0, mid).reduce((sum, day) => sum + byDay[day], 0);
  const secondHalf = days.slice(mid).reduce((sum, day) => sum + byDay[day], 0);
  
  return secondHalf - firstHalf;
}