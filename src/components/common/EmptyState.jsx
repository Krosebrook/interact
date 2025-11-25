import React from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  actionLabel, 
  onAction,
  className = '',
  type = 'default'
}) {
  const typeStyles = {
    default: { bg: 'bg-slate-100', icon: 'text-slate-400' },
    orange: { bg: 'bg-int-orange/10', icon: 'text-int-orange' },
    navy: { bg: 'bg-int-navy/10', icon: 'text-int-navy' },
    purple: { bg: 'bg-purple-500/10', icon: 'text-purple-500' }
  };

  const style = typeStyles[type] || typeStyles.default;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`text-center py-12 px-6 ${className}`}
    >
      {Icon && (
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
          className={`w-16 h-16 mx-auto mb-4 rounded-2xl ${style.bg} flex items-center justify-center`}
        >
          <Icon className={`h-8 w-8 ${style.icon}`} />
        </motion.div>
      )}
      <h3 className="text-lg font-bold text-int-navy mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto leading-relaxed">{description}</p>
      )}
      {actionLabel && onAction && (
        <Button 
          onClick={onAction}
          className="bg-gradient-orange hover:opacity-90 text-white shadow-lg hover:shadow-xl transition-all press-effect"
        >
          {actionLabel}
        </Button>
      )}
    </motion.div>
  );
}