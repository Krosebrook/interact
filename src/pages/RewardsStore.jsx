import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useUserData } from '../components/hooks/useUserData';
import { useGamificationData } from '../components/hooks/useGamificationData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Gift, 
  ShoppingCart, 
  Sparkles, 
  Award, 
  Clock,
  Package,
  TrendingUp,
  Search,
  Filter
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function RewardsStore() {
  const queryClient = useQueryClient();
  const { user, loading, userPoints } = useUserData(true);
  const { rewards, redemptions: myRedemptions } = useGamificationData(user?.email);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReward, setSelectedReward] = useState(null);
  const [redemptionNotes, setRedemptionNotes] = useState('');

  const redeemMutation = useMutation({
    mutationFn: async ({ reward_id, redemption_notes }) => {
      const response = await base44.functions.invoke('redeemReward', {
        reward_id,
        redemption_notes
      });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['rewards']);
      queryClient.invalidateQueries(['user-points']);
      queryClient.invalidateQueries(['my-redemptions']);
      setSelectedReward(null);
      setRedemptionNotes('');
      toast.success(`Reward redeemed! ${data.remaining_points} points remaining 🎉`);
    },
    onError: (error) => {
      const errorMsg = error.response?.data?.error || 'Failed to redeem reward';
      toast.error(errorMsg);
    }
  });

  const categories = [
    { value: 'all', label: 'All Rewards', icon: Gift },
    { value: 'badge', label: 'Badges', icon: Award },
    { value: 'swag', label: 'Company Swag', icon: Package },
    { value: 'gift_voucher', label: 'Gift Vouchers', icon: ShoppingCart },
    { value: 'extra_pto', label: 'Extra PTO', icon: Clock },
    { value: 'experience', label: 'Experiences', icon: Sparkles },
    { value: 'donation', label: 'Donations', icon: TrendingUp }
  ];

  const filteredRewards = rewards.filter(reward => {
    const matchesCategory = selectedCategory === 'all' || reward.category === selectedCategory;
    const matchesSearch = reward.reward_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         reward.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch && reward.is_available;
  });

  const handleRedeem = () => {
    if (userPoints.total_points < selectedReward.points_cost) {
      toast.error('Not enough points!');
      return;
    }
    redeemMutation.mutate({
      reward_id: selectedReward.id,
      redemption_notes: redemptionNotes
    });
  };

  const categoryColors = {
    badge: 'from-[#F5C16A] to-[#C46322]',
    swag: 'from-[#4A6070] to-[#7A94A6]',
    gift_voucher: 'from-[#F47C20] to-[#C46322]',
    extra_pto: 'from-[#0A1C39] to-[#4A6070]',
    experience: 'from-[#F47C20] to-[#F5C16A]',
    donation: 'from-[#7A94A6] to-[#4A6070]',
    other: 'from-[#4C4C4C] to-[#7A94A6]'
  };

  if (loading || !user || !userPoints) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-int-orange"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with Points Balance */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Rewards Store</h1>
          <p className="text-slate-600">Redeem your points for awesome rewards</p>
        </div>
        <Card className="bg-int-navy text-white border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Your Points</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{userPoints.total_points}</div>
            <p className="text-slate-300 text-sm mt-1">Available to spend</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search rewards..."
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map(cat => {
            const Icon = cat.icon;
            return (
              <Button
                key={cat.value}
                variant={selectedCategory === cat.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(cat.value)}
                className="whitespace-nowrap"
              >
                <Icon className="h-3 w-3 mr-1" />
                {cat.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Rewards Grid */}
      {!rewards.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-80 bg-slate-100 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : filteredRewards.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-slate-300">
          <Gift className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No rewards found</h3>
          <p className="text-slate-600">Try adjusting your filters or search query</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRewards.map((reward, index) => {
            const canAfford = userPoints.total_points >= reward.points_cost;
            const isOutOfStock = reward.stock_quantity !== null && reward.stock_quantity <= 0;
            
            return (
              <motion.div
                key={reward.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={`h-full flex flex-col hover:shadow-lg transition-all ${!canAfford || isOutOfStock ? 'opacity-60' : ''}`}>
                  <div className={`h-40 bg-gradient-to-br ${categoryColors[reward.category]} rounded-t-xl flex items-center justify-center relative overflow-hidden`}>
                    {reward.image_url ? (
                      <img src={reward.image_url} alt={reward.reward_name} className="w-full h-full object-cover" />
                    ) : (
                      <Gift className="h-16 w-16 text-white/80" />
                    )}
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-white/90 text-slate-900">
                        {reward.points_cost} pts
                      </Badge>
                    </div>
                    {isOutOfStock && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Badge variant="destructive">Out of Stock</Badge>
                      </div>
                    )}
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg">{reward.reward_name}</CardTitle>
                    <CardDescription className="line-clamp-2">{reward.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="mt-auto">
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="outline" className="capitalize">
                        {reward.category.replace('_', ' ')}
                      </Badge>
                      {reward.stock_quantity !== null && (
                        <span className="text-xs text-slate-500">
                          {reward.stock_quantity} left
                        </span>
                      )}
                    </div>
                    <Button
                      onClick={() => setSelectedReward(reward)}
                      disabled={!canAfford || isOutOfStock || redeemMutation.isLoading}
                      className="w-full"
                      variant={canAfford && !isOutOfStock ? 'default' : 'outline'}
                    >
                      {!canAfford ? 'Insufficient Points' : isOutOfStock ? 'Out of Stock' : 'Redeem'}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* My Redemptions Section */}
      {myRedemptions.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">My Redemptions</h2>
          <div className="space-y-3">
            {myRedemptions.slice(0, 5).map(redemption => (
              <Card key={redemption.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex-1">
                    <h3 className="font-semibold">{redemption.reward_name}</h3>
                    <p className="text-sm text-slate-600">
                      {redemption.points_spent} points • {new Date(redemption.created_date).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge
                    variant={
                      redemption.status === 'fulfilled' ? 'default' :
                      redemption.status === 'approved' ? 'secondary' :
                      redemption.status === 'cancelled' ? 'destructive' : 'outline'
                    }
                    className="capitalize"
                  >
                    {redemption.status}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Redemption Confirmation Dialog */}
      <Dialog open={!!selectedReward} onOpenChange={() => setSelectedReward(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Redeem {selectedReward?.reward_name}?</DialogTitle>
            <DialogDescription>
              This will cost {selectedReward?.points_cost} points
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-slate-50 p-4 rounded-lg">
              <p className="text-sm text-slate-700 mb-2">{selectedReward?.description}</p>
              {selectedReward?.redemption_instructions && (
                <div className="mt-3 pt-3 border-t border-slate-200">
                  <p className="text-xs font-semibold text-slate-900 mb-1">How to claim:</p>
                  <p className="text-xs text-slate-600">{selectedReward.redemption_instructions}</p>
                </div>
              )}
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Additional notes (optional)
              </label>
              <Textarea
                value={redemptionNotes}
                onChange={(e) => setRedemptionNotes(e.target.value)}
                placeholder="e.g., size preference, delivery address, etc."
                rows={3}
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border-2 border-int-orange">
              <div>
                <p className="text-sm font-semibold text-slate-900">Your Points</p>
                <p className="text-xs text-slate-600">After redemption</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-int-orange">
                  {userPoints.total_points - (selectedReward?.points_cost || 0)}
                </p>
                <p className="text-xs text-slate-500">
                  (was {userPoints.total_points})
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setSelectedReward(null);
                setRedemptionNotes('');
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRedeem}
              disabled={redeemMutation.isLoading}
              className="flex-1 bg-int-orange hover:bg-[#C46322] text-white"
            >
              {redeemMutation.isLoading ? 'Redeeming...' : 'Confirm Redemption'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}