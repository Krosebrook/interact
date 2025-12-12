/**
 * ASYNC ACTION HOOK
 * Handle async operations with loading/error states
 */

import { useState, useCallback } from 'react';
import { toast } from 'sonner';

export function useAsyncAction(options = {}) {
  const {
    onSuccess,
    onError,
    successMessage,
    errorMessage
  } = options;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (asyncFn) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await asyncFn();
      
      if (successMessage) {
        toast.success(successMessage);
      }
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      return { success: true, data: result };
    } catch (err) {
      const message = errorMessage || err.message || 'An error occurred';
      setError(message);
      toast.error(message);
      
      if (onError) {
        onError(err);
      }
      
      return { success: false, error: err };
    } finally {
      setIsLoading(false);
    }
  }, [onSuccess, onError, successMessage, errorMessage]);

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
  }, []);

  return {
    execute,
    isLoading,
    error,
    reset
  };
}

export default useAsyncAction;