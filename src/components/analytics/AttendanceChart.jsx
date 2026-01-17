import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users } from 'lucide-react';
import { format, startOfMonth, subMonths, parseISO } from 'date-fns';

export default function AttendanceChart({ events, participations }) {
  const chartData = useMemo(() => {
    if (!events.length || !participations.length) return [];

    // Group by month for the last 6 months
    const monthsData = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(new Date(), i);
      const monthStart = startOfMonth(monthDate);
      const monthKey = format(monthStart, 'MMM yyyy');

      // Events in this month
      const monthEvents = events.filter(e => {
        const eventDate = new Date(e.scheduled_date);
        return eventDate.getMonth() === monthStart.getMonth() && 
               eventDate.getFullYear() === monthStart.getFullYear();
      });

      // Participations in this month
      const monthParticipations = participations.filter(p => {
        const event = events.find(e => e.id === p.event_id);
        if (!event) return false;
        const eventDate = new Date(event.scheduled_date);
        return eventDate.getMonth() === monthStart.getMonth() && 
               eventDate.getFullYear() === monthStart.getFullYear();
      });

      const attended = monthParticipations.filter(p => p.attendance_status === 'attended').length;
      const registered = monthParticipations.length;
      const attendanceRate = registered > 0 ? Math.round((attended / registered) * 100) : 0;

      monthsData.push({
        month: monthKey,
        events: monthEvents.length,
        registered,
        attended,
        attendanceRate
      });
    }

    return monthsData;
  }, [events, participations]);

  const totalStats = useMemo(() => {
    const totalRegistered = chartData.reduce((sum, d) => sum + d.registered, 0);
    const totalAttended = chartData.reduce((sum, d) => sum + d.attended, 0);
    const avgRate = totalRegistered > 0 ? Math.round((totalAttended / totalRegistered) * 100) : 0;

    return { totalRegistered, totalAttended, avgRate };
  }, [chartData]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Stats Cards */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-slate-600">Attendance Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-4 w-4 text-slate-500" />
              <span className="text-xs text-slate-500">Total Registered</span>
            </div>
            <div className="text-3xl font-bold text-slate-900">{totalStats.totalRegistered}</div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              <span className="text-xs text-slate-500">Total Attended</span>
            </div>
            <div className="text-3xl font-bold text-emerald-600">{totalStats.totalAttended}</div>
          </div>
          <div className="pt-4 border-t">
            <div className="text-xs text-slate-500 mb-1">Average Attendance Rate</div>
            <div className="text-2xl font-bold text-purple-600">{totalStats.avgRate}%</div>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            Participation Trends (Last 6 Months)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
              />
              <Legend />
              <Bar dataKey="registered" fill="#94a3b8" name="Registered" radius={[4, 4, 0, 0]} />
              <Bar dataKey="attended" fill="#8b5cf6" name="Attended" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Attendance Rate Line Chart */}
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>Attendance Rate Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} unit="%" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="attendanceRate" 
                stroke="#10b981" 
                strokeWidth={3}
                name="Attendance Rate (%)"
                dot={{ fill: '#10b981', r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}