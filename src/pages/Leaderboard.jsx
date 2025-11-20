import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Trophy, Medal, Award, Search, TrendingUp, Users, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import BadgeShowcase from '../components/gamification/BadgeShowcase';

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

export default function Leaderboard() {
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        if (currentUser.role !== 'admin') {
          base44.auth.redirectToLogin();
        }
      } catch (error) {
        base44.auth.redirectToLogin();
      }
    };
    loadUser();
  }, []);

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ['all-profiles'],
    queryFn: () => base44.entities.ParticipantProfile.list('-total_points', 100),
    refetchInterval: 30000
  });

  const filteredProfiles = profiles.filter(p =>
    p.participant_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.participant_email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalParticipants = profiles.length;
  const totalPoints = profiles.reduce((sum, p) => sum + p.total_points, 0);
  const avgPoints = totalParticipants > 0 ? Math.round(totalPoints / totalParticipants) : 0;

  const getRankIcon = (index) => {
    if (index === 0) return <Trophy className="h-6 w-6 text-yellow-500" />;
    if (index === 1) return <Medal className="h-6 w-6 text-slate-400" />;
    if (index === 2) return <Award className="h-6 w-6 text-amber-600" />;
    return null;
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
          <Trophy className="h-8 w-8 text-yellow-500" />
          Leaderboard
        </h1>
        <p className="text-slate-600">Top performers and achievement tracker</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 border-0 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-100 rounded-xl">
              <Users className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Total Participants</p>
              <p className="text-2xl font-bold text-slate-900">{totalParticipants}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-0 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 rounded-xl">
              <Target className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Total Points</p>
              <p className="text-2xl font-bold text-slate-900">{totalPoints.toLocaleString()}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-0 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-100 rounded-xl">
              <TrendingUp className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Average Score</p>
              <p className="text-2xl font-bold text-slate-900">{avgPoints}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search */}
      <Card className="p-4 border-0 shadow-lg">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input
            placeholder="Search participants..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Leaderboard */}
      <Card className="p-6 border-0 shadow-lg">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Top Performers</h2>
        
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-20 bg-slate-100 animate-pulse rounded-lg" />
            ))}
          </div>
        ) : filteredProfiles.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600">No participants found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredProfiles.map((profile, index) => (
              <motion.div
                key={profile.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-5 rounded-xl border-2 transition-all ${
                  index === 0
                    ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300'
                    : index === 1
                    ? 'bg-slate-50 border-slate-300'
                    : index === 2
                    ? 'bg-amber-50 border-amber-300'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/80">
                    {getRankIcon(index) || (
                      <span className="text-xl font-bold text-slate-600">#{index + 1}</span>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="text-lg font-bold text-slate-900">
                        {profile.participant_name}
                      </p>
                      {profile.badges?.length > 0 && (
                        <div className="flex gap-1">
                          {profile.badges.slice(0, 5).map((badgeId) => (
                            <span
                              key={badgeId}
                              className="text-xl"
                              title={BADGES_INFO[badgeId]?.name}
                            >
                              {BADGES_INFO[badgeId]?.emoji}
                            </span>
                          ))}
                          {profile.badges.length > 5 && (
                            <span className="text-sm text-slate-500">
                              +{profile.badges.length - 5}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-4 text-sm">
                      <Badge variant="outline" className="gap-1">
                        <Users className="h-3 w-3" />
                        {profile.events_attended} events
                      </Badge>
                      <Badge variant="outline" className="gap-1">
                        💬 {profile.feedback_count} feedback
                      </Badge>
                      {profile.avg_engagement && (
                        <Badge variant="outline" className="gap-1">
                          ⭐ {profile.avg_engagement.toFixed(1)} avg
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-3xl font-bold text-slate-900">
                      {profile.total_points}
                    </p>
                    <p className="text-sm text-slate-500">points</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </Card>

      {/* Badge Showcase */}
      {filteredProfiles[0] && (
        <BadgeShowcase earnedBadges={filteredProfiles[0].badges || []} />
      )}
    </div>
  );
}