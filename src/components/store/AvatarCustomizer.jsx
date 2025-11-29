import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { User, Sparkles, RotateCcw, Save, Check } from 'lucide-react';

const SLOT_CONFIG = {
  hat: { label: 'Hat', icon: '🎩', category: 'avatar_hat' },
  glasses: { label: 'Glasses', icon: '👓', category: 'avatar_glasses' },
  background: { label: 'Background', icon: '🖼️', category: 'avatar_background' },
  frame: { label: 'Frame', icon: '✨', category: 'avatar_frame' },
  effect: { label: 'Effect', icon: '🌟', category: 'avatar_effect' }
};

const RARITY_BORDER = {
  common: 'border-slate-300',
  uncommon: 'border-green-400',
  rare: 'border-blue-400',
  epic: 'border-purple-400',
  legendary: 'border-amber-400 ring-2 ring-amber-200'
};

export default function AvatarCustomizer({ userEmail, userName }) {
  const queryClient = useQueryClient();
  const [activeSlot, setActiveSlot] = useState('hat');
  const [selectedItems, setSelectedItems] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch user inventory
  const { data: inventory = [], isLoading: loadingInventory } = useQuery({
    queryKey: ['user-inventory', userEmail],
    queryFn: () => base44.entities.UserInventory.filter({ user_email: userEmail }),
    enabled: !!userEmail
  });

  // Fetch user avatar
  const { data: avatarData } = useQuery({
    queryKey: ['user-avatar', userEmail],
    queryFn: async () => {
      const avatars = await base44.entities.UserAvatar.filter({ user_email: userEmail });
      return avatars[0] || null;
    },
    enabled: !!userEmail
  });

  // Fetch store items for owned inventory
  const { data: storeItems = [] } = useQuery({
    queryKey: ['store-items'],
    queryFn: () => base44.entities.StoreItem.list()
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
    onError: (error) => {
      toast.error('Failed to save avatar');
    }
  });

  // Get items for current slot
  const getSlotItems = (slot) => {
    const category = SLOT_CONFIG[slot].category;
    return inventory
      .filter(inv => inv.item_category === category && inv.is_active !== false)
      .map(inv => {
        const item = storeItems.find(s => s.id === inv.item_id);
        return { ...inv, storeItem: item };
      });
  };

  const handleSelectItem = (slot, itemId) => {
    const newSelected = { ...selectedItems };
    if (newSelected[slot] === itemId) {
      newSelected[slot] = null; // Unequip
    } else {
      newSelected[slot] = itemId;
    }
    setSelectedItems(newSelected);
    setHasChanges(true);
  };

  const handleReset = () => {
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
  };

  const getEquippedItem = (slot) => {
    const itemId = selectedItems[slot];
    if (!itemId) return null;
    const inv = inventory.find(i => i.item_id === itemId);
    const item = storeItems.find(s => s.id === itemId);
    return { ...inv, storeItem: item };
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Avatar Preview */}
      <Card className="glass-card-solid">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-int-orange" />
            Avatar Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="aspect-square max-w-sm mx-auto relative rounded-2xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
            {/* Background layer */}
            {selectedItems.background && (() => {
              const item = getEquippedItem('background');
              return item?.storeItem?.image_url ? (
                <img 
                  src={item.storeItem.image_url} 
                  alt="Background"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-30">
                  {item?.storeItem?.icon || '🖼️'}
                </div>
              );
            })()}

            {/* Frame layer */}
            {selectedItems.frame && (() => {
              const item = getEquippedItem('frame');
              return (
                <div className="absolute inset-0 border-8 border-amber-400 rounded-2xl pointer-events-none" />
              );
            })()}

            {/* Avatar base */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                {/* User avatar circle */}
                <div className="w-32 h-32 rounded-full bg-int-orange flex items-center justify-center text-white text-4xl font-bold shadow-xl">
                  {userName?.charAt(0) || '?'}
                </div>

                {/* Hat layer */}
                {selectedItems.hat && (() => {
                  const item = getEquippedItem('hat');
                  return (
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-5xl">
                      {item?.storeItem?.icon || '🎩'}
                    </div>
                  );
                })()}

                {/* Glasses layer */}
                {selectedItems.glasses && (() => {
                  const item = getEquippedItem('glasses');
                  return (
                    <div className="absolute top-1/3 left-1/2 -translate-x-1/2 text-4xl">
                      {item?.storeItem?.icon || '👓'}
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Effect layer */}
            {selectedItems.effect && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <Sparkles className="h-full w-full text-amber-400 opacity-30 animate-pulse" />
              </div>
            )}
          </div>

          {/* Current equipment summary */}
          <div className="mt-4 flex flex-wrap gap-2 justify-center">
            {Object.entries(SLOT_CONFIG).map(([slot, config]) => {
              const equipped = getEquippedItem(slot);
              return (
                <Badge 
                  key={slot}
                  variant={equipped ? 'default' : 'outline'}
                  className={equipped ? 'bg-int-orange' : 'text-slate-400'}
                >
                  {config.icon} {equipped ? equipped.item_name : 'None'}
                </Badge>
              );
            })}
          </div>

          {/* Action buttons */}
          <div className="mt-4 flex gap-3">
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={!hasChanges}
              className="flex-1"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button
              onClick={() => saveMutation.mutate()}
              disabled={!hasChanges || saveMutation.isLoading}
              className="flex-1 bg-int-orange hover:bg-[#C46322]"
            >
              <Save className="h-4 w-4 mr-2" />
              {saveMutation.isLoading ? 'Saving...' : 'Save Avatar'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Selection */}
      <Card className="glass-card-solid">
        <CardHeader>
          <CardTitle>Your Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeSlot} onValueChange={setActiveSlot}>
            <TabsList className="grid grid-cols-5 mb-4">
              {Object.entries(SLOT_CONFIG).map(([slot, config]) => (
                <TabsTrigger key={slot} value={slot} className="text-xs">
                  <span className="mr-1">{config.icon}</span>
                  <span className="hidden sm:inline">{config.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {Object.entries(SLOT_CONFIG).map(([slot, config]) => {
              const items = getSlotItems(slot);
              return (
                <TabsContent key={slot} value={slot}>
                  <ScrollArea className="h-[300px]">
                    {items.length === 0 ? (
                      <div className="text-center py-8 text-slate-500">
                        <div className="text-4xl mb-2">{config.icon}</div>
                        <p>No {config.label.toLowerCase()} items owned</p>
                        <p className="text-sm">Visit the store to get some!</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-3">
                        {items.map((item) => {
                          const isSelected = selectedItems[slot] === item.item_id;
                          return (
                            <button
                              key={item.id}
                              onClick={() => handleSelectItem(slot, item.item_id)}
                              className={`relative p-3 rounded-lg border-2 transition-all ${
                                isSelected 
                                  ? 'border-int-orange bg-orange-50 ring-2 ring-int-orange/30' 
                                  : `${RARITY_BORDER[item.item_rarity]} hover:border-int-orange/50 bg-white`
                              }`}
                            >
                              {isSelected && (
                                <div className="absolute -top-2 -right-2 w-6 h-6 bg-int-orange rounded-full flex items-center justify-center">
                                  <Check className="h-4 w-4 text-white" />
                                </div>
                              )}
                              <div className="text-3xl mb-1">
                                {item.storeItem?.icon || config.icon}
                              </div>
                              <div className="text-xs font-medium truncate">
                                {item.item_name}
                              </div>
                              <Badge className="text-[10px] mt-1 capitalize" variant="outline">
                                {item.item_rarity}
                              </Badge>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </ScrollArea>
                </TabsContent>
              );
            })}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}