import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Trophy, Crown } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TeamCard({ 
  team, 
  index, 
  isMyTeam, 
  isLeader,
  currentUserEmail,
  onJoin, 
  onViewDashboard,
  isJoining 
}) {
  const canJoin = !isMyTeam && team.member_count < team.max_members;

  return (
    <motion.div
      data-b44-sync="true"
      data-feature="teams"
      data-component="teamcard"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className={`hover:shadow-lg transition-all ${
        isMyTeam ? 'border-2 border-int-orange' : ''
      }`}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="text-4xl">{team.team_avatar}</div>
              <div>
                <CardTitle className="text-lg text-int-navy">{team.team_name}</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className="bg-int-navy text-white">#{index + 1}</Badge>
                  {team.team_leader_email === currentUserEmail && (
                    <Crown className="h-4 w-4 text-[#F5C16A]" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-slate-600 line-clamp-2">{team.description}</p>
          <div className="flex justify-between text-sm">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4 text-int-navy" />
              <span>{team.member_count}/{team.max_members}</span>
            </div>
            <div className="flex items-center gap-1">
              <Trophy className="h-4 w-4 text-int-orange" />
              <span className="font-bold text-int-orange">{team.total_points}</span>
            </div>
          </div>
          {canJoin && (
            <Button
              onClick={() => onJoin(team)}
              disabled={isJoining}
              className="w-full bg-int-orange hover:bg-int-orange/90 text-slate-900 font-semibold"
              size="sm"
            >
              Join Team
            </Button>
          )}
          {isMyTeam && (
            <Button
              onClick={() => onViewDashboard(team.id)}
              className="w-full bg-int-navy hover:bg-[#4A6070] text-white"
              size="sm"
            >
              View Dashboard
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}