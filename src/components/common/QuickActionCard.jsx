import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { ChevronRight } from 'lucide-react';

const colorVariants = {
  navy: { bg: 'bg-int-navy/10', icon: 'bg-int-navy', text: 'text-int-navy' },
  orange: { bg: 'bg-int-orange/10', icon: 'bg-int-orange', text: 'text-int-orange' },
  purple: { bg: 'bg-purple-500/10', icon: 'bg-purple-600', text: 'text-purple-600' },
  slate: { bg: 'bg-slate-500/10', icon: 'bg-slate-600', text: 'text-slate-600' },
  green: { bg: 'bg-emerald-500/10', icon: 'bg-emerald-600', text: 'text-emerald-600' }
};

export default function QuickActionCard({ title, subtitle, icon: Icon, page, onClick, color = 'navy' }) {
  const colorConfig = colorVariants[color] || colorVariants.navy;
  
  const content = (
    <div className="glass-card group relative overflow-hidden">
      {/* Decorative circles */}
      <div className={`absolute -top-4 -right-4 w-20 h-20 ${colorConfig.bg} rounded-full`} />
      <div className={`absolute -bottom-6 -left-6 w-24 h-24 ${colorConfig.bg} rounded-full`} />
      
      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl ${colorConfig.icon}`}>
            {Icon && <Icon className="h-6 w-6 text-white" />}
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 text-lg">{title}</h3>
            <p className="text-sm text-slate-600">{subtitle}</p>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-slate-500 group-hover:text-int-navy group-hover:translate-x-1 transition-all" />
      </div>
    </div>
  );

  if (page) {
    return (
      <Link to={createPageUrl(page)} className="block">
        {content}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button onClick={onClick} className="block w-full text-left">
        {content}
      </button>
    );
  }

  return content;
}