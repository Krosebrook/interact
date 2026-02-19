import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';

/**
 * REDIRECT LOOP DETECTOR
 * 
 * Monitors route changes and detects potential redirect loops.
 * Logs warning if > 5 route changes happen in < 3 seconds.
 */

const LOOP_THRESHOLD = 5; // Max route changes
const TIME_WINDOW = 3000; // Time window in ms

export default function RedirectLoopDetector() {
  const location = useLocation();
  const { auditLog } = useAuth();
  const historyRef = useRef([]);

  useEffect(() => {
    const now = Date.now();
    const currentPath = location.pathname;

    // Add current route to history
    historyRef.current.push({ path: currentPath, timestamp: now });

    // Clean up old entries outside time window
    historyRef.current = historyRef.current.filter(
      (entry) => now - entry.timestamp < TIME_WINDOW
    );

    // Check for loop
    if (historyRef.current.length >= LOOP_THRESHOLD) {
      const paths = historyRef.current.map((e) => e.path);
      const uniquePaths = [...new Set(paths)];

      // Require at least 3 full cycles through the same 2 routes
      const hasCycle = paths.length >= 6 && uniquePaths.length <= 2;

      if (hasCycle) {
        auditLog('redirect_loop_detected', {
          route_history: paths,
          unique_routes: uniquePaths,
          time_window_ms: TIME_WINDOW,
          change_count: historyRef.current.length,
        });

        console.error('[REDIRECT LOOP DETECTED]', {
          paths,
          uniquePaths,
          message: 'Possible redirect loop detected. Check auth logic and route guards.',
        });
      }
    }
  }, [location.pathname, auditLog]);

  return null; // This component doesn't render anything
}