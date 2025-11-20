import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const BADGES_INFO = {
  first_timer: { emoji: '🎉', name: 'First Timer' },
  feedback_champion: { emoji: '💬', name: 'Feedback Champion' },
  consistent_3: { emoji: '🔥', name: '3-Event Streak' },
  consistent_5: { emoji: '⚡', name: '5-Event Streak' },
  top_scorer: { emoji: '🏆', name: 'Top Scorer' },
  super_scorer: { emoji: '👑', name: 'Super Scorer' },
  engagement_master: { emoji: '⭐', name: 'Engagement Master' },
  team_player: { emoji: '🤝', name: 'Team Player' },
  veteran: { emoji: '🎖️', name: 'Veteran' }
};

export default function LeaderboardCard({ limit = 5, showBadges = true }) {
  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const profiles = await base44.entities.ParticipantProfile.list('-total_points', 50);
      return profiles;
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  const topProfiles = profiles.slice(0, limit);

  const getRankIcon = (index) => {
    if (index === 0) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (index === 1) return <Medal className="h-5 w-5 text-slate-400" />;
    if (index === 2) return <Award className="h-5 w-5 text-amber-600" />;
    return null;
  };

  if (isLoading) {
    return (
      <Card className="p-6 border-0 shadow-lg">
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-slate-100 animate-pulse rounded-lg" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 border-0 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-500" />
            Leaderboard
          </h3>
          <p className="text-sm text-slate-600 mt-1">Top participants this month</p>
        </div>
        <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
          <TrendingUp className="h-3 w-3 mr-1" />
          Live
        </Badge>
      </div>

      <div className="space-y-3">
        {topProfiles.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Trophy className="h-12 w-12 mx-auto mb-3 text-slate-300" />
            <p>No participants yet</p>
          </div>
        ) : (
          topProfiles.map((profile, index) => (
            <motion.div
              key={profile.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-lg border transition-all ${
                index === 0
                  ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200'
                  : index === 1
                  ? 'bg-slate-50 border-slate-200'
                  : index === 2
                  ? 'bg-amber-50 border-amber-200'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex items-center justify-center w-8">
                    {getRankIcon(index) || (
                      <span className="font-bold text-slate-600">#{index + 1}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-slate-900">
                        {profile.participant_name}
                      </p>
                      {showBadges && profile.badges?.length > 0 && (
                        <div className="flex gap-1">
                          {profile.badges.slice(0, 3).map((badgeId) => (
                            <span
                              key={badgeId}
                              className="text-lg"
                              title={BADGES_INFO[badgeId]?.name}
                            >
                              {BADGES_INFO[badgeId]?.emoji}
                            </span>
                          ))}
                          {profile.badges.length > 3 && (
                            <span className="text-xs text-slate-500">
                              +{profile.badges.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-600">
                      <span>{profile.events_attended} events</span>
                      <span>•</span>
                      <span>{profile.feedback_count} feedback</span>
                      {profile.avg_engagement && (
                        <>
                          <span>•</span>
                          <span>⭐ {profile.avg_engagement.toFixed(1)}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-slate-900">
                    {profile.total_points}
                  </p>
                  <p className="text-xs text-slate-500">points</p>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </Card>
  );
}