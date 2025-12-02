/**
 * CONTENT TYPE INDICATOR
 * Visual indicator to distinguish between different content types
 * (activities, events, challenges, templates, etc.)
 */

import React from 'react';
import { cn } from '@/lib/utils';
import {
  Sparkles,
  Calendar,
  Trophy,
  FileText,
  Users,
  Zap,
  Gift,
  Target,
  BookOpen
} from 'lucide-react';

const contentTypes = {
  activity: {
    icon: Sparkles,
    label: 'Activity',
    color: 'text-int-orange',
    bgColor: 'bg-int-orange/10',
    borderColor: 'border-int-orange/20',
    gradientFrom: 'from-int-orange',
    gradientTo: 'to-amber-500'
  },
  event: {
    icon: Calendar,
    label: 'Event',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    gradientFrom: 'from-blue-500',
    gradientTo: 'to-blue-600'
  },
  challenge: {
    icon: Trophy,
    label: 'Challenge',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    gradientFrom: 'from-amber-500',
    gradientTo: 'to-amber-600'
  },
  template: {
    icon: FileText,
    label: 'Template',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    gradientFrom: 'from-purple-500',
    gradientTo: 'to-purple-600'
  },
  team: {
    icon: Users,
    label: 'Team',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    gradientFrom: 'from-emerald-500',
    gradientTo: 'to-emerald-600'
  },
  reward: {
    icon: Gift,
    label: 'Reward',
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
    gradientFrom: 'from-pink-500',
    gradientTo: 'to-pink-600'
  },
  recognition: {
    icon: Zap,
    label: 'Recognition',
    color: 'text-rose-600',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-200',
    gradientFrom: 'from-rose-500',
    gradientTo: 'to-rose-600'
  },
  goal: {
    icon: Target,
    label: 'Goal',
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-200',
    gradientFrom: 'from-cyan-500',
    gradientTo: 'to-cyan-600'
  },
  learning: {
    icon: BookOpen,
    label: 'Learning',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    gradientFrom: 'from-indigo-500',
    gradientTo: 'to-indigo-600'
  }
};

/**
 * Badge-style indicator
 */
export default function ContentTypeIndicator({
  type = 'activity',
  size = 'default',
  showLabel = true,
  variant = 'filled',
  className
}) {
  const config = contentTypes[type] || contentTypes.activity;
  const Icon = config.icon;

  const sizeClasses = {
    xs: 'text-[10px] py-0.5 px-1.5 gap-1',
    sm: 'text-xs py-1 px-2 gap-1',
    default: 'text-xs py-1.5 px-2.5 gap-1.5',
    lg: 'text-sm py-2 px-3 gap-2'
  };

  const iconSizes = {
    xs: 'h-2.5 w-2.5',
    sm: 'h-3 w-3',
    default: 'h-3.5 w-3.5',
    lg: 'h-4 w-4'
  };

  const variantClasses = {
    filled: cn(config.bgColor, config.color),
    outline: cn('bg-transparent border', config.borderColor, config.color),
    gradient: cn(
      'bg-gradient-to-r text-white',
      config.gradientFrom,
      config.gradientTo
    ),
    minimal: cn('bg-transparent', config.color)
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
    >
      <Icon className={iconSizes[size]} />
      {showLabel && <span>{config.label}</span>}
    </span>
  );
}

/**
 * Corner ribbon indicator
 */
export function ContentTypeRibbon({ type = 'activity', position = 'top-left' }) {
  const config = contentTypes[type] || contentTypes.activity;
  const Icon = config.icon;

  const positionClasses = {
    'top-left': 'top-0 left-0 rounded-br-lg',
    'top-right': 'top-0 right-0 rounded-bl-lg',
    'bottom-left': 'bottom-0 left-0 rounded-tr-lg',
    'bottom-right': 'bottom-0 right-0 rounded-tl-lg'
  };

  return (
    <div
      className={cn(
        'absolute z-10 p-1.5 bg-gradient-to-br',
        config.gradientFrom,
        config.gradientTo,
        positionClasses[position]
      )}
    >
      <Icon className="h-3.5 w-3.5 text-white" />
    </div>
  );
}

/**
 * Side stripe indicator
 */
export function ContentTypeStripe({ type = 'activity', className }) {
  const config = contentTypes[type] || contentTypes.activity;

  return (
    <div
      className={cn(
        'absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b',
        config.gradientFrom,
        config.gradientTo,
        className
      )}
    />
  );
}

/**
 * Get content type config for use in custom components
 */
export function getContentTypeConfig(type) {
  return contentTypes[type] || contentTypes.activity;
}