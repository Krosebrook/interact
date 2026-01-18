import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { Users } from 'lucide-react';

const STATE_COLORS = {
  new: '#3B82F6',
  activated: '#10B981',
  engaged: '#8B5CF6',
  power_user: '#F59E0B',
  at_risk: '#EAB308',
  dormant: '#64748B',
  returning: '#14B8A6'
};

export default function StateDistributionChart({ data }) {
  if (!data) return null;

  const barData = Object.entries(data.distribution).map(([state, count]) => ({
    name: state.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    count,
    percentage: data.percentages[state]
  }));

  const pieData = Object.entries(data.churn_risk_distribution).map(([level, count]) => ({
    name: level.charAt(0).toUpperCase() + level.slice(1),
    value: count
  }));

  const RISK_COLORS = {
    Low: '#10B981',
    Medium: '#EAB308',
    High: '#EF4444'
  };

  return (
    <div className="grid grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            User Distribution by Lifecycle State
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end" 
                height={80}
                style={{ fontSize: '12px' }}
              />
              <YAxis />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200">
                        <p className="font-semibold text-slate-900">{payload[0].payload.name}</p>
                        <p className="text-sm text-slate-600">Users: {payload[0].value}</p>
                        <p className="text-sm text-slate-600">
                          {payload[0].payload.percentage.toFixed(1)}% of total
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {barData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={STATE_COLORS[Object.keys(data.distribution)[index]]} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-orange-600" />
            Churn Risk Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={RISK_COLORS[entry.name]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}