/**
 * Tiered Rewards Display
 * Shows rewards grouped by tier with unlock requirements
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lock, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const TIER_CONFIG = {
  bronze: { color: 'from-orange-700 to-orange-900', textColor: 'text-orange-700', minPoints: 0 },
  silver: { color: 'from-slate-400 to-slate-600', textColor: 'text-slate-600', minPoints: 500 },
  gold: { color: 'from-yellow-500 to-yellow-700', textColor: 'text-yellow-600', minPoints: 1500 },
  platinum: { color: 'from-purple-500 to-purple-700', textColor: 'text-purple-600', minPoints: 3000 },
  diamond: { color: 'from-cyan-400 to-blue-600', textColor: 'text-cyan-600', minPoints: 5000 }
};

export default function TieredRewardsDisplay({ storeItems, userTier, userLifetimePoints, onRedeem }) {
  // Group items by tier
  const groupedItems = {};
  
  storeItems.forEach(item => {
    const tier = item.tier_requirement || 'bronze';
    if (!groupedItems[tier]) {
      groupedItems[tier] = [];
    }
    groupedItems[tier].push(item);
  });

  const tiers = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];

  return (
    <div className="space-y-6">
      {tiers.map((tier) => {
        const items = groupedItems[tier] || [];
        if (items.length === 0) return null;

        const config = TIER_CONFIG[tier];
        const isUnlocked = userLifetimePoints >= config.minPoints;

        return (
          <div key={tier}>
            {/* Tier Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`px-4 py-2 rounded-lg bg-gradient-to-r ${config.color} text-white font-bold capitalize`}>
                  {tier} Tier
                </div>
                {!isUnlocked && (
                  <Badge variant="outline" className="gap-1">
                    <Lock className="h-3 w-3" />
                    Unlocks at {config.minPoints.toLocaleString()} lifetime points
                  </Badge>
                )}
                {isUnlocked && (
                  <Badge className="bg-green-100 text-green-700">
                    ✓ Unlocked
                  </Badge>
                )}
              </div>
              {!isUnlocked && (
                <p className="text-sm text-slate-600">
                  {(config.minPoints - userLifetimePoints).toLocaleString()} points to unlock
                </p>
              )}
            </div>

            {/* Items */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((item) => (
                <TierRewardCard
                  key={item.id}
                  item={item}
                  tier={tier}
                  isLocked={!isUnlocked}
                  onRedeem={onRedeem}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TierRewardCard({ item, tier, isLocked, onRedeem }) {
  const config = TIER_CONFIG[tier];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={!isLocked ? { y: -4 } : {}}
    >
      <Card className={`relative overflow-hidden ${isLocked ? 'opacity-60' : ''}`}>
        {isLocked && (
          <div className="absolute top-4 right-4 z-10">
            <div className="p-2 bg-slate-900/80 rounded-lg">
              <Lock className="h-4 w-4 text-white" />
            </div>
          </div>
        )}

        {item.image_url && (
          <div className="h-40 bg-slate-200 overflow-hidden">
            <img
              src={item.image_url}
              alt={item.item_name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-bold text-slate-900">{item.item_name}</h3>
            <Badge className={`${config.textColor} capitalize`}>
              {tier}
            </Badge>
          </div>

          <p className="text-sm text-slate-600 mb-4 line-clamp-2">{item.description}</p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Sparkles className="h-4 w-4 text-int-orange" />
              <span className="font-bold text-int-orange">{item.points_cost}</span>
            </div>
            <Button
              size="sm"
              onClick={() => onRedeem(item)}
              disabled={isLocked}
              variant={isLocked ? 'outline' : 'default'}
            >
              {isLocked ? 'Locked' : 'Redeem'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}