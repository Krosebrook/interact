import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lock, Check, Crown, Gift, Zap, Star } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const TIER_CONFIG = {
  bronze: {
    name: 'Bronze',
    icon: '🥉',
    color: 'from-amber-700 to-amber-500',
    minPoints: 0,
    minBadges: 0,
    rewards: ['Basic store access', 'Weekly challenges', 'Public profile']
  },
  silver: {
    name: 'Silver',
    icon: '🥈',
    color: 'from-slate-400 to-slate-300',
    minPoints: 500,
    minBadges: 3,
    rewards: ['Priority event registration', 'Custom avatar items', 'Exclusive challenges', 'Recognition boost (+5 pts)']
  },
  gold: {
    name: 'Gold',
    icon: '🥇',
    color: 'from-int-gold to-yellow-500',
    minPoints: 2000,
    minBadges: 8,
    rewards: ['VIP event access', 'Premium store items', 'Team creation', 'Double recognition points', 'Mentor status']
  },
  platinum: {
    name: 'Platinum',
    icon: '💎',
    color: 'from-purple-500 to-pink-500',
    minPoints: 5000,
    minBadges: 15,
    rewards: ['Exclusive events', 'Custom badge creation', 'Event proposal priority', 'Triple recognition points', 'Executive recognition']
  }
};

const TIER_ORDER = ['bronze', 'silver', 'gold', 'platinum'];

export default function TierRewardsDisplay({ currentPoints, currentBadges, currentTier = 'bronze' }) {
  const currentTierIndex = TIER_ORDER.indexOf(currentTier);
  const nextTier = TIER_ORDER[currentTierIndex + 1];
  const nextTierConfig = nextTier ? TIER_CONFIG[nextTier] : null;
  
  const pointsProgress = nextTierConfig 
    ? Math.min(100, (currentPoints / nextTierConfig.minPoints) * 100)
    : 100;
    
  const badgesProgress = nextTierConfig
    ? Math.min(100, (currentBadges / nextTierConfig.minBadges) * 100)
    : 100;
  
  return (
    <div className="space-y-6">
      {/* Current Tier Card */}
      <Card className={`bg-gradient-to-br ${TIER_CONFIG[currentTier].color} text-white`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Crown className="h-5 w-5" />
            Current Tier: {TIER_CONFIG[currentTier].name}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-6xl text-center">
            {TIER_CONFIG[currentTier].icon}
          </div>
          <div>
            <p className="text-sm font-semibold mb-2">Your Perks:</p>
            <ul className="space-y-1">
              {TIER_CONFIG[currentTier].rewards.map((reward, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4" />
                  {reward}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
      
      {/* Next Tier Progress */}
      {nextTierConfig && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Star className="h-5 w-5 text-int-orange" />
              Progress to {nextTierConfig.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">Points</span>
                <span className="text-sm font-semibold">
                  {currentPoints} / {nextTierConfig.minPoints}
                </span>
              </div>
              <Progress value={pointsProgress} className="h-2" />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">Badges</span>
                <span className="text-sm font-semibold">
                  {currentBadges} / {nextTierConfig.minBadges}
                </span>
              </div>
              <Progress value={badgesProgress} className="h-2" />
            </div>
            
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <p className="text-sm font-semibold text-purple-900 mb-2">
                {nextTierConfig.name} Tier Unlocks:
              </p>
              <ul className="space-y-1">
                {nextTierConfig.rewards.map((reward, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-purple-800">
                    <Lock className="h-3 w-3" />
                    {reward}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* All Tiers Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Tiers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {TIER_ORDER.map((tier, index) => {
              const config = TIER_CONFIG[tier];
              const isUnlocked = index <= currentTierIndex;
              
              return (
                <div
                  key={tier}
                  className={`p-3 rounded-lg border-2 ${
                    tier === currentTier
                      ? 'border-int-orange bg-int-orange/5'
                      : isUnlocked
                      ? 'border-green-200 bg-green-50'
                      : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{config.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold">{config.name}</p>
                        {isUnlocked && <Check className="h-4 w-4 text-green-600" />}
                        {tier === currentTier && <Badge className="bg-int-orange">Current</Badge>}
                      </div>
                      <p className="text-xs text-slate-600">
                        {config.minPoints} pts • {config.minBadges} badges
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}