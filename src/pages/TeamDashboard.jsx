import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Trophy, MessageSquare, Target, Send, TrendingUp, Award } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserData } from '../components/hooks/useUserData';
import { useTeamData } from '../components/hooks/useTeamData';
import TeamBadgeDisplay from '../components/teams/TeamBadgeDisplay';
import AchievementCelebration from '../components/gamification/AchievementCelebration';

export default function TeamDashboard() {
  const queryClient = useQueryClient();
  const { user, loading } = useUserData(true);
  const [message, setMessage] = useState('');
  const [achievementToShow, setAchievementToShow] = useState(null);
  const urlParams = new URLSearchParams(window.location.search);
  const teamId = urlParams.get('teamId');

  const { team, teamMembers, teamMessages: messages, challenges } = useTeamData(teamId);

  const sendMessageMutation = useMutation({
    mutationFn: (msg) => base44.entities.TeamMessage.create({
      team_id: teamId,
      sender_email: user.email,
      sender_name: user.full_name,
      message: msg
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['team-messages']);
      setMessage('');
    }
  });

  const joinChallengeMutation = useMutation({
    mutationFn: async (challenge) => {
      const updatedTeams = [...(challenge.participating_teams || [])];
      if (!updatedTeams.includes(teamId)) {
        updatedTeams.push(teamId);
      }
      return base44.entities.TeamChallenge.update(challenge.id, {
        participating_teams: updatedTeams
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['team-challenges']);
      toast.success('Joined challenge! 🎯');
    }
  });

  const handleSendMessage = () => {
    if (!message.trim()) return;
    sendMessageMutation.mutate(message);
  };

  const activeChallenges = challenges.filter(c => 
    c.status === 'active' && c.participating_teams?.includes(teamId)
  );

  const availableChallenges = challenges.filter(c => 
    c.status === 'active' && !c.participating_teams?.includes(teamId)
  );

  if (loading || !user || !team) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-int-orange"></div>
      </div>
    );
  }

  const isLeader = team.team_leader_email === user.email;

  return (
    <div className="space-y-6">
      {/* Team Header */}
      <Card className="border-2 border-int-orange bg-gradient-to-br from-orange-50 to-slate-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-5xl">{team.team_avatar}</span>
              <div>
                <CardTitle className="text-2xl text-int-navy">{team.team_name}</CardTitle>
                <p className="text-slate-600">{team.description}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-int-orange">{team.total_points}</div>
              <div className="text-sm text-slate-600">Team Points</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-int-navy" />
              <span className="font-semibold">{team.member_count} Members</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-int-orange" />
              <span className="font-semibold">{team.badges_earned?.length || 0} Badges</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="chat" className="space-y-6">
        <TabsList className="bg-slate-100">
          <TabsTrigger value="chat">
            <MessageSquare className="h-4 w-4 mr-2" />
            Team Chat
          </TabsTrigger>
          <TabsTrigger value="members">
            <Users className="h-4 w-4 mr-2" />
            Members
          </TabsTrigger>
          <TabsTrigger value="challenges">
            <Target className="h-4 w-4 mr-2" />
            Challenges
          </TabsTrigger>
          <TabsTrigger value="badges">
            <Award className="h-4 w-4 mr-2" />
            Team Badges
          </TabsTrigger>
        </TabsList>

        {/* Team Chat */}
        <TabsContent value="chat">
          <Card className="border-2 border-int-navy/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-int-orange" />
                Team Communication
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-96 overflow-y-auto space-y-3 bg-slate-50 rounded-lg p-4">
                <AnimatePresence>
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`${
                        msg.sender_email === user.email
                          ? 'ml-auto bg-int-orange text-white'
                          : 'bg-white border border-slate-200'
                      } max-w-[80%] rounded-lg p-3`}
                    >
                      {msg.sender_email !== user.email && (
                        <div className="text-xs font-semibold text-int-navy mb-1">
                          {msg.sender_name}
                        </div>
                      )}
                      <div className={msg.sender_email === user.email ? 'text-white' : 'text-slate-700'}>
                        {msg.message}
                      </div>
                      <div className={`text-xs mt-1 ${
                        msg.sender_email === user.email ? 'text-orange-100' : 'text-slate-500'
                      }`}>
                        {new Date(msg.created_date).toLocaleTimeString()}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
              <div className="flex gap-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..."
                  className="flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!message.trim() || sendMessageMutation.isLoading}
                  className="bg-int-orange hover:bg-[#C46322] text-white"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Members */}
        <TabsContent value="members">
          <Card>
            <CardHeader>
              <CardTitle>Team Members ({teamMembers.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {teamMembers.sort((a, b) => b.total_points - a.total_points).map((member, index) => (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-int-navy text-white flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-semibold flex items-center gap-2">
                          {member.user_email}
                          {member.user_email === team.team_leader_email && (
                            <Badge className="bg-[#F5C16A] text-int-navy">Leader</Badge>
                          )}
                        </div>
                        <div className="text-sm text-slate-600">
                          Level {member.level} • {member.total_points} points
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-slate-600">Contributed</div>
                      <div className="font-bold text-int-orange">{member.total_points} pts</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Challenges */}
        <TabsContent value="challenges">
          <div className="space-y-6">
            {/* Active Challenges */}
            {activeChallenges.length > 0 && (
              <Card className="border-2 border-int-orange">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-int-orange" />
                    Active Challenges
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {activeChallenges.map(challenge => (
                      <div key={challenge.id} className="p-4 bg-orange-50 rounded-lg border-2 border-int-orange">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-bold text-int-navy">{challenge.challenge_name}</h4>
                            <p className="text-sm text-slate-600">{challenge.description}</p>
                          </div>
                          <Badge className="bg-int-orange text-white">
                            {challenge.reward_points} pts
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-slate-600">
                            Target: {challenge.target_value} {challenge.challenge_type}
                          </span>
                          <span className="text-slate-600">
                            Ends: {new Date(challenge.end_date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Available Challenges */}
            {availableChallenges.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Available Challenges</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {availableChallenges.map(challenge => (
                      <div key={challenge.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-bold text-slate-900">{challenge.challenge_name}</h4>
                            <p className="text-sm text-slate-600">{challenge.description}</p>
                          </div>
                          <Badge variant="outline">{challenge.reward_points} pts</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">
                            Target: {challenge.target_value} {challenge.challenge_type}
                          </span>
                          {isLeader && (
                            <Button
                              size="sm"
                              onClick={() => joinChallengeMutation.mutate(challenge)}
                              className="bg-int-orange hover:bg-[#C46322] text-white"
                            >
                              Join Challenge
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Team Badges Tab */}
        <TabsContent value="badges">
          <TeamBadgeDisplay teamId={teamId} teamData={team} />
        </TabsContent>
      </Tabs>

      {/* Achievement Celebration */}
      <AchievementCelebration
        show={!!achievementToShow}
        onClose={() => setAchievementToShow(null)}
        achievement={achievementToShow}
      />
    </div>
  );
}