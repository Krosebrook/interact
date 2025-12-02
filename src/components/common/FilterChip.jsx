/**
 * FILTER CHIP COMPONENT
 * Consistent, accessible filter/tag component with clear visual states
 */

import React from 'react';
import { X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const variants = {
  default: {
    base: 'border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300',
    active: 'bg-int-orange text-white border-int-orange hover:bg-int-orange/90'
  },
  navy: {
    base: 'border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300',
    active: 'bg-int-navy text-white border-int-navy hover:bg-int-navy/90'
  },
  purple: {
    base: 'border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300',
    active: 'bg-purple-600 text-white border-purple-600 hover:bg-purple-700'
  },
  green: {
    base: 'border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300',
    active: 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700'
  },
  // Activity type specific
  icebreaker: {
    base: 'border-blue-200 text-blue-600 hover:bg-blue-50',
    active: 'bg-blue-600 text-white border-blue-600'
  },
  creative: {
    base: 'border-purple-200 text-purple-600 hover:bg-purple-50',
    active: 'bg-purple-600 text-white border-purple-600'
  },
  competitive: {
    base: 'border-amber-200 text-amber-600 hover:bg-amber-50',
    active: 'bg-amber-600 text-white border-amber-600'
  },
  wellness: {
    base: 'border-emerald-200 text-emerald-600 hover:bg-emerald-50',
    active: 'bg-emerald-600 text-white border-emerald-600'
  },
  learning: {
    base: 'border-cyan-200 text-cyan-600 hover:bg-cyan-50',
    active: 'bg-cyan-600 text-white border-cyan-600'
  },
  social: {
    base: 'border-pink-200 text-pink-600 hover:bg-pink-50',
    active: 'bg-pink-600 text-white border-pink-600'
  }
};

export default function FilterChip({
  children,
  isActive = false,
  onClick,
  onRemove,
  variant = 'default',
  icon: Icon,
  size = 'default',
  showCheck = false,
  disabled = false,
  className
}) {
  const variantStyles = variants[variant] || variants.default;
  
  const sizeClasses = {
    sm: 'text-xs py-1 px-2.5 gap-1',
    default: 'text-sm py-1.5 px-3 gap-1.5',
    lg: 'text-sm py-2 px-4 gap-2'
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        // Base styles
        'inline-flex items-center justify-center rounded-full border font-medium',
        'transition-all duration-200 ease-out',
        'focus:outline-none focus:ring-2 focus:ring-int-orange/30 focus:ring-offset-1',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        // Size
        sizeClasses[size],
        // State
        isActive ? variantStyles.active : variantStyles.base,
        // Shadow for active
        isActive && 'shadow-sm',
        className
      )}
    >
      {/* Check mark for active state */}
      {showCheck && isActive && (
        <Check className="h-3 w-3 shrink-0" />
      )}
      
      {/* Icon */}
      {Icon && !showCheck && (
        <Icon className="h-3.5 w-3.5 shrink-0" />
      )}
      
      {/* Label */}
      <span className="truncate">{children}</span>
      
      {/* Remove button */}
      {onRemove && isActive && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-0.5 rounded-full hover:bg-white/20 p-0.5 transition-colors"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </button>
  );
}

/**
 * Filter chip group with "All" option
 */
export function FilterChipGroup({
  options,
  value,
  onChange,
  variant = 'default',
  label,
  icon: LabelIcon,
  showCount = false,
  className
}) {
  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {label && (
        <div className="flex items-center gap-1.5 mr-1 text-sm font-medium text-slate-700">
          {LabelIcon && <LabelIcon className="h-4 w-4 text-slate-500" />}
          <span>{label}:</span>
        </div>
      )}
      {options.map((option) => (
        <FilterChip
          key={option.value}
          isActive={value === option.value}
          onClick={() => onChange(option.value)}
          variant={option.variant || variant}
          icon={option.icon}
        >
          {option.label}
          {showCount && option.count !== undefined && (
            <span className="ml-1 opacity-70">({option.count})</span>
          )}
        </FilterChip>
      ))}
    </div>
  );
}

/**
 * Active filters summary bar
 */
export function ActiveFiltersBar({
  filters = [],
  onRemove,
  onClearAll,
  resultCount,
  totalCount,
  className
}) {
  if (filters.length === 0) return null;

  return (
    <div className={cn(
      'flex flex-wrap items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200',
      className
    )}>
      <span className="text-sm text-slate-600">
        <span className="font-semibold text-slate-900">{resultCount}</span>
        {' '}of{' '}
        <span className="font-medium">{totalCount}</span>
        {' '}results
      </span>
      
      <div className="h-4 w-px bg-slate-300 mx-1" />
      
      <div className="flex flex-wrap items-center gap-1.5 flex-1">
        {filters.map((filter, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded-md border border-slate-200 text-xs font-medium text-slate-700"
          >
            {filter.label}
            <button
              onClick={() => onRemove(filter.key)}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
      
      <button
        onClick={onClearAll}
        className="text-sm text-slate-500 hover:text-int-orange transition-colors font-medium"
      >
        Clear all
      </button>
    </div>
  );
}