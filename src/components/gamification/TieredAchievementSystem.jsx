import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Star, Crown, Zap, Lock } from 'lucide-react';

const TIER_CONFIG = {
  bronze: { icon: Trophy, color: 'from-amber-700 to-amber-500', unlock: 0 },
  silver: { icon: Star, color: 'from-slate-400 to-slate-300', unlock: 500 },
  gold: { icon: Crown, color: 'from-yellow-500 to-yellow-400', unlock: 1500 },
  platinum: { icon: Zap, color: 'from-cyan-500 to-blue-500', unlock: 3000 },
  diamond: { icon: Crown, color: 'from-purple-500 to-pink-500', unlock: 5000 }
};

export default function TieredAchievementSystem({ userEmail }) {
  const { data: userPoints } = useQuery({
    queryKey: ['user-points', userEmail],
    queryFn: () => base44.entities.UserPoints.filter({ user_email: userEmail })
  });

  const { data: badges = [] } = useQuery({
    queryKey: ['user-badge-awards', userEmail],
    queryFn: () => base44.entities.BadgeAward.filter({ user_email: userEmail })
  });

  const { data: allBadges = [] } = useQuery({
    queryKey: ['all-badges'],
    queryFn: () => base44.entities.Badge.list()
  });

  const totalPoints = userPoints?.[0]?.total_points || 0;
  
  // Calculate current tier and progress
  const tiers = Object.keys(TIER_CONFIG);
  let currentTier = 'bronze';
  let nextTier = null;
  let progressToNext = 0;

  for (let i = 0; i < tiers.length; i++) {
    if (totalPoints >= TIER_CONFIG[tiers[i]].unlock) {
      currentTier = tiers[i];
      nextTier = i < tiers.length - 1 ? tiers[i + 1] : null;
    }
  }

  if (nextTier) {
    const currentUnlock = TIER_CONFIG[currentTier].unlock;
    const nextUnlock = TIER_CONFIG[nextTier].unlock;
    progressToNext = ((totalPoints - currentUnlock) / (nextUnlock - currentUnlock)) * 100;
  }

  // Group badges by tier
  const badgesByTier = {};
  allBadges.forEach(badge => {
    const tier = badge.tier || 'bronze';
    if (!badgesByTier[tier]) badgesByTier[tier] = [];
    badgesByTier[tier].push({
      ...badge,
      earned: badges.some(b => b.badge_id === badge.id)
    });
  });

  const CurrentTierIcon = TIER_CONFIG[currentTier].icon;

  return (
    <div data-b44-sync="true" data-feature="gamification" data-component="tieredachievementsystem" className="space-y-6">
      {/* Current Tier Display */}
      <Card className={`bg-gradient-to-br ${TIER_CONFIG[currentTier].color} border-0`}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between text-white">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <CurrentTierIcon className="h-6 w-6" />
                <h4 className="text-lg font-bold capitalize">{currentTier} Tier</h4>
              </div>
              <p className="text-2xl font-bold">{totalPoints.toLocaleString()} Points</p>
              {nextTier && (
                <p className="text-sm opacity-90 mt-1">
                  {(TIER_CONFIG[nextTier].unlock - totalPoints).toLocaleString()} points to {nextTier}
                </p>
              )}
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{badges.length}</div>
              <div className="text-sm opacity-90">Badges Earned</div>
            </div>
          </div>
          
          {nextTier && (
            <div className="mt-4">
              <Progress value={progressToNext} className="h-2 bg-white/30" />
              <div className="flex items-center justify-between text-xs mt-1 opacity-90">
                <span>Current</span>
                <span>{Math.round(progressToNext)}%</span>
                <span className="capitalize">{nextTier}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tier Roadmap */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Achievement Tiers</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {tiers.map((tier) => {
            const TierIcon = TIER_CONFIG[tier].icon;
            const isUnlocked = totalPoints >= TIER_CONFIG[tier].unlock;
            const isActive = tier === currentTier;
            
            return (
              <div 
                key={tier}
                className={`p-4 rounded-lg border-2 transition-all ${
                  isActive ? 'border-blue-500 bg-blue-50' :
                  isUnlocked ? 'border-slate-200 bg-slate-50' :
                  'border-slate-200 bg-slate-50 opacity-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${TIER_CONFIG[tier].color}`}>
                      <TierIcon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h5 className="font-medium capitalize text-slate-900">{tier} Tier</h5>
                      <p className="text-sm text-slate-600">
                        {TIER_CONFIG[tier].unlock.toLocaleString()} points required
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isActive && <Badge className="bg-blue-600">Current</Badge>}
                    {isUnlocked && !isActive && (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        Unlocked
                      </Badge>
                    )}
                    {!isUnlocked && <Lock className="h-4 w-4 text-slate-400" />}
                  </div>
                </div>

                {/* Badges in this tier */}
                {badgesByTier[tier] && (
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {badgesByTier[tier].slice(0, 5).map((badge) => (
                      <div 
                        key={badge.id}
                        className={`p-2 rounded border ${
                          badge.earned ? 'border-green-500 bg-green-50' : 'border-slate-200 bg-slate-50 opacity-50'
                        }`}
                        title={badge.badge_name}
                      >
                        <Star className={`h-4 w-4 ${badge.earned ? 'text-green-600' : 'text-slate-400'}`} />
                      </div>
                    ))}
                    {badgesByTier[tier].length > 5 && (
                      <div className="p-2 text-xs text-slate-500">
                        +{badgesByTier[tier].length - 5} more
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Tier Benefits */}
      <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="h-4 w-4 text-purple-600" />
            Your Tier Benefits
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-start gap-2 text-sm">
            <Star className="h-4 w-4 text-purple-600 mt-0.5" />
            <span className="text-slate-700">Access to {currentTier}-tier rewards in store</span>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <Star className="h-4 w-4 text-purple-600 mt-0.5" />
            <span className="text-slate-700">
              {currentTier === 'bronze' ? '1x' : currentTier === 'silver' ? '1.2x' : 
               currentTier === 'gold' ? '1.5x' : currentTier === 'platinum' ? '2x' : '3x'} points multiplier
            </span>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <Star className="h-4 w-4 text-purple-600 mt-0.5" />
            <span className="text-slate-700">Exclusive {currentTier}-tier badge collection</span>
          </div>
          {(currentTier === 'gold' || currentTier === 'platinum' || currentTier === 'diamond') && (
            <div className="flex items-start gap-2 text-sm">
              <Star className="h-4 w-4 text-purple-600 mt-0.5" />
              <span className="text-slate-700">Priority support access</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}