import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Activity, Trophy, TrendingUp } from 'lucide-react';

const ACTIVITY_COLORS = {
  icebreaker: '#3b82f6',
  creative: '#8b5cf6',
  competitive: '#f59e0b',
  wellness: '#10b981',
  learning: '#06b6d4',
  social: '#ec4899'
};

const ACTIVITY_LABELS = {
  icebreaker: 'Icebreaker',
  creative: 'Creative',
  competitive: 'Competitive',
  wellness: 'Wellness',
  learning: 'Learning',
  social: 'Social'
};

export default function ActivityTypeDistribution({ events, activities, participations }) {
  const { distributionData, engagementData, topActivities } = useMemo(() => {
    if (!events.length || !activities.length) return { distributionData: [], engagementData: [], topActivities: [] };

    // Count events by activity type
    const typeCounts = {};
    const typeEngagement = {};

    events.forEach(event => {
      const activity = activities.find(a => a.id === event.activity_id);
      if (activity?.type) {
        typeCounts[activity.type] = (typeCounts[activity.type] || 0) + 1;

        // Calculate engagement (attendance count)
        const eventParticipations = participations.filter(p => 
          p.event_id === event.id && p.attendance_status === 'attended'
        );
        
        if (!typeEngagement[activity.type]) {
          typeEngagement[activity.type] = { count: 0, total: 0 };
        }
        typeEngagement[activity.type].count++;
        typeEngagement[activity.type].total += eventParticipations.length;
      }
    });

    // Distribution pie chart data
    const distribution = Object.entries(typeCounts).map(([type, count]) => ({
      name: ACTIVITY_LABELS[type] || type,
      value: count,
      color: ACTIVITY_COLORS[type] || '#94a3b8'
    }));

    // Engagement bar chart data
    const engagement = Object.entries(typeEngagement).map(([type, data]) => ({
      name: ACTIVITY_LABELS[type] || type,
      avgAttendance: data.count > 0 ? Math.round(data.total / data.count) : 0,
      totalEvents: data.count,
      color: ACTIVITY_COLORS[type] || '#94a3b8'
    })).sort((a, b) => b.avgAttendance - a.avgAttendance);

    // Top performing activities
    const activityStats = {};
    events.forEach(event => {
      const activity = activities.find(a => a.id === event.activity_id);
      if (activity) {
        if (!activityStats[activity.id]) {
          activityStats[activity.id] = {
            id: activity.id,
            title: activity.title,
            type: activity.type,
            count: 0,
            totalAttendance: 0
          };
        }
        activityStats[activity.id].count++;

        const eventParticipations = participations.filter(p => 
          p.event_id === event.id && p.attendance_status === 'attended'
        );
        activityStats[activity.id].totalAttendance += eventParticipations.length;
      }
    });

    const top = Object.values(activityStats)
      .map(stat => ({
        ...stat,
        avgAttendance: stat.count > 0 ? (stat.totalAttendance / stat.count).toFixed(1) : 0
      }))
      .sort((a, b) => b.totalAttendance - a.totalAttendance)
      .slice(0, 5);

    return { 
      distributionData: distribution, 
      engagementData: engagement,
      topActivities: top
    };
  }, [events, activities, participations]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Distribution Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-purple-600" />
            Event Distribution by Type
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={distributionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {distributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Engagement by Type */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
            Avg Attendance by Type
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={engagementData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" stroke="#64748b" fontSize={12} />
              <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={12} width={100} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="avgAttendance" radius={[0, 4, 4, 0]}>
                {engagementData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Activities */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            Top 5 Activities by Attendance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topActivities.map((activity, index) => (
              <div 
                key={activity.id}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-purple-300 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-purple text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">{activity.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge 
                        variant="outline" 
                        style={{ 
                          borderColor: ACTIVITY_COLORS[activity.type],
                          color: ACTIVITY_COLORS[activity.type]
                        }}
                      >
                        {ACTIVITY_LABELS[activity.type] || activity.type}
                      </Badge>
                      <span className="text-xs text-slate-500">
                        {activity.count} events
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-slate-900">
                    {activity.totalAttendance}
                  </div>
                  <div className="text-xs text-slate-500">
                    Avg: {activity.avgAttendance}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}