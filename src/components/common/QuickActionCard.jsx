import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';

const colorVariants = {
  navy: 'bg-int-navy text-white',
  orange: 'bg-int-orange text-white',
  slate: 'bg-[#4A6070] text-white',
  purple: 'bg-purple-600 text-white'
};

const subtitleColors = {
  navy: 'text-sky-blue-gray',
  orange: 'text-orange-100',
  slate: 'text-slate-200',
  purple: 'text-purple-200'
};

export default function QuickActionCard({ 
  title, 
  subtitle, 
  icon: Icon, 
  page, 
  color = 'navy',
  onClick 
}) {
  const content = (
    <div className={`${colorVariants[color]} rounded-xl p-6 hover:shadow-xl transition-shadow relative overflow-hidden`}>
      {color === 'navy' && (
        <div className="absolute top-0 right-0 w-20 h-20 bg-int-orange opacity-20 rounded-full -mr-10 -mt-10" />
      )}
      {Icon && <Icon className="h-8 w-8 mb-3" />}
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      <p className={`${subtitleColors[color]} text-sm`}>{subtitle}</p>
    </div>
  );

  if (onClick) {
    return (
      <button onClick={onClick} className="w-full text-left">
        {content}
      </button>
    );
  }

  return (
    <Link to={createPageUrl(page)} className="group">
      {content}
    </Link>
  );
}