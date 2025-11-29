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
    <div className="space-y-6">
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
            <div className="text-center py-12 text-slate-500">
              <Trophy className="h-12 w-12 mx-auto mb-3 text-slate-300" />
              <p>No rankings yet for this category</p>
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