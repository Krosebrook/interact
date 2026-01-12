import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Sparkles, ThumbsUp, ThumbsDown, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AIFeatureAnalytics() {
  const { data: aiEvents } = useQuery({
    queryKey: ['ai-interaction-events'],
    queryFn: () => base44.entities.AnalyticsEvent.filter({
      event_category: 'ai_interaction'
    })
  });

  const analytics = useMemo(() => {
    if (!aiEvents) return null;

    const byFeature = {};
    let totalAccepted = 0;
    let totalRejected = 0;

    aiEvents.forEach(event => {
      const feature = event.feature_name;
      if (!byFeature[feature]) {
        byFeature[feature] = {
          feature,
          accepted: 0,
          rejected: 0,
          totalConfidence: 0,
          count: 0
        };
      }

      if (event.event_type === 'ai_suggestion_accepted') {
        byFeature[feature].accepted += 1;
        totalAccepted += 1;
      } else {
        byFeature[feature].rejected += 1;
        totalRejected += 1;
      }

      if (event.event_data?.ai_confidence) {
        byFeature[feature].totalConfidence += event.event_data.ai_confidence;
        byFeature[feature].count += 1;
      }
    });

    const featureStats = Object.values(byFeature).map(f => ({
      ...f,
      acceptanceRate: ((f.accepted / (f.accepted + f.rejected)) * 100).toFixed(1),
      avgConfidence: f.count > 0 ? (f.totalConfidence / f.count * 100).toFixed(1) : 0,
      total: f.accepted + f.rejected
    })).sort((a, b) => b.total - a.total);

    const overallAcceptanceRate = totalAccepted + totalRejected > 0
      ? ((totalAccepted / (totalAccepted + totalRejected)) * 100).toFixed(1)
      : 0;

    return {
      featureStats,
      totalAccepted,
      totalRejected,
      overallAcceptanceRate,
      totalInteractions: totalAccepted + totalRejected
    };
  }, [aiEvents]);

  if (!analytics) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-purple-700">{analytics.totalInteractions}</div>
                <div className="text-sm text-purple-600">Total AI Interactions</div>
              </div>
              <Sparkles className="h-10 w-10 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-green-700">{analytics.overallAcceptanceRate}%</div>
                <div className="text-sm text-green-600">Acceptance Rate</div>
              </div>
              <ThumbsUp className="h-10 w-10 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-blue-700">{analytics.totalAccepted}</div>
                <div className="text-sm text-blue-600">Accepted Suggestions</div>
              </div>
              <TrendingUp className="h-10 w-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-red-700">{analytics.totalRejected}</div>
                <div className="text-sm text-red-600">Rejected Suggestions</div>
              </div>
              <ThumbsDown className="h-10 w-10 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>AI Feature Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.featureStats.map((feature) => (
              <div key={feature.feature} className="p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-slate-900">{formatFeatureName(feature.feature)}</h4>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      {feature.acceptanceRate}% accepted
                    </Badge>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                      {feature.avgConfidence}% confidence
                    </Badge>
                  </div>
                </div>
                <Progress value={parseFloat(feature.acceptanceRate)} className="h-2 mb-2" />
                <div className="flex justify-between text-sm text-slate-600">
                  <span>{feature.accepted} accepted</span>
                  <span>{feature.rejected} rejected</span>
                  <span>{feature.total} total</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Acceptance Rate by Feature</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.featureStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="feature" tickFormatter={formatFeatureName} angle={-45} textAnchor="end" height={100} />
              <YAxis label={{ value: 'Acceptance Rate (%)', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value) => `${value}%`} />
              <Bar dataKey="acceptanceRate" fill="#10b981" name="Acceptance Rate" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

function formatFeatureName(name) {
  return name.split(/(?=[A-Z])/).join(' ').replace(/^./, str => str.toUpperCase());
}