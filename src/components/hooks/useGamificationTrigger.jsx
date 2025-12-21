import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

/**
 * Hook to trigger gamification rule processing
 * Automatically awards points and badges based on configured rules
 */
export function useGamificationTrigger() {
  const triggerMutation = useMutation({
    mutationFn: async ({ trigger_type, user_email, metadata }) => {
      return await base44.functions.invoke('processGamificationRules', {
        trigger_type,
        user_email,
        metadata
      });
    },
    onSuccess: (data) => {
      if (data?.data?.awarded && data.data.awarded.length > 0) {
        const totalPoints = data.data.total_points || 0;
        const badges = data.data.awarded.filter(a => a.badge).length;
        
        if (totalPoints > 0 || badges > 0) {
          const message = [];
          if (totalPoints > 0) message.push(`+${totalPoints} points`);
          if (badges > 0) message.push(`${badges} badge${badges > 1 ? 's' : ''}`);
          
          toast.success(`🎉 ${message.join(' & ')} earned!`, {
            duration: 3000
          });
        }
      }
    },
    onError: (error) => {
      console.error('Gamification trigger error:', error);
      // Silent fail - don't disrupt user experience
    }
  });

  const trigger = async (trigger_type, user_email, metadata = {}) => {
    try {
      await triggerMutation.mutateAsync({ trigger_type, user_email, metadata });
    } catch (error) {
      // Silent fail
    }
  };

  return { trigger, isTriggering: triggerMutation.isPending };
}