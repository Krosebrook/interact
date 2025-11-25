import React from 'react';
import { Card } from '@/components/ui/card';
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
    <Card className={`p-12 text-center border-2 border-dashed border-slate-300 ${className}`}>
      {Icon && <Icon className="h-12 w-12 text-slate-400 mx-auto mb-4" />}
      <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
      {description && <p className="text-slate-600 mb-4">{description}</p>}
      {actionLabel && onAction && (
        <Button onClick={onAction} className="bg-int-orange hover:bg-[#C46322] text-white">
          {actionLabel}
        </Button>
      )}
    </Card>
  );
}