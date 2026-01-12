import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Crown, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const TIER_CONFIG = {
  bronze: {
    name: 'Bronze',
    color: 'from-amber-600 to-amber-800',
    textColor: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-300',
    icon: '🥉',
    minPoints: 0,
    maxPoints: 999
  },
  silver: {
    name: 'Silver',
    color: 'from-slate-400 to-slate-600',
    textColor: 'text-slate-700',
    bgColor: 'bg-slate-50',
    borderColor: 'border-slate-300',
    icon: '🥈',
    minPoints: 1000,
    maxPoints: 2499
  },
  gold: {
    name: 'Gold',
    color: 'from-yellow-500 to-yellow-700',
    textColor: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-300',
    icon: '🥇',
    minPoints: 2500,
    maxPoints: 4999
  },
  platinum: {
    name: 'Platinum',
    color: 'from-purple-600 to-indigo-700',
    textColor: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-300',
    icon: '💎',
    minPoints: 5000,
    maxPoints: Infinity
  }
};

const TIER_ORDER = ['bronze', 'silver', 'gold', 'platinum'];

export default function TierStatusDisplay({ currentPoints = 0, currentTier = 'bronze' }) {
  const tierConfig = TIER_CONFIG[currentTier] || TIER_CONFIG.bronze;
  const currentTierIndex = TIER_ORDER.indexOf(currentTier);
  const nextTierKey = TIER_ORDER[currentTierIndex + 1];
  const nextTier = nextTierKey ? TIER_CONFIG[nextTierKey] : null;
  
  // Calculate progress to next tier
  const pointsInCurrentTier = currentPoints - tierConfig.minPoints;
  const pointsNeededForTier = tierConfig.maxPoints - tierConfig.minPoints;
  const progressPercentage = nextTier 
    ? Math.min(100, (pointsInCurrentTier / pointsNeededForTier) * 100)
    : 100;
  
  const pointsToNextTier = nextTier ? nextTier.minPoints - currentPoints : 0;

  return (
    <Card data-b44-sync="true" data-feature="gamification" data-component="tierstatusdisplay" className={`border-2 ${tierConfig.borderColor} ${tierConfig.bgColor}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className={`h-5 w-5 ${tierConfig.textColor}`} />
            <span>Your Tier Status</span>
          </div>
          <Badge className={`bg-gradient-to-r ${tierConfig.color} text-white text-lg px-3 py-1`}>
            {tierConfig.icon} {tierConfig.name}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Current Points */}
        <div className="text-center">
          <p className="text-3xl font-bold text-slate-900">
            {currentPoints.toLocaleString()}
          </p>
          <p className="text-sm text-slate-600">Total Points</p>
        </div>

        {/* Progress to Next Tier */}
        {nextTier && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Progress to {nextTier.name}</span>
              <span className={`font-medium ${nextTier.textColor}`}>
                {pointsToNextTier.toLocaleString()} pts needed
              </span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
          </div>
        )}

        {/* Tier Benefits */}
        <div className="bg-white rounded-lg p-3 border">
          <p className="text-xs font-medium text-slate-600 mb-2">Current Tier Benefits:</p>
          <ul className="space-y-1 text-xs text-slate-700">
            <li>• Priority event access</li>
            <li>• Exclusive badge collection</li>
            {currentTier !== 'bronze' && <li>• Special recognition flair</li>}
            {(currentTier === 'gold' || currentTier === 'platinum') && <li>• Premium rewards access</li>}
            {currentTier === 'platinum' && <li>• VIP events & experiences</li>}
          </ul>
        </div>

        {/* All Tiers Preview */}
        <div className="grid grid-cols-4 gap-2">
          {TIER_ORDER.map((tierKey, idx) => {
            const tier = TIER_CONFIG[tierKey];
            const isActive = tierKey === currentTier;
            const isUnlocked = currentPoints >= tier.minPoints;
            
            return (
              <motion.div
                key={tierKey}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: idx * 0.1 }}
                className={`text-center p-2 rounded-lg border-2 transition-all ${
                  isActive 
                    ? `${tier.borderColor} ${tier.bgColor}` 
                    : isUnlocked
                    ? 'border-slate-200 bg-white'
                    : 'border-slate-100 bg-slate-50 opacity-50'
                }`}
              >
                <div className="text-xl mb-1">{tier.icon}</div>
                <p className={`text-xs font-medium ${isActive ? tier.textColor : 'text-slate-600'}`}>
                  {tier.name}
                </p>
                {!isUnlocked && (
                  <p className="text-xs text-slate-500 mt-1">
                    {tier.minPoints.toLocaleString()}
                  </p>
                )}
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export { TIER_CONFIG, TIER_ORDER };