import React from 'react';

export default function SkeletonGrid({ count = 3, height = 'h-48', columns = 3 }) {
  const gridCols = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-6`}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className={`${height} bg-slate-100 animate-pulse rounded-xl`} />
      ))}
    </div>
  );
}