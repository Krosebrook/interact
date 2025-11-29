import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

/**
 * Custom hook for social actions (follow/unfollow/block)
 */
export function useSocialActions(currentUserEmail) {
  const queryClient = useQueryClient();

  // Fetch following list
  const { data: following = [] } = useQuery({
    queryKey: ['user-following', currentUserEmail],
    queryFn: () => base44.entities.UserFollow.filter({ 
      follower_email: currentUserEmail,
      status: 'active'
    }),
    enabled: !!currentUserEmail,
    staleTime: 30000
  });

  // Fetch followers list
  const { data: followers = [] } = useQuery({
    queryKey: ['user-followers', currentUserEmail],
    queryFn: () => base44.entities.UserFollow.filter({ 
      following_email: currentUserEmail,
      status: 'active'
    }),
    enabled: !!currentUserEmail,
    staleTime: 30000
  });

  // Fetch blocked users
  const { data: blocked = [] } = useQuery({
    queryKey: ['user-blocked', currentUserEmail],
    queryFn: () => base44.entities.UserFollow.filter({ 
      follower_email: currentUserEmail,
      status: 'blocked'
    }),
    enabled: !!currentUserEmail,
    staleTime: 30000
  });

  const invalidateSocialQueries = () => {
    queryClient.invalidateQueries(['user-following', currentUserEmail]);
    queryClient.invalidateQueries(['user-followers', currentUserEmail]);
    queryClient.invalidateQueries(['user-blocked', currentUserEmail]);
  };

  // Follow mutation
  const followMutation = useMutation({
    mutationFn: async (targetEmail) => {
      // Check if relationship exists
      const existing = await base44.entities.UserFollow.filter({
        follower_email: currentUserEmail,
        following_email: targetEmail
      });

      if (existing.length > 0) {
        return base44.entities.UserFollow.update(existing[0].id, { status: 'active' });
      }

      return base44.entities.UserFollow.create({
        follower_email: currentUserEmail,
        following_email: targetEmail,
        status: 'active'
      });
    },
    onSuccess: () => {
      invalidateSocialQueries();
      toast.success('Now following!');
    },
    onError: () => toast.error('Failed to follow user')
  });

  // Unfollow mutation
  const unfollowMutation = useMutation({
    mutationFn: async (targetEmail) => {
      const existing = await base44.entities.UserFollow.filter({
        follower_email: currentUserEmail,
        following_email: targetEmail
      });

      if (existing.length > 0) {
        return base44.entities.UserFollow.delete(existing[0].id);
      }
    },
    onSuccess: () => {
      invalidateSocialQueries();
      toast.success('Unfollowed');
    },
    onError: () => toast.error('Failed to unfollow')
  });

  // Block mutation
  const blockMutation = useMutation({
    mutationFn: async (targetEmail) => {
      const existing = await base44.entities.UserFollow.filter({
        follower_email: currentUserEmail,
        following_email: targetEmail
      });

      if (existing.length > 0) {
        return base44.entities.UserFollow.update(existing[0].id, { status: 'blocked' });
      }

      return base44.entities.UserFollow.create({
        follower_email: currentUserEmail,
        following_email: targetEmail,
        status: 'blocked'
      });
    },
    onSuccess: () => {
      invalidateSocialQueries();
      toast.success('User blocked');
    },
    onError: () => toast.error('Failed to block user')
  });

  // Helper functions
  const isFollowing = (email) => following.some(f => f.following_email === email);
  const isBlocked = (email) => blocked.some(b => b.following_email === email);
  const followingEmails = following.map(f => f.following_email);

  return {
    following,
    followers,
    blocked,
    followingCount: following.length,
    followersCount: followers.length,
    isFollowing,
    isBlocked,
    followingEmails,
    follow: (email) => followMutation.mutate(email),
    unfollow: (email) => unfollowMutation.mutate(email),
    block: (email) => blockMutation.mutate(email),
    isLoading: followMutation.isLoading || unfollowMutation.isLoading || blockMutation.isLoading
  };
}

export default useSocialActions;