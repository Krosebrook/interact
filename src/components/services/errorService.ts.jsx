/**
 * Error Service Layer
 * Centralizes error handling and logging
 * @module services/errorService
 */

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export interface AppError {
  code: string;
  message: string;
  severity: ErrorSeverity;
  timestamp: Date;
  context?: Record<string, any>;
  originalError?: Error;
}

export interface ErrorHandlerOptions {
  silent?: boolean;
  retry?: boolean;
  fallback?: any;
  context?: Record<string, any>;
}

class ErrorService {
  private errors: AppError[] = [];
  private maxErrors = 100;

  /**
   * Handles application errors with consistent patterns
   */
  handleError(
    error: Error | string,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    options: ErrorHandlerOptions = {}
  ): AppError {
    const appError: AppError = {
      code: this.getErrorCode(error),
      message: this.getErrorMessage(error),
      severity,
      timestamp: new Date(),
      context: options.context,
      originalError: error instanceof Error ? error : undefined,
    };

    // Store error for debugging
    this.errors.push(appError);
    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[ErrorService]', {
        ...appError,
        stack: appError.originalError?.stack,
      });
    }

    // Don't show toast if silent
    if (!options.silent) {
      this.notifyUser(appError);
    }

    return appError;
  }

  /**
   * Wraps async operations with error handling
   */
  async withErrorHandling<T>(
    operation: () => Promise<T>,
    options: ErrorHandlerOptions = {}
  ): Promise<T | null> {
    try {
      return await operation();
    } catch (error) {
      this.handleError(
        error as Error,
        ErrorSeverity.MEDIUM,
        options
      );

      if (options.retry) {
        // Placeholder: implement retry logic
        return null;
      }

      return options.fallback ?? null;
    }
  }

  /**
   * Gets recent errors for debugging
   */
  getRecentErrors(count = 10): AppError[] {
    return this.errors.slice(-count);
  }

  /**
   * Clears error history
   */
  clearErrors(): void {
    this.errors = [];
  }

  private getErrorCode(error: Error | string): string {
    if (typeof error === 'string') return 'GENERIC_ERROR';
    return error.name || 'UNKNOWN_ERROR';
  }

  private getErrorMessage(error: Error | string): string {
    if (typeof error === 'string') return error;
    return error.message || 'An unknown error occurred';
  }

  private notifyUser(error: AppError): void {
    // Placeholder: integrate with toast notification system
    // This should be implemented to show user-friendly messages
    if (typeof window !== 'undefined') {
      console.warn('User notification:', error.message);
    }
  }
}

// Singleton instance
export const errorService = new ErrorService();

/**
 * React hook wrapper for error handling
 */
export function useErrorHandler() {
  return {
    handleError: errorService.handleError.bind(errorService),
    withErrorHandling: errorService.withErrorHandling.bind(errorService),
    getRecentErrors: errorService.getRecentErrors.bind(errorService),
  };
}