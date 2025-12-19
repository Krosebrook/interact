/**
 * SESSION TIMEOUT HOOK
 * Implements 8-hour session timeout per security requirements
 * Automatically redirects to login when session expires
 */

import { useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';

const SESSION_DURATION = 8 * 60 * 60 * 1000; // 8 hours in milliseconds
const CHECK_INTERVAL = 5 * 60 * 1000; // Check every 5 minutes
const STORAGE_KEY = 'last_auth_time';

export function useSessionTimeout(enabled = true) {
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!enabled) return;

    // Update last auth time on mount
    const updateAuthTime = () => {
      localStorage.setItem(STORAGE_KEY, Date.now().toString());
    };

    // Check if session has expired
    const checkSessionExpiry = () => {
      const lastAuthTime = localStorage.getItem(STORAGE_KEY);
      
      if (!lastAuthTime) {
        updateAuthTime();
        return;
      }

      const timeSinceAuth = Date.now() - parseInt(lastAuthTime, 10);
      
      if (timeSinceAuth > SESSION_DURATION) {
        // Session expired - clear storage and redirect to login
        localStorage.removeItem(STORAGE_KEY);
        base44.auth.redirectToLogin(window.location.pathname);
      }
    };

    // Initial check
    checkSessionExpiry();

    // Set up periodic checks
    intervalRef.current = setInterval(checkSessionExpiry, CHECK_INTERVAL);

    // Update auth time on user activity
    const handleActivity = () => updateAuthTime();
    window.addEventListener('click', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('scroll', handleActivity);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('scroll', handleActivity);
    };
  }, [enabled]);
}