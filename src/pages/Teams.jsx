import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Users, Plus, Trophy, Crown, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { useUserData } from '../components/hooks/useUserData';
import { useTeamData } from '../components/hooks/useTeamData';

export default function Teams() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, loading, userPoints } = useUserData(true);
  const { teams } = useTeamData();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [teamForm, setTeamForm] = useState({
    team_name: '',
    description: '',
    team_avatar: '🚀'
  });

  const myTeam = userPoints?.team_id ? teams.find(t => t.id === userPoints.team_id) : null;

  const createTeamMutation = useMutation({
    mutationFn: async (data) => {
      const team = await base44.entities.Team.create({
        ...data,
        team_leader_email: user.email,
        total_points: 0,
        member_count: 1
      });

      // Update user's team
      if (userPoints) {
        await base44.entities.UserPoints.update(userPoints.id, {
          team_id: team.id,
          team_name: team.team_name
        });
      }

      return team;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['teams']);
      queryClient.invalidateQueries(['user-points']);
      setShowCreateDialog(false);
      setTeamForm({ team_name: '', description: '', team_avatar: '🚀' });
      toast.success('Team created successfully! 🎉');
    }
  });

  const joinTeamMutation = useMutation({
    mutationFn: async (team) => {
      if (team.member_count >= team.max_members) {
        throw new Error('Team is full');
      }

      // Update user's team
      if (userPoints) {
        await base44.entities.UserPoints.update(userPoints.id, {
          team_id: team.id,
          team_name: team.team_name
        });
      }

      // Update team member count
      await base44.entities.Team.update(team.id, {
        member_count: team.member_count + 1
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['teams']);
      queryClient.invalidateQueries(['user-points']);
      toast.success('Joined team successfully! 🎉');
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const leaveTeamMutation = useMutation({
    mutationFn: async () => {
      if (userPoints) {
        await base44.entities.UserPoints.update(userPoints.id, {
          team_id: null,
          team_name: null
        });
      }

      if (myTeam) {
        await base44.entities.Team.update(myTeam.id, {
          member_count: Math.max(0, myTeam.member_count - 1)
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['teams']);
      queryClient.invalidateQueries(['user-points']);
      toast.success('Left team successfully');
    }
  });

  const avatarOptions = ['🚀', '⚡', '🔥', '💎', '🌟', '🎯', '🏆', '👑', '🦁', '🐉'];

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-int-orange"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-int-navy mb-2">Teams</h1>
          <p className="text-slate-600">Join or create a team to compete together</p>
        </div>
        {!myTeam && (
          <Button onClick={() => setShowCreateDialog(true)} className="bg-int-orange hover:bg-[#C46322] text-white">
            <Plus className="h-4 w-4 mr-2" />
            Create Team
          </Button>
        )}
      </div>

      {/* My Team */}
      {myTeam && (
        <Card className="border-2 border-int-orange bg-gradient-to-br from-orange-50 to-slate-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-3xl">{myTeam.team_avatar}</span>
              <span className="text-int-navy">Your Team: {myTeam.team_name}</span>
              {myTeam.team_leader_email === user.email && (
                <Crown className="h-5 w-5 text-[#F5C16A]" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-600">{myTeam.description}</p>
            <div className="flex gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-int-navy" />
                <span className="font-semibold">{myTeam.member_count}/{myTeam.max_members} Members</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-int-orange" />
                <span className="font-semibold">{myTeam.total_points} Points</span>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => navigate(createPageUrl('TeamDashboard') + `?teamId=${myTeam.id}`)}
                className="bg-int-navy hover:bg-[#4A6070] text-white"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Team Dashboard
              </Button>
              {myTeam.team_leader_email !== user.email && (
                <Button
                  variant="outline"
                  onClick={() => leaveTeamMutation.mutate()}
                  disabled={leaveTeamMutation.isLoading}
                >
                  Leave Team
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Teams Leaderboard */}
      <div>
        <h2 className="text-2xl font-bold text-int-navy mb-4">Team Leaderboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team, index) => (
            <motion.div
              key={team.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className={`hover:shadow-lg transition-all ${
                team.id === myTeam?.id ? 'border-2 border-int-orange' : ''
              }`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-4xl">{team.team_avatar}</div>
                      <div>
                        <CardTitle className="text-lg text-int-navy">{team.team_name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className="bg-int-navy text-white">#{index + 1}</Badge>
                          {team.team_leader_email === user.email && (
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
                  {!myTeam && team.member_count < team.max_members && (
                    <Button
                      onClick={() => joinTeamMutation.mutate(team)}
                      disabled={joinTeamMutation.isLoading}
                      className="w-full bg-int-orange hover:bg-[#C46322] text-white"
                      size="sm"
                    >
                      Join Team
                    </Button>
                  )}
                  {team.id === myTeam?.id && (
                    <Button
                      onClick={() => navigate(createPageUrl('TeamDashboard') + `?teamId=${team.id}`)}
                      className="w-full bg-int-navy hover:bg-[#4A6070] text-white"
                      size="sm"
                    >
                      View Dashboard
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Create Team Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Team</DialogTitle>
            <DialogDescription>Start your own team and invite members</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Team Avatar</Label>
              <div className="grid grid-cols-5 gap-2 mt-2">
                {avatarOptions.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => setTeamForm(prev => ({ ...prev, team_avatar: emoji }))}
                    className={`text-3xl p-2 rounded-lg border-2 hover:border-int-orange transition-all ${
                      teamForm.team_avatar === emoji ? 'border-int-orange bg-orange-50' : 'border-slate-200'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>Team Name</Label>
              <Input
                value={teamForm.team_name}
                onChange={(e) => setTeamForm(prev => ({ ...prev, team_name: e.target.value }))}
                placeholder="Enter team name..."
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={teamForm.description}
                onChange={(e) => setTeamForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="What's your team about?"
                rows={3}
              />
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowCreateDialog(false)} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={() => createTeamMutation.mutate(teamForm)}
              disabled={!teamForm.team_name || createTeamMutation.isLoading}
              className="flex-1 bg-int-orange hover:bg-[#C46322] text-white"
            >
              Create Team
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}