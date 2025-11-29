import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useUserData } from '../components/hooks/useUserData';
import { useStoreActions } from '../components/store/hooks/useStoreActions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StoreItemCard from '../components/store/StoreItemCard';
import StoreItemDetail from '../components/store/StoreItemDetail';
import AvatarCustomizer from '../components/store/AvatarCustomizer';
import { toast } from 'sonner';
import { Store, Search, Coins, User, Package, Filter, ShoppingBag } from 'lucide-react';

const CATEGORIES = [
  { value: 'all', label: 'All Items', icon: Store },
  { value: 'avatar_hat', label: 'Hats', icon: '🎩' },
  { value: 'avatar_glasses', label: 'Glasses', icon: '👓' },
  { value: 'avatar_background', label: 'Backgrounds', icon: '🖼️' },
  { value: 'avatar_frame', label: 'Frames', icon: '✨' },
  { value: 'avatar_effect', label: 'Effects', icon: '🌟' },
  { value: 'power_up', label: 'Power-Ups', icon: '⚡' }
];

const RARITIES = [
  { value: 'all', label: 'All Rarities' },
  { value: 'common', label: 'Common' },
  { value: 'uncommon', label: 'Uncommon' },
  { value: 'rare', label: 'Rare' },
  { value: 'epic', label: 'Epic' },
  { value: 'legendary', label: 'Legendary' }
];

export default function PointStore() {
  const { user, loading, userPoints } = useUserData(true);
  const { purchase, isPurchasing, invalidateStoreQueries } = useStoreActions();
  const [activeTab, setActiveTab] = useState('store');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRarity, setSelectedRarity] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);

  // Check URL params for Stripe redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === 'true') {
      toast.success('Purchase successful! Check your inventory.', { duration: 5000 });
      invalidateStoreQueries();
      window.history.replaceState({}, '', window.location.pathname);
    } else if (params.get('canceled') === 'true') {
      toast.error('Purchase canceled');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [invalidateStoreQueries]);

  // Fetch store items
  const { data: storeItems = [], isLoading: loadingItems } = useQuery({
    queryKey: ['store-items'],
    queryFn: () => base44.entities.StoreItem.filter({ is_available: true }, 'display_order'),
    staleTime: 30000
  });

  // Fetch user inventory
  const { data: inventory = [] } = useQuery({
    queryKey: ['user-inventory', user?.email],
    queryFn: () => base44.entities.UserInventory.filter({ user_email: user?.email }),
    enabled: !!user?.email,
    staleTime: 30000
  });

  // Filter items
  const filteredItems = storeItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesRarity = selectedRarity === 'all' || item.rarity === selectedRarity;
    const matchesSearch = !searchQuery || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesRarity && matchesSearch;
  });

  // Check if user owns an item
  const isOwned = (itemId) => inventory.some(inv => inv.item_id === itemId);

  const currentPoints = userPoints?.available_points || 0;

  if (loading) {
    return <LoadingSpinner className="min-h-[60vh]" message="Loading store..." />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="glass-panel-solid">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-int-navy font-display flex items-center gap-2">
              <Store className="h-8 w-8 text-int-orange" />
              Point Store
            </h1>
            <p className="text-slate-600 mt-1">
              Customize your avatar with exclusive items and power-ups
            </p>
          </div>

          {/* Points Balance */}
          <Card className="bg-gradient-to-r from-int-navy to-blue-800 text-white border-0 shadow-lg">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-full">
                <Coins className="h-6 w-6" />
              </div>
              <div>
                <div className="text-3xl font-bold">{currentPoints.toLocaleString()}</div>
                <p className="text-white/80 text-sm">Available Points</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="store" className="flex items-center gap-2">
            <Store className="h-4 w-4" />
            <span className="hidden sm:inline">Store</span>
          </TabsTrigger>
          <TabsTrigger value="inventory" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            <span className="hidden sm:inline">My Inventory</span>
            {inventory.length > 0 && (
              <Badge variant="secondary" className="ml-1">{inventory.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="avatar" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Avatar</span>
          </TabsTrigger>
        </TabsList>

        {/* Store Tab */}
        <TabsContent value="store" className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category filter */}
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
              {CATEGORIES.map(cat => (
                <Button
                  key={cat.value}
                  variant={selectedCategory === cat.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`whitespace-nowrap ${selectedCategory === cat.value ? 'bg-int-orange hover:bg-[#C46322]' : ''}`}
                >
                  {typeof cat.icon === 'string' ? (
                    <span className="mr-1">{cat.icon}</span>
                  ) : (
                    <cat.icon className="h-4 w-4 mr-1" />
                  )}
                  {cat.label}
                </Button>
              ))}
            </div>

            {/* Rarity filter */}
            <Select value={selectedRarity} onValueChange={setSelectedRarity}>
              <SelectTrigger className="w-[150px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Rarity" />
              </SelectTrigger>
              <SelectContent>
                {RARITIES.map(rarity => (
                  <SelectItem key={rarity.value} value={rarity.value}>
                    {rarity.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Items Grid */}
          {loadingItems ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="aspect-square bg-slate-100 animate-pulse rounded-xl" />
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <Card className="p-12 text-center">
              <ShoppingBag className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No items found</h3>
              <p className="text-slate-500">Try adjusting your filters</p>
            </Card>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredItems.map(item => (
                <StoreItemCard
                  key={item.id}
                  item={item}
                  userPoints={currentPoints}
                  owned={isOwned(item.id)}
                  onViewDetails={setSelectedItem}
                  onQuickBuy={purchase}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Inventory Tab */}
        <TabsContent value="inventory" className="space-y-6">
          {inventory.length === 0 ? (
            <Card className="p-12 text-center">
              <Package className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Your inventory is empty</h3>
              <p className="text-slate-500 mb-4">Visit the store to get your first items!</p>
              <Button onClick={() => setActiveTab('store')} className="bg-int-orange hover:bg-[#C46322]">
                <Store className="h-4 w-4 mr-2" />
                Browse Store
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {inventory.map(inv => {
                const item = storeItems.find(s => s.id === inv.item_id) || {
                  name: inv.item_name,
                  category: inv.item_category,
                  rarity: inv.item_rarity
                };
                return (
                  <Card key={inv.id} className={`relative overflow-hidden ${inv.is_equipped ? 'ring-2 ring-int-orange' : ''}`}>
                    <CardContent className="p-4">
                      <div className="aspect-square mb-3 rounded-lg bg-slate-100 flex items-center justify-center">
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <span className="text-5xl">{item.icon || '🎁'}</span>
                        )}
                      </div>
                      <h3 className="font-semibold text-slate-900 truncate">{inv.item_name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="capitalize text-xs">
                          {inv.item_rarity}
                        </Badge>
                        {inv.is_equipped && (
                          <Badge className="bg-int-orange text-xs">Equipped</Badge>
                        )}
                      </div>
                      {inv.expires_at && (
                        <p className="text-xs text-slate-500 mt-2">
                          Expires: {new Date(inv.expires_at).toLocaleDateString()}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Avatar Tab */}
        <TabsContent value="avatar">
          <AvatarCustomizer 
            userEmail={user?.email} 
            userName={user?.full_name}
          />
        </TabsContent>
      </Tabs>

      {/* Item Detail Modal */}
      <StoreItemDetail
        item={selectedItem}
        open={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        userPoints={currentPoints}
        owned={selectedItem ? isOwned(selectedItem.id) : false}
        onPurchasePoints={(item) => purchase(item, 'points')}
        onPurchaseStripe={(item) => purchase(item, 'stripe')}
        isPurchasing={isPurchasing}
      />
    </div>
  );
}