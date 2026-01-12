import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function QuickStats({ stats, icon: Icon, color = 'indigo' }) {
  const colorClasses = {
    indigo: 'text-indigo-600',
    coral: 'text-coral-600',
    mint: 'text-mint-600',
    sky: 'text-sky-600',
    orange: 'text-int-orange',
    navy: 'text-int-navy'
  };

  return (
    <Card data-b44-sync="true" data-feature="dashboard" data-component="quickstats">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{stats.title}</CardTitle>
        {Icon && <Icon className={`h-4 w-4 ${colorClasses[color]}`} />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{stats.value}</div>
        {stats.subtitle && <p className="text-xs text-slate-500 mt-1">{stats.subtitle}</p>}
        {stats.trend && <p className="text-xs text-green-600 mt-1">{stats.trend}</p>}
      </CardContent>
    </Card>
  );
}