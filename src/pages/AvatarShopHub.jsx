import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useUserData } from '../components/hooks/useUserData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Sparkles, Star, Clock } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { toast } from 'sonner';

export default function AvatarShopHub() {
  const { user, loading } = useUserData();
  const [selectedCategory, setSelectedCategory] = useState('Apparel');
  const queryClient = useQueryClient();

  const { data: userPoints } = useQuery({
    queryKey: ['user-points', user?.email],
    queryFn: async () => {
      const points = await base44.entities.UserPoints.filter({ user_email: user?.email });
      return points[0] || { total_points: 0 };
    },
    enabled: !!user?.email
  });

  const { data: storeItems = [] } = useQuery({
    queryKey: ['store-items'],
    queryFn: () => base44.entities.StoreItem.filter({ is_available: true })
  });

  const purchaseMutation = useMutation({
    mutationFn: async (itemId) => {
      return await base44.functions.invoke('purchaseWithPoints', { item_id: itemId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['user-points']);
      queryClient.invalidateQueries(['user-inventory']);
      toast.success('Purchase successful!');
    },
    onError: () => toast.error('Purchase failed')
  });

  const categories = ['Apparel', 'Effects', 'Backgrounds', 'Animations'];
  const filteredItems = storeItems.filter(item => item.category === selectedCategory);

  // Featured limited item
  const featuredItem = storeItems.find(item => item.rarity === 'legendary');

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-purple-950 pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-purple-500/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-purple-600/20 p-0.5 border border-purple-500/50">
            <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
              <ShoppingCart className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-slate-400 font-medium">Employee #{user?.id?.slice(-3)}</span>
            <span className="text-sm font-bold">Avatar Shop Hub</span>
          </div>
        </div>
        <div className="bg-amber-400/10 border border-amber-400/30 rounded-full px-3 py-1.5 flex items-center gap-2 shadow-lg shadow-amber-400/20">
          <Sparkles className="h-4 w-4 text-amber-400" />
          <span className="text-amber-400 font-bold text-sm">{userPoints?.total_points || 0} <span className="text-[10px] opacity-70">PTS</span></span>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 pt-4 space-y-6">
        {/* Featured Limited Drop */}
        {featuredItem && (
          <section>
            <div className="flex items-center justify-between mb-3 px-1">
              <h2 className="text-lg font-bold">Limited Drop</h2>
              <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">Legendary</span>
            </div>
            <div className="relative overflow-hidden rounded-xl bg-slate-900 border border-purple-500/30 shadow-lg shadow-purple-500/20">
              <div className="aspect-video w-full bg-gradient-to-br from-purple-900 to-slate-900 flex items-center justify-center">
                <Sparkles className="h-20 w-20 text-purple-400 opacity-50" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="flex justify-between items-end">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{featuredItem.name}</h3>
                    <p className="text-sm text-slate-300">{featuredItem.description}</p>
                  </div>
                  <Button
                    onClick={() => purchaseMutation.mutate(featuredItem.id)}
                    disabled={purchaseMutation.isPending || (userPoints?.total_points || 0) < featuredItem.points_cost}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-full shadow-lg"
                  >
                    {featuredItem.points_cost} PTS
                  </Button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Category Tabs */}
        <nav className="flex overflow-x-auto gap-2 hide-scrollbar">
          {categories.map(cat => (
            <Button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              variant={selectedCategory === cat ? "default" : "outline"}
              className={selectedCategory === cat 
                ? "bg-purple-600 text-white font-bold whitespace-nowrap"
                : "bg-slate-800 text-slate-400 font-bold whitespace-nowrap border-slate-700"
              }
            >
              {cat}
            </Button>
          ))}
        </nav>

        {/* Item Grid */}
        <section className="grid grid-cols-2 gap-4 pb-6">
          {filteredItems.map(item => {
            const canAfford = (userPoints?.total_points || 0) >= item.points_cost;
            const rarityColors = {
              common: 'text-slate-400',
              rare: 'text-blue-400',
              epic: 'text-purple-400',
              legendary: 'text-amber-400'
            };

            return (
              <Card key={item.id} className="bg-slate-900 border-slate-800 overflow-hidden">
                <div className="aspect-square relative bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <Star className="h-12 w-12 text-slate-600" />
                  )}
                  {item.rarity && item.rarity !== 'common' && (
                    <Badge className={`absolute top-2 left-2 text-[10px] font-bold uppercase ${rarityColors[item.rarity]} bg-slate-950/80`}>
                      {item.rarity}
                    </Badge>
                  )}
                </div>
                <CardContent className="p-3 space-y-2">
                  <h4 className="text-sm font-bold text-white line-clamp-1">{item.name}</h4>
                  <p className="text-xs text-slate-400 line-clamp-2">{item.description}</p>
                  <Button
                    onClick={() => purchaseMutation.mutate(item.id)}
                    disabled={!canAfford || purchaseMutation.isPending}
                    className={`w-full text-xs font-bold ${
                      canAfford 
                        ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {item.points_cost} PTS
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </section>
      </main>
    </div>
  );
}