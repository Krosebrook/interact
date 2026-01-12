import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Award, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TeamBadgeDisplay({ teamId, teamData }) {
  const { data: allBadges = [] } = useQuery({
    queryKey: ['badges'],
    queryFn: () => base44.entities.Badge.list()
  });

  const teamBadges = allBadges.filter(b => b.is_team_badge);
  const earnedBadgeIds = teamData?.badges_earned || [];
  const earnedBadges = teamBadges.filter(b => earnedBadgeIds.includes(b.id));
  const lockedBadges = teamBadges.filter(b => !earnedBadgeIds.includes(b.id));

  const rarityColors = {
    common: 'from-slate-400 to-slate-600',
    rare: 'from-blue-400 to-blue-600',
    epic: 'from-purple-400 to-purple-600',
    legendary: 'from-[#F5C16A] to-int-orange'
  };

  return (
    <Card className="border-2 border-int-orange" data-b44-sync="true" data-feature="teams" data-component="teambadgedisplay">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-int-orange" />
          Team Badges ({earnedBadges.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {earnedBadges.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {earnedBadges.map((badge, index) => (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ 
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 200
                }}
                whileHover={{ scale: 1.1, rotate: 5 }}
                className={`p-4 rounded-xl text-center bg-gradient-to-br ${rarityColors[badge.rarity]} text-white shadow-lg cursor-pointer relative overflow-hidden`}
              >
                <motion.div
                  animate={{
                    x: ['-100%', '200%'],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 3,
                    delay: index * 0.5,
                    ease: "easeInOut"
                  }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  style={{ width: '50%' }}
                />
                <motion.div 
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 2, delay: index * 0.2 }}
                  className="text-5xl mb-2"
                >
                  {badge.badge_icon}
                </motion.div>
                <div className="font-bold text-sm">{badge.badge_name}</div>
                <Badge className="mt-2 bg-white/30 text-white text-xs">
                  {badge.rarity}
                </Badge>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 mb-6">
            <Award className="h-12 w-12 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-600">Complete team challenges to earn badges!</p>
          </div>
        )}

        {lockedBadges.length > 0 && (
          <div>
            <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Locked Team Badges
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {lockedBadges.slice(0, 8).map((badge, index) => (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: earnedBadges.length * 0.1 + index * 0.05 }}
                  whileHover={{ scale: 1.05, opacity: 0.8 }}
                  className="p-3 rounded-lg text-center bg-slate-100 border-2 border-dashed border-slate-300 opacity-60"
                >
                  <div className="text-3xl mb-1 grayscale">{badge.badge_icon}</div>
                  <div className="font-semibold text-xs text-slate-700">{badge.badge_name}</div>
                  {badge.award_criteria && (
                    <div className="text-xs text-slate-600 mt-1">
                      {badge.award_criteria.threshold} {badge.award_criteria.type?.replace('_', ' ')}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}