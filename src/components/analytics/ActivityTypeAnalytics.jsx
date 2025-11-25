import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { Trophy, Target, Zap } from 'lucide-react';

const COLORS = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];
const TYPE_COLORS = {
  icebreaker: '#6366f1',
  creative: '#ec4899',
  competitive: '#f59e0b',
  wellness: '#10b981',
  learning: '#8b5cf6',
  social: '#06b6d4'
};

export default function ActivityTypeAnalytics({ activities, events, participations }) {
  // Calculate metrics per activity type
  const typeMetrics = {};
  
  activities.forEach(activity => {
    const type = activity.type || 'other';
    if (!typeMetrics[type]) {
      typeMetrics[type] = {
        type,
        activities: 0,
        events: 0,
        participants: 0,
        attended: 0,
        totalEngagement: 0,
        engagementCount: 0
      };
    }
    typeMetrics[type].activities += 1;
    
    // Find events for this activity
    const activityEvents = events.filter(e => e.activity_id === activity.id);
    typeMetrics[type].events += activityEvents.length;
    
    // Find participations for these events
    activityEvents.forEach(event => {
      const eventParticipations = participations.filter(p => p.event_id === event.id);
      typeMetrics[type].participants += eventParticipations.length;
      typeMetrics[type].attended += eventParticipations.filter(p => p.attended).length;
      
      eventParticipations.forEach(p => {
        if (p.engagement_score) {
          typeMetrics[type].totalEngagement += p.engagement_score;
          typeMetrics[type].engagementCount += 1;
        }
      });
    });
  });

  // Convert to array with calculated averages
  const typeData = Object.values(typeMetrics).map(t => ({
    ...t,
    displayName: t.type.charAt(0).toUpperCase() + t.type.slice(1),
    attendanceRate: t.participants > 0 ? Math.round((t.attended / t.participants) * 100) : 0,
    avgEngagement: t.engagementCount > 0 ? parseFloat((t.totalEngagement / t.engagementCount).toFixed(1)) : 0,
    avgParticipants: t.events > 0 ? Math.round(t.attended / t.events) : 0
  }));

  // Pie chart data for event distribution
  const pieData = typeData.map(t => ({
    name: t.displayName,
    value: t.events,
    color: TYPE_COLORS[t.type] || '#94a3b8'
  })).filter(t => t.value > 0);

  // Radar chart data for comprehensive comparison
  const radarData = typeData.filter(t => t.events > 0).map(t => ({
    type: t.displayName,
    engagement: t.avgEngagement,
    attendance: t.attendanceRate / 10, // Scale to match engagement
    popularity: Math.min(t.events, 10), // Cap at 10 for radar
    participation: Math.min(t.avgParticipants, 10)
  }));

  // Find best performing type
  const bestByEngagement = [...typeData].sort((a, b) => b.avgEngagement - a.avgEngagement)[0];
  const bestByAttendance = [...typeData].sort((a, b) => b.attendanceRate - a.attendanceRate)[0];
  const mostPopular = [...typeData].sort((a, b) => b.events - a.events)[0];

  return (
    <div className="space-y-6">
      {/* Top Performers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 border-0 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Zap className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Highest Engagement</p>
              <p className="font-bold text-lg">{bestByEngagement?.displayName || '-'}</p>
              <Badge className="bg-purple-100 text-purple-700 text-xs">
                {bestByEngagement?.avgEngagement || 0}/10 avg
              </Badge>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 border-0 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Target className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Best Attendance</p>
              <p className="font-bold text-lg">{bestByAttendance?.displayName || '-'}</p>
              <Badge className="bg-green-100 text-green-700 text-xs">
                {bestByAttendance?.attendanceRate || 0}% rate
              </Badge>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 border-0 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Trophy className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Most Popular</p>
              <p className="font-bold text-lg">{mostPopular?.displayName || '-'}</p>
              <Badge className="bg-orange-100 text-orange-700 text-xs">
                {mostPopular?.events || 0} events
              </Badge>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Event Distribution Pie */}
        <Card className="p-6 border-0 shadow-lg">
          <CardHeader className="p-0 pb-4">
            <CardTitle>Event Distribution by Type</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Performance Radar */}
        <Card className="p-6 border-0 shadow-lg">
          <CardHeader className="p-0 pb-4">
            <CardTitle>Activity Type Performance</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {radarData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="type" tick={{ fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 10]} />
                  <Radar
                    name="Engagement"
                    dataKey="engagement"
                    stroke="#8b5cf6"
                    fill="#8b5cf6"
                    fillOpacity={0.3}
                  />
                  <Radar
                    name="Attendance"
                    dataKey="attendance"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.3}
                  />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-slate-500">
                Not enough data for radar chart
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Comparison */}
      <Card className="p-6 border-0 shadow-lg">
        <CardHeader className="p-0 pb-4">
          <CardTitle>Activity Type Comparison</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={typeData.filter(t => t.events > 0)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="displayName" stroke="#64748b" />
              <YAxis yAxisId="left" stroke="#64748b" />
              <YAxis yAxisId="right" orientation="right" stroke="#64748b" />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
              />
              <Legend />
              <Bar yAxisId="left" dataKey="events" fill="#6366f1" name="Events" />
              <Bar yAxisId="left" dataKey="attended" fill="#10b981" name="Total Attended" />
              <Bar yAxisId="right" dataKey="avgEngagement" fill="#f59e0b" name="Avg Engagement" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Type Details Table */}
      <Card className="p-6 border-0 shadow-lg">
        <CardHeader className="p-0 pb-4">
          <CardTitle>Detailed Metrics by Type</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Type</th>
                  <th className="text-center py-3 px-4 font-medium text-slate-600">Activities</th>
                  <th className="text-center py-3 px-4 font-medium text-slate-600">Events</th>
                  <th className="text-center py-3 px-4 font-medium text-slate-600">Participants</th>
                  <th className="text-center py-3 px-4 font-medium text-slate-600">Attendance Rate</th>
                  <th className="text-center py-3 px-4 font-medium text-slate-600">Avg Engagement</th>
                </tr>
              </thead>
              <tbody>
                {typeData.sort((a, b) => b.events - a.events).map(t => (
                  <tr key={t.type} className="border-b hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: TYPE_COLORS[t.type] || '#94a3b8' }}
                        />
                        <span className="font-medium">{t.displayName}</span>
                      </div>
                    </td>
                    <td className="text-center py-3 px-4">{t.activities}</td>
                    <td className="text-center py-3 px-4">{t.events}</td>
                    <td className="text-center py-3 px-4">{t.attended}</td>
                    <td className="text-center py-3 px-4">
                      <Badge className={
                        t.attendanceRate >= 80 ? 'bg-green-100 text-green-700' :
                        t.attendanceRate >= 60 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-slate-100 text-slate-700'
                      }>
                        {t.attendanceRate}%
                      </Badge>
                    </td>
                    <td className="text-center py-3 px-4">
                      <Badge className={
                        t.avgEngagement >= 7 ? 'bg-purple-100 text-purple-700' :
                        t.avgEngagement >= 5 ? 'bg-blue-100 text-blue-700' :
                        'bg-slate-100 text-slate-700'
                      }>
                        {t.avgEngagement}/10
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}