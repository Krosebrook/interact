import React, { useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

/**
 * Background component that monitors onboarding progress
 * and dynamically adjusts based on user performance
 */
export default function DynamicOnboardingAdjuster({ user, onboardingRecord }) {
  const queryClient = useQueryClient();

  const adjustOnboardingMutation = useMutation({
    mutationFn: async () => {
      return await base44.functions.invoke('adjustOnboardingDynamically', {
        user_email: user.email,
        onboarding_id: onboardingRecord.id
      });
    },
    onSuccess: (data) => {
      if (data.adjusted) {
        queryClient.invalidateQueries(['user-onboarding']);
        toast.info(data.message || 'Your onboarding plan has been personalized');
      }
    }
  });

  useEffect(() => {
    if (!onboardingRecord || onboardingRecord.status === 'completed') return;

    // Check if adjustment is needed
    const daysSinceStart = (Date.now() - new Date(onboardingRecord.start_date).getTime()) / (1000 * 60 * 60 * 24);
    const tasksCompleted = onboardingRecord.tasks_completed || 0;
    
    // Adjust if stuck for 3+ days with low progress
    if (daysSinceStart >= 3 && tasksCompleted < 2) {
      adjustOnboardingMutation.mutate();
    }
  }, [onboardingRecord]);

  return null; // Background component
}