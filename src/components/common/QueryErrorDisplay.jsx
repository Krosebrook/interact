/**
 * QUERY ERROR DISPLAY
 * User-friendly error component for React Query errors
 */

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { getErrorDisplay } from '../lib/errors';

export default function QueryErrorDisplay({ 
  error, 
  onRetry, 
  title,
  compact = false 
}) {
  const errorDisplay = getErrorDisplay(error);
  const displayTitle = title || errorDisplay.title;

  if (compact) {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
        <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-red-700 truncate">{displayTitle}</p>
          <p className="text-xs text-red-600 truncate mt-0.5">{errorDisplay.message}</p>
        </div>
        {onRetry && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onRetry}
            className="text-red-600 hover:text-red-700 hover:bg-red-100 flex-shrink-0"
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
          <AlertCircle className="h-6 w-6 text-red-600" />
        </div>
        <h3 className="font-semibold text-slate-900 mb-1">{displayTitle}</h3>
        <p className="text-sm text-slate-600 mb-4">{errorDisplay.message}</p>
        {process.env.NODE_ENV === 'development' && error?.stack && (
          <details className="mb-4 text-left">
            <summary className="cursor-pointer text-xs text-slate-500 hover:text-slate-700 mb-2">
              Technical Details
            </summary>
            <pre className="text-xs bg-white p-2 rounded overflow-auto max-h-32 border border-slate-200">
              {error.stack}
            </pre>
          </details>
        )}
        {onRetry && (
          <Button 
            variant="outline" 
            onClick={onRetry}
            className="border-red-300 text-red-700 hover:bg-red-100"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            {errorDisplay.action}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}