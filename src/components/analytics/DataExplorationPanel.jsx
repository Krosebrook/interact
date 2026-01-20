import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis } from 'recharts';
import { TrendingUp } from 'lucide-react';

export default function DataExplorationPanel() {
  const [xMetric, setXMetric] = useState('engagement_score');
  const [yMetric, setYMetric] = useState('churn_risk');

  const { data, isLoading } = useQuery({
    queryKey: ['correlation-data', xMetric, yMetric],
    queryFn: async () => {
      const states = await base44.entities.LifecycleState.list();
      const participations = await base44.entities.Participation.list();
      
      const userData = states.map(state => {
        const userParticipations = participations.filter(p => p.user_email === state.user_email);
        
        return {
          user: state.user_email,
          engagement_score: state.engagement_score || 0,
          churn_risk: state.churn_risk || 0,
          participation_count: userParticipations.length,
          days_in_state: state.days_in_state || 0,
          lifecycle_state: state.lifecycle_state
        };
      });

      return userData.slice(0, 100);
    },
    initialData: []
  });

  const metrics = {
    engagement_score: { label: 'Engagement Score', key: 'engagement_score' },
    churn_risk: { label: 'Churn Risk', key: 'churn_risk' },
    participation_count: { label: 'Participation Count', key: 'participation_count' },
    days_in_state: { label: 'Days in State', key: 'days_in_state' }
  };

  const calculateCorrelation = () => {
    if (data.length < 2) return 0;
    
    const xValues = data.map(d => d[xMetric]);
    const yValues = data.map(d => d[yMetric]);
    
    const xMean = xValues.reduce((a, b) => a + b, 0) / xValues.length;
    const yMean = yValues.reduce((a, b) => a + b, 0) / yValues.length;
    
    const numerator = xValues.reduce((sum, x, i) => sum + (x - xMean) * (yValues[i] - yMean), 0);
    const xDenom = Math.sqrt(xValues.reduce((sum, x) => sum + Math.pow(x - xMean, 2), 0));
    const yDenom = Math.sqrt(yValues.reduce((sum, y) => sum + Math.pow(y - yMean, 2), 0));
    
    return (numerator / (xDenom * yDenom)).toFixed(3);
  };

  const correlation = calculateCorrelation();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            Data Correlation Explorer
          </CardTitle>
          <div className="text-right">
            <p className="text-xs text-slate-600">Correlation Coefficient</p>
            <p className={`text-2xl font-bold ${
              Math.abs(correlation) > 0.7 ? 'text-red-600' :
              Math.abs(correlation) > 0.4 ? 'text-yellow-600' :
              'text-green-600'
            }`}>
              {correlation}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-slate-600 mb-2 block">X-Axis Metric</label>
            <Select value={xMetric} onValueChange={setXMetric}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(metrics).map(([key, { label }]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm text-slate-600 mb-2 block">Y-Axis Metric</label>
            <Select value={yMetric} onValueChange={setYMetric}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(metrics).map(([key, { label }]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="h-96 flex items-center justify-center text-slate-500">Loading data...</div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid />
              <XAxis dataKey={xMetric} name={metrics[xMetric].label} />
              <YAxis dataKey={yMetric} name={metrics[yMetric].label} />
              <ZAxis range={[60, 60]} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter data={data} fill="#8b5cf6" />
            </ScatterChart>
          </ResponsiveContainer>
        )}

        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center p-3 bg-slate-50 rounded">
            <p className="text-slate-600">Data Points</p>
            <p className="text-xl font-bold text-slate-900">{data.length}</p>
          </div>
          <div className="text-center p-3 bg-slate-50 rounded">
            <p className="text-slate-600">Correlation Strength</p>
            <p className="text-xl font-bold text-slate-900">
              {Math.abs(correlation) > 0.7 ? 'Strong' :
               Math.abs(correlation) > 0.4 ? 'Moderate' : 'Weak'}
            </p>
          </div>
          <div className="text-center p-3 bg-slate-50 rounded">
            <p className="text-slate-600">Direction</p>
            <p className="text-xl font-bold text-slate-900">
              {correlation > 0 ? 'Positive' : correlation < 0 ? 'Negative' : 'None'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}