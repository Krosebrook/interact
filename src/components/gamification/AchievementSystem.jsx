import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Award, 
  Star, 
  Lock, 
  Sparkles,
  Trophy,
  Target,
  Flame,
  Calendar,
  MessageSquare,
  Users,
  Zap,
  Gift
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORY_ICONS = {
  engagement: Zap,
  collaboration: Users,
  innovation: Sparkles,
  community: MessageSquare,
  leadership: Trophy,
  special: Gift,
  seasonal: Calendar,
  challenge: Target
};

const RARITY_COLORS = {
  common: 'bg-slate-100 border-slate-300 text-slate-700',
  uncommon: 'bg-green-100 border-green-400 text-green-700',
  rare: 'bg-blue-100 border-blue-400 text-blue-700',
  epic: 'bg-purple-100 border-purple-400 text-purple-700',
  legendary: 'bg-gradient-to-r from-yellow-100 to-orange-100 border-yellow-400 text-yellow-800'
};

const RARITY_GLOW = {
  common: '',
  uncommon: 'shadow-green-200',
  rare: 'shadow-blue-300 shadow-lg',
  epic: 'shadow-purple-400 shadow-lg',
  legendary: 'shadow-yellow-400 shadow-xl animate-pulse'
};

export default function AchievementSystem({ userEmail }) {
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [filter, setFilter] = useState('all');

  const { data: badges = [] } = useQuery({
    queryKey: ['badges'],
    queryFn: () => base44.entities.Badge.list()
  });

  const { data: userPoints = [] } = useQuery({
    queryKey: ['user-points', userEmail],
    queryFn: () => base44.entities.UserPoints.filter({ user_email: userEmail }),
    enabled: !!userEmail
  });

  const { data: badgeAwards = [] } = useQuery({
    queryKey: ['badge-awards', userEmail],
    queryFn: () => base44.entities.BadgeAward.filter({ user_email: userEmail }),
    enabled: !!userEmail
  });

  const currentUserPoints = userPoints[0] || {};
  const earnedBadgeIds = currentUserPoints.badges_earned || [];

  // Calculate progress towards unearned badges
  const getBadgeProgress = (badge) => {
    const { type, threshold } = badge.award_criteria || {};
    if (!type || type === 'manual') return null;

    let current = 0;
    switch (type) {
      case 'events_attended':
        current = currentUserPoints.events_attended || 0;
        break;
      case 'feedback_submitted':
        current = currentUserPoints.feedback_submitted || 0;
        break;
      case 'activities_completed':
        current = currentUserPoints.activities_completed || 0;
        break;
      case 'points_total':
        current = currentUserPoints.total_points || 0;
        break;
      case 'streak_days':
        current = currentUserPoints.streak_days || 0;
        break;
      default:
        return null;
    }

    return {
      current,
      target: threshold,
      percentage: Math.min(100, Math.round((current / threshold) * 100))
    };
  };

  // Group badges by category
  const badgesByCategory = badges.reduce((acc, badge) => {
    const category = badge.category || 'engagement';
    if (!acc[category]) acc[category] = [];
    acc[category].push(badge);
    return acc;
  }, {});

  // Filter badges
  const filteredBadges = filter === 'all' 
    ? badges
    : filter === 'earned'
      ? badges.filter(b => earnedBadgeIds.includes(b.id))
      : filter === 'unearned'
        ? badges.filter(b => !earnedBadgeIds.includes(b.id) && !b.is_hidden)
        : badges.filter(b => b.category === filter);

  // Sort by rarity
  const rarityOrder = { legendary: 0, epic: 1, rare: 2, uncommon: 3, common: 4 };
  const sortedBadges = [...filteredBadges].sort((a, b) => 
    (rarityOrder[a.rarity] || 4) - (rarityOrder[b.rarity] || 4)
  );

  // Stats
  const totalBadges = badges.filter(b => !b.is_hidden || earnedBadgeIds.includes(b.id)).length;
  const earnedCount = earnedBadgeIds.length;
  const totalBadgePoints = badgeAwards.reduce((sum, award) => sum + (award.points_awarded || 0), 0);

  return (
    <div className="space-y-6">
      {/* Stats Header */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="text-center p-4 border-2 border-int-orange">
          <div className="text-3xl font-bold text-int-orange">{earnedCount}</div>
          <p className="text-sm text-slate-600">Badges Earned</p>
        </Card>
        <Card className="text-center p-4">
          <div className="text-3xl font-bold text-int-navy">
            {totalBadges > 0 ? Math.round((earnedCount / totalBadges) * 100) : 0}%
          </div>
          <p className="text-sm text-slate-600">Collection</p>
        </Card>
        <Card className="text-center p-4">
          <div className="text-3xl font-bold text-[#F5C16A]">{totalBadgePoints}</div>
          <p className="text-sm text-slate-600">Badge Points</p>
        </Card>
      </div>

      {/* Filter Tabs */}
      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="earned">
            <Award className="h-4 w-4 mr-1" />
            Earned ({earnedCount})
          </TabsTrigger>
          <TabsTrigger value="unearned">
            <Lock className="h-4 w-4 mr-1" />
            Locked
          </TabsTrigger>
          {Object.keys(badgesByCategory).map(category => {
            const Icon = CATEGORY_ICONS[category] || Award;
            return (
              <TabsTrigger key={category} value={category}>
                <Icon className="h-4 w-4 mr-1" />
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>

      {/* Badge Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <AnimatePresence>
          {sortedBadges.map((badge, index) => {
            const isEarned = earnedBadgeIds.includes(badge.id);
            const isLocked = !isEarned && badge.is_hidden;
            const progress = !isEarned ? getBadgeProgress(badge) : null;
            const rarityColor = RARITY_COLORS[badge.rarity] || RARITY_COLORS.common;
            const rarityGlow = isEarned ? RARITY_GLOW[badge.rarity] || '' : '';

            return (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: index * 0.03 }}
              >
                <Card 
                  className={`relative cursor-pointer transition-all hover:scale-105 ${
                    isEarned 
                      ? `border-2 ${rarityColor} ${rarityGlow}` 
                      : 'opacity-60 grayscale hover:grayscale-0 hover:opacity-100'
                  }`}
                  onClick={() => setSelectedBadge(badge)}
                >
                  {badge.rarity === 'legendary' && isEarned && (
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 to-orange-400/10 rounded-lg" />
                  )}
                  
                  <CardContent className="p-4 text-center relative">
                    {isLocked ? (
                      <div className="text-5xl mb-2">🔒</div>
                    ) : (
                      <div className="text-5xl mb-2">{badge.badge_icon}</div>
                    )}
                    
                    <h4 className="font-semibold text-sm truncate">
                      {isLocked ? '???' : badge.badge_name}
                    </h4>
                    
                    <Badge 
                      variant="outline" 
                      className={`mt-2 text-xs ${isEarned ? rarityColor : ''}`}
                    >
                      {badge.rarity || 'common'}
                    </Badge>

                    {progress && !isLocked && (
                      <div className="mt-3">
                        <Progress value={progress.percentage} className="h-1.5" />
                        <p className="text-xs text-slate-500 mt-1">
                          {progress.current}/{progress.target}
                        </p>
                      </div>
                    )}

                    {isEarned && (
                      <div className="absolute top-2 right-2">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Badge Detail Dialog */}
      <Dialog open={!!selectedBadge} onOpenChange={() => setSelectedBadge(null)}>
        {selectedBadge && (
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <span className="text-4xl">{selectedBadge.badge_icon}</span>
                <div>
                  <h3 className="text-xl">{selectedBadge.badge_name}</h3>
                  <Badge className={RARITY_COLORS[selectedBadge.rarity] || ''}>
                    {selectedBadge.rarity || 'common'}
                  </Badge>
                </div>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <p className="text-slate-600">{selectedBadge.badge_description}</p>

              {selectedBadge.points_value > 0 && (
                <div className="flex items-center gap-2 text-int-orange">
                  <Zap className="h-5 w-5" />
                  <span className="font-semibold">+{selectedBadge.points_value} points</span>
                </div>
              )}

              {earnedBadgeIds.includes(selectedBadge.id) ? (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 text-green-700">
                    <Award className="h-5 w-5" />
                    <span className="font-semibold">Badge Earned!</span>
                  </div>
                  {badgeAwards.find(a => a.badge_id === selectedBadge.id)?.created_date && (
                    <p className="text-sm text-green-600 mt-1">
                      Earned on {new Date(badgeAwards.find(a => a.badge_id === selectedBadge.id).created_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ) : (
                <>
                  {selectedBadge.award_criteria && selectedBadge.award_criteria.type !== 'manual' && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">How to earn:</p>
                      <p className="text-sm text-slate-600">
                        {selectedBadge.award_criteria.type.replace(/_/g, ' ')} ≥ {selectedBadge.award_criteria.threshold}
                      </p>
                      {getBadgeProgress(selectedBadge) && (
                        <div>
                          <Progress value={getBadgeProgress(selectedBadge).percentage} />
                          <p className="text-xs text-slate-500 mt-1">
                            {getBadgeProgress(selectedBadge).current} / {getBadgeProgress(selectedBadge).target}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                  {selectedBadge.is_manual_award && (
                    <p className="text-sm text-slate-500 italic">
                      This badge is awarded manually by admins for special achievements
                    </p>
                  )}
                </>
              )}

              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Users className="h-4 w-4" />
                <span>{selectedBadge.awarded_count || 0} users have earned this badge</span>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}