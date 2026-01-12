import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Trophy, Crown, MessageSquare, BarChart3 } from 'lucide-react';

export default function MyTeamCard({ 
  team, 
  user, 
  onNavigateToDashboard,
  onManageMembers,
  onViewAnalytics,
  onLeaveTeam,
  isLeaving
}) {
  const isLeader = team.team_leader_email === user?.email;

  return (
    <Card className="border-2 border-int-orange bg-gradient-to-br from-orange-50 to-slate-50" data-b44-sync="true" data-feature="teams" data-component="myteamcard">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-3xl">{team.team_avatar}</span>
          <span className="text-int-navy">Your Team: {team.team_name}</span>
          {isLeader && <Crown className="h-5 w-5 text-[#F5C16A]" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-slate-600">{team.description}</p>
        <div className="flex gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-int-navy" />
            <span className="font-semibold">{team.member_count}/{team.max_members} Members</span>
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-int-orange" />
            <span className="font-semibold">{team.total_points} Points</span>
          </div>
        </div>
        <div className="flex gap-3 flex-wrap">
          <Button
            onClick={onNavigateToDashboard}
            className="bg-int-navy hover:bg-[#4A6070] text-white"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Team Dashboard
          </Button>
          {isLeader && (
            <>
              <Button variant="outline" onClick={onManageMembers}>
                <Users className="h-4 w-4 mr-2" />
                Manage Members
              </Button>
              <Button variant="outline" onClick={onViewAnalytics}>
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </Button>
            </>
          )}
          {!isLeader && (
            <Button
              variant="outline"
              onClick={onLeaveTeam}
              disabled={isLeaving}
            >
              Leave Team
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}