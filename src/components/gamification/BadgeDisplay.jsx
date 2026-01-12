import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Award, Lock } from 'lucide-react';

export default function BadgeDisplay({ userEmail }) {
  const { data: allBadges = [] } = useQuery({
    queryKey: ['badges'],
    queryFn: () => base44.entities.Badge.list()
  });

  const { data: userPointsRecords = [] } = useQuery({
    queryKey: ['user-points', userEmail],
    queryFn: () => base44.entities.UserPoints.filter({ user_email: userEmail }),
    enabled: !!userEmail
  });

  const userPoints = userPointsRecords[0];
  const earnedBadgeIds = userPoints?.badges_earned || [];

  const earnedBadges = allBadges.filter(b => earnedBadgeIds.includes(b.id));
  const lockedBadges = allBadges.filter(b => !earnedBadgeIds.includes(b.id));

  const rarityColors = {
    common: 'border-slate-300 bg-slate-50',
    rare: 'border-blue-300 bg-blue-50',
    epic: 'border-purple-300 bg-purple-50',
    legendary: 'border-yellow-300 bg-gradient-to-br from-yellow-50 to-orange-50'
  };

  return (
    <div data-b44-sync="true" data-feature="gamification" data-component="badgedisplay" className="space-y-6">
      {/* Earned Badges */}
      {earnedBadges.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Award className="h-5 w-5 text-indigo-600" />
            Your Badges ({earnedBadges.length})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {earnedBadges.map((badge, index) => (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`p-4 text-center hover:shadow-lg transition-all border-2 ${
                  rarityColors[badge.rarity] || rarityColors.common
                }`}>
                  <div className="text-4xl mb-2">{badge.badge_icon}</div>
                  <h4 className="font-semibold text-sm text-slate-900 mb-1">
                    {badge.badge_name}
                  </h4>
                  <p className="text-xs text-slate-600 mb-2">{badge.badge_description}</p>
                  <Badge variant="outline" className="text-xs capitalize">
                    {badge.rarity}
                  </Badge>
                  {badge.points_value > 0 && (
                    <div className="text-xs text-indigo-600 font-semibold mt-2">
                      +{badge.points_value} pts
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Locked Badges */}
      {lockedBadges.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Lock className="h-5 w-5 text-slate-400" />
            Locked Badges
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {lockedBadges.slice(0, 8).map((badge, index) => (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="p-4 text-center opacity-60 hover:opacity-80 transition-all border-2 border-dashed border-slate-300">
                  <div className="text-4xl mb-2 filter grayscale">{badge.badge_icon}</div>
                  <h4 className="font-semibold text-sm text-slate-700 mb-1">
                    {badge.badge_name}
                  </h4>
                  <p className="text-xs text-slate-500 mb-2">{badge.badge_description}</p>
                  {badge.award_criteria && (
                    <div className="text-xs text-slate-600 font-medium">
                      Requirement: {badge.award_criteria.threshold} {badge.award_criteria.type?.replace('_', ' ')}
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {allBadges.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No badges available yet</p>
        </div>
      )}
    </div>
  );
}