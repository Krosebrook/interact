import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { TrendingUp, TrendingDown, Minus, Users } from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

export default function AttendanceMetrics({ events, participations }) {
  // Calculate attendance rate per event
  const eventAttendance = events.map(event => {
    const eventParticipations = participations.filter(p => p.event_id === event.id);
    const registered = eventParticipations.length;
    const attended = eventParticipations.filter(p => p.attended).length;
    return {
      id: event.id,
      title: event.title?.substring(0, 15) || 'Event',
      date: new Date(event.scheduled_date),
      registered,
      attended,
      rate: registered > 0 ? Math.round((attended / registered) * 100) : 0
    };
  }).filter(e => e.registered > 0);

  // Monthly attendance trend (last 6 months)
  const monthlyTrend = [];
  for (let i = 5; i >= 0; i--) {
    const monthDate = subMonths(new Date(), i);
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);
    
    const monthEvents = eventAttendance.filter(e => 
      isWithinInterval(e.date, { start: monthStart, end: monthEnd })
    );
    
    const totalRegistered = monthEvents.reduce((sum, e) => sum + e.registered, 0);
    const totalAttended = monthEvents.reduce((sum, e) => sum + e.attended, 0);
    
    monthlyTrend.push({
      month: format(monthDate, 'MMM'),
      registered: totalRegistered,
      attended: totalAttended,
      rate: totalRegistered > 0 ? Math.round((totalAttended / totalRegistered) * 100) : 0,
      events: monthEvents.length
    });
  }

  // Overall metrics
  const totalRegistered = eventAttendance.reduce((sum, e) => sum + e.registered, 0);
  const totalAttended = eventAttendance.reduce((sum, e) => sum + e.attended, 0);
  const overallRate = totalRegistered > 0 ? Math.round((totalAttended / totalRegistered) * 100) : 0;

  // Trend calculation
  const recentMonths = monthlyTrend.slice(-2);
  const previousRate = recentMonths[0]?.rate || 0;
  const currentRate = recentMonths[1]?.rate || 0;
  const trendDiff = currentRate - previousRate;

  const TrendIcon = trendDiff > 0 ? TrendingUp : trendDiff < 0 ? TrendingDown : Minus;
  const trendColor = trendDiff > 0 ? 'text-green-600' : trendDiff < 0 ? 'text-red-600' : 'text-slate-500';

  // Top performing events by attendance rate
  const topEvents = [...eventAttendance]
    .sort((a, b) => b.rate - a.rate)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-80">Overall Attendance Rate</p>
              <p className="text-3xl font-bold">{overallRate}%</p>
            </div>
            <Users className="h-8 w-8 opacity-60" />
          </div>
        </Card>
        
        <Card className="p-4 border-0 shadow-lg">
          <p className="text-sm text-slate-500">Total Registered</p>
          <p className="text-2xl font-bold text-slate-900">{totalRegistered}</p>
        </Card>
        
        <Card className="p-4 border-0 shadow-lg">
          <p className="text-sm text-slate-500">Total Attended</p>
          <p className="text-2xl font-bold text-green-600">{totalAttended}</p>
        </Card>
        
        <Card className="p-4 border-0 shadow-lg">
          <p className="text-sm text-slate-500">Monthly Trend</p>
          <div className="flex items-center gap-2">
            <TrendIcon className={`h-5 w-5 ${trendColor}`} />
            <span className={`text-xl font-bold ${trendColor}`}>
              {trendDiff > 0 ? '+' : ''}{trendDiff}%
            </span>
          </div>
        </Card>
      </div>

      {/* Attendance Trend Chart */}
      <Card className="p-6 border-0 shadow-lg">
        <CardHeader className="p-0 pb-4">
          <CardTitle>Attendance Trend (Last 6 Months)</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyTrend}>
              <defs>
                <linearGradient id="colorRegistered" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorAttended" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="registered" 
                stroke="#6366f1" 
                fillOpacity={1}
                fill="url(#colorRegistered)"
                name="Registered"
              />
              <Area 
                type="monotone" 
                dataKey="attended" 
                stroke="#10b981" 
                fillOpacity={1}
                fill="url(#colorAttended)"
                name="Attended"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Events */}
      <Card className="p-6 border-0 shadow-lg">
        <CardHeader className="p-0 pb-4">
          <CardTitle>Top Events by Attendance Rate</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-3">
            {topEvents.map((event, i) => (
              <div key={event.id} className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                  i === 0 ? 'bg-yellow-500' : i === 1 ? 'bg-slate-400' : i === 2 ? 'bg-amber-600' : 'bg-slate-300'
                }`}>
                  {i + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{event.title}</p>
                  <p className="text-xs text-slate-500">
                    {event.attended}/{event.registered} attended
                  </p>
                </div>
                <Badge className={
                  event.rate >= 80 ? 'bg-green-100 text-green-700' :
                  event.rate >= 60 ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }>
                  {event.rate}%
                </Badge>
              </div>
            ))}
            {topEvents.length === 0 && (
              <p className="text-center text-slate-500 py-4">No attendance data available</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}