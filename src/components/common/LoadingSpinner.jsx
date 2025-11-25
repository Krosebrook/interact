import React from 'react';
import { motion } from 'framer-motion';

export default function LoadingSpinner({ 
  className = '', 
  size = 'default',
  type = 'orange',
  message
}) {
  const sizeClasses = {
    small: 'h-6 w-6',
    default: 'h-10 w-10',
    large: 'h-16 w-16'
  };

  const gradientColors = {
    orange: 'from-int-orange to-int-gold',
    navy: 'from-int-navy to-blue-600',
    purple: 'from-purple-600 to-purple-400',
    icebreaker: 'from-blue-600 to-blue-400',
    creative: 'from-purple-600 to-pink-400',
    competitive: 'from-amber-500 to-yellow-400',
    wellness: 'from-emerald-600 to-teal-400',
    learning: 'from-cyan-600 to-cyan-400',
    social: 'from-pink-600 to-rose-400'
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className={`${sizeClasses[size]} rounded-full`}
        style={{
          background: `conic-gradient(from 0deg, transparent, var(--int-orange))`,
          WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 3px), black calc(100% - 3px))',
          mask: 'radial-gradient(farthest-side, transparent calc(100% - 3px), black calc(100% - 3px))'
        }}
      />
      {message && (
        <p className="text-sm text-slate-500 font-medium animate-pulse">{message}</p>
      )}
    </div>
  );
}