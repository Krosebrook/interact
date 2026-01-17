import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, TrendingUp, Zap, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

const TIER_COLORS = {
  diamond: 'from-blue-400 via-purple-400 to-pink-400',
  platinum: 'from-gray-300 to-gray-400',
  gold: 'from-yellow-300 to-yellow-500',
  silver: 'from-gray-200 to-gray-300',
  bronze: 'from-orange-400 to-orange-600'
};

const TIER_ICONS = {
  diamond: '💎',
  platinum: '⭐',
  gold: '🏅',
  silver: '🥈',
  bronze: '🥉'
};

export default function DynamicLeaderboard({ 
  leaderboardName, 
  leaderboardFilter = '',
  title,
  timePeriod = 'all_time',
  showAIChallenges = true 
}) {
  const [selectedTab, setSelectedTab] = useState('ranking');

  const { data: entries, isLoading } = useQuery({
    queryKey: ['leaderboard', leaderboardName, leaderboardFilter, timePeriod],
    queryFn: async () => {
      const results = await base44.entities.LeaderboardEntry.filter({
        leaderboard_name: leaderboardName,
        ...(leaderboardFilter && { leaderboard_filter: leaderboardFilter }),
        time_period: timePeriod
      }, '-rank', 100);
      return results;
    }
  });

  const { data: aiSuggestions, isLoading: suggestionsLoading } = useQuery({
    queryKey: ['leaderboard-challenges', leaderboardName],
    queryFn: async () => {
      const response = await base44.functions.invoke('aiLeaderboardChallenges', {
        leaderboardName
      });
      return response.data;
    },
    enabled: showAIChallenges
  });

  const topThree = useMemo(() => entries?.slice(0, 3) || [], [entries]);
  const restEntries = useMemo(() => entries?.slice(3) || [], [entries]);

  if (isLoading) {
    return <div className="text-center py-8">Loading leaderboard...</div>;
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="ranking" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="ranking">
            <Trophy className="w-4 h-4 mr-2" />
            Rankings
          </TabsTrigger>
          {showAIChallenges && (
            <TabsTrigger value="challenges">
              <Zap className="w-4 h-4 mr-2" />
              AI Challenges
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="ranking" className="space-y-4">
          {/* Podium - Top 3 */}
          {topThree.length > 0 && (
            <Card className="bg-gradient-to-b from-slate-50 to-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  {title || 'Leaderboard'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-8">
                  {/* 2nd Place */}
                  {topThree[1] && (
                    <div className="flex flex-col items-center">
                      <div className="relative mb-2">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-2xl">
                          {TIER_ICONS[topThree[1].tier]}
                        </div>
                        <div className="absolute -top-2 -right-2 bg-white rounded-full px-2 py-1 text-xs font-bold">
                          2️⃣
                        </div>
                      </div>
                      <p className="font-semibold text-sm text-center truncate w-full">
                        {topThree[1].user_email.split('@')[0]}
                      </p>
                      <p className="text-2xl font-bold text-gray-400">
                        {topThree[1].score}
                      </p>
                      <Badge className={`bg-gradient-to-r ${TIER_COLORS[topThree[1].tier]} text-white text-xs`}>
                        {topThree[1].tier}
                      </Badge>
                    </div>
                  )}

                  {/* 1st Place */}
                  {topThree[0] && (
                    <div className="flex flex-col items-center -mt-4">
                      <div className="relative mb-2">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 flex items-center justify-center text-4xl animate-pulse">
                          {TIER_ICONS[topThree[0].tier]}
                        </div>
                        <div className="absolute -top-3 -right-3 bg-white rounded-full px-2 py-1 text-xl font-bold">
                          🥇
                        </div>
                      </div>
                      <p className="font-bold text-center truncate w-full">
                        {topThree[0].user_email.split('@')[0]}
                      </p>
                      <p className="text-3xl font-bold text-yellow-600">
                        {topThree[0].score}
                      </p>
                      <Badge className={`bg-gradient-to-r ${TIER_COLORS[topThree[0].tier]} text-white`}>
                        {topThree[0].tier}
                      </Badge>
                    </div>
                  )}

                  {/* 3rd Place */}
                  {topThree[2] && (
                    <div className="flex flex-col items-center">
                      <div className="relative mb-2">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-2xl">
                          {TIER_ICONS[topThree[2].tier]}
                        </div>
                        <div className="absolute -top-2 -right-2 bg-white rounded-full px-2 py-1 text-xs font-bold">
                          3️⃣
                        </div>
                      </div>
                      <p className="font-semibold text-sm text-center truncate w-full">
                        {topThree[2].user_email.split('@')[0]}
                      </p>
                      <p className="text-2xl font-bold text-orange-600">
                        {topThree[2].score}
                      </p>
                      <Badge className={`bg-gradient-to-r ${TIER_COLORS[topThree[2].tier]} text-white text-xs`}>
                        {topThree[2].tier}
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Full Rankings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Full Rankings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {restEntries.map((entry, idx) => (
                  <div 
                    key={entry.id}
                    className={cn(
                      'flex items-center justify-between p-3 rounded-lg transition-colors',
                      entry.rank <= 3 ? 'bg-slate-50' : 'hover:bg-slate-50'
                    )}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-8 text-center font-bold text-slate-500">
                        #{entry.rank}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium text-slate-900">
                          {entry.user_email.split('@')[0]}
                        </span>
                        <span className="text-slate-500 ml-2">
                          {entry.user_email.split('@')[1]}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-xs">
                        {entry.tier}
                      </Badge>
                      <span className="font-bold text-int-orange w-12 text-right">
                        {entry.score}
                      </span>
                      {entry.previous_rank && entry.rank < entry.previous_rank && (
                        <div className="flex items-center gap-1 text-green-600 text-sm">
                          <TrendingUp className="w-4 h-4" />
                          {entry.previous_rank - entry.rank}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {showAIChallenges && (
          <TabsContent value="challenges" className="space-y-4">
            {suggestionsLoading ? (
              <div className="text-center py-8">Generating challenges...</div>
            ) : aiSuggestions ? (
              <div className="space-y-4">
                {/* Promotion Message */}
                {aiSuggestions.suggestions?.promotion_message && (
                  <Card className="bg-gradient-to-r from-int-orange/10 to-int-navy/10">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-int-orange" />
                        Recognition
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-700">
                        {aiSuggestions.suggestions.promotion_message}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* AI Suggested Challenges */}
                {aiSuggestions.suggestions?.challenges && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-slate-900">Upcoming Challenges</h3>
                    {aiSuggestions.suggestions.challenges.map((challenge, idx) => (
                      <Card key={idx} className="hover:shadow-md transition-shadow">
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-semibold text-slate-900">
                                {challenge.title}
                              </h4>
                              <p className="text-sm text-slate-600 mt-1">
                                {challenge.description}
                              </p>
                            </div>
                            <Badge className={cn(
                              'ml-2',
                              challenge.difficulty === 'hard' && 'bg-red-100 text-red-800',
                              challenge.difficulty === 'medium' && 'bg-yellow-100 text-yellow-800',
                              challenge.difficulty === 'easy' && 'bg-green-100 text-green-800'
                            )}>
                              {challenge.difficulty}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between text-sm text-slate-500">
                            <span>{challenge.duration_days} days</span>
                            <span className="font-semibold text-int-orange">
                              +{challenge.point_reward} pts
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Motivation Tips */}
                {aiSuggestions.suggestions?.motivation_tips && (
                  <Card className="bg-blue-50 border-blue-200">
                    <CardHeader>
                      <CardTitle className="text-base">💡 Tips to Climb the Ranks</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {aiSuggestions.suggestions.motivation_tips.map((tip, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <span className="font-bold text-blue-600 mt-0.5">→</span>
                            <span className="text-slate-700">{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : null}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}