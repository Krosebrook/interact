import React from 'react';
import { motion } from 'framer-motion';

export function StatCard({ title, value, subtitle, trend, icon: Icon, color = 'orange', delay = 0 }) {
  const gradientBgs = {
    orange: 'bg-gradient-orange',
    navy: 'bg-gradient-navy',
    purple: 'bg-gradient-purple',
    green: 'bg-gradient-wellness',
    icebreaker: 'bg-gradient-icebreaker',
    creative: 'bg-gradient-creative',
    competitive: 'bg-gradient-competitive',
    wellness: 'bg-gradient-wellness',
    learning: 'bg-gradient-learning',
    social: 'bg-gradient-social'
  };

  const iconBgs = {
    orange: 'bg-int-orange/10',
    navy: 'bg-int-navy/10',
    purple: 'bg-purple-500/10',
    green: 'bg-emerald-500/10',
    icebreaker: 'bg-blue-500/10',
    creative: 'bg-purple-500/10',
    competitive: 'bg-amber-500/10',
    wellness: 'bg-emerald-500/10',
    learning: 'bg-cyan-500/10',
    social: 'bg-pink-500/10'
  };

  const iconColors = {
    orange: 'text-int-orange',
    navy: 'text-int-navy',
    purple: 'text-purple-600',
    green: 'text-emerald-600',
    icebreaker: 'text-blue-600',
    creative: 'text-purple-600',
    competitive: 'text-amber-600',
    wellness: 'text-emerald-600',
    learning: 'text-cyan-600',
    social: 'text-pink-600'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="glass-card-solid group relative overflow-hidden hover-lift"
    >
      {/* Gradient accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${gradientBgs[color] || gradientBgs.orange}`} />
      
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-int-navy">{value}</p>
          {subtitle && <p className="text-xs text-slate-600 mt-1">{subtitle}</p>}
          {trend && (
            <p className="text-xs text-emerald-600 mt-1 font-semibold">{trend}</p>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl ${iconBgs[color] || iconBgs.orange} group-hover:scale-110 transition-transform`}>
            <Icon className={`h-6 w-6 ${iconColors[color] || iconColors.orange}`} />
          </div>
        )}
      </div>
    </motion.div>
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