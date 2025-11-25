import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { ChevronRight } from 'lucide-react';

const colorVariants = {
  navy: 'from-int-navy/80 to-int-navy',
  orange: 'from-int-orange/80 to-int-orange',
  purple: 'from-purple-600/80 to-purple-700',
  slate: 'from-slate-600/80 to-slate-700',
  green: 'from-emerald-600/80 to-emerald-700'
};

export default function QuickActionCard({ title, subtitle, icon: Icon, page, onClick, color = 'navy' }) {
  const gradient = colorVariants[color] || colorVariants.navy;
  
  const content = (
    <div className={`glass-card group relative overflow-hidden bg-gradient-to-br ${gradient} border-0`}>
      {/* Decorative circles */}
      <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/10 rounded-full" />
      <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/5 rounded-full" />
      
      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
            {Icon && <Icon className="h-6 w-6 text-white" />}
          </div>
          <div>
            <h3 className="font-semibold text-white text-lg">{title}</h3>
            <p className="text-sm text-white/70">{subtitle}</p>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all" />
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