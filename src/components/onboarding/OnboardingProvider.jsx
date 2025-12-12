/**
 * ONBOARDING PROVIDER
 * Context and state management for onboarding system
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/apiClient';
import { queryKeys } from '../lib/queryKeys';
import { getOnboardingSteps, calculateTotalTime } from './onboardingConfig';
import { usePermissions } from '../hooks/usePermissions';

const OnboardingContext = createContext(null);

export function OnboardingProvider({ children }) {
  const { user, isAdmin, isFacilitator } = usePermissions();
  const queryClient = useQueryClient();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isOnboardingActive, setIsOnboardingActive] = useState(false);
  const [startTime, setStartTime] = useState(null);

  // Determine user role for onboarding
  const onboardingRole = isAdmin || isFacilitator ? 'admin' : 'participant';
  const steps = getOnboardingSteps(onboardingRole);

  // Fetch onboarding state
  const { data: onboardingState, isLoading } = useQuery({
    queryKey: queryKeys.onboarding.byEmail(user?.email),
    queryFn: async () => {
      const records = await apiClient.list('UserOnboarding', {
        filters: { user_email: user?.email }
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

  // Auto-start onboarding for new users OR resume incomplete onboarding
  useEffect(() => {
    if (!isLoading && user && !isOnboardingActive) {
      const hasSeenOnboarding = localStorage.getItem(`onboarding-seen-${user.email}`);
      
      // Resume incomplete onboarding on login
      if (onboardingState && !onboardingState.onboarding_completed && !onboardingState.dismissed) {
        const lastStepIndex = steps.findIndex(s => s.id === onboardingState.current_step);
        if (lastStepIndex >= 0) {
          setCurrentStepIndex(lastStepIndex);
          setIsOnboardingActive(true);
          setStartTime(Date.now());
        }
      }
      // Start fresh for new users
      else if (!onboardingState && !hasSeenOnboarding) {
        startOnboarding();
      }
    }
  }, [isLoading, user, onboardingState, isOnboardingActive, steps]);

  // Start onboarding
  const startOnboarding = useCallback(() => {
    setIsOnboardingActive(true);
    setCurrentStepIndex(0);
    setStartTime(Date.now());
    
    if (!onboardingState) {
      updateOnboardingMutation.mutate({
        current_step: steps[0].id,
        completed_steps: [],
        completion_percentage: 0
      });
    }
  }, [steps, onboardingState, updateOnboardingMutation]);

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
      localStorage.setItem(`onboarding-seen-${user.email}`, 'true');
    } else {
      setCurrentStepIndex(nextIndex);
    }
  }, [currentStepIndex, steps, onboardingState, updateOnboardingMutation, startTime, user]);

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
    localStorage.setItem(`onboarding-seen-${user.email}`, 'true');
  }, [updateOnboardingMutation, user]);

  // Restart onboarding
  const restartOnboarding = useCallback(async () => {
    setCurrentStepIndex(0);
    setStartTime(Date.now());
    await updateOnboardingMutation.mutateAsync({
      current_step: steps[0].id,
      completed_steps: [],
      skipped_steps: [],
      completion_percentage: 0,
      onboarding_completed: false,
      dismissed: false,
      total_time_spent: 0
    });
    setIsOnboardingActive(true);
    localStorage.removeItem(`onboarding-seen-${user.email}`);
  }, [steps, updateOnboardingMutation, user]);

  const currentStep = steps[currentStepIndex];
  const progress = onboardingState?.completion_percentage || 0;
  const totalTime = calculateTotalTime(steps);

  const value = {
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
    isDismissed: onboardingState?.dismissed || false
  };

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