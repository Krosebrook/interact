/**
 * PERFORMANCE UTILITIES
 * Advanced memoization and performance helpers
 */

import { useMemo, useRef, useCallback, useState, useEffect } from 'react';
import { isEqual } from 'lodash';

// Deep comparison memoization
export function useMemoizedValue(value) {
  const ref = useRef(value);

  if (!isEqual(ref.current, value)) {
    ref.current = value;
  }

  return ref.current;
}

// Memoized callback with deep comparison
export function useStableCallback(callback, dependencies) {
  const memoizedDeps = useMemoizedValue(dependencies);
  return useCallback(callback, [memoizedDeps]);
}

// Throttle hook
export function useThrottle(value, delay = 500) {
  const [throttledValue, setThrottledValue] = useState(value);
  const lastRan = useRef(Date.now());

  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= delay) {
        setThrottledValue(value);
        lastRan.current = Date.now();
      }
    }, delay - (Date.now() - lastRan.current));

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return throttledValue;
}

export default {
  useMemoizedValue,
  useStableCallback,
  useThrottle
};