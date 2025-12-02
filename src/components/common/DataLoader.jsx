/**
 * DATA LOADER COMPONENT
 * Standardized loading, error, and empty states for data fetching
 */

import React from 'react';
import LoadingSpinner from './LoadingSpinner';
import EmptyState from './EmptyState';
import ErrorBoundary from './ErrorBoundary';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * DataLoader - Handles loading, error, and empty states
 */
export default function DataLoader({
  isLoading,
  error,
  data,
  children,
  
  // Loading options
  loadingMessage = 'Loading...',
  loadingSize = 'default',
  loadingClassName = 'min-h-[200px]',
  
  // Empty state options
  emptyIcon,
  emptyTitle = 'No data found',
  emptyDescription,
  emptyActionLabel,
  onEmptyAction,
  
  // Error options
  errorTitle = 'Something went wrong',
  onRetry,
  
  // Custom renderers
  renderLoading,
  renderEmpty,
  renderError,
  
  // Behavior
  showEmptyWhenNoData = true,
  minLoadingTime = 0
}) {
  // Loading state
  if (isLoading) {
    if (renderLoading) return renderLoading();
    
    return (
      <div className={`flex items-center justify-center ${loadingClassName}`}>
        <LoadingSpinner size={loadingSize} message={loadingMessage} />
      </div>
    );
  }

  // Error state
  if (error) {
    if (renderError) return renderError(error);
    
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
          <AlertCircle className="w-6 h-6 text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">{errorTitle}</h3>
        <p className="text-slate-500 text-center mb-4 max-w-md">
          {error?.message || 'An unexpected error occurred. Please try again.'}
        </p>
        {onRetry && (
          <Button onClick={onRetry} variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
        )}
      </div>
    );
  }

  // Check if data is empty
  const isEmpty = Array.isArray(data) 
    ? data.length === 0 
    : !data;

  // Empty state
  if (showEmptyWhenNoData && isEmpty) {
    if (renderEmpty) return renderEmpty();
    
    return (
      <EmptyState
        icon={emptyIcon}
        title={emptyTitle}
        description={emptyDescription}
        actionLabel={emptyActionLabel}
        onAction={onEmptyAction}
      />
    );
  }

  // Render children with data
  return (
    <ErrorBoundary>
      {typeof children === 'function' ? children(data) : children}
    </ErrorBoundary>
  );
}

/**
 * DataSection - Section wrapper with title and DataLoader
 */
export function DataSection({
  title,
  description,
  action,
  className = '',
  children,
  ...loaderProps
}) {
  return (
    <section className={`space-y-4 ${className}`}>
      {(title || action) && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            {title && (
              <h2 className="text-xl font-bold text-slate-900">{title}</h2>
            )}
            {description && (
              <p className="text-slate-500 text-sm mt-1">{description}</p>
            )}
          </div>
          {action}
        </div>
      )}
      <DataLoader {...loaderProps}>
        {children}
      </DataLoader>
    </section>
  );
}

/**
 * GridLoader - Grid layout with loading skeletons
 */
export function GridLoader({
  isLoading,
  data,
  children,
  columns = { base: 1, md: 2, lg: 3 },
  skeletonCount = 6,
  skeletonHeight = 'h-48',
  gap = 'gap-6',
  ...loaderProps
}) {
  const gridCols = `grid-cols-${columns.base} md:grid-cols-${columns.md} lg:grid-cols-${columns.lg}`;

  if (isLoading) {
    return (
      <div className={`grid ${gridCols} ${gap}`}>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <div 
            key={i} 
            className={`${skeletonHeight} bg-slate-100 animate-pulse rounded-xl`} 
          />
        ))}
      </div>
    );
  }

  return (
    <DataLoader data={data} {...loaderProps}>
      {(items) => (
        <div className={`grid ${gridCols} ${gap}`}>
          {typeof children === 'function' ? children(items) : children}
        </div>
      )}
    </DataLoader>
  );
}