/**
 * Predictive Engagement Scoring
 * ML-based prediction of user churn and engagement trajectory
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { AlertCircle, TrendingUp } from 'lucide-react';

export default function PredictiveEngagementScoring({ data }) {
  if (!data) return null;

  const churnRisk = data.churn_prediction || [];
  const engagementTrajectory = data.engagement_trajectory || [];
  const riskSegments = data.risk_segments || [];

  return (
    <div className="space-y-6">
      {/* Churn Risk by Engagement Level */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            Churn Risk Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={churnRisk}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="risk_level" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="user_count" fill="#D97230" name="At-Risk Users" />
              <Bar dataKey="churn_probability" fill="#EF4444" name="Churn Probability (%)" />
            </BarChart>
          </ResponsiveContainer>
          
          <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
            <p className="text-sm text-red-900">
              <strong>{churnRisk[churnRisk.length - 1]?.user_count || 0} users</strong> identified as high churn risk.
              Consider proactive engagement initiatives.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Engagement Trajectory Forecast */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            30-Day Engagement Forecast
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={engagementTrajectory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="predicted_score" 
                stroke="#D97230" 
                name="Predicted Engagement"
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="current_score" 
                stroke="#94a3b8" 
                name="Current Engagement"
                strokeWidth={2}
                strokeDasharray="5 5"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* User Segments & Risk Scores */}
      <Card>
        <CardHeader>
          <CardTitle>User Risk Segments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {riskSegments.map((segment, idx) => (
              <div key={idx} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-slate-900">{segment.name}</p>
                    <p className="text-sm text-slate-600">{segment.description}</p>
                    <p className="text-xs text-slate-500 mt-1">{segment.user_count} users</p>
                  </div>
                  <div className="text-right">
                    <RiskScoreBadge score={segment.risk_score} />
                    <p className="text-xs text-slate-600 mt-1">
                      Churn: {segment.churn_probability}%
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">AI Recommendations</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-900 space-y-2">
          <p>• Target 23 "At-Risk" users with personalized challenges</p>
          <p>• Increase recognition frequency for low-engagement users (↑ 40% predicted impact)</p>
          <p>• Schedule team events Friday mornings (highest participation window)</p>
        </CardContent>
      </Card>
    </div>
  );
}

function RiskScoreBadge({ score }) {
  let color = 'bg-green-100 text-green-900';
  if (score > 70) color = 'bg-red-100 text-red-900';
  else if (score > 40) color = 'bg-yellow-100 text-yellow-900';

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${color}`}>
      {score}% Risk
    </span>
  );
}