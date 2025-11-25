import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Gift, 
  Zap, 
  Clock, 
  ShoppingBag, 
  Check, 
  AlertCircle,
  Star,
  Sparkles,
  Heart
} from 'lucide-react';

const CATEGORY_CONFIG = {
  badge: { icon: Star, color: 'from-purple-500 to-violet-600', label: 'Badge' },
  swag: { icon: ShoppingBag, color: 'from-pink-500 to-rose-600', label: 'Swag' },
  gift_voucher: { icon: Gift, color: 'from-emerald-500 to-teal-600', label: 'Gift Card' },
  extra_pto: { icon: Clock, color: 'from-blue-500 to-cyan-600', label: 'Time Off' },
  experience: { icon: Sparkles, color: 'from-amber-500 to-orange-600', label: 'Experience' },
  donation: { icon: Heart, color: 'from-red-500 to-pink-600', label: 'Donation' },
  other: { icon: Gift, color: 'from-slate-500 to-gray-600', label: 'Other' }
};

export default function RewardCard({ 
  reward,
  userPoints = 0,
  onRedeem,
  isRedeemed = false,
  isLoading = false
}) {
  const [showConfirm, setShowConfirm] = useState(false);
  
  const category = CATEGORY_CONFIG[reward.category] || CATEGORY_CONFIG.other;
  const CategoryIcon = category.icon;
  
  const canAfford = userPoints >= reward.points_cost;
  const isOutOfStock = reward.stock_quantity !== null && reward.stock_quantity <= 0;
  const isUnavailable = !reward.is_available || isOutOfStock;

  const handleRedeem = () => {
    if (showConfirm) {
      onRedeem?.(reward);
      setShowConfirm(false);
    } else {
      setShowConfirm(true);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4 }}
      className="h-full"
    >
      <Card className={`h-full overflow-hidden border-2 transition-all ${
        isRedeemed ? 'border-emerald-300 bg-emerald-50/50' :
        isUnavailable ? 'border-slate-200 opacity-60' :
        canAfford ? 'border-int-orange/30 hover:border-int-orange hover:shadow-lg' :
        'border-slate-200'
      }`}>
        {/* Category gradient header */}
        <div className={`relative h-24 bg-gradient-to-br ${category.color} overflow-hidden`}>
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute inset-0 flex items-center justify-center">
            {reward.image_url ? (
              <img 
                src={reward.image_url} 
                alt={reward.reward_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <CategoryIcon className="h-12 w-12 text-white/80" />
            )}
          </div>
          
          {/* Stock indicator */}
          {reward.stock_quantity !== null && (
            <Badge className="absolute top-2 right-2 bg-black/50 text-white">
              {reward.stock_quantity} left
            </Badge>
          )}

          {/* Popular badge */}
          {reward.popularity_score > 10 && (
            <Badge className="absolute top-2 left-2 bg-gradient-orange text-white">
              🔥 Popular
            </Badge>
          )}
        </div>

        <CardContent className="p-4">
          {/* Title and category */}
          <div className="mb-3">
            <Badge className="mb-2" variant="outline">{category.label}</Badge>
            <h3 className="font-bold text-slate-900 line-clamp-1">{reward.reward_name}</h3>
            <p className="text-sm text-slate-500 line-clamp-2 mt-1">{reward.description}</p>
          </div>

          {/* Points cost */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-lg ${canAfford ? 'bg-int-orange/10' : 'bg-slate-100'}`}>
                <Zap className={`h-5 w-5 ${canAfford ? 'text-int-orange' : 'text-slate-400'}`} />
              </div>
              <div>
                <span className={`text-xl font-bold ${canAfford ? 'text-int-orange' : 'text-slate-500'}`}>
                  {reward.points_cost.toLocaleString()}
                </span>
                <span className="text-sm text-slate-500 ml-1">pts</span>
              </div>
            </div>

            {!canAfford && !isUnavailable && (
              <span className="text-xs text-slate-500">
                Need {(reward.points_cost - userPoints).toLocaleString()} more
              </span>
            )}
          </div>

          {/* Action button */}
          <AnimatePresence mode="wait">
            {isRedeemed ? (
              <motion.div
                key="redeemed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Button 
                  variant="outline" 
                  className="w-full border-emerald-300 text-emerald-700"
                  disabled
                >
                  <Check className="h-4 w-4 mr-2" />
                  Redeemed
                </Button>
              </motion.div>
            ) : showConfirm ? (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-2"
              >
                <p className="text-xs text-center text-slate-600">
                  Redeem for {reward.points_cost} points?
                </p>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex-1"
                    onClick={() => setShowConfirm(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    size="sm"
                    className="flex-1 bg-gradient-orange hover:opacity-90 text-white"
                    onClick={handleRedeem}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Redeeming...' : 'Confirm'}
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div key="action" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Button 
                  className={`w-full ${
                    canAfford && !isUnavailable
                      ? 'bg-gradient-orange hover:opacity-90 text-white shadow-md press-effect'
                      : ''
                  }`}
                  variant={canAfford && !isUnavailable ? 'default' : 'outline'}
                  disabled={!canAfford || isUnavailable}
                  onClick={handleRedeem}
                >
                  {isUnavailable ? (
                    <>
                      <AlertCircle className="h-4 w-4 mr-2" />
                      {isOutOfStock ? 'Out of Stock' : 'Unavailable'}
                    </>
                  ) : canAfford ? (
                    <>
                      <Gift className="h-4 w-4 mr-2" />
                      Redeem Reward
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Not Enough Points
                    </>
                  )}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}