import React from 'react';

export default function LoadingSpinner({ size = 'lg', color = 'indigo' }) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  const colorClasses = {
    indigo: 'border-indigo-600',
    orange: 'border-int-orange',
    purple: 'border-purple-600',
    slate: 'border-slate-600'
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className={`animate-spin rounded-full border-b-2 ${sizeClasses[size]} ${colorClasses[color]}`} />
    </div>
  );
}