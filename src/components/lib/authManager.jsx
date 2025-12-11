/**
 * ADVANCED AUTHENTICATION MANAGER
 * Secure token management with automatic refresh and session monitoring
 * Ensures continuous authentication for remote employees (8-hour session timeout)
 */

import { base44 } from '@/api/base44Client';
import { logError, AuthenticationError } from './errors';

// ============================================================================
// CONFIGURATION
// ============================================================================

const AUTH_CONFIG = {
  SESSION_TIMEOUT_MS: 8 * 60 * 60 * 1000, // 8 hours
  TOKEN_REFRESH_BEFORE_MS: 5 * 60 * 1000, // Refresh 5 minutes before expiry
  ACTIVITY_CHECK_INTERVAL_MS: 60 * 1000, // Check activity every minute
  INACTIVITY_WARNING_MS: 7.5 * 60 * 60 * 1000, // Warn at 7.5 hours
};

// ============================================================================
// AUTH MANAGER CLASS
// ============================================================================

class AuthManager {
  constructor() {
    this.sessionStartTime = null;
    this.lastActivityTime = null;
    this.inactivityTimer = null;
    this.activityCheckInterval = null;
    this.refreshTimer = null;
    this.listeners = new Set();
    
    if (typeof window !== 'undefined') {
      this.initializeActivityTracking();
      this.initializeSessionMonitoring();
    }
  }
  
  // ============================================================================
  // SESSION INITIALIZATION
  // ============================================================================
  
  /**
   * Initialize a new session
   */
  async initializeSession(user) {
    this.sessionStartTime = Date.now();
    this.lastActivityTime = Date.now();
    
    // Start monitoring
    this.startActivityMonitoring();
    this.scheduleTokenRefresh(user);
    
    this.notifyListeners('session_started', { user });
  }
  
  /**
   * End current session
   */
  async endSession() {
    this.stopActivityMonitoring();
    this.clearRefreshTimer();
    
    this.sessionStartTime = null;
    this.lastActivityTime = null;
    
    this.notifyListeners('session_ended');
  }
  
  // ============================================================================
  // ACTIVITY TRACKING
  // ============================================================================
  
  /**
   * Initialize activity tracking listeners
   */
  initializeActivityTracking() {
    const activityEvents = [
      'mousedown',
      'keydown',
      'scroll',
      'touchstart',
      'click',
    ];
    
    const handleActivity = () => {
      this.recordActivity();
    };
    
    activityEvents.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true });
    });
    
    // Store cleanup function
    this.cleanupActivityListeners = () => {
      activityEvents.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }
  
  /**
   * Record user activity
   */
  recordActivity() {
    this.lastActivityTime = Date.now();
  }
  
  /**
   * Start monitoring for inactivity
   */
  startActivityMonitoring() {
    this.activityCheckInterval = setInterval(() => {
      this.checkInactivity();
    }, AUTH_CONFIG.ACTIVITY_CHECK_INTERVAL_MS);
  }
  
  /**
   * Stop activity monitoring
   */
  stopActivityMonitoring() {
    if (this.activityCheckInterval) {
      clearInterval(this.activityCheckInterval);
      this.activityCheckInterval = null;
    }
  }
  
  /**
   * Check for inactivity and session timeout
   */
  checkInactivity() {
    if (!this.sessionStartTime || !this.lastActivityTime) return;
    
    const now = Date.now();
    const sessionDuration = now - this.sessionStartTime;
    const inactiveDuration = now - this.lastActivityTime;
    
    // Session timeout (8 hours from start)
    if (sessionDuration >= AUTH_CONFIG.SESSION_TIMEOUT_MS) {
      this.handleSessionTimeout();
      return;
    }
    
    // Inactivity warning (7.5 hours)
    if (sessionDuration >= AUTH_CONFIG.INACTIVITY_WARNING_MS) {
      this.notifyListeners('inactivity_warning', {
        remainingMs: AUTH_CONFIG.SESSION_TIMEOUT_MS - sessionDuration,
      });
    }
  }
  
  // ============================================================================
  // SESSION MONITORING
  // ============================================================================
  
  /**
   * Initialize session monitoring (page visibility, online status)
   */
  initializeSessionMonitoring() {
    // Handle page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.handlePageVisible();
      }
    });
    
    // Handle online/offline status
    window.addEventListener('online', () => {
      this.handleOnline();
    });
    
    window.addEventListener('offline', () => {
      this.handleOffline();
    });
  }
  
  /**
   * Handle page becoming visible (check session validity)
   */
  async handlePageVisible() {
    try {
      // Verify session is still valid
      const isValid = await this.verifySession();
      
      if (!isValid) {
        this.handleSessionTimeout();
      }
    } catch (error) {
      logError(error, { context: 'AuthManager.handlePageVisible' });
    }
  }
  
  /**
   * Handle coming back online
   */
  async handleOnline() {
    this.notifyListeners('connection_restored');
    
    try {
      await this.verifySession();
    } catch (error) {
      logError(error, { context: 'AuthManager.handleOnline' });
    }
  }
  
  /**
   * Handle going offline
   */
  handleOffline() {
    this.notifyListeners('connection_lost');
  }
  
  // ============================================================================
  // TOKEN REFRESH
  // ============================================================================
  
  /**
   * Schedule automatic token refresh
   */
  scheduleTokenRefresh(user) {
    // Clear existing timer
    this.clearRefreshTimer();
    
    // In production, you would parse JWT to get actual expiry
    // For now, refresh every hour as a safe interval
    const refreshInterval = 60 * 60 * 1000; // 1 hour
    
    this.refreshTimer = setTimeout(async () => {
      try {
        await this.refreshToken(user);
      } catch (error) {
        logError(error, { context: 'AuthManager.scheduleTokenRefresh' });
        this.handleSessionTimeout();
      }
    }, refreshInterval);
  }
  
  /**
   * Refresh authentication token
   */
  async refreshToken(user) {
    try {
      // Attempt to refresh by fetching user data again
      const refreshedUser = await base44.auth.me();
      
      if (refreshedUser) {
        this.notifyListeners('token_refreshed', { user: refreshedUser });
        this.scheduleTokenRefresh(refreshedUser);
        return refreshedUser;
      }
      
      throw new AuthenticationError('Token refresh failed');
    } catch (error) {
      throw new AuthenticationError('Unable to refresh session', { cause: error });
    }
  }
  
  /**
   * Clear refresh timer
   */
  clearRefreshTimer() {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }
  
  // ============================================================================
  // SESSION VERIFICATION
  // ============================================================================
  
  /**
   * Verify current session is still valid
   */
  async verifySession() {
    try {
      const isAuthenticated = await base44.auth.isAuthenticated();
      
      if (!isAuthenticated) {
        return false;
      }
      
      // Additional check: ensure session hasn't exceeded timeout
      if (this.sessionStartTime) {
        const sessionDuration = Date.now() - this.sessionStartTime;
        if (sessionDuration >= AUTH_CONFIG.SESSION_TIMEOUT_MS) {
          return false;
        }
      }
      
      return true;
    } catch (error) {
      logError(error, { context: 'AuthManager.verifySession' });
      return false;
    }
  }
  
  // ============================================================================
  // SESSION TIMEOUT HANDLING
  // ============================================================================
  
  /**
   * Handle session timeout
   */
  async handleSessionTimeout() {
    this.notifyListeners('session_timeout');
    
    await this.endSession();
    
    // Redirect to login with return URL
    const returnUrl = window.location.pathname + window.location.search;
    base44.auth.redirectToLogin(returnUrl);
  }
  
  // ============================================================================
  // EVENT LISTENERS
  // ============================================================================
  
  /**
   * Add event listener
   */
  addEventListener(callback) {
    this.listeners.add(callback);
    
    return () => {
      this.listeners.delete(callback);
    };
  }
  
  /**
   * Notify all listeners
   */
  notifyListeners(event, data = {}) {
    this.listeners.forEach(callback => {
      try {
        callback({ event, ...data });
      } catch (error) {
        logError(error, { context: 'AuthManager.notifyListeners', event });
      }
    });
  }
  
  // ============================================================================
  // UTILITY METHODS
  // ============================================================================
  
  /**
   * Get session duration in milliseconds
   */
  getSessionDuration() {
    if (!this.sessionStartTime) return 0;
    return Date.now() - this.sessionStartTime;
  }
  
  /**
   * Get time until session timeout
   */
  getTimeUntilTimeout() {
    if (!this.sessionStartTime) return AUTH_CONFIG.SESSION_TIMEOUT_MS;
    const elapsed = this.getSessionDuration();
    return Math.max(0, AUTH_CONFIG.SESSION_TIMEOUT_MS - elapsed);
  }
  
  /**
   * Extend session (on explicit user action)
   */
  async extendSession() {
    try {
      const user = await base44.auth.me();
      
      if (user) {
        this.sessionStartTime = Date.now();
        this.lastActivityTime = Date.now();
        this.notifyListeners('session_extended', { user });
        return true;
      }
      
      return false;
    } catch (error) {
      logError(error, { context: 'AuthManager.extendSession' });
      return false;
    }
  }
  
  /**
   * Cleanup (called on app unmount)
   */
  cleanup() {
    this.stopActivityMonitoring();
    this.clearRefreshTimer();
    
    if (this.cleanupActivityListeners) {
      this.cleanupActivityListeners();
    }
    
    this.listeners.clear();
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const authManager = new AuthManager();

// ============================================================================
// REACT HOOK
// ============================================================================

/**
 * Hook to monitor auth state and session
 */
export function useAuthMonitor() {
  const [sessionInfo, setSessionInfo] = React.useState({
    isActive: false,
    timeRemaining: AUTH_CONFIG.SESSION_TIMEOUT_MS,
    showWarning: false,
  });
  
  React.useEffect(() => {
    const handleAuthEvent = ({ event, ...data }) => {
      switch (event) {
        case 'session_started':
          setSessionInfo({
            isActive: true,
            timeRemaining: AUTH_CONFIG.SESSION_TIMEOUT_MS,
            showWarning: false,
          });
          break;
          
        case 'session_ended':
        case 'session_timeout':
          setSessionInfo({
            isActive: false,
            timeRemaining: 0,
            showWarning: false,
          });
          break;
          
        case 'inactivity_warning':
          setSessionInfo(prev => ({
            ...prev,
            timeRemaining: data.remainingMs,
            showWarning: true,
          }));
          break;
          
        case 'session_extended':
          setSessionInfo({
            isActive: true,
            timeRemaining: AUTH_CONFIG.SESSION_TIMEOUT_MS,
            showWarning: false,
          });
          break;
      }
    };
    
    return authManager.addEventListener(handleAuthEvent);
  }, []);
  
  const extendSession = React.useCallback(async () => {
    const extended = await authManager.extendSession();
    return extended;
  }, []);
  
  return {
    ...sessionInfo,
    sessionDuration: authManager.getSessionDuration(),
    extendSession,
  };
}

export default authManager;