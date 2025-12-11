/**
 * STORE DATA HOOK
 * Production-grade for point store with inventory management and transactions
 */

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { apiClient } from '../lib/apiClient';
import { useOptimisticUpdate } from '../lib/optimisticMutations';
import { queryKeys } from '../lib/queryKeys';
import { usePermissions } from './usePermissions';

export function useStoreData(options = {}) {
  const { enabled = true, userEmail = null } = options;
  const { user, isAdmin } = usePermissions();

  // Store items
  const { data: items = [], isLoading: itemsLoading } = useQuery({
    queryKey: queryKeys.store.items.available,
    queryFn: () => apiClient.list('StoreItem', {
      filters: { is_available: true }
    }),
    enabled,
    staleTime: 60000
  });

  // All items (admin only)
  const { data: allItems = [], isLoading: allItemsLoading, refetch: refetchItems } = useQuery({
    queryKey: queryKeys.store.items.all,
    queryFn: () => apiClient.list('StoreItem', {
      sort: '-created_date',
      limit: 200
    }),
    enabled: isAdmin,
    staleTime: 30000
  });

  // User inventory
  const { data: inventory = [], isLoading: inventoryLoading, refetch: refetchInventory } = useQuery({
    queryKey: queryKeys.store.inventory.list({ userEmail }),
    queryFn: () => userEmail
      ? apiClient.list('UserInventory', { filters: { user_email: userEmail } })
      : [],
    enabled: !!userEmail,
    staleTime: 30000
  });

  // User avatar
  const { data: avatar, isLoading: avatarLoading, refetch: refetchAvatar } = useQuery({
    queryKey: queryKeys.store.avatar.byUser(userEmail),
    queryFn: async () => {
      if (!userEmail) return null;
      const avatars = await apiClient.list('UserAvatar', {
        filters: { user_email: userEmail }
      });
      return avatars[0] || null;
    },
    enabled: !!userEmail,
    staleTime: 30000
  });

  // Transactions
  const { data: transactions = [], isLoading: transactionsLoading } = useQuery({
    queryKey: queryKeys.store.transactions.list({ userEmail }),
    queryFn: () => userEmail
      ? apiClient.list('StoreTransaction', {
          filters: { user_email: userEmail },
          sort: '-created_date',
          limit: 50
        })
      : [],
    enabled: !!userEmail,
    staleTime: 30000
  });

  // Purchase item with optimistic update
  const purchaseMutation = useOptimisticUpdate({
    mutationFn: async ({ itemId, quantity = 1 }) => {
      return apiClient.invoke('purchaseWithPoints', {
        item_id: itemId,
        quantity
      });
    },
    queryKey: queryKeys.store.inventory.list({ userEmail }),
    successMessage: 'Purchase successful!',
    errorMessage: 'Purchase failed'
  });

  // Update avatar
  const updateAvatarMutation = useOptimisticUpdate({
    mutationFn: async (avatarData) => {
      if (avatar?.id) {
        return apiClient.update('UserAvatar', avatar.id, avatarData);
      }
      return apiClient.create('UserAvatar', {
        ...avatarData,
        user_email: userEmail
      });
    },
    queryKey: queryKeys.store.avatar.byUser(userEmail),
    successMessage: 'Avatar updated',
    errorMessage: 'Failed to update avatar'
  });

  // Memoized computed values
  const computed = useMemo(() => {
    // Items grouped by category
    const itemsByCategory = items.reduce((acc, item) => {
      const category = item.category || 'other';
      if (!acc[category]) acc[category] = [];
      acc[category].push(item);
      return acc;
    }, {});

    // Check if user can afford item
    const canAfford = (itemPrice, userPoints) => {
      return (userPoints?.available_points || 0) >= itemPrice;
    };

    // Check if item is in inventory
    const hasInInventory = (itemId) => {
      return inventory.some(inv => inv.item_id === itemId);
    };

    return {
      itemsByCategory,
      canAfford,
      hasInInventory
    };
  }, [items, inventory]);

  return {
    items,
    allItems,
    inventory,
    avatar,
    transactions,
    ...computed,
    isLoading: itemsLoading || inventoryLoading || avatarLoading || transactionsLoading,
    allItemsLoading,
    purchaseItem: purchaseMutation.mutate,
    updateAvatar: updateAvatarMutation.mutate,
    isPurchasing: purchaseMutation.isPending,
    isUpdatingAvatar: updateAvatarMutation.isPending,
    refetchItems,
    refetchInventory,
    refetchAvatar
  };
}