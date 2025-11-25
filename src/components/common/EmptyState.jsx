import React from 'react';
import { Button } from '@/components/ui/button';

export default function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  actionLabel, 
  onAction,
  className = ''
}) {
  return (
    <div className={`text-center py-12 px-6 ${className}`}>
      {Icon && (
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center">
          <Icon className="h-8 w-8 text-slate-400" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-slate-700 mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-slate-500 mb-4 max-w-sm mx-auto">{description}</p>
      )}
      {actionLabel && onAction && (
        <Button 
          onClick={onAction}
          className="bg-int-orange hover:bg-[#C46322] text-white"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}