import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { TrendingUp, TrendingDown, Users, Calendar, Star, Target } from 'lucide-react';
import { format, subDays, startOfWeek, eachDayOfInterval, isValid, parseISO } from 'date-fns';

const COLORS = ['#F47C20', '#0A1C39', '#4A6070', '#F5C16A', '#C46322', '#7A94A6'];

export default function EngagementAnalytics({ events, participations, activities }) {
  // Safely parse date
  const safeParseDate = (dateStr) => {
    if (!dateStr) return null;
    try {
      const date = typeof dateStr === 'string' ? parseISO(dateStr) : new Date(dateStr);
      return isValid(date) ? date : null;
    } catch {
      return null;
    }
  };

  // Calculate engagement over time (last 30 days)
  const engagementOverTime = useMemo(() => {
    const last30Days = eachDayOfInterval({
      start: subDays(new Date(), 29),
      end: new Date()
    });

    return last30Days.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayEvents = (events || []).filter(e => {
        const eventDate = safeParseDate(e.scheduled_date);
        return eventDate && format(eventDate, 'yyyy-MM-dd') === dateStr;
      });
      const dayParticipations = (participations || []).filter(p =>
        dayEvents.some(e => e.id === p.event_id)
      );

      const avgEngagement = dayParticipations.length > 0
        ? dayParticipations.reduce((sum, p) => sum + (p.engagement_score || 0), 0) / dayParticipations.length
        : 0;

      return {
        date: format(date, 'MMM d'),
        fullDate: dateStr,
        events: dayEvents.length,
        participants: dayParticipations.length,
        avgEngagement: Math.round(avgEngagement * 10) / 10,
        attendance: dayParticipations.filter(p => p.attended).length
      };
    });
  }, [events, participations]);

  // Attendance rate by activity type
  const attendanceByType = useMemo(() => {
    const typeStats = {};

    (events || []).forEach(event => {
      const activity = (activities || []).find(a => a.id === event.activity_id);
      const type = activity?.type || 'unknown';
      
      if (!typeStats[type]) {
        typeStats[type] = { type, totalInvited: 0, attended: 0, events: 0, totalEngagement: 0 };
      }

      const eventParticipations = (participations || []).filter(p => p.event_id === event.id);
      typeStats[type].totalInvited += eventParticipations.length;
      typeStats[type].attended += eventParticipations.filter(p => p.attended).length;
      typeStats[type].events += 1;
      typeStats[type].totalEngagement += eventParticipations.reduce((sum, p) => sum + (p.engagement_score || 0), 0);
    });

    return Object.values(typeStats).map(stat => ({
      ...stat,
      attendanceRate: stat.totalInvited > 0 ? Math.round((stat.attended / stat.totalInvited) * 100) : 0,
      avgEngagement: stat.attended > 0 ? Math.round((stat.totalEngagement / stat.attended) * 10) / 10 : 0
    }));
  }, [events, participations, activities]);

  // Popular activity types (pie chart data)
  const activityPopularity = useMemo(() => {
    const typeCounts = {};
    (events || []).forEach(event => {
      const activity = (activities || []).find(a => a.id === event.activity_id);
      const type = activity?.type || 'other';
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });

    return Object.entries(typeCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [events, activities]);

  // Event completion trends
  const completionTrends = useMemo(() => {
    const weeklyData = [];
    for (let i = 3; i >= 0; i--) {
      const weekStart = startOfWeek(subDays(new Date(), i * 7));
      const weekEnd = subDays(weekStart, -6);
      
      const weekEvents = (events || []).filter(e => {
        const eventDate = safeParseDate(e.scheduled_date);
        return eventDate && eventDate >= weekStart && eventDate <= weekEnd;
      });

      weeklyData.push({
        week: format(weekStart, 'MMM d'),
        scheduled: weekEvents.length,
        completed: weekEvents.filter(e => e.status === 'completed').length,
        cancelled: weekEvents.filter(e => e.status === 'cancelled').length,
        completionRate: weekEvents.length > 0 
          ? Math.round((weekEvents.filter(e => e.status === 'completed').length / weekEvents.length) * 100)
          : 0
      });
    }
    return weeklyData;
  }, [events]);

  // Summary stats
  const summaryStats = useMemo(() => {
    const eventsArr = events || [];
    const participationsArr = participations || [];
    const totalEvents = eventsArr.length;
    const completedEvents = eventsArr.filter(e => e.status === 'completed').length;
    const totalParticipants = participationsArr.length;
    const attendedCount = participationsArr.filter(p => p.attended).length;
    const avgEngagement = participationsArr.length > 0
      ? participationsArr.reduce((sum, p) => sum + (p.engagement_score || 0), 0) / participationsArr.length
      : 0;

    return {
      totalEvents,
      completedEvents,
      completionRate: totalEvents > 0 ? Math.round((completedEvents / totalEvents) * 100) : 0,
      totalParticipants,
      attendanceRate: totalParticipants > 0 ? Math.round((attendedCount / totalParticipants) * 100) : 0,
      avgEngagement: Math.round(avgEngagement * 10) / 10
    };
  }, [events, participations]);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total Events</p>
                <p className="text-2xl font-bold">{summaryStats.totalEvents}</p>
              </div>
              <Calendar className="h-8 w-8 text-int-orange opacity-60" />
            </div>
            <Badge className="mt-2 bg-green-100 text-green-700">
              {summaryStats.completionRate}% completed
            </Badge>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total Participants</p>
                <p className="text-2xl font-bold">{summaryStats.totalParticipants}</p>
              </div>
              <Users className="h-8 w-8 text-int-navy opacity-60" />
            </div>
            <Badge className="mt-2 bg-blue-100 text-blue-700">
              {summaryStats.attendanceRate}% attendance
            </Badge>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Avg Engagement</p>
                <p className="text-2xl font-bold">{summaryStats.avgEngagement}/5</p>
              </div>
              <Star className="h-8 w-8 text-yellow-500 opacity-60" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              {summaryStats.avgEngagement >= 3.5 ? (
                <><TrendingUp className="h-4 w-4 text-green-500 mr-1" /> Above target</>
              ) : (
                <><TrendingDown className="h-4 w-4 text-red-500 mr-1" /> Below target</>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Completion Rate</p>
                <p className="text-2xl font-bold">{summaryStats.completionRate}%</p>
              </div>
              <Target className="h-8 w-8 text-purple-500 opacity-60" />
            </div>
            <div className="mt-2 h-2 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-purple-500 rounded-full transition-all"
                style={{ width: `${summaryStats.completionRate}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Over Time */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Engagement Over Time (30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={engagementOverTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Area 
                yAxisId="left"
                type="monotone" 
                dataKey="participants" 
                stackId="1"
                stroke="#0A1C39" 
                fill="#0A1C39" 
                fillOpacity={0.3}
                name="Participants"
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="avgEngagement" 
                stroke="#F47C20" 
                strokeWidth={2}
                dot={false}
                name="Avg Engagement"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance by Activity Type */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Attendance by Activity Type</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={attendanceByType} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} />
                <YAxis dataKey="type" type="category" tick={{ fontSize: 12 }} width={80} />
                <Tooltip formatter={(value) => `${value}%`} />
                <Bar dataKey="attendanceRate" fill="#F47C20" radius={[0, 4, 4, 0]} name="Attendance Rate" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Activity Type Distribution */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Popular Activity Types</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={activityPopularity}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {activityPopularity.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Completion Trends */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Weekly Event Completion Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={completionTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="week" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="completed" stackId="a" fill="#10b981" name="Completed" radius={[4, 4, 0, 0]} />
              <Bar dataKey="cancelled" stackId="a" fill="#ef4444" name="Cancelled" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}