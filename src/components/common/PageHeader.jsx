/**
 * PAGE HEADER COMPONENT
 * Consistent header with title, description, and actions
 * Ensures visual hierarchy across all pages
 */

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function PageHeader({
  icon: Icon,
  title,
  subtitle,
  description,
  actions,
  badge,
  breadcrumbs,
  stats,
  variant = 'default',
  className
}) {
  const variants = {
    default: 'glass-panel-solid',
    gradient: 'bg-gradient-to-r from-int-navy to-int-navy/80 text-white',
    orange: 'bg-gradient-orange text-white',
    minimal: 'bg-transparent'
  };

  const textColors = {
    default: { title: 'text-int-navy', subtitle: 'text-slate-600', description: 'text-slate-500' },
    gradient: { title: 'text-white', subtitle: 'text-white/80', description: 'text-white/70' },
    orange: { title: 'text-white', subtitle: 'text-white/80', description: 'text-white/70' },
    minimal: { title: 'text-int-navy', subtitle: 'text-slate-600', description: 'text-slate-500' }
  };

  const colors = textColors[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(variants[variant], 'rounded-2xl overflow-hidden', className)}
    >
      {/* Breadcrumbs */}
      {breadcrumbs && (
        <div className={cn(
          'px-6 py-2 text-sm border-b',
          variant === 'default' ? 'border-slate-200 bg-slate-50/50' : 'border-white/10 bg-black/10'
        )}>
          <nav className="flex items-center gap-2">
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={index}>
                {index > 0 && <span className="text-slate-400">/</span>}
                {crumb.href ? (
                  <a href={crumb.href} className="hover:underline">
                    {crumb.label}
                  </a>
                ) : (
                  <span className={variant === 'default' ? 'text-slate-500' : 'text-white/60'}>
                    {crumb.label}
                  </span>
                )}
              </React.Fragment>
            ))}
          </nav>
        </div>
      )}

      {/* Main Header Content */}
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Left: Icon, Title, Description */}
          <div className="flex items-start gap-4">
            {Icon && (
              <div className={cn(
                'p-3 rounded-xl shadow-lg shrink-0',
                variant === 'default' 
                  ? 'bg-gradient-orange' 
                  : 'bg-white/20 backdrop-blur-sm'
              )}>
                <Icon className="h-8 w-8 text-white" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-3">
                <h1 className={cn('text-2xl md:text-3xl font-bold font-display', colors.title)}>
                  {title}
                </h1>
                {badge}
              </div>
              {subtitle && (
                <p className={cn('text-sm font-medium mt-0.5', colors.subtitle)}>
                  {subtitle}
                </p>
              )}
              {description && (
                <p className={cn('text-sm mt-1 max-w-2xl leading-relaxed', colors.description)}>
                  {description}
                </p>
              )}
            </div>
          </div>

          {/* Right: Actions */}
          {actions && (
            <div className="flex flex-wrap items-center gap-2 md:gap-3">
              {actions}
            </div>
          )}
        </div>

        {/* Stats Row */}
        {stats && stats.length > 0 && (
          <div className={cn(
            'grid gap-4 mt-6 pt-6 border-t',
            variant === 'default' ? 'border-slate-200' : 'border-white/10',
            stats.length <= 3 ? `grid-cols-${stats.length}` : 'grid-cols-2 md:grid-cols-4'
          )} style={{ gridTemplateColumns: `repeat(${Math.min(stats.length, 4)}, minmax(0, 1fr))` }}>
            {stats.map((stat, index) => (
              <div key={index} className="text-center md:text-left">
                <div className={cn(
                  'text-2xl font-bold',
                  variant === 'default' ? 'text-int-navy' : 'text-white'
                )}>
                  {stat.value}
                </div>
                <div className={cn(
                  'text-xs uppercase tracking-wide font-medium',
                  variant === 'default' ? 'text-slate-500' : 'text-white/70'
                )}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

/**
 * Section header for content sections within a page
 */
export function SectionHeader({
  icon: Icon,
  title,
  description,
  action,
  actionLabel,
  className
}) {
  return (
    <div className={cn('flex flex-col sm:flex-row sm:items-center justify-between gap-3', className)}>
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="p-2 bg-int-orange/10 rounded-lg">
            <Icon className="h-5 w-5 text-int-orange" />
          </div>
        )}
        <div>
          <h2 className="text-xl font-bold text-int-navy font-display">{title}</h2>
          {description && (
            <p className="text-sm text-slate-500">{description}</p>
          )}
        </div>
      </div>
      {action && (
        <div>{action}</div>
      )}
    </div>
  );
}