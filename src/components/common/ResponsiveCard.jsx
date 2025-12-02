/**
 * RESPONSIVE CARD COMPONENT
 * Adaptive card layouts for different screen sizes
 * Includes proper text overflow handling
 */

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ContentTypeStripe } from './ContentTypeIndicator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

/**
 * Base responsive card with hover effects
 */
export default function ResponsiveCard({
  children,
  onClick,
  contentType,
  className,
  hoverEffect = true,
  padding = 'default',
  animate = true
}) {
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    default: 'p-4',
    lg: 'p-6'
  };

  const Component = animate ? motion.div : 'div';
  const motionProps = animate ? {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.2 },
    whileHover: hoverEffect ? { y: -4 } : undefined
  } : {};

  return (
    <Component
      {...motionProps}
      onClick={onClick}
      className={cn(
        'relative bg-white rounded-xl border border-slate-200 shadow-sm',
        'transition-all duration-200',
        hoverEffect && 'hover:shadow-md hover:border-slate-300',
        onClick && 'cursor-pointer',
        paddingClasses[padding],
        className
      )}
    >
      {contentType && <ContentTypeStripe type={contentType} />}
      {children}
    </Component>
  );
}

/**
 * Truncated text with tooltip
 */
export function TruncatedText({
  text,
  lines = 1,
  className,
  showTooltip = true
}) {
  const lineClampClasses = {
    1: 'line-clamp-1',
    2: 'line-clamp-2',
    3: 'line-clamp-3',
    4: 'line-clamp-4'
  };

  const content = (
    <span className={cn(lineClampClasses[lines] || 'line-clamp-1', className)}>
      {text}
    </span>
  );

  if (!showTooltip) return content;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {content}
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p>{text}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Card grid with responsive columns
 */
export function CardGrid({
  children,
  columns = { sm: 1, md: 2, lg: 3 },
  gap = 'default',
  className
}) {
  const gapClasses = {
    sm: 'gap-3',
    default: 'gap-4',
    lg: 'gap-6'
  };

  // Build grid classes dynamically
  const gridClasses = cn(
    'grid',
    gapClasses[gap],
    columns.sm && `grid-cols-${columns.sm}`,
    columns.md && `md:grid-cols-${columns.md}`,
    columns.lg && `lg:grid-cols-${columns.lg}`,
    columns.xl && `xl:grid-cols-${columns.xl}`,
    className
  );

  return (
    <div className={gridClasses}>
      {children}
    </div>
  );
}

/**
 * Responsive list/grid toggle container
 */
export function ResponsiveListGrid({
  children,
  view = 'grid',
  gridColumns = { sm: 1, md: 2, lg: 3 },
  className
}) {
  if (view === 'list') {
    return (
      <div className={cn('flex flex-col gap-3', className)}>
        {children}
      </div>
    );
  }

  return (
    <CardGrid columns={gridColumns} className={className}>
      {children}
    </CardGrid>
  );
}

/**
 * Card with image header
 */
export function ImageCard({
  image,
  imageAlt,
  imageHeight = 'default',
  overlay,
  badge,
  children,
  onClick,
  className
}) {
  const heightClasses = {
    sm: 'h-24',
    default: 'h-36',
    lg: 'h-48'
  };

  return (
    <ResponsiveCard onClick={onClick} className={cn('overflow-hidden', className)} padding="none">
      {/* Image Header */}
      <div className={cn('relative overflow-hidden', heightClasses[imageHeight])}>
        <img
          src={image}
          alt={imageAlt}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {overlay && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        )}
        {badge && (
          <div className="absolute top-3 right-3">
            {badge}
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="p-4">
        {children}
      </div>
    </ResponsiveCard>
  );
}

/**
 * Skeleton card for loading states
 */
export function CardSkeleton({
  hasImage = false,
  imageHeight = 'default',
  lines = 3,
  className
}) {
  const heightClasses = {
    sm: 'h-24',
    default: 'h-36',
    lg: 'h-48'
  };

  return (
    <div className={cn('bg-white rounded-xl border border-slate-200 overflow-hidden animate-pulse', className)}>
      {hasImage && (
        <div className={cn('bg-slate-200', heightClasses[imageHeight])} />
      )}
      <div className="p-4 space-y-3">
        <div className="h-4 bg-slate-200 rounded w-3/4" />
        {lines >= 2 && <div className="h-3 bg-slate-200 rounded w-full" />}
        {lines >= 3 && <div className="h-3 bg-slate-200 rounded w-5/6" />}
        {lines >= 4 && (
          <div className="flex gap-2 pt-2">
            <div className="h-6 bg-slate-200 rounded w-16" />
            <div className="h-6 bg-slate-200 rounded w-20" />
          </div>
        )}
      </div>
    </div>
  );
}