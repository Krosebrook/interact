/**
 * CENTRALIZED ENTITY HOOKS
 * Reusable data fetching hooks for all entities
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  EventService,
  ActivityService,
  ParticipationService,
  RecognitionService,
  StoreService,
  SocialService,
  TeamService,
  BadgeService,
  ChannelService,
  NotificationService,
  UserPointsService,
  UserProfileService,
  BackendFunctions,
  Integrations,
  QUERY_CONFIG
} from '../lib/api';

// ============================================================================
// EVENT HOOKS
// ============================================================================

export function useEvents(options = {}) {
  const { limit = 100, enabled = true } = options;

  const { data: events = [], isLoading: eventsLoading, refetch } = useQuery({
    queryKey: ['events', limit],
    queryFn: () => EventService.getAll(limit),
    enabled,
    ...QUERY_CONFIG.user
  });

  const { data: activities = [], isLoading: activitiesLoading } = useQuery({
    queryKey: ['activities'],
    queryFn: () => ActivityService.getAll(),
    enabled,
    ...QUERY_CONFIG.static
  });

  const { data: participations = [], isLoading: participationsLoading } = useQuery({
    queryKey: ['participations'],
    queryFn: () => ParticipationService.getAll(500),
    enabled,
    ...QUERY_CONFIG.user
  });

  return {
    events,
    activities,
    participations,
    isLoading: eventsLoading || activitiesLoading || participationsLoading,
    refetch
  };
}

// ============================================================================
// RECOGNITION HOOKS
// ============================================================================

export function useRecognitions(status = 'approved', limit = 50) {
  return useQuery({
    queryKey: ['recognitions', status, limit],
    queryFn: () => RecognitionService.getByStatus(status, limit),
    ...QUERY_CONFIG.user
  });
}

export function useFeaturedRecognitions(limit = 10) {
  return useQuery({
    queryKey: ['recognitions-featured', limit],
    queryFn: () => RecognitionService.getFeatured(limit),
    ...QUERY_CONFIG.user
  });
}

export function useRecognitionMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries(['recognitions']);
    queryClient.invalidateQueries(['recognitions-featured']);
  };

  const createMutation = useMutation({
    mutationFn: (data) => RecognitionService.create(data),
    onSuccess: () => {
      invalidate();
      toast.success('Recognition sent!');
    },
    onError: (error) => toast.error(error.message)
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => RecognitionService.update(id, data),
    onSuccess: () => {
      invalidate();
      toast.success('Recognition updated');
    },
    onError: (error) => toast.error(error.message)
  });

  return { createMutation, updateMutation, invalidate };
}

// ============================================================================
// LEADERBOARD HOOKS
// ============================================================================

export function useLeaderboardData() {
  const { data: allUserPoints = [], isLoading: pointsLoading } = useQuery({
    queryKey: ['leaderboard-data'],
    queryFn: () => UserPointsService.getLeaderboard(500),
    ...QUERY_CONFIG.leaderboard
  });

  const { data: profiles = [], isLoading: profilesLoading } = useQuery({
    queryKey: ['user-profiles-all'],
    queryFn: () => UserProfileService.getAll(),
    ...QUERY_CONFIG.static
  });

  // Create profile map for O(1) lookups
  const profileMap = new Map(profiles.map(p => [p.user_email, p]));

  return {
    allUserPoints,
    profiles,
    profileMap,
    isLoading: pointsLoading || profilesLoading
  };
}

// ============================================================================
// STORE HOOKS
// ============================================================================

export function useStoreItems(availableOnly = true) {
  return useQuery({
    queryKey: ['store-items', availableOnly],
    queryFn: () => StoreService.getItems(availableOnly),
    ...QUERY_CONFIG.static
  });
}

export function useUserInventory(userEmail) {
  return useQuery({
    queryKey: ['user-inventory', userEmail],
    queryFn: () => StoreService.getInventory(userEmail),
    enabled: !!userEmail,
    ...QUERY_CONFIG.user
  });
}

export function useUserAvatar(userEmail) {
  return useQuery({
    queryKey: ['user-avatar', userEmail],
    queryFn: () => StoreService.getAvatar(userEmail),
    enabled: !!userEmail,
    ...QUERY_CONFIG.user
  });
}

export function useStorePurchase() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries(['user-points']);
    queryClient.invalidateQueries(['user-inventory']);
    queryClient.invalidateQueries(['store-items']);
  };

  const purchaseWithPoints = useMutation({
    mutationFn: ({ itemId, quantity }) => BackendFunctions.purchaseWithPoints(itemId, quantity),
    onSuccess: (data) => {
      invalidate();
      toast.success(`${data.item?.name || 'Item'} added to inventory! 🎉`);
    },
    onError: (error) => {
      const msg = error.response?.data?.error || 'Purchase failed';
      toast.error(msg);
    }
  });

  const purchaseWithStripe = useMutation({
    mutationFn: ({ itemId }) => BackendFunctions.createStoreCheckout(itemId),
    onSuccess: (data) => {
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    },
    onError: (error) => {
      const msg = error.response?.data?.error || 'Checkout failed';
      toast.error(msg);
    }
  });

  return {
    purchaseWithPoints,
    purchaseWithStripe,
    invalidate,
    isPurchasing: purchaseWithPoints.isLoading || purchaseWithStripe.isLoading
  };
}

// ============================================================================
// SOCIAL HOOKS
// ============================================================================

export function useSocial(currentUserEmail) {
  const queryClient = useQueryClient();

  const { data: following = [] } = useQuery({
    queryKey: ['user-following', currentUserEmail],
    queryFn: () => SocialService.getFollowing(currentUserEmail),
    enabled: !!currentUserEmail,
    ...QUERY_CONFIG.user
  });

  const { data: followers = [] } = useQuery({
    queryKey: ['user-followers', currentUserEmail],
    queryFn: () => SocialService.getFollowers(currentUserEmail),
    enabled: !!currentUserEmail,
    ...QUERY_CONFIG.user
  });

  const { data: blocked = [] } = useQuery({
    queryKey: ['user-blocked', currentUserEmail],
    queryFn: () => SocialService.getBlocked(currentUserEmail),
    enabled: !!currentUserEmail,
    ...QUERY_CONFIG.user
  });

  const invalidate = () => {
    queryClient.invalidateQueries(['user-following', currentUserEmail]);
    queryClient.invalidateQueries(['user-followers', currentUserEmail]);
    queryClient.invalidateQueries(['user-blocked', currentUserEmail]);
  };

  const followMutation = useMutation({
    mutationFn: (targetEmail) => SocialService.follow(currentUserEmail, targetEmail),
    onSuccess: () => {
      invalidate();
      toast.success('Now following!');
    },
    onError: () => toast.error('Failed to follow')
  });

  const unfollowMutation = useMutation({
    mutationFn: (targetEmail) => SocialService.unfollow(currentUserEmail, targetEmail),
    onSuccess: () => {
      invalidate();
      toast.success('Unfollowed');
    },
    onError: () => toast.error('Failed to unfollow')
  });

  const blockMutation = useMutation({
    mutationFn: (targetEmail) => SocialService.block(currentUserEmail, targetEmail),
    onSuccess: () => {
      invalidate();
      toast.success('User blocked');
    },
    onError: () => toast.error('Failed to block')
  });

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
    follow: followMutation.mutate,
    unfollow: unfollowMutation.mutate,
    block: blockMutation.mutate,
    isLoading: followMutation.isLoading || unfollowMutation.isLoading || blockMutation.isLoading
  };
}

// ============================================================================
// TEAM HOOKS
// ============================================================================

export function useTeams() {
  return useQuery({
    queryKey: ['teams'],
    queryFn: () => TeamService.getAll(),
    ...QUERY_CONFIG.user
  });
}

// ============================================================================
// BADGE HOOKS
// ============================================================================

export function useBadges() {
  return useQuery({
    queryKey: ['badges'],
    queryFn: () => BadgeService.getAll(),
    ...QUERY_CONFIG.static
  });
}

export function useUserBadges(userEmail) {
  return useQuery({
    queryKey: ['user-badges', userEmail],
    queryFn: () => BadgeService.getAwards(userEmail),
    enabled: !!userEmail,
    ...QUERY_CONFIG.user
  });
}

// ============================================================================
// CHANNEL HOOKS
// ============================================================================

export function useChannels() {
  return useQuery({
    queryKey: ['channels'],
    queryFn: () => ChannelService.getAll(),
    ...QUERY_CONFIG.user
  });
}

export function useChannelMessages(channelId, limit = 100) {
  return useQuery({
    queryKey: ['channel-messages', channelId, limit],
    queryFn: () => ChannelService.getMessages(channelId, limit),
    enabled: !!channelId,
    ...QUERY_CONFIG.realtime
  });
}

// ============================================================================
// NOTIFICATION HOOKS
// ============================================================================

export function useNotifications(userEmail, limit = 20) {
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications', userEmail, limit],
    queryFn: () => NotificationService.getForUser(userEmail, limit),
    enabled: !!userEmail,
    ...QUERY_CONFIG.user
  });

  const invalidate = () => {
    queryClient.invalidateQueries(['notifications', userEmail]);
  };

  const markAsReadMutation = useMutation({
    mutationFn: (id) => NotificationService.markAsRead(id),
    onSuccess: invalidate
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => NotificationService.delete(id),
    onSuccess: invalidate
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return {
    notifications,
    isLoading,
    unreadCount,
    markAsRead: markAsReadMutation.mutate,
    deleteNotification: deleteMutation.mutate,
    invalidate
  };
}

// ============================================================================
// AI HOOKS
// ============================================================================

export function useAI() {
  const invokeLLM = useMutation({
    mutationFn: ({ prompt, options }) => Integrations.invokeLLM(prompt, options)
  });

  const openAI = useMutation({
    mutationFn: ({ action, prompt, options }) => BackendFunctions.callOpenAI(action, prompt, options)
  });

  const claude = useMutation({
    mutationFn: ({ action, prompt, options }) => BackendFunctions.callClaude(action, prompt, options)
  });

  const gemini = useMutation({
    mutationFn: ({ action, prompt, options }) => BackendFunctions.callGemini(action, prompt, options)
  });

  return { invokeLLM, openAI, claude, gemini };
}