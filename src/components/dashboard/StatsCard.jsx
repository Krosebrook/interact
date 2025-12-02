import React from 'react';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';

export default function StatsCard({ title, value, subtitle, icon: Icon, color = "indigo", trend }) {
  const colorClasses = {
    indigo: "from-indigo-500 to-indigo-600",
    coral: "from-rose-500 to-pink-600",
    mint: "from-emerald-500 to-teal-600",
    sky: "from-blue-500 to-cyan-600"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow">
        <div className={`absolute inset-0 bg-gradient-to-br ${colorClasses[color]} opacity-5`} />
        <div className="p-6 relative">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
              <p className="text-3xl font-bold text-slate-900 mb-1">{value}</p>
              {subtitle && (
                <p className="text-sm text-slate-600">{subtitle}</p>
              )}
              {trend && (
                <p className="text-xs text-emerald-600 font-medium mt-2">
                  ↑ {trend}
                </p>
              )}
            </div>
            <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClasses[color]}`}>
              <Icon className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}