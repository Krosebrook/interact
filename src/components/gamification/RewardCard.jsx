import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Gift } from 'lucide-react';
import { motion } from 'framer-motion';

const categoryColors = {
  badge: 'from-[#F5C16A] to-[#C46322]',
  swag: 'from-[#4A6070] to-[#7A94A6]',
  gift_voucher: 'from-[#F47C20] to-[#C46322]',
  extra_pto: 'from-[#0A1C39] to-[#4A6070]',
  experience: 'from-[#F47C20] to-[#F5C16A]',
  donation: 'from-[#7A94A6] to-[#4A6070]',
  other: 'from-[#4C4C4C] to-[#7A94A6]'
};

export default function RewardCard({ reward, userPoints, onRedeem, isRedeeming, index = 0 }) {
  const canAfford = userPoints >= reward.points_cost;
  const isOutOfStock = reward.stock_quantity !== null && reward.stock_quantity <= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className={`h-full flex flex-col hover:shadow-lg transition-all ${!canAfford || isOutOfStock ? 'opacity-60' : ''}`}>
        <div className={`h-40 bg-gradient-to-br ${categoryColors[reward.category] || categoryColors.other} rounded-t-xl flex items-center justify-center relative overflow-hidden`}>
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
              {reward.category?.replace('_', ' ')}
            </Badge>
            {reward.stock_quantity !== null && (
              <span className="text-xs text-slate-500">
                {reward.stock_quantity} left
              </span>
            )}
          </div>
          <Button
            onClick={() => onRedeem(reward)}
            disabled={!canAfford || isOutOfStock || isRedeeming}
            className="w-full"
            variant={canAfford && !isOutOfStock ? 'default' : 'outline'}
          >
            {!canAfford ? 'Insufficient Points' : isOutOfStock ? 'Out of Stock' : 'Redeem'}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}