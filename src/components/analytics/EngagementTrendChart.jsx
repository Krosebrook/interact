import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp, Activity, Users } from 'lucide-react';
import { format, startOfMonth, subMonths } from 'date-fns';

export default function EngagementTrendChart({ events, participations }) {
  const trendData = useMemo(() => {
    if (!events.length || !participations.length) return [];

    const monthsData = [];
    for (let i = 11; i >= 0; i--) {
      const monthDate = subMonths(new Date(), i);
      const monthStart = startOfMonth(monthDate);
      const monthKey = format(monthStart, 'MMM yy');

      const monthEvents = events.filter(e => {
        const eventDate = new Date(e.scheduled_date);
        return eventDate.getMonth() === monthStart.getMonth() && 
               eventDate.getFullYear() === monthStart.getFullYear();
      });

      const monthParticipations = participations.filter(p => {
        const event = events.find(e => e.id === p.event_id);
        if (!event) return false;
        const eventDate = new Date(event.scheduled_date);
        return eventDate.getMonth() === monthStart.getMonth() && 
               eventDate.getFullYear() === monthStart.getFullYear();
      });

      const uniqueParticipants = new Set(monthParticipations.map(p => p.user_email)).size;
      const attended = monthParticipations.filter(p => p.attendance_status === 'attended').length;
      const avgRating = monthParticipations.filter(p => p.feedback_rating).length > 0
        ? monthParticipations.reduce((sum, p) => sum + (p.feedback_rating || 0), 0) / 
          monthParticipations.filter(p => p.feedback_rating).length
        : 0;

      monthsData.push({
        month: monthKey,
        events: monthEvents.length,
        participants: uniqueParticipants,
        attendance: attended,
        avgRating: avgRating.toFixed(1)
      });
    }

    return monthsData;
  }, [events, participations]);

  const summary = useMemo(() => {
    const recentMonths = trendData.slice(-3);
    const olderMonths = trendData.slice(-6, -3);

    const recentAvg = recentMonths.reduce((sum, d) => sum + d.attendance, 0) / Math.max(recentMonths.length, 1);
    const olderAvg = olderMonths.reduce((sum, d) => sum + d.attendance, 0) / Math.max(olderMonths.length, 1);
    
    const trend = recentAvg > olderAvg ? 'increasing' : recentAvg < olderAvg ? 'decreasing' : 'stable';
    const change = olderAvg > 0 ? (((recentAvg - olderAvg) / olderAvg) * 100).toFixed(1) : 0;

    return { trend, change };
  }, [trendData]);

  return (
    <div className="space-y-6">
      {/* Trend Summary */}
      <Card className={`border-2 ${summary.trend === 'increasing' ? 'border-emerald-200' : summary.trend === 'decreasing' ? 'border-red-200' : 'border-slate-200'}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-slate-600 mb-1">Engagement Trend</h3>
              <div className="flex items-center gap-2">
                <TrendingUp className={`h-6 w-6 ${summary.trend === 'increasing' ? 'text-emerald-600' : summary.trend === 'decreasing' ? 'text-red-600 rotate-180' : 'text-slate-600'}`} />
                <span className="text-2xl font-bold text-slate-900 capitalize">{summary.trend}</span>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-3xl font-bold ${summary.trend === 'increasing' ? 'text-emerald-600' : summary.trend === 'decreasing' ? 'text-red-600' : 'text-slate-600'}`}>
                {summary.change > 0 ? '+' : ''}{summary.change}%
              </div>
              <p className="text-xs text-slate-500">vs previous quarter</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Engagement Over Time */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-purple-600" />
            Engagement Metrics Over Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="colorEvents" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
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
              <Area 
                type="monotone" 
                dataKey="events" 
                stroke="#8b5cf6" 
                fillOpacity={1}
                fill="url(#colorEvents)"
                name="Events" 
              />
              <Area 
                type="monotone" 
                dataKey="attendance" 
                stroke="#10b981" 
                fillOpacity={1}
                fill="url(#colorAttendance)"
                name="Attendance" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Participant & Rating Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-int-orange" />
            Participants & Satisfaction
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
              <YAxis yAxisId="left" stroke="#64748b" fontSize={12} />
              <YAxis yAxisId="right" orientation="right" stroke="#64748b" fontSize={12} domain={[0, 5]} />
              <Tooltip />
              <Legend />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="participants" 
                stroke="#D97230" 
                strokeWidth={3}
                name="Unique Participants"
                dot={{ fill: '#D97230', r: 4 }}
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="avgRating" 
                stroke="#f59e0b" 
                strokeWidth={3}
                name="Avg Rating (0-5)"
                dot={{ fill: '#f59e0b', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}