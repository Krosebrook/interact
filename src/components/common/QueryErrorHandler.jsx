import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, WifiOff } from 'lucide-react';

/**
 * Query Error Handler Component
 * Displays user-friendly error messages for API/query failures
 */
export default function QueryErrorHandler({ 
  error, 
  onRetry, 
  title = "Failed to load data",
  compact = false 
}) {
  const isNetworkError = error?.message?.includes('network') || 
                         error?.message?.includes('fetch') ||
                         !navigator.onLine;

  const Icon = isNetworkError ? WifiOff : AlertCircle;
  const message = isNetworkError 
    ? "Please check your internet connection and try again."
    : error?.message || "An unexpected error occurred. Please try again.";

  if (compact) {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
        <Icon className="h-5 w-5 text-red-500 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-red-700 truncate">{title}</p>
        </div>
        {onRetry && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onRetry}
            className="text-red-600 hover:text-red-700 hover:bg-red-100"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card className="border-2 border-red-200 bg-red-50/50">
      <CardContent className="p-6 text-center">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
          <Icon className="h-6 w-6 text-red-600" />
        </div>
        <h3 className="font-semibold text-slate-900 mb-1">{title}</h3>
        <p className="text-sm text-slate-600 mb-4">{message}</p>
        {onRetry && (
          <Button 
            variant="outline" 
            onClick={onRetry}
            className="border-red-300 text-red-700 hover:bg-red-100"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        )}
      </CardContent>
    </Card>
  );
}