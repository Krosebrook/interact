import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Gift, Coins, ShoppingCart, CheckCircle } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';
import EmptyState from '../common/EmptyState';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function RewardsRedemptionSection({ userEmail, userPoints }) {
  const queryClient = useQueryClient();
  const [selectedReward, setSelectedReward] = useState(null);

  const { data: rewards, isLoading } = useQuery({
    queryKey: ['available-rewards'],
    queryFn: async () => {
      const allRewards = await base44.entities.Reward.filter({
        is_available: true
      });
      // Filter out rewards with 0 stock (unless unlimited)
      return allRewards.filter(r => r.stock_quantity === -1 || r.stock_quantity > 0);
    }
  });

  const redeemMutation = useMutation({
    mutationFn: async (rewardId) => {
      const reward = rewards.find(r => r.id === rewardId);
      
      if (!reward) {
        throw new Error('Reward not found');
      }
      
      // Check sufficient points
      if ((userPoints || 0) < reward.points_cost) {
        throw new Error('Insufficient points');
      }
      
      // Check stock availability
      if (reward.stock_quantity !== -1 && reward.stock_quantity <= 0) {
        throw new Error('Reward out of stock');
      }
      
      // Create redemption
      const redemption = await base44.entities.RewardRedemption.create({
        reward_id: rewardId,
        user_email: userEmail,
        points_spent: reward.points_cost,
        status: 'pending'
      });
      
      // Update stock if limited
      if (reward.stock_quantity !== -1) {
        await base44.entities.Reward.update(rewardId, {
          stock_quantity: reward.stock_quantity - 1
        });
      }
      
      return redemption;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['user-points']);
      queryClient.invalidateQueries(['redemption-history']);
      queryClient.invalidateQueries(['available-rewards']);
      toast.success('Reward redeemed! Pending admin approval.');
      setSelectedReward(null);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to redeem reward');
    }
  });

  if (isLoading) {
    return (
      <Card data-b44-sync="true" data-feature="gamification" data-component="rewardsredemptionsection">
        <CardContent className="py-12">
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  if (!rewards || rewards.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-int-orange" />
            Available Rewards
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={Gift}
            title="No Rewards Available"
            description="Check back soon for rewards you can redeem with your points"
          />
        </CardContent>
      </Card>
    );
  }

  const affordableRewards = rewards.filter(r => r.points_cost <= (userPoints || 0));
  const expensiveRewards = rewards.filter(r => r.points_cost > (userPoints || 0));

  return (
    <div className="space-y-6">
      {/* Points Balance */}
      <Card className="bg-gradient-to-br from-int-orange to-int-gold text-white">
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Your Points Balance</p>
              <p className="text-4xl font-bold">{userPoints || 0}</p>
            </div>
            <Coins className="h-16 w-16 opacity-20" />
          </div>
        </CardContent>
      </Card>

      {/* Affordable Rewards */}
      {affordableRewards.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-emerald-600" />
              You Can Afford These
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {affordableRewards.map((reward) => (
                <RewardCard 
                  key={reward.id}
                  reward={reward}
                  userPoints={userPoints}
                  onRedeem={() => setSelectedReward(reward)}
                  affordable={true}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Other Rewards */}
      {expensiveRewards.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-slate-600" />
              Keep Earning For These
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {expensiveRewards.map((reward) => (
                <RewardCard 
                  key={reward.id}
                  reward={reward}
                  userPoints={userPoints}
                  affordable={false}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Confirmation Modal */}
      <AnimatePresence>
        {selectedReward && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedReward(null)}
          >
            <Card className="max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <CardHeader>
                <CardTitle>Confirm Redemption</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="h-24 w-24 rounded-full bg-gradient-to-br from-int-orange to-int-gold mx-auto mb-4 flex items-center justify-center">
                    <Gift className="h-12 w-12 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{selectedReward.reward_name}</h3>
                  <p className="text-sm text-slate-600 mb-4">{selectedReward.description}</p>
                  
                  <div className="bg-slate-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span>Cost:</span>
                      <span className="font-bold text-red-600">-{selectedReward.points_cost} points</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Balance After:</span>
                      <span className="font-bold text-emerald-600">
                        {(userPoints || 0) - selectedReward.points_cost} points
                      </span>
                    </div>
                  </div>

                  {selectedReward.redemption_instructions && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-left">
                      <p className="text-xs text-blue-800">
                        <strong>Next Steps:</strong> {selectedReward.redemption_instructions}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setSelectedReward(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 bg-gradient-to-r from-int-orange to-int-gold hover:from-int-orange/90 hover:to-int-gold/90"
                    onClick={() => redeemMutation.mutate(selectedReward.id)}
                    disabled={redeemMutation.isPending}
                  >
                    {redeemMutation.isPending ? 'Redeeming...' : 'Confirm Redeem'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function RewardCard({ reward, userPoints, onRedeem, affordable }) {
  const pointsNeeded = affordable ? 0 : reward.points_cost - (userPoints || 0);
  const isOutOfStock = reward.stock_quantity === 0;

  const typeIcons = {
    physical: '📦',
    digital: '💎',
    experience: '🎁',
    time_off: '🏖️',
    perk: '⭐',
    donation: '❤️'
  };

  const icon = typeIcons[reward.reward_type] || '🎁';

  return (
    <div className={`rounded-lg border p-4 ${
      isOutOfStock ? 'bg-slate-100 border-slate-300 opacity-60' : 
      affordable ? 'bg-white border-emerald-200' : 
      'bg-slate-50 border-slate-200 opacity-75'
    }`}>
      <div className="flex items-start gap-3 mb-3">
        <div className={`h-12 w-12 rounded-lg flex items-center justify-center flex-shrink-0 text-2xl ${
          isOutOfStock ? 'bg-slate-300' :
          affordable ? 'bg-gradient-to-br from-emerald-500 to-teal-500' : 
          'bg-slate-300'
        }`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-slate-900 mb-1">{reward.reward_name}</h4>
          <p className="text-xs text-slate-600 line-clamp-2">{reward.description}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Coins className="h-4 w-4 text-int-orange" />
          <span className="font-bold text-int-orange">{reward.points_cost}</span>
        </div>
        
        {isOutOfStock ? (
          <Badge variant="outline" className="text-xs text-slate-500">
            Out of Stock
          </Badge>
        ) : affordable ? (
          <Button 
            size="sm"
            onClick={onRedeem}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
          >
            Redeem
          </Button>
        ) : (
          <Badge variant="outline" className="text-xs">
            {pointsNeeded} more needed
          </Badge>
        )}
      </div>

      {reward.stock_quantity > 0 && reward.stock_quantity !== -1 && (
        <div className="mt-2">
          <Badge variant="outline" className={`text-xs ${
            reward.stock_quantity <= 3 ? 'border-red-300 text-red-700' : ''
          }`}>
            {reward.stock_quantity} left
          </Badge>
        </div>
      )}
    </div>
  );
}