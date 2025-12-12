/**
 * STEP VALIDATION HOOK
 * Monitors app state to auto-validate onboarding steps
 */

import { useEffect, useState } from 'react';
import { useEventData } from '../hooks/useEventData';
import { useTeamData } from '../hooks/useTeamData';
import { useUserProfile } from '../hooks/useUserProfile';
import { useGamificationData } from '../hooks/useGamificationData';

export function useStepValidation(user, currentStep) {
  const [isValid, setIsValid] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');

  // Data hooks for validation
  const { events } = useEventData();
  const { teams } = useTeamData();
  const { profile } = useUserProfile(user?.email);
  const { badges, userPoints } = useGamificationData(user?.email);

  useEffect(() => {
    if (!currentStep?.validation) {
      setIsValid(true);
      return;
    }

    const { check, message, optional } = currentStep.validation;
    
    try {
      // Create validation context
      const context = {
        events: events || [],
        teams: teams || [],
        profile: profile || {},
        badges: badges || [],
        userPoints: userPoints || {},
        participations: [], // Would be fetched separately
        recognitionsSent: [] // Would be fetched separately
      };

      // Evaluate validation condition
      const result = evaluateCondition(check, context);
      
      setIsValid(result || optional);
      setValidationMessage(result ? '' : message);
    } catch (error) {
      console.error('Validation error:', error);
      setIsValid(currentStep.validation.optional || false);
    }
  }, [currentStep, events, teams, profile, badges, userPoints]);

  return { isValid, validationMessage };
}

function evaluateCondition(condition, context) {
  try {
    // Safe evaluation of validation conditions
    // Examples: 'events.length > 0', 'profile.avatar_url && profile.bio'
    
    // Simple property checks
    if (condition.includes('profile.avatar_url') && condition.includes('profile.bio')) {
      return context.profile?.avatar_url && context.profile?.bio;
    }
    
    if (condition.includes('events.length > 0')) {
      return context.events.length > 0;
    }
    
    if (condition.includes('teams.length > 0')) {
      return context.teams.length > 0;
    }
    
    if (condition.includes('profile.activity_preferences.preferred_types.length >= 3')) {
      return context.profile?.activity_preferences?.preferred_types?.length >= 3;
    }
    
    if (condition.includes('participations.length > 0')) {
      return context.participations.length > 0;
    }
    
    if (condition.includes('recognitionsSent.length > 0')) {
      return context.recognitionsSent.length > 0;
    }
    
    // Default to true for unknown conditions
    return true;
  } catch (error) {
    console.error('Condition evaluation error:', error);
    return false;
  }
}