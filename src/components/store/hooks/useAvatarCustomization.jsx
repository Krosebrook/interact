import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

/**
 * Slot configuration for avatar customization
 */
export const SLOT_CONFIG = {
  hat: { label: 'Hat', icon: '🎩', category: 'avatar_hat' },
  glasses: { label: 'Glasses', icon: '👓', category: 'avatar_glasses' },
  background: { label: 'Background', icon: '🖼️', category: 'avatar_background' },
  frame: { label: 'Frame', icon: '✨', category: 'avatar_frame' },
  effect: { label: 'Effect', icon: '🌟', category: 'avatar_effect' }
};

export const RARITY_BORDER = {
  common: 'border-slate-300',
  uncommon: 'border-green-400',
  rare: 'border-blue-400',
  epic: 'border-purple-400',
  legendary: 'border-amber-400 ring-2 ring-amber-200'
};

/**
 * Custom hook for avatar customization logic
 * Separates data fetching and state management from UI
 */
export function useAvatarCustomization(userEmail) {
  const queryClient = useQueryClient();
  const [activeSlot, setActiveSlot] = useState('hat');
  const [selectedItems, setSelectedItems] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch user inventory
  const { data: inventory = [], isLoading: loadingInventory } = useQuery({
    queryKey: ['user-inventory', userEmail],
    queryFn: () => base44.entities.UserInventory.filter({ user_email: userEmail }),
    enabled: !!userEmail,
    staleTime: 30000
  });

  // Fetch user avatar
  const { data: avatarData } = useQuery({
    queryKey: ['user-avatar', userEmail],
    queryFn: async () => {
      const avatars = await base44.entities.UserAvatar.filter({ user_email: userEmail });
      return avatars[0] || null;
    },
    enabled: !!userEmail,
    staleTime: 30000
  });

  // Fetch store items
  const { data: storeItems = [] } = useQuery({
    queryKey: ['store-items'],
    queryFn: () => base44.entities.StoreItem.list(),
    staleTime: 60000
  });

  // Initialize selected items from avatar
  useEffect(() => {
    if (avatarData) {
      setSelectedItems({
        hat: avatarData.equipped_hat,
        glasses: avatarData.equipped_glasses,
        background: avatarData.equipped_background,
        frame: avatarData.equipped_frame,
        effect: avatarData.equipped_effect
      });
      setHasChanges(false);
    }
  }, [avatarData]);

  // Save avatar mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      const updateData = {
        equipped_hat: selectedItems.hat || null,
        equipped_glasses: selectedItems.glasses || null,
        equipped_background: selectedItems.background || null,
        equipped_frame: selectedItems.frame || null,
        equipped_effect: selectedItems.effect || null,
        last_updated: new Date().toISOString()
      };

      if (avatarData) {
        return base44.entities.UserAvatar.update(avatarData.id, updateData);
      } else {
        return base44.entities.UserAvatar.create({
          user_email: userEmail,
          ...updateData
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['user-avatar', userEmail]);
      setHasChanges(false);
      toast.success('Avatar saved!');
    },
    onError: () => {
      toast.error('Failed to save avatar');
    }
  });

  // Get items for a specific slot
  const getSlotItems = useCallback((slot) => {
    const category = SLOT_CONFIG[slot]?.category;
    return inventory
      .filter(inv => inv.item_category === category && inv.is_active !== false)
      .map(inv => ({
        ...inv,
        storeItem: storeItems.find(s => s.id === inv.item_id)
      }));
  }, [inventory, storeItems]);

  // Get equipped item for a slot
  const getEquippedItem = useCallback((slot) => {
    const itemId = selectedItems[slot];
    if (!itemId) return null;
    const inv = inventory.find(i => i.item_id === itemId);
    const item = storeItems.find(s => s.id === itemId);
    return inv ? { ...inv, storeItem: item } : null;
  }, [selectedItems, inventory, storeItems]);

  // Handle item selection
  const handleSelectItem = useCallback((slot, itemId) => {
    setSelectedItems(prev => {
      const newSelected = { ...prev };
      newSelected[slot] = prev[slot] === itemId ? null : itemId;
      return newSelected;
    });
    setHasChanges(true);
  }, []);

  // Reset to saved state
  const handleReset = useCallback(() => {
    if (avatarData) {
      setSelectedItems({
        hat: avatarData.equipped_hat,
        glasses: avatarData.equipped_glasses,
        background: avatarData.equipped_background,
        frame: avatarData.equipped_frame,
        effect: avatarData.equipped_effect
      });
    } else {
      setSelectedItems({});
    }
    setHasChanges(false);
  }, [avatarData]);

  return {
    // State
    activeSlot,
    setActiveSlot,
    selectedItems,
    hasChanges,
    
    // Data
    inventory,
    storeItems,
    loadingInventory,
    
    // Methods
    getSlotItems,
    getEquippedItem,
    handleSelectItem,
    handleReset,
    
    // Mutation
    saveMutation,
    saveAvatar: () => saveMutation.mutate()
  };
}

export default useAvatarCustomization;