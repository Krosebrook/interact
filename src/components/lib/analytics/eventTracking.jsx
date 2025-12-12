/**
 * ANALYTICS EVENT TRACKING
 * Centralized analytics tracking (prepared for GA4/Mixpanel)
 */

// Event Categories
export const TRACK_CATEGORIES = {
  USER: 'user',
  EVENT: 'event',
  GAMIFICATION: 'gamification',
  RECOGNITION: 'recognition',
  TEAM: 'team',
  ONBOARDING: 'onboarding'
};

// Track Events
export const TRACK_EVENTS = {
  // User
  USER_LOGIN: 'user_login',
  USER_LOGOUT: 'user_logout',
  USER_PROFILE_UPDATE: 'user_profile_update',
  
  // Events
  EVENT_CREATE: 'event_create',
  EVENT_RSVP: 'event_rsvp',
  EVENT_ATTEND: 'event_attend',
  EVENT_FEEDBACK: 'event_feedback',
  
  // Gamification
  BADGE_EARNED: 'badge_earned',
  POINTS_AWARDED: 'points_awarded',
  CHALLENGE_STARTED: 'challenge_started',
  CHALLENGE_COMPLETED: 'challenge_completed',
  LEVEL_UP: 'level_up',
  
  // Recognition
  RECOGNITION_SENT: 'recognition_sent',
  RECOGNITION_RECEIVED: 'recognition_received',
  
  // Teams
  TEAM_CREATED: 'team_created',
  TEAM_JOINED: 'team_joined',
  
  // Onboarding
  ONBOARDING_STARTED: 'onboarding_started',
  ONBOARDING_STEP_COMPLETED: 'onboarding_step_completed',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  ONBOARDING_DISMISSED: 'onboarding_dismissed'
};

// Track Function
export function trackEvent(eventName, properties = {}) {
  // Placeholder for future analytics integration
  if (process.env.NODE_ENV === 'development') {
    console.log('📊 Analytics Event:', eventName, properties);
  }

  // Future: Send to GA4, Mixpanel, etc.
  // window.gtag?.('event', eventName, properties);
  // window.mixpanel?.track(eventName, properties);
}

// Convenience tracking functions
export function trackUserAction(action, metadata = {}) {
  trackEvent(action, {
    category: TRACK_CATEGORIES.USER,
    ...metadata
  });
}

export function trackEventAction(action, eventData = {}) {
  trackEvent(action, {
    category: TRACK_CATEGORIES.EVENT,
    event_id: eventData.id,
    event_type: eventData.type,
    ...eventData
  });
}

export function trackGamificationAction(action, metadata = {}) {
  trackEvent(action, {
    category: TRACK_CATEGORIES.GAMIFICATION,
    ...metadata
  });
}

export function trackOnboardingProgress(action, stepData = {}) {
  trackEvent(action, {
    category: TRACK_CATEGORIES.ONBOARDING,
    ...stepData
  });
}

export default {
  TRACK_CATEGORIES,
  TRACK_EVENTS,
  trackEvent,
  trackUserAction,
  trackEventAction,
  trackGamificationAction,
  trackOnboardingProgress
};