import { useCallback, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useUserData } from './useUserData';

/**
 * Analytics tracking hook
 * Provides methods to track user behavior and feature usage
 */
export function useAnalytics() {
  const { user } = useUserData(false);
  const sessionId = useRef(generateSessionId());

  // Track page view on mount
  useEffect(() => {
    if (user?.email) {
      trackPageView();
    }
  }, [user?.email, window.location.pathname]);

  const trackEvent = useCallback(async (eventType, eventCategory, eventData = {}) => {
    if (!user?.email) return;

    try {
      const cohort = getCohortFromUser(user);
      const deviceType = getDeviceType();

      await base44.entities.AnalyticsEvent.create({
        user_email: user.email,
        event_type: eventType,
        event_category: eventCategory,
        feature_name: eventData.feature_name || 'unknown',
        event_data: {
          page_url: window.location.pathname,
          referrer: document.referrer,
          ...eventData
        },
        session_id: sessionId.current,
        device_type: deviceType,
        user_cohort: cohort
      });
    } catch (error) {
      // Silent fail - don't disrupt user experience
      console.error('Analytics tracking error:', error);
    }
  }, [user]);

  const trackPageView = useCallback(() => {
    trackEvent('page_view', 'navigation', {
      feature_name: window.location.pathname.split('/').pop() || 'home'
    });
  }, [trackEvent]);

  const trackFeatureUse = useCallback((featureName, data = {}) => {
    trackEvent('feature_use', 'engagement', {
      feature_name: featureName,
      ...data
    });
  }, [trackEvent]);

  const trackAIInteraction = useCallback((accepted, aiFeature, confidence) => {
    trackEvent(
      accepted ? 'ai_suggestion_accepted' : 'ai_suggestion_rejected',
      'ai_interaction',
      {
        feature_name: aiFeature,
        ai_confidence: confidence,
        success: accepted
      }
    );
  }, [trackEvent]);

  const trackOnboardingStep = useCallback((stepName, stepNumber, totalSteps) => {
    trackEvent('onboarding_step_completed', 'conversion', {
      feature_name: 'onboarding',
      step_name: stepName,
      step_number: stepNumber,
      total_steps: totalSteps,
      completion_rate: (stepNumber / totalSteps) * 100
    });
  }, [trackEvent]);

  const trackButtonClick = useCallback((buttonName, location) => {
    trackEvent('button_click', 'engagement', {
      feature_name: location,
      button_name: buttonName
    });
  }, [trackEvent]);

  const trackSearch = useCallback((searchTerm, resultCount) => {
    trackEvent('search_performed', 'engagement', {
      feature_name: 'search',
      search_term: searchTerm,
      result_count: resultCount
    });
  }, [trackEvent]);

  return {
    trackEvent,
    trackPageView,
    trackFeatureUse,
    trackAIInteraction,
    trackOnboardingStep,
    trackButtonClick,
    trackSearch
  };
}

// Helper functions
function generateSessionId() {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function getCohortFromUser(user) {
  const createdDate = new Date(user.created_date);
  return `${createdDate.getFullYear()}-${String(createdDate.getMonth() + 1).padStart(2, '0')}`;
}

function getDeviceType() {
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}