/**
 * CHANNEL DATA HOOK
 * Production-grade for team channels with real-time messaging
 */

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { apiClient } from '../lib/apiClient';
import { useOptimisticCreate } from '../lib/optimisticMutations';
import { queryKeys } from '../lib/queryKeys';
import { usePermissions } from './usePermissions';
import { transformInput } from '../lib/dataTransformers';

export function useChannelData(options = {}) {
  const { enabled = true, channelId = null, userEmail = null } = options;
  const { user, isFacilitator, isAdmin } = usePermissions();

  // Fetch channels
  const { data: channels = [], isLoading: channelsLoading, refetch: refetchChannels } = useQuery({
    queryKey: queryKeys.channels.all,
    queryFn: () => apiClient.list('Channel', {
      sort: '-created_date',
      limit: 100
    }),
    enabled,
    staleTime: 30000
  });

  // Fetch messages for specific channel
  const { data: messages = [], isLoading: messagesLoading, refetch: refetchMessages } = useQuery({
    queryKey: queryKeys.channels.messages.list({ channelId }),
    queryFn: () => channelId
      ? apiClient.list('ChannelMessage', {
          filters: { channel_id: channelId },
          sort: '-created_date',
          limit: 200
        })
      : [],
    enabled: !!channelId,
    staleTime: 5000, // More frequent refetch for messages
    refetchInterval: 10000 // Poll every 10 seconds
  });

  // Send message with optimistic update
  const sendMessageMutation = useOptimisticCreate({
    mutationFn: async (messageData) => {
      const validated = transformInput({
        ...messageData,
        user_email: user?.email,
        channel_id: channelId
      });
      return apiClient.create('ChannelMessage', validated);
    },
    queryKey: queryKeys.channels.messages.list({ channelId }),
    successMessage: null, // Silent
    errorMessage: 'Failed to send message'
  });

  // Memoized computed values
  const computed = useMemo(() => {
    // User's channels
    const userChannels = channels.filter(c => 
      c.is_public || 
      c.members?.includes(user?.email) ||
      c.created_by === user?.email
    );

    // Channel categories
    const publicChannels = channels.filter(c => c.is_public);
    const privateChannels = channels.filter(c => !c.is_public);

    // Current channel
    const currentChannel = channelId 
      ? channels.find(c => c.id === channelId)
      : null;

    // User can post in channel
    const canPostInChannel = (channel) => {
      if (!channel) return false;
      if (isAdmin || isFacilitator) return true;
      return channel.is_public || channel.members?.includes(user?.email);
    };

    return {
      userChannels,
      publicChannels,
      privateChannels,
      currentChannel,
      canPostInChannel
    };
  }, [channels, channelId, user, isAdmin, isFacilitator]);

  return {
    channels,
    messages,
    ...computed,
    isLoading: channelsLoading,
    messagesLoading,
    refetchChannels,
    refetchMessages,
    sendMessage: sendMessageMutation.mutate,
    isSending: sendMessageMutation.isPending
  };
}