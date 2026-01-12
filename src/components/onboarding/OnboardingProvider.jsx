/**
 * ONBOARDING PROVIDER
 * Context and state management for onboarding system
 * FIXED: Removed circular dependencies and ensured stable hook order
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/apiClient';
import { queryKeys } from '../lib/queryKeys';
import { getOnboardingSteps, calculateTotalTime } from './onboardingConfig';
import { usePermissions } from '../hooks/usePermissions';

const OnboardingContext = createContext(null);

export function OnboardingProvider({ children }) {
  // ALL HOOKS AT TOP LEVEL
  const { user, isAdmin, isFacilitator } = usePermissions();
  const queryClient = useQueryClient();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isOnboardingActive, setIsOnboardingActive] = useState(false);
  const [startTime, setStartTime] = useState(null);

  // Determine user role for onboarding - memoized to prevent recalculation
  // Admin takes precedence, then facilitator, then participant
  const onboardingRole = useMemo(() => {
    if (isAdmin) return 'admin';
    if (isFacilitator) return 'facilitator';
    return 'participant';
  }, [isAdmin, isFacilitator]);
  
  const steps = useMemo(() => getOnboardingSteps(user?.role, user?.user_type), [user?.role, user?.user_type]);

  // Fetch onboarding state
  const { data: onboardingState, isLoading } = useQuery({
    queryKey: queryKeys.onboarding.byEmail(user?.email),
    queryFn: async () => {
      if (!user?.email) return null;
      const records = await apiClient.list('UserOnboarding', {
        filters: { user_email: user.email }
      });
      return records[0] || null;
    },
    enabled: !!user?.email,
    staleTime: 30000
  });

  // Create or update onboarding state
  const updateOnboardingMutation = useMutation({
    mutationFn: async (data) => {
      if (onboardingState?.id) {
        return apiClient.update('UserOnboarding', onboardingState.id, data);
      }
      return apiClient.create('UserOnboarding', {
        user_email: user?.email,
        user_role: onboardingRole,
        started_date: new Date().toISOString(),
        ...data
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(queryKeys.onboarding.byEmail(user?.email));
    }
  });

  // Start onboarding - removed circular dependency by using functional setState
  const startOnboarding = useCallback(() => {
    setIsOnboardingActive(true);
    setCurrentStepIndex(0);
    setStartTime(Date.now());
    
    // Use steps from closure safely
    const firstStepId = steps[0]?.id;
    if (firstStepId && !onboardingState) {
      updateOnboardingMutation.mutate({
        current_step: firstStepId,
        completed_steps: [],
        completion_percentage: 0
      });
    }
  }, [steps, onboardingState, updateOnboardingMutation]);

  // Auto-start onboarding for new users OR resume incomplete onboarding
  useEffect(() => {
    // Don't auto-start if user is null (logged out)
    if (!isLoading && user?.email && !isOnboardingActive && steps.length > 0) {
      const hasSeenOnboarding = sessionStorage.getItem(`onboarding-seen-${user.email}`);
      
      // Resume incomplete onboarding on login (but only once per session)
      if (onboardingState && !onboardingState.onboarding_completed && !onboardingState.dismissed && !hasSeenOnboarding) {
        const lastStepIndex = steps.findIndex(s => s.id === onboardingState.current_step);
        if (lastStepIndex >= 0) {
          setCurrentStepIndex(lastStepIndex);
          setIsOnboardingActive(true);
          setStartTime(Date.now());
          sessionStorage.setItem(`onboarding-seen-${user.email}`, 'true');
        }
      }
      // Start fresh for new users (once per session)
      else if (!onboardingState && !hasSeenOnboarding) {
        sessionStorage.setItem(`onboarding-seen-${user.email}`, 'true');
        startOnboarding();
      }
    }
    
    // Clean up onboarding if user logs out
    if (!user?.email && isOnboardingActive) {
      setIsOnboardingActive(false);
    }
  }, [isLoading, user?.email, onboardingState?.id, isOnboardingActive, steps.length, startOnboarding]);

  // Complete current step
  const completeStep = useCallback(async (stepId) => {
    const completedSteps = [...(onboardingState?.completed_steps || []), stepId];
    const completionPercentage = Math.round((completedSteps.length / steps.length) * 100);
    const nextIndex = currentStepIndex + 1;
    
    const isComplete = nextIndex >= steps.length;
    
    await updateOnboardingMutation.mutateAsync({
      completed_steps: completedSteps,
      current_step: isComplete ? null : steps[nextIndex]?.id,
      completion_percentage: completionPercentage,
      onboarding_completed: isComplete,
      completed_date: isComplete ? new Date().toISOString() : undefined,
      last_step_date: new Date().toISOString(),
      total_time_spent: startTime ? Math.floor((Date.now() - startTime) / 1000) : 0
    });

    if (isComplete) {
      setIsOnboardingActive(false);
      if (user?.email) {
        localStorage.setItem(`onboarding-seen-${user.email}`, 'true');
      }
    } else {
      setCurrentStepIndex(nextIndex);
    }
  }, [currentStepIndex, steps, onboardingState, updateOnboardingMutation, startTime, user?.email]);

  // Skip current step
  const skipStep = useCallback(async (stepId) => {
    const skippedSteps = [...(onboardingState?.skipped_steps || []), stepId];
    const nextIndex = currentStepIndex + 1;
    
    await updateOnboardingMutation.mutateAsync({
      skipped_steps: skippedSteps,
      current_step: nextIndex < steps.length ? steps[nextIndex].id : null,
      last_step_date: new Date().toISOString()
    });

    if (nextIndex >= steps.length) {
      setIsOnboardingActive(false);
    } else {
      setCurrentStepIndex(nextIndex);
    }
  }, [currentStepIndex, steps, onboardingState, updateOnboardingMutation]);

  // Go to previous step
  const previousStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  }, [currentStepIndex]);

  // Dismiss onboarding
  const dismissOnboarding = useCallback(async () => {
    setIsOnboardingActive(false);
    await updateOnboardingMutation.mutateAsync({
      dismissed: true,
      last_step_date: new Date().toISOString()
    });
    if (user?.email) {
      localStorage.setItem(`onboarding-seen-${user.email}`, 'true');
    }
  }, [updateOnboardingMutation, user?.email]);

  // Restart onboarding
  const restartOnboarding = useCallback(async () => {
    setCurrentStepIndex(0);
    setStartTime(Date.now());
    await updateOnboardingMutation.mutateAsync({
      current_step: steps[0]?.id,
      completed_steps: [],
      skipped_steps: [],
      completion_percentage: 0,
      onboarding_completed: false,
      dismissed: false,
      total_time_spent: 0
    });
    setIsOnboardingActive(true);
    if (user?.email) {
      localStorage.removeItem(`onboarding-seen-${user.email}`);
    }
  }, [steps, updateOnboardingMutation, user?.email]);

  const currentStep = steps[currentStepIndex];
  const progress = onboardingState?.completion_percentage || 0;
  const totalTime = useMemo(() => calculateTotalTime(steps), [steps]);

  const value = useMemo(() => ({
    // State
    isOnboardingActive,
    currentStep,
    currentStepIndex,
    steps,
    onboardingState,
    progress,
    totalTime,
    
    // Actions
    startOnboarding,
    completeStep,
    skipStep,
    previousStep,
    dismissOnboarding,
    restartOnboarding,
    
    // Helpers
    isLoading,
    isComplete: onboardingState?.onboarding_completed || false,
    isDismissed: onboardingState?.dismissed || false,
    
    // Quest tracking
    completedStepsCount: onboardingState?.completed_steps?.length || 0,
    totalStepsCount: steps.length
  }), [
    isOnboardingActive,
    currentStep,
    currentStepIndex,
    steps,
    onboardingState,
    progress,
    totalTime,
    startOnboarding,
    completeStep,
    skipStep,
    previousStep,
    dismissOnboarding,
    restartOnboarding,
    isLoading
  ]);

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
}