import React from 'react';

export function StatCard({ title, value, subtitle, trend, icon: Icon, color = 'orange' }) {
  const accentColors = {
    orange: 'from-int-orange/20 to-int-orange/5',
    navy: 'from-int-navy/20 to-int-navy/5',
    purple: 'from-purple-500/20 to-purple-500/5',
    green: 'from-emerald-500/20 to-emerald-500/5',
    slate: 'from-slate-500/20 to-slate-500/5'
  };

  const iconColors = {
    orange: 'text-int-orange',
    navy: 'text-int-navy',
    purple: 'text-purple-400',
    green: 'text-emerald-400',
    slate: 'text-slate-400'
  };

  return (
    <div className="glass-card-solid group relative overflow-hidden">
      {/* Accent gradient top bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${accentColors[color]}`} />
      
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <p className="text-3xl font-bold text-slate-900">{value}</p>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
          {trend && (
            <p className="text-xs text-emerald-600 mt-1 font-medium">{trend}</p>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl bg-gradient-to-br ${accentColors[color]}`}>
            <Icon className={`h-5 w-5 ${iconColors[color]}`} />
          </div>
        )}
      </div>
    </div>
  );
}

export default function StatsGrid({ stats, columns = 4 }) {
  const gridCols = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-4`}>
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
}