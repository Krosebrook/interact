import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Clock, TrendingUp, Users, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ValueMetricsCard() {
  const { data: valueMetrics } = useQuery({
    queryKey: ['value-metrics'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const response = await base44.functions.invoke('monetizationEngine', {
        action: 'calculate_value_metrics',
        userEmail: user.email
      });
      return response.data.metrics;
    }
  });

  if (!valueMetrics) return null;

  const metrics = [
    {
      icon: Clock,
      label: 'Time Saved',
      value: `${valueMetrics.time_saved_hours}h`,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      icon: TrendingUp,
      label: 'Portfolio Accuracy',
      value: `+${valueMetrics.portfolio_accuracy_improvement}%`,
      color: 'text-green-600',
      bg: 'bg-green-50'
    },
    {
      icon: Users,
      label: 'Network Strength',
      value: `${valueMetrics.network_strength}`,
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    },
    {
      icon: Target,
      label: 'Deals Value Examined',
      value: `$${(valueMetrics.deals_value_examined / 1000000).toFixed(1)}M`,
      color: 'text-orange-600',
      bg: 'bg-orange-50'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Your Value This Month</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {metrics.map((metric, idx) => {
            const Icon = metric.icon;
            return (
              <div key={idx} className={`${metric.bg} rounded-lg p-3 text-center`}>
                <Icon className={`w-5 h-5 ${metric.color} mx-auto mb-2`} />
                <p className="text-xs text-slate-600 mb-1">{metric.label}</p>
                <p className={`text-sm font-bold ${metric.color}`}>{metric.value}</p>
              </div>
            );
          })}
        </div>

        <p className="text-xs text-slate-500 text-center mt-4">
          🎯 This is the value you've unlocked by staying engaged.
        </p>
      </CardContent>
    </Card>
  );
}