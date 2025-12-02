/**
 * ENHANCED EMPTY STATE
 * Provides contextual guidance and positive messaging when content is unavailable
 * 
 * Features:
 * - Multiple visual themes
 * - Suggested actions
 * - Helpful tips
 * - Animation
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight, Lightbulb } from 'lucide-react';

const typeStyles = {
  default: { bg: 'bg-slate-100', icon: 'text-slate-400', border: 'border-slate-200' },
  orange: { bg: 'bg-int-orange/10', icon: 'text-int-orange', border: 'border-int-orange/20' },
  navy: { bg: 'bg-int-navy/10', icon: 'text-int-navy', border: 'border-int-navy/20' },
  purple: { bg: 'bg-purple-500/10', icon: 'text-purple-500', border: 'border-purple-200' },
  success: { bg: 'bg-emerald-50', icon: 'text-emerald-500', border: 'border-emerald-200' },
  warning: { bg: 'bg-amber-50', icon: 'text-amber-500', border: 'border-amber-200' }
};

export default function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  actionLabel, 
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className = '',
  type = 'default',
  tips = [],
  illustration,
  compact = false
}) {
  const style = typeStyles[type] || typeStyles.default;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`
        text-center rounded-2xl border ${style.border} bg-gradient-to-b from-white to-slate-50/50
        ${compact ? 'py-8 px-4' : 'py-12 px-6'}
        ${className}
      `}
    >
      {/* Illustration or Icon */}
      {illustration ? (
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
          className="mb-6"
        >
          {illustration}
        </motion.div>
      ) : Icon && (
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
          className={`
            ${compact ? 'w-12 h-12' : 'w-16 h-16'} 
            mx-auto mb-4 rounded-2xl ${style.bg} 
            flex items-center justify-center shadow-sm
          `}
        >
          <Icon className={`${compact ? 'h-6 w-6' : 'h-8 w-8'} ${style.icon}`} />
        </motion.div>
      )}
      
      {/* Title */}
      <motion.h3 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className={`${compact ? 'text-base' : 'text-lg'} font-bold text-int-navy mb-2`}
      >
        {title}
      </motion.h3>
      
      {/* Description */}
      {description && (
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className={`
            ${compact ? 'text-xs' : 'text-sm'} 
            text-slate-600 mb-6 max-w-sm mx-auto leading-relaxed
          `}
        >
          {description}
        </motion.p>
      )}
      
      {/* Tips Section */}
      {tips.length > 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-6 p-4 bg-amber-50/50 rounded-xl border border-amber-100 max-w-md mx-auto"
        >
          <div className="flex items-center gap-2 text-amber-700 font-medium text-sm mb-2">
            <Lightbulb className="h-4 w-4" />
            Quick Tips
          </div>
          <ul className="text-left text-sm text-amber-900 space-y-1">
            {tips.map((tip, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-amber-500 mt-0.5">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}
      
      {/* Actions */}
      {(actionLabel || secondaryActionLabel) && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="flex flex-wrap items-center justify-center gap-3"
        >
          {actionLabel && onAction && (
            <Button 
              onClick={onAction}
              className="bg-int-orange hover:bg-int-orange/90 text-slate-900 font-semibold shadow-md hover:shadow-lg transition-all"
              size={compact ? 'sm' : 'default'}
            >
              {actionLabel}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <Button 
              onClick={onSecondaryAction}
              variant="outline"
              className="border-slate-200 text-slate-600 hover:bg-slate-50"
              size={compact ? 'sm' : 'default'}
            >
              {secondaryActionLabel}
            </Button>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

/**
 * Preset empty states for common scenarios
 */
export function NoSearchResults({ onClearFilters }) {
  return (
    <EmptyState
      icon={Search}
      title="No results found"
      description="We couldn't find anything matching your search. Try adjusting your filters or search terms."
      actionLabel="Clear Filters"
      onAction={onClearFilters}
      tips={[
        "Try using fewer or different keywords",
        "Check for typos in your search",
        "Remove some filters to see more results"
      ]}
    />
  );
}

export function NoEventsEmpty({ onSchedule }) {
  return (
    <EmptyState
      icon={Calendar}
      type="navy"
      title="No upcoming events"
      description="Your calendar is clear! Get started by scheduling your first team activity."
      actionLabel="Schedule Event"
      onAction={onSchedule}
      tips={[
        "Browse our activity library for ideas",
        "Try a quick 15-minute icebreaker to start",
        "Consider scheduling a recurring weekly event"
      ]}
    />
  );
}

export function NoRecognitionsEmpty({ onGiveRecognition }) {
  return (
    <EmptyState
      icon={Heart}
      type="orange"
      title="No recognitions yet"
      description="Be the first to spread some positivity! Recognize a teammate for their great work."
      actionLabel="Give Recognition"
      onAction={onGiveRecognition}
    />
  );
}

// Import these icons for the preset components
import { Search, Calendar, Heart } from 'lucide-react';