import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Crown, ChevronRight, Star, Gift, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import AchievementTierCard from './AchievementTierCard';
import { SocialShareDialog } from './SocialShareCard';

// Default tiers if none exist in database
const DEFAULT_TIERS = [
  { tier_name: 'Bronze', tier_level: 1, points_required: 0, tier_icon: '🥉', tier_color: '#CD7F32', perks: ['Access to basic rewards', 'Join team challenges'], multiplier: 1 },
  { tier_name: 'Silver', tier_level: 2, points_required: 500, tier_icon: '🥈', tier_color: '#C0C0C0', perks: ['10% discount on rewards', 'Priority event registration', 'Silver badge'], multiplier: 1.1 },
  { tier_name: 'Gold', tier_level: 3, points_required: 1500, tier_icon: '🥇', tier_color: '#FFD700', perks: ['20% discount on rewards', 'Exclusive gold events', 'Gold profile frame'], multiplier: 1.25 },
  { tier_name: 'Platinum', tier_level: 4, points_required: 3500, tier_icon: '💎', tier_color: '#00CED1', perks: ['30% discount on rewards', 'VIP event access', 'Platinum avatar items'], multiplier: 1.4 },
  { tier_name: 'Diamond', tier_level: 5, points_required: 7500, tier_icon: '💠', tier_color: '#4169E1', perks: ['40% discount on rewards', 'Early access to new features', 'Diamond exclusive rewards'], multiplier: 1.5 },
  { tier_name: 'Master', tier_level: 6, points_required: 15000, tier_icon: '👑', tier_color: '#9400D3', perks: ['50% discount on rewards', 'Create custom challenges', 'Master mentorship program'], multiplier: 1.75 },
  { tier_name: 'Grandmaster', tier_level: 7, points_required: 30000, tier_icon: '🌟', tier_color: '#FF4500', perks: ['Free monthly reward', 'Host exclusive events', 'Grandmaster recognition'], multiplier: 2 },
  { tier_name: 'Legend', tier_level: 8, points_required: 50000, tier_icon: '✨', tier_color: '#FFD700', perks: ['All previous perks', 'Custom profile badge', 'Legend Hall of Fame'], multiplier: 2.5 }
];

export default function AchievementTiersSection({ userEmail, userPoints }) {
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [tierToShare, setTierToShare] = useState(null);

  const { data: tiers = [] } = useQuery({
    queryKey: ['achievement-tiers'],
    queryFn: async () => {
      const dbTiers = await base44.entities.AchievementTier.list('tier_level');
      return dbTiers.length > 0 ? dbTiers : DEFAULT_TIERS;
    }
  });

  const lifetimePoints = userPoints?.lifetime_points || 0;

  const { currentTier, nextTier, unlockedTiers } = useMemo(() => {
    const sortedTiers = [...tiers].sort((a, b) => b.points_required - a.points_required);
    const current = sortedTiers.find(t => lifetimePoints >= t.points_required) || tiers[0];
    const currentIdx = tiers.findIndex(t => t.tier_level === current?.tier_level);
    const next = tiers[currentIdx + 1] || null;
    const unlocked = tiers.filter(t => lifetimePoints >= t.points_required);
    
    return { currentTier: current, nextTier: next, unlockedTiers: unlocked };
  }, [tiers, lifetimePoints]);

  const progressToNext = nextTier
    ? ((lifetimePoints - currentTier.points_required) / (nextTier.points_required - currentTier.points_required)) * 100
    : 100;

  const handleShareTier = (tier) => {
    setTierToShare(tier);
    setShowShareDialog(true);
  };

  const handleShareSubmit = async (platform) => {
    if (!tierToShare) return;
    
    await base44.entities.SocialShare.create({
      user_email: userEmail,
      share_type: 'tier_achieved',
      reference_id: tierToShare.id || tierToShare.tier_name,
      share_data: {
        title: `${tierToShare.tier_name} Tier Achieved!`,
        description: `I've reached the ${tierToShare.tier_name} tier with ${lifetimePoints.toLocaleString()} lifetime points!`,
        icon: tierToShare.tier_icon,
        value: `${tierToShare.multiplier}x Points Multiplier`
      },
      platforms: [platform],
      visibility: 'public'
    });
  };

  return (
    <div data-b44-sync="true" data-feature="gamification" data-component="achievementtierssection" className="space-y-6">
      {/* Current Tier Card */}
      <Card className="overflow-hidden border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-yellow-50">
        <div className="h-2 bg-gradient-to-r from-amber-400 via-yellow-500 to-orange-500" />
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Current Tier Badge */}
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex-shrink-0"
            >
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500 flex items-center justify-center shadow-xl">
                <span className="text-5xl">{currentTier?.tier_icon}</span>
              </div>
            </motion.div>

            {/* Tier Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                <Crown className="h-5 w-5 text-amber-500" />
                <span className="text-sm font-medium text-amber-700">Current Tier</span>
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-1">{currentTier?.tier_name}</h2>
              <p className="text-slate-600">
                {lifetimePoints.toLocaleString()} lifetime points
              </p>
              
              {currentTier?.multiplier > 1 && (
                <Badge className="mt-2 bg-amber-100 text-amber-700">
                  <Sparkles className="h-3 w-3 mr-1" />
                  {currentTier.multiplier}x Points Multiplier
                </Badge>
              )}
            </div>

            {/* Progress to Next */}
            {nextTier && (
              <div className="w-full md:w-64 text-center md:text-right">
                <p className="text-sm text-slate-600 mb-2">
                  Next: <span className="font-semibold">{nextTier.tier_name}</span>
                </p>
                <Progress value={progressToNext} className="h-3 mb-2" />
                <p className="text-xs text-slate-500">
                  {(nextTier.points_required - lifetimePoints).toLocaleString()} points to go
                </p>
              </div>
            )}

            {/* Share Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleShareTier(currentTier)}
              className="border-amber-300 text-amber-700 hover:bg-amber-50"
            >
              Share
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>

          {/* Current Tier Perks */}
          {currentTier?.perks && currentTier.perks.length > 0 && (
            <div className="mt-6 pt-4 border-t border-amber-200">
              <h4 className="text-sm font-semibold text-slate-600 mb-3 flex items-center gap-2">
                <Gift className="h-4 w-4" />
                Your Tier Perks
              </h4>
              <div className="flex flex-wrap gap-2">
                {currentTier.perks.map((perk, idx) => (
                  <Badge key={idx} variant="outline" className="bg-white border-amber-200">
                    <Star className="h-3 w-3 mr-1 text-amber-500" />
                    {perk}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Tiers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-purple-600" />
            Achievement Tiers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {tiers.map((tier) => (
              <AchievementTierCard
                key={tier.tier_level}
                tier={tier}
                currentPoints={lifetimePoints}
                isCurrentTier={tier.tier_level === currentTier?.tier_level}
                isUnlocked={lifetimePoints >= tier.points_required}
                nextTier={tiers.find(t => t.tier_level === tier.tier_level + 1)}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Share Dialog */}
      <SocialShareDialog
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
        shareType="tier_achieved"
        shareData={{
          title: `${tierToShare?.tier_name} Tier!`,
          description: `Reached ${tierToShare?.tier_name} tier with ${lifetimePoints.toLocaleString()} points`,
          icon: tierToShare?.tier_icon,
          value: tierToShare?.multiplier > 1 ? `${tierToShare.multiplier}x Multiplier` : null
        }}
        onShare={handleShareSubmit}
      />
    </div>
  );
}