import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

const TIER_COLORS = {
  bronze: 'from-amber-700 to-amber-900',
  silver: 'from-slate-400 to-slate-600',
  gold: 'from-yellow-400 to-yellow-600',
  platinum: 'from-purple-400 to-purple-600'
};

const TIER_BADGES = {
  bronze: '🥉',
  silver: '🥈',
  gold: '🥇',
  platinum: '💎'
};

export default function BadgeShowcase({ userEmail, showTier = true }) {
  const { data: badges = [], isLoading } = useQuery({
    queryKey: ['user-badges', userEmail],
    queryFn: async () => {
      const awards = await base44.entities.BadgeAward.filter({ user_email: userEmail });
      return awards.sort((a, b) => new Date(b.earned_date) - new Date(a.earned_date));
    },
    enabled: !!userEmail
  });

  const { data: userPoints } = useQuery({
    queryKey: ['user-points', userEmail],
    queryFn: async () => {
      const points = await base44.entities.UserPoints.filter({ user_email: userEmail });
      return points[0];
    },
    enabled: !!userEmail
  });

  const tierCounts = badges.reduce((acc, badge) => {
    acc[badge.tier] = (acc[badge.tier] || 0) + 1;
    return acc;
  }, {});

  const currentTier = userPoints?.tier || 'bronze';

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-16 w-16 bg-slate-200 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-int-orange" />
            Badges & Achievements
          </CardTitle>
          {showTier && (
            <Badge className={`bg-gradient-to-r ${TIER_COLORS[currentTier]} text-white border-0`}>
              {TIER_BADGES[currentTier]} {currentTier.charAt(0).toUpperCase() + currentTier.slice(1)} Tier
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {badges.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Lock className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No badges earned yet</p>
            <p className="text-sm">Participate in events to unlock achievements!</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 mb-4">
              {badges.map((badge, idx) => (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`relative p-3 rounded-lg bg-gradient-to-br ${TIER_COLORS[badge.tier]} shadow-lg`}
                  title={`${badge.badge_name} - Earned ${new Date(badge.earned_date).toLocaleDateString()}`}
                >
                  <div className="text-3xl text-center">{badge.badge_icon}</div>
                  <div className="text-xs text-white text-center font-semibold mt-1 truncate">
                    {badge.badge_name}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Tier breakdown */}
            <div className="grid grid-cols-4 gap-2 text-center text-sm">
              {Object.entries(TIER_COLORS).map(([tier, colors]) => (
                <div key={tier} className="space-y-1">
                  <div className={`h-2 rounded-full bg-gradient-to-r ${colors}`} />
                  <div className="text-xs font-medium capitalize">{tier}</div>
                  <div className="text-xs text-slate-600">{tierCounts[tier] || 0}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}