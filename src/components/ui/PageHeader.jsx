import React from 'react';

export default function PageHeader({ title, description, children }) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">{title}</h1>
        {description && <p className="text-slate-600">{description}</p>}
      </div>
      {children && <div className="flex gap-3">{children}</div>}
    </div>
  );
}