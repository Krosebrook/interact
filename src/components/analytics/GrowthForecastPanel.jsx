import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, DollarSign, Activity, Zap } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function GrowthForecastPanel({ timeframe = 90 }) {
  const { data, isLoading } = useQuery({
    queryKey: ['growth-forecast', timeframe],
    queryFn: async () => {
      const response = await base44.functions.invoke('predictiveAnalytics', {
        action: 'forecast_growth',
        timeframe
      });
      return response.data;
    },
    staleTime: 300000
  });

  if (isLoading) {
    return <Card><CardContent className="py-8 text-center text-slate-500">Loading forecast...</CardContent></Card>;
  }

  if (!data) return null;

  const { forecast, current_baseline } = data;

  const chartData = [
    { day: 0, users: current_baseline.total_users, label: 'Today' },
    { day: 30, users: current_baseline.total_users * (1 + forecast.growth_forecast.engagement_growth_rate * 0.33) },
    { day: 60, users: current_baseline.total_users * (1 + forecast.growth_forecast.engagement_growth_rate * 0.66) },
    { day: timeframe, users: forecast.growth_forecast.projected_active_users, label: `Day ${timeframe}` }
  ];

  return (
    <div className="space-y-4">
      <Card className="border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Engagement Growth Forecast
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <Activity className="w-4 h-4 text-green-600" />
                <p className="text-xs text-slate-600">Growth Rate</p>
              </div>
              <p className="text-2xl font-bold text-green-600">
                +{(forecast.growth_forecast.engagement_growth_rate * 100).toFixed(1)}%
              </p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <p className="text-xs text-slate-600">Projected Active</p>
              </div>
              <p className="text-2xl font-bold text-blue-600">
                {Math.round(forecast.growth_forecast.projected_active_users)}
              </p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-4 h-4 text-purple-600" />
                <p className="text-xs text-slate-600">Avg LTV</p>
              </div>
              <p className="text-2xl font-bold text-purple-600">
                ${forecast.ltv_trends.average_ltv}
              </p>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" label={{ value: 'Days', position: 'insideBottom', offset: -5 }} />
                <YAxis label={{ value: 'Active Users', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Line type="monotone" dataKey="users" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">Confidence Interval</span>
            <span className="font-medium">
              {Math.round(forecast.growth_forecast.confidence_interval.lower)} - {Math.round(forecast.growth_forecast.confidence_interval.upper)}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Zap className="w-4 h-4 text-yellow-600" />
            Key Growth Drivers
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {forecast.key_drivers.map((driver, idx) => (
            <div key={idx} className="border rounded-lg p-3">
              <div className="flex items-start justify-between mb-2">
                <p className="font-medium text-slate-900">{driver.driver}</p>
                <Badge className={
                  driver.impact === 'high' ? 'bg-green-100 text-green-800' :
                  driver.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-slate-100 text-slate-800'
                }>
                  {driver.impact} impact
                </Badge>
              </div>
              <p className="text-sm text-slate-600">{driver.recommendation}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {forecast.risks?.length > 0 && (
        <Card className="border-orange-200">
          <CardHeader>
            <CardTitle className="text-base text-orange-900">Potential Risks</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1">
              {forecast.risks.map((risk, idx) => (
                <li key={idx} className="text-sm text-orange-700">• {risk}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}