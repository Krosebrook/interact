import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * Enhanced button with micro-interactions
 * Provides visual feedback on hover, tap, and loading states
 */
export default function AnimatedButton({
  children,
  onClick,
  variant = 'default',
  size = 'default',
  className,
  loading = false,
  success = false,
  disabled = false,
  icon,
  ...props
}) {
  return (
    <motion.div
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      <Button
        onClick={onClick}
        variant={variant}
        size={size}
        disabled={disabled || loading}
        className={cn(
          'relative overflow-hidden transition-all duration-200',
          success && 'bg-emerald-600 hover:bg-emerald-700',
          className
        )}
        {...props}
      >
        {/* Shimmer effect on hover */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          initial={{ x: '-100%' }}
          whileHover={{ x: '100%' }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        />
        
        {/* Loading spinner */}
        {loading && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full" />
          </motion.div>
        )}
        
        {/* Content */}
        <span className={cn('flex items-center gap-2', loading && 'opacity-0')}>
          {icon && <span className="flex-shrink-0">{icon}</span>}
          {children}
        </span>
      </Button>
    </motion.div>
  );
}