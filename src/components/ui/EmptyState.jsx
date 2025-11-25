import React from 'react';
import { Button } from '@/components/ui/button';

export default function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  actionLabel, 
  onAction,
  actionIcon: ActionIcon
}) {
  return (
    <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-slate-300">
      {Icon && <Icon className="h-12 w-12 text-slate-400 mx-auto mb-4" />}
      <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
      {description && <p className="text-slate-600 mb-4">{description}</p>}
      {actionLabel && onAction && (
        <Button onClick={onAction} className="bg-int-orange hover:bg-[#C46322] text-white">
          {ActionIcon && <ActionIcon className="h-4 w-4 mr-2" />}
          {actionLabel}
        </Button>
      )}
    </div>
  );
}