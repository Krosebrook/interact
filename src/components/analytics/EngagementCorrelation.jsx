import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend, BarChart, Bar } from 'recharts';

export default function EngagementCorrelation({ pointsLedger = [], recognitions = [], userPoints = [] }) {
  // Points vs Recognition correlation
  const userEngagementData = userPoints?.map(up => {
    const userRecognitions = recognitions?.filter(r => 
      r.sender_email === up.user_email || r.recipient_email === up.user_email
    ).length || 0;

    const userPointsEarned = pointsLedger?.filter(p => 
      p.user_email === up.user_email && p.points > 0
    ).reduce((sum, p) => sum + p.points, 0) || 0;

    return {
      email: up.user_email,
      points: userPointsEarned,
      recognitions: userRecognitions,
      totalPoints: up.total_points,
    };
  }).filter(u => u.points > 0 || u.recognitions > 0) || [];

  // Point earning activities breakdown
  const activityBreakdown = {};
  pointsLedger?.forEach(entry => {
    if (entry.points > 0) {
      const action = entry.action || 'other';
      activityBreakdown[action] = (activityBreakdown[action] || 0) + entry.points;
    }
  });

  const activityData = Object.entries(activityBreakdown)
    .map(([action, points]) => ({
      action: action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      points,
    }))
    .sort((a, b) => b.points - a.points)
    .slice(0, 8);

  // Engagement timeline (last 30 days)
  const last30Days = pointsLedger?.filter(entry => {
    const entryDate = new Date(entry.created_date);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return entryDate >= thirtyDaysAgo;
  }) || [];

  const timelineData = {};
  last30Days.forEach(entry => {
    const date = new Date(entry.created_date).toLocaleDateString();
    if (!timelineData[date]) {
      timelineData[date] = { date, points: 0, activities: 0 };
    }
    if (entry.points > 0) {
      timelineData[date].points += entry.points;
      timelineData[date].activities += 1;
    }
  });

  const timelineChartData = Object.values(timelineData).slice(-14);

  // Calculate correlation coefficient
  const calculateCorrelation = (data) => {
    if (data.length < 2) return 0;
    
    const n = data.length;
    const sumX = data.reduce((sum, d) => sum + d.points, 0);
    const sumY = data.reduce((sum, d) => sum + d.recognitions, 0);
    const sumXY = data.reduce((sum, d) => sum + (d.points * d.recognitions), 0);
    const sumX2 = data.reduce((sum, d) => sum + (d.points * d.points), 0);
    const sumY2 = data.reduce((sum, d) => sum + (d.recognitions * d.recognitions), 0);
    
    const numerator = (n * sumXY) - (sumX * sumY);
    const denominator = Math.sqrt(((n * sumX2) - (sumX * sumX)) * ((n * sumY2) - (sumY * sumY)));
    
    return denominator === 0 ? 0 : numerator / denominator;
  };

  const correlationCoefficient = calculateCorrelation(userEngagementData);
  const correlationStrength = Math.abs(correlationCoefficient) > 0.7 ? 'Strong' : 
                              Math.abs(correlationCoefficient) > 0.4 ? 'Moderate' : 'Weak';

  return (
    <>
      {/* Correlation Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Points vs Recognition Correlation</CardTitle>
          <CardDescription>
            Correlation coefficient: {correlationCoefficient.toFixed(3)} ({correlationStrength} correlation)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="points" name="Points Earned" />
              <YAxis dataKey="recognitions" name="Recognitions" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Legend />
              <Scatter name="Users" data={userEngagementData} fill="#D97230" />
            </ScatterChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Activity Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Points by Activity Type</CardTitle>
          <CardDescription>Where users are earning the most points</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={activityData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="action" type="category" width={150} />
              <Tooltip />
              <Bar dataKey="points" fill="#8B5CF6" name="Total Points" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Engagement Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Engagement Activity</CardTitle>
          <CardDescription>Points and activities over the last 14 days</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timelineChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="points" stroke="#D97230" strokeWidth={2} name="Points Awarded" />
              <Line yAxisId="right" type="monotone" dataKey="activities" stroke="#8B5CF6" strokeWidth={2} name="Activities" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Engagement Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="font-semibold text-blue-900">Correlation Analysis</p>
              <p className="text-sm text-blue-700 mt-1">
                {correlationStrength} {correlationCoefficient > 0 ? 'positive' : 'negative'} correlation between 
                points earned and recognition participation. Users with higher points tend to {correlationCoefficient > 0 ? 'give/receive more' : 'give/receive fewer'} recognitions.
              </p>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <p className="font-semibold text-green-900">Top Activity</p>
              <p className="text-sm text-green-700 mt-1">
                {activityData[0]?.action} is the highest point-earning activity with {activityData[0]?.points.toLocaleString()} 
                total points awarded. Consider incentivizing other activities to diversify engagement.
              </p>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="font-semibold text-purple-900">Engagement Health</p>
              <p className="text-sm text-purple-700 mt-1">
                Average daily engagement: {Math.round(timelineChartData.reduce((sum, d) => sum + d.activities, 0) / timelineChartData.length)} activities. 
                {timelineChartData.length > 1 && timelineChartData[timelineChartData.length - 1].activities > timelineChartData[0].activities 
                  ? ' Trending upward 📈' 
                  : ' Consider boosting engagement initiatives 💡'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}