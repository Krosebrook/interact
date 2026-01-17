import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DynamicLeaderboard from './DynamicLeaderboard';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function LeaderboardSelector() {
  const { data: configs, isLoading } = useQuery({
    queryKey: ['leaderboard-configs'],
    queryFn: async () => {
      const results = await base44.entities.LeaderboardConfig.filter(
        { is_active: true }
      );
      return results;
    }
  });

  const { data: userTeams } = useQuery({
    queryKey: ['user-teams'],
    queryFn: async () => {
      const user = await base44.auth.me();
      if (!user) return [];
      const results = await base44.entities.TeamMembership.filter({
        user_email: user.email
      });
      return results;
    }
  });

  if (isLoading) {
    return <LoadingSpinner message="Loading leaderboards..." />;
  }

  const globalLeaderboards = configs?.filter(c => c.leaderboard_type === 'global') || [];
  const teamLeaderboards = configs?.filter(c => c.leaderboard_type === 'team') || [];
  const skillLeaderboards = configs?.filter(c => c.leaderboard_type === 'skill') || [];
  const challengeLeaderboards = configs?.filter(c => c.leaderboard_type === 'challenge') || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Leaderboards</h1>
        <p className="text-slate-600">Compete and climb the ranks across different categories</p>
      </div>

      <Tabs defaultValue="global" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="global">Global</TabsTrigger>
          <TabsTrigger value="team">Teams</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="challenges">Challenges</TabsTrigger>
        </TabsList>

        <TabsContent value="global" className="space-y-4">
          {globalLeaderboards.map(config => (
            <DynamicLeaderboard
              key={config.id}
              leaderboardName={config.leaderboard_name}
              title={config.display_name}
              showAIChallenges={config.enable_ai_challenges}
            />
          ))}
        </TabsContent>

        <TabsContent value="team" className="space-y-4">
          {teamLeaderboards.map(config => (
            <div key={config.id} className="space-y-4">
              {userTeams?.map(membership => (
                <DynamicLeaderboard
                  key={`${config.id}-${membership.team_id}`}
                  leaderboardName={config.leaderboard_name}
                  leaderboardFilter={membership.team_id}
                  title={`${config.display_name} - Team`}
                  showAIChallenges={config.enable_ai_challenges}
                />
              ))}
            </div>
          ))}
        </TabsContent>

        <TabsContent value="skills" className="space-y-4">
          {skillLeaderboards.map(config => (
            <DynamicLeaderboard
              key={config.id}
              leaderboardName={config.leaderboard_name}
              title={config.display_name}
              showAIChallenges={config.enable_ai_challenges}
            />
          ))}
        </TabsContent>

        <TabsContent value="challenges" className="space-y-4">
          {challengeLeaderboards.map(config => (
            <DynamicLeaderboard
              key={config.id}
              leaderboardName={config.leaderboard_name}
              title={config.display_name}
              showAIChallenges={config.enable_ai_challenges}
            />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}