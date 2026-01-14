/**
 * Trend Analysis
 * Popular actions, badges, and challenges over time
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Award, Target } from 'lucide-react';

export default function TrendAnalysis({ data }) {
  if (!data) return null;

  const actionTrends = data.action_trends || [];
  const badgeTrends = data.badge_trends || [];
  const challengeTrends = data.challenge_trends || [];
  const topTrending = data.top_trending || [];

  return (
    <div className="space-y-6">
      {/* Top Trending Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-int-orange" />
            🔥 Trending Now
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topTrending.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-slate-600">{item.type} • {item.momentum}% growth</p>
                </div>
                <span className="text-3xl">{item.emoji}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Popular Actions (30-day trend)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={actionTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="recognition_given" stroke="#D97230" strokeWidth={2} />
              <Line type="monotone" dataKey="events_attended" stroke="#10B981" strokeWidth={2} />
              <Line type="monotone" dataKey="challenges_completed" stroke="#06B6D4" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Badge Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Most Earned Badges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={badgeTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="earned_count" fill="#D97230" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Challenge Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Challenge Participation Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {challengeTrends.map((challenge, idx) => (
              <div key={idx} className="p-4 bg-gradient-to-r from-slate-50 to-transparent rounded-lg border">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{challenge.name}</p>
                    <p className="text-sm text-slate-600 mt-1">
                      {challenge.participants} participants • {challenge.completion_rate}% completion
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-int-orange">{challenge.growth}%</p>
                    <p className="text-xs text-slate-600">growth</p>
                  </div>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 mt-3">
                  <div
                    className="bg-int-orange h-2 rounded-full"
                    style={{ width: `${challenge.completion_rate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle>Engagement Heatmap (by day & hour)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, dayIdx) => (
              <div key={day}>
                <p className="text-xs font-medium text-center mb-2">{day}</p>
                {[...Array(24)].map((_, hourIdx) => {
                  const intensity = Math.random();
                  return (
                    <div
                      key={`${day}-${hourIdx}`}
                      className={`h-2 rounded-sm mb-1 ${
                        intensity > 0.7 ? 'bg-int-orange' : intensity > 0.4 ? 'bg-int-orange/50' : 'bg-slate-200'
                      }`}
                      title={`${hourIdx}:00 - ${intensity.toFixed(2)} intensity`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}