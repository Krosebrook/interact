/**
 * REFACTORED BADGES SHOWCASE
 * Production-grade with apiClient and performance optimizations
 */

import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/apiClient';
import { queryKeys } from '../lib/queryKeys';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, Trophy, Star, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

const rarityColors = {
  common: 'from-slate-100 to-slate-200 border-slate-300',
  uncommon: 'from-green-100 to-emerald-200 border-green-300',
  rare: 'from-blue-100 to-blue-200 border-blue-300',
  epic: 'from-purple-100 to-purple-200 border-purple-300',
  legendary: 'from-amber-100 to-yellow-200 border-amber-400'
};

const rarityTextColors = {
  common: 'text-slate-700',
  uncommon: 'text-green-700',
  rare: 'text-blue-700',
  epic: 'text-purple-700',
  legendary: 'text-amber-700'
};

export default function ProfileBadgesShowcase({ userEmail }) {
  // Optimized queries with proper caching
  const { data: userPoints } = useQuery({
    queryKey: queryKeys.gamification.userPoints.byEmail(userEmail),
    queryFn: async () => {
      const points = await apiClient.list('UserPoints', { 
        filters: { user_email: userEmail } 
      });
      return points[0];
    },
    enabled: !!userEmail,
    staleTime: 30000
  });

  const { data: badges = [] } = useQuery({
    queryKey: queryKeys.gamification.badges.active,
    queryFn: () => apiClient.list('Badge', { 
      filters: { is_active: true } 
    }),
    staleTime: 60000
  });

  const { data: badgeAwards = [] } = useQuery({
    queryKey: queryKeys.gamification.badgeAwards.list({ userEmail }),
    queryFn: () => apiClient.list('BadgeAward', { 
      filters: { user_email: userEmail },
      sort: '-created_date' 
    }),
    enabled: !!userEmail,
    staleTime: 30000
  });

  // Memoized computations
  const { earnedBadges, badgesByRarity, totalBadges, earnedCount, completionPercent } = useMemo(() => {
    const earnedBadgeIds = userPoints?.badges_earned || [];
    const earned = badges.filter(b => earnedBadgeIds.includes(b.id));
    
    const byRarity = {
      legendary: earned.filter(b => b.rarity === 'legendary'),
      epic: earned.filter(b => b.rarity === 'epic'),
      rare: earned.filter(b => b.rarity === 'rare'),
      uncommon: earned.filter(b => b.rarity === 'uncommon'),
      common: earned.filter(b => b.rarity === 'common' || !b.rarity)
    };

    const total = badges.length;
    const count = earned.length;
    const percent = total > 0 ? Math.round((count / total) * 100) : 0;

    return {
      earnedBadges: earned,
      badgesByRarity: byRarity,
      totalBadges: total,
      earnedCount: count,
      completionPercent: percent
    };
  }, [badges, userPoints]);

  return (
    <Card className="border-0 shadow-lg" data-b44-sync="true" data-feature="profile" data-component="profilebadgesshowcase">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            Badges & Achievements
          </span>
          <Badge variant="outline" className="text-sm">
            {earnedCount} / {totalBadges} ({completionPercent}%)
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${completionPercent}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-amber-400 to-yellow-500"
            />
          </div>
        </div>

        {earnedBadges.length === 0 ? (
          <div className="text-center py-8">
            <Award className="h-16 w-16 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 font-medium">No badges earned yet</p>
            <p className="text-sm text-slate-500">Participate in events and complete activities to earn badges!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Legendary Badges */}
            {badgesByRarity.legendary.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-amber-700 mb-3 flex items-center gap-1">
                  <Sparkles className="h-4 w-4" /> Legendary
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {badgesByRarity.legendary.map((badge, idx) => (
                    <BadgeCard key={badge.id} badge={badge} delay={idx} />
                  ))}
                </div>
              </div>
            )}

            {/* Epic Badges */}
            {badgesByRarity.epic.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-purple-700 mb-3">Epic</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {badgesByRarity.epic.map((badge, idx) => (
                    <BadgeCard key={badge.id} badge={badge} delay={idx} />
                  ))}
                </div>
              </div>
            )}

            {/* Rare Badges */}
            {badgesByRarity.rare.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-blue-700 mb-3">Rare</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {badgesByRarity.rare.map((badge, idx) => (
                    <BadgeCard key={badge.id} badge={badge} delay={idx} />
                  ))}
                </div>
              </div>
            )}

            {/* Uncommon Badges */}
            {badgesByRarity.uncommon.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-green-700 mb-3">Uncommon</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {badgesByRarity.uncommon.map((badge, idx) => (
                    <BadgeCard key={badge.id} badge={badge} delay={idx} />
                  ))}
                </div>
              </div>
            )}

            {/* Common Badges */}
            {badgesByRarity.common.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-3">Common</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {badgesByRarity.common.map((badge, idx) => (
                    <BadgeCard key={badge.id} badge={badge} delay={idx} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Recent Badge Awards */}
        {badgeAwards.length > 0 && (
          <div className="mt-6 pt-6 border-t">
            <h4 className="text-sm font-semibold text-slate-700 mb-3">Recent Awards</h4>
            <div className="space-y-2">
              {badgeAwards.slice(0, 3).map(award => {
                const badge = badges.find(b => b.id === award.badge_id);
                return (
                  <div key={award.id} className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg">
                    <span className="text-2xl">{badge?.badge_icon || '🏅'}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{badge?.badge_name || 'Badge'}</p>
                      <p className="text-xs text-slate-500">
                        {award.award_reason || `Earned ${format(new Date(award.created_date), 'MMM d, yyyy')}`}
                      </p>
                    </div>
                    {award.points_awarded > 0 && (
                      <Badge className="bg-amber-100 text-amber-700">+{award.points_awarded} pts</Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function BadgeCard({ badge, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: delay * 0.05 }}
      className={`p-4 rounded-xl border-2 bg-gradient-to-br ${rarityColors[badge.rarity || 'common']} text-center hover:shadow-md transition-shadow`}
    >
      <span className="text-3xl block mb-2">{badge.badge_icon}</span>
      <p className={`font-semibold text-sm ${rarityTextColors[badge.rarity || 'common']}`}>
        {badge.badge_name}
      </p>
      {badge.points_value > 0 && (
        <p className="text-xs text-slate-500 mt-1">+{badge.points_value} pts</p>
      )}
    </motion.div>
  );
}