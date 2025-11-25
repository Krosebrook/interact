import React from 'react';
import { motion } from 'framer-motion';

/**
 * Gradient-styled loading spinner with activity type support
 */
export default function GradientSpinner({ 
  size = 'default', 
  type = 'orange',
  className = '' 
}) {
  const sizes = {
    small: 'h-6 w-6',
    default: 'h-10 w-10',
    large: 'h-16 w-16'
  };

  const gradients = {
    orange: 'from-int-orange to-[#F5C16A]',
    navy: 'from-int-navy to-[#2a4a7d]',
    purple: 'from-purple-600 to-purple-400',
    icebreaker: 'from-blue-600 to-blue-400',
    creative: 'from-purple-600 to-pink-400',
    competitive: 'from-amber-500 to-yellow-400',
    wellness: 'from-emerald-600 to-teal-400',
    learning: 'from-cyan-600 to-cyan-400',
    social: 'from-pink-600 to-rose-400'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className={`${sizes[size]} rounded-full border-[3px] border-transparent bg-gradient-to-r ${gradients[type]} p-[2px]`}
        style={{ 
          maskImage: 'linear-gradient(transparent 40%, black)',
          WebkitMaskImage: 'linear-gradient(transparent 40%, black)'
        }}
      >
        <div className="w-full h-full rounded-full bg-white" />
      </motion.div>
    </div>
  );
}

/**
 * Full page loading state with gradient spinner
 */
export function PageLoader({ type = 'orange', message = 'Loading...' }) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <GradientSpinner size="large" type={type} />
      <p className="text-slate-600 font-medium animate-pulse">{message}</p>
    </div>
  );
}

/**
 * Inline loading indicator
 */
export function InlineLoader({ type = 'orange' }) {
  return (
    <span className="inline-flex items-center gap-2">
      <GradientSpinner size="small" type={type} />
    </span>
  );
}

/**
 * Activity-specific loader that matches activity type color
 */
export function ActivityLoader({ activityType = 'social', message }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 gap-3">
      <GradientSpinner size="default" type={activityType} />
      {message && <p className="text-sm text-slate-500">{message}</p>}
    </div>
  );
}