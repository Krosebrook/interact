import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Area
} from 'recharts';
import { Sparkles, TrendingUp, Award } from 'lucide-react';
import { format, subWeeks, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';

export default function EngagementOverTime({ events, participations, userProfiles }) {
  // Weekly engagement trend (last 12 weeks)
  const weeklyEngagement = [];
  for (let i = 11; i >= 0; i--) {
    const weekDate = subWeeks(new Date(), i);
    const weekStart = startOfWeek(weekDate);
    const weekEnd = endOfWeek(weekDate);
    
    const weekEvents = events.filter(e => 
      isWithinInterval(new Date(e.scheduled_date), { start: weekStart, end: weekEnd })
    );
    
    const weekParticipations = participations.filter(p => {
      const event = events.find(e => e.id === p.event_id);
      return event && isWithinInterval(new Date(event.scheduled_date), { start: weekStart, end: weekEnd });
    });
    
    const scoresWithValues = weekParticipations.filter(p => p.engagement_score);
    const avgScore = scoresWithValues.length > 0
      ? scoresWithValues.reduce((sum, p) => sum + p.engagement_score, 0) / scoresWithValues.length
      : 0;
    
    weeklyEngagement.push({
      week: format(weekDate, 'MMM d'),
      avgEngagement: parseFloat(avgScore.toFixed(1)),
      participants: weekParticipations.filter(p => p.attended).length,
      events: weekEvents.length,
      feedbackCount: weekParticipations.filter(p => p.feedback).length
    });
  }

  // Engagement distribution
  const engagementDistribution = [
    { range: '0-2', count: participations.filter(p => p.engagement_score && p.engagement_score <= 2).length, label: 'Low' },
    { range: '3-4', count: participations.filter(p => p.engagement_score && p.engagement_score > 2 && p.engagement_score <= 4).length, label: 'Below Avg' },
    { range: '5-6', count: participations.filter(p => p.engagement_score && p.engagement_score > 4 && p.engagement_score <= 6).length, label: 'Average' },
    { range: '7-8', count: participations.filter(p => p.engagement_score && p.engagement_score > 6 && p.engagement_score <= 8).length, label: 'Good' },
    { range: '9-10', count: participations.filter(p => p.engagement_score && p.engagement_score > 8).length, label: 'Excellent' }
  ];

  // Top engaged participants
  const participantEngagement = {};
  participations.forEach(p => {
    if (!participantEngagement[p.participant_email]) {
      participantEngagement[p.participant_email] = {
        email: p.participant_email,
        name: p.participant_name,
        totalScore: 0,
        count: 0,
        eventsAttended: 0
      };
    }
    if (p.engagement_score) {
      participantEngagement[p.participant_email].totalScore += p.engagement_score;
      participantEngagement[p.participant_email].count += 1;
    }
    if (p.attended) {
      participantEngagement[p.participant_email].eventsAttended += 1;
    }
  });

  const topEngaged = Object.values(participantEngagement)
    .map(p => ({
      ...p,
      avgScore: p.count > 0 ? (p.totalScore / p.count).toFixed(1) : 0
    }))
    .filter(p => p.count >= 2) // At least 2 events for meaningful average
    .sort((a, b) => b.avgScore - a.avgScore)
    .slice(0, 5);

  // Overall metrics
  const allScores = participations.filter(p => p.engagement_score);
  const overallAvg = allScores.length > 0
    ? (allScores.reduce((sum, p) => sum + p.engagement_score, 0) / allScores.length).toFixed(1)
    : 0;
  
  const highEngagement = allScores.filter(p => p.engagement_score >= 7).length;
  const engagementRate = allScores.length > 0 
    ? Math.round((highEngagement / allScores.length) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-80">Avg Engagement Score</p>
              <p className="text-3xl font-bold">{overallAvg}/10</p>
            </div>
            <Sparkles className="h-8 w-8 opacity-60" />
          </div>
        </Card>
        
        <Card className="p-4 border-0 shadow-lg">
          <p className="text-sm text-slate-500">High Engagement Rate</p>
          <p className="text-2xl font-bold text-green-600">{engagementRate}%</p>
          <p className="text-xs text-slate-400">Score 7+ out of 10</p>
        </Card>
        
        <Card className="p-4 border-0 shadow-lg">
          <p className="text-sm text-slate-500">Feedback Submissions</p>
          <p className="text-2xl font-bold text-blue-600">
            {participations.filter(p => p.feedback).length}
          </p>
        </Card>
        
        <Card className="p-4 border-0 shadow-lg">
          <p className="text-sm text-slate-500">Unique Participants</p>
          <p className="text-2xl font-bold text-slate-900">
            {Object.keys(participantEngagement).length}
          </p>
        </Card>
      </div>

      {/* Engagement Over Time */}
      <Card className="p-6 border-0 shadow-lg">
        <CardHeader className="p-0 pb-4">
          <CardTitle>Engagement Trend (Last 12 Weeks)</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={weeklyEngagement}>
              <defs>
                <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="week" stroke="#64748b" fontSize={12} />
              <YAxis yAxisId="left" stroke="#64748b" domain={[0, 10]} />
              <YAxis yAxisId="right" orientation="right" stroke="#64748b" />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
              />
              <Legend />
              <Area 
                yAxisId="left"
                type="monotone" 
                dataKey="avgEngagement" 
                stroke="#8b5cf6" 
                fill="url(#colorEngagement)"
                name="Avg Score"
              />
              <Bar 
                yAxisId="right"
                dataKey="participants" 
                fill="#10b981" 
                name="Participants"
                opacity={0.7}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Engagement Distribution */}
        <Card className="p-6 border-0 shadow-lg">
          <CardHeader className="p-0 pb-4">
            <CardTitle>Engagement Score Distribution</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={engagementDistribution} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" stroke="#64748b" />
                <YAxis dataKey="label" type="category" stroke="#64748b" width={80} />
                <Tooltip />
                <Bar 
                  dataKey="count" 
                  fill="#6366f1"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Engaged Participants */}
        <Card className="p-6 border-0 shadow-lg">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-500" />
              Top Engaged Participants
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-3">
              {topEngaged.map((participant, i) => (
                <div key={participant.email} className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                    i === 0 ? 'bg-yellow-500' : i === 1 ? 'bg-slate-400' : i === 2 ? 'bg-amber-600' : 'bg-slate-300'
                  }`}>
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{participant.name}</p>
                    <p className="text-xs text-slate-500">
                      {participant.eventsAttended} events • {participant.count} rated
                    </p>
                  </div>
                  <Badge className="bg-purple-100 text-purple-700">
                    {participant.avgScore}/10
                  </Badge>
                </div>
              ))}
              {topEngaged.length === 0 && (
                <p className="text-center text-slate-500 py-4">Not enough data yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}