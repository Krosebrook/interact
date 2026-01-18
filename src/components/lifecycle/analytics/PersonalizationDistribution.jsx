import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const LEVEL_COLORS = {
  onboarding: '#3B82F6',
  learning: '#10B981',
  autonomous: '#8B5CF6',
  expert: '#F59E0B'
};

export default function PersonalizationDistribution({ data }) {
  if (!data?.distribution) return null;

  const chartData = Object.entries(data.distribution).map(([level, count]) => ({
    name: level.charAt(0).toUpperCase() + level.slice(1),
    count,
    level
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-600" />
          Personalization Level Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" radius={[8, 8, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={LEVEL_COLORS[entry.level]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="grid grid-cols-4 gap-4 mt-4">
          {chartData.map(item => (
            <div key={item.level} className="text-center p-3 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-600 mb-1">{item.name}</p>
              <p className="text-2xl font-bold" style={{ color: LEVEL_COLORS[item.level] }}>
                {item.count}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}