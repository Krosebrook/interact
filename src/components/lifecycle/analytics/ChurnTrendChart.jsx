import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingDown } from 'lucide-react';

export default function ChurnTrendChart({ data, timeRange }) {
  if (!data?.trends) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingDown className="w-5 h-5 text-red-600" />
          Churn Risk Trends (Last {timeRange} Days)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={data.trends}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="week_start" 
              style={{ fontSize: '12px' }}
            />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200">
                      <p className="font-semibold text-slate-900 mb-2">
                        Week of {payload[0].payload.week_start}
                      </p>
                      <p className="text-sm text-red-600">
                        Avg Churn Risk: {payload[0].value}
                      </p>
                      <p className="text-sm text-yellow-600">
                        At-Risk: {payload[1].value}
                      </p>
                      <p className="text-sm text-slate-600">
                        Dormant: {payload[2].value}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="avg_churn_risk" 
              stroke="#EF4444" 
              strokeWidth={2}
              name="Avg Churn Risk"
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="at_risk_users" 
              stroke="#EAB308" 
              strokeWidth={2}
              name="At-Risk Users"
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="dormant_users" 
              stroke="#64748B" 
              strokeWidth={2}
              name="Dormant Users"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}