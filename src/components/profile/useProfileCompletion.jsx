import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { useGamificationTrigger } from '../hooks/useGamificationTrigger';

/**
 * Hook for tracking profile completion and triggering rewards
 */
export function useProfileCompletion() {
  const queryClient = useQueryClient();
  const { trigger } = useGamificationTrigger();

  const updateProfileMutation = useMutation({
    mutationFn: async ({ userEmail, profileData }) => {
      const profiles = await base44.entities.UserProfile.filter({ user_email: userEmail });
      
      if (profiles.length > 0) {
        return await base44.entities.UserProfile.update(profiles[0].id, profileData);
      } else {
        return await base44.entities.UserProfile.create({
          user_email: userEmail,
          ...profileData
        });
      }
    },
    onSuccess: async (profile) => {
      queryClient.invalidateQueries(['user-profile']);
      toast.success('Profile updated successfully!');

      // Check if profile is now complete
      const isComplete = profile.display_name && 
                        profile.bio && 
                        profile.avatar_url && 
                        profile.department;

      if (isComplete && !profile.onboarding_completed) {
        // Mark profile as complete and trigger gamification
        await base44.entities.UserProfile.update(profile.id, {
          onboarding_completed: true
        });

        await trigger('profile_completed', profile.user_email, {
          profile_id: profile.id,
          reference_id: profile.id
        });
      }
    },
    onError: (error) => {
      toast.error('Failed to update profile: ' + error.message);
    }
  });

  return {
    updateProfile: updateProfileMutation.mutate,
    isUpdating: updateProfileMutation.isPending
  };
}