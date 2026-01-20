import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, AlertTriangle, Lightbulb, BarChart3 } from 'lucide-react';
import ChurnPredictionPanel from '../components/analytics/ChurnPredictionPanel';
import GrowthForecastPanel from '../components/analytics/GrowthForecastPanel';
import PredictiveInsightsPanel from '../components/analytics/PredictiveInsightsPanel';

export default function PredictiveAnalyticsDashboard() {
  const [timeframe, setTimeframe] = useState('90');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="w-8 h-8 text-purple-600" />
            Predictive Analytics
          </h1>
          <p className="text-slate-600 mt-1">AI-powered forecasts and insights for strategic planning</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600">Forecast Period:</span>
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">30 Days</SelectItem>
              <SelectItem value="60">60 Days</SelectItem>
              <SelectItem value="90">90 Days</SelectItem>
              <SelectItem value="180">6 Months</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Churn Risk</p>
                <p className="text-2xl font-bold text-red-600">Monitor</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Growth Forecast</p>
                <p className="text-2xl font-bold text-green-600">Positive</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Lightbulb className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">AI Insights</p>
                <p className="text-2xl font-bold text-blue-600">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="insights">
        <TabsList>
          <TabsTrigger value="insights">
            <Lightbulb className="w-4 h-4 mr-2" />
            Insights & Alerts
          </TabsTrigger>
          <TabsTrigger value="churn">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Churn Prediction
          </TabsTrigger>
          <TabsTrigger value="growth">
            <TrendingUp className="w-4 h-4 mr-2" />
            Growth Forecast
          </TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-4">
          <PredictiveInsightsPanel />
        </TabsContent>

        <TabsContent value="churn" className="space-y-4">
          <ChurnPredictionPanel />
        </TabsContent>

        <TabsContent value="growth" className="space-y-4">
          <GrowthForecastPanel timeframe={parseInt(timeframe)} />
        </TabsContent>
      </Tabs>
    </div>
  );
}