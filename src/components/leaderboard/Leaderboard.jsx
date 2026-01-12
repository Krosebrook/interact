import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trophy, Loader2 } from 'lucide-react';
import { useLeaderboard, LEADERBOARD_CATEGORIES } from './hooks/useLeaderboard';
import LeaderboardFilters from './LeaderboardFilters';
import LeaderboardRow from './LeaderboardRow';
import MyRankCard from './MyRankCard';

/**
 * Main leaderboard component with filtering and user ranking
 */
export default function Leaderboard({ currentUserEmail, onViewProfile }) {
  const [category, setCategory] = useState('points');
  const [period, setPeriod] = useState('all_time');
  const [showFollowingOnly, setShowFollowingOnly] = useState(false);

  const { rankings, myRank, nearby, totalParticipants, isLoading } = useLeaderboard(
    category,
    period,
    currentUserEmail
  );

  const categoryConfig = LEADERBOARD_CATEGORIES[category];

  return (
    <div className="space-y-6" data-b44-sync="true" data-feature="leaderboard" data-component="leaderboard">
      {/* My Rank Card */}
      <MyRankCard 
        myRank={myRank}
        nearby={nearby}
        totalParticipants={totalParticipants}
        categoryLabel={categoryConfig.label}
      />

      {/* Leaderboard */}
      <Card className="glass-card-solid">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-int-orange" />
            Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <LeaderboardFilters
            category={category}
            period={period}
            onCategoryChange={setCategory}
            onPeriodChange={setPeriod}
            showFollowingOnly={showFollowingOnly}
            onToggleFollowing={() => setShowFollowingOnly(!showFollowingOnly)}
          />

          {/* Rankings list */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-int-orange" />
            </div>
          ) : rankings.length === 0 ? (
            <div className="text-center py-12 px-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-50 flex items-center justify-center">
                <Trophy className="h-8 w-8 text-amber-400" />
              </div>
              <h3 className="text-lg font-bold text-int-navy mb-2">No rankings yet</h3>
              <p className="text-sm text-slate-500 max-w-xs mx-auto">
                Be the first to earn points and appear on the leaderboard! Participate in events and activities.
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-2">
                {rankings.map(user => (
                  <LeaderboardRow
                    key={user.user_email}
                    user={user}
                    isCurrentUser={user.user_email === currentUserEmail}
                    onViewProfile={onViewProfile}
                  />
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}