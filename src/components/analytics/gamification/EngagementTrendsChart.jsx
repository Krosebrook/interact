import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart, ComposedChart, Bar } from 'recharts';
import { TrendingUp, TrendingDown, Activity, Target, Zap } from 'lucide-react';
import { format, subDays, startOfDay, eachDayOfInterval } from 'date-fns';

export default function EngagementTrendsChart({ 
  userPoints = [], 
  participations = [], 
  challenges = [],
  timeRange = 30 
}) {
  const [selectedMetric, setSelectedMetric] = React.useState('all');

  const trendData = useMemo(() => {
    const days = eachDayOfInterval({
      start: subDays(new Date(), timeRange),
      end: new Date()
    });

    return days.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      const dayStart = startOfDay(day);
      
      // Points earned that day
      const dayPoints = userPoints.reduce((sum, up) => {
        const history = up.points_history || [];
        const dayPointsSum = history
          .filter(h => h.timestamp && format(new Date(h.timestamp), 'yyyy-MM-dd') === dayStr)
          .reduce((s, h) => s + (h.amount || 0), 0);
        return sum + dayPointsSum;
      }, 0);

      // Events attended
      const dayParticipations = participations.filter(p => 
        p.attended && p.created_date && format(new Date(p.created_date), 'yyyy-MM-dd') === dayStr
      ).length;

      // Challenges completed
      const dayChallenges = challenges.filter(c =>
        c.status === 'completed' && c.completed_date && format(new Date(c.completed_date), 'yyyy-MM-dd') === dayStr
      ).length;

      // Active users (users who earned points)
      const activeUsers = new Set(
        userPoints.filter(up => {
          const history = up.points_history || [];
          return history.some(h => h.timestamp && format(new Date(h.timestamp), 'yyyy-MM-dd') === dayStr);
        }).map(up => up.user_email)
      ).size;

      return {
        date: format(day, 'MMM dd'),
        fullDate: dayStr,
        points: dayPoints,
        events: dayParticipations,
        challenges: dayChallenges,
        activeUsers,
        engagementScore: Math.round((dayPoints / 10) + (dayParticipations * 5) + (dayChallenges * 10))
      };
    });
  }, [userPoints, participations, challenges, timeRange]);

  // Calculate correlation between challenges and engagement
  const correlation = useMemo(() => {
    if (trendData.length < 7) return null;
    
    const challengeValues = trendData.map(d => d.challenges);
    const engagementValues = trendData.map(d => d.engagementScore);
    
    const n = challengeValues.length;
    const sumX = challengeValues.reduce((a, b) => a + b, 0);
    const sumY = engagementValues.reduce((a, b) => a + b, 0);
    const sumXY = challengeValues.reduce((sum, x, i) => sum + x * engagementValues[i], 0);
    const sumX2 = challengeValues.reduce((sum, x) => sum + x * x, 0);
    const sumY2 = engagementValues.reduce((sum, y) => sum + y * y, 0);
    
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    
    return denominator === 0 ? 0 : (numerator / denominator);
  }, [trendData]);

  // Calculate week-over-week change
  const weekChange = useMemo(() => {
    if (trendData.length < 14) return null;
    
    const thisWeek = trendData.slice(-7).reduce((sum, d) => sum + d.engagementScore, 0);
    const lastWeek = trendData.slice(-14, -7).reduce((sum, d) => sum + d.engagementScore, 0);
    
    return lastWeek > 0 ? ((thisWeek - lastWeek) / lastWeek * 100).toFixed(1) : 0;
  }, [trendData]);

  return (
    <Card className="col-span-2">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-int-orange" />
            Engagement Trends
          </CardTitle>
          <p className="text-sm text-slate-500 mt-1">
            User activity and challenge completion over time
          </p>
        </div>
        <div className="flex items-center gap-3">
          {weekChange !== null && (
            <Badge className={`${parseFloat(weekChange) >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
              {parseFloat(weekChange) >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
              {weekChange}% WoW
            </Badge>
          )}
          <Select value={selectedMetric} onValueChange={setSelectedMetric}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Metrics</SelectItem>
              <SelectItem value="engagement">Engagement</SelectItem>
              <SelectItem value="challenges">Challenges</SelectItem>
              <SelectItem value="points">Points</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {/* Correlation insight */}
        {correlation !== null && (
          <div className="mb-4 p-3 bg-slate-50 rounded-lg flex items-center gap-3">
            <Target className="h-5 w-5 text-int-navy" />
            <div>
              <span className="text-sm font-medium text-slate-700">Challenge-Engagement Correlation: </span>
              <span className={`font-bold ${correlation > 0.5 ? 'text-emerald-600' : correlation > 0.2 ? 'text-amber-600' : 'text-slate-600'}`}>
                {(correlation * 100).toFixed(0)}%
              </span>
              <span className="text-xs text-slate-500 ml-2">
                {correlation > 0.5 ? '(Strong positive)' : correlation > 0.2 ? '(Moderate)' : '(Weak)'}
              </span>
            </div>
          </div>
        )}

        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis yAxisId="left" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255,255,255,0.95)', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              {(selectedMetric === 'all' || selectedMetric === 'engagement') && (
                <Area 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="engagementScore" 
                  name="Engagement Score"
                  fill="rgba(217, 114, 48, 0.2)" 
                  stroke="#D97230"
                  strokeWidth={2}
                />
              )}
              {(selectedMetric === 'all' || selectedMetric === 'challenges') && (
                <Bar 
                  yAxisId="right"
                  dataKey="challenges" 
                  name="Challenges Completed"
                  fill="#14294D"
                  radius={[4, 4, 0, 0]}
                />
              )}
              {(selectedMetric === 'all' || selectedMetric === 'points') && (
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="points" 
                  name="Points Earned"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={false}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t">
          <div className="text-center">
            <p className="text-2xl font-bold text-int-orange">
              {trendData.reduce((sum, d) => sum + d.engagementScore, 0).toLocaleString()}
            </p>
            <p className="text-xs text-slate-500">Total Engagement</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-int-navy">
              {trendData.reduce((sum, d) => sum + d.challenges, 0)}
            </p>
            <p className="text-xs text-slate-500">Challenges Done</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-600">
              {trendData.reduce((sum, d) => sum + d.points, 0).toLocaleString()}
            </p>
            <p className="text-xs text-slate-500">Points Earned</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">
              {Math.max(...trendData.map(d => d.activeUsers))}
            </p>
            <p className="text-xs text-slate-500">Peak Active Users</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}