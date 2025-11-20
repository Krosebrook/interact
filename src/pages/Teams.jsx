import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import TeamCard from '../components/teams/TeamCard';
import TeamChallengeCard from '../components/teams/TeamChallengeCard';
import { Users, Plus, Trophy, Target, Zap } from 'lucide-react';
import { toast } from 'sonner';

export default function Teams() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [showCreateChallenge, setShowCreateChallenge] = useState(false);
  const [teamForm, setTeamForm] = useState({
    team_name: '',
    description: '',
    avatar: '🚀',
    color: '#6366f1'
  });
  const [challengeForm, setChallengeForm] = useState({
    title: '',
    description: '',
    goal_type: 'points',
    goal_value: 100,
    end_date: '',
    prize: ''
  });

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.log('Not logged in');
      }
    };
    loadUser();
  }, []);

  const { data: teams = [] } = useQuery({
    queryKey: ['teams'],
    queryFn: () => base44.entities.Team.list('-total_points')
  });

  const { data: challenges = [] } = useQuery({
    queryKey: ['challenges'],
    queryFn: () => base44.entities.TeamChallenge.list('-created_date')
  });

  const { data: userStats = [] } = useQuery({
    queryKey: ['user-stats'],
    queryFn: () => base44.entities.UserStats.list()
  });

  const createTeamMutation = useMutation({
    mutationFn: (data) => base44.entities.Team.create({
      ...data,
      captain_email: user.email,
      members: [user.email],
      total_points: 0
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['teams']);
      setShowCreateTeam(false);
      setTeamForm({ team_name: '', description: '', avatar: '🚀', color: '#6366f1' });
      toast.success('Team created! 🎉');
    }
  });

  const createChallengeMutation = useMutation({
    mutationFn: (data) => base44.entities.TeamChallenge.create({
      ...data,
      status: 'active',
      participating_teams: [],
      progress: {}
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['challenges']);
      setShowCreateChallenge(false);
      setChallengeForm({
        title: '',
        description: '',
        goal_type: 'points',
        goal_value: 100,
        end_date: '',
        prize: ''
      });
      toast.success('Challenge created! 🏆');
    }
  });

  const myTeam = teams.find(t => t.members?.includes(user?.email));
  const activeChallenges = challenges.filter(c => c.status === 'active');
  const completedChallenges = challenges.filter(c => c.status === 'completed');

  const teamEmojis = ['🚀', '⚡', '🔥', '💎', '🌟', '🎯', '👑', '🦄', '🐉', '🎨'];
  const teamColors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#f43f5e', '#84cc16'];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Users className="h-8 w-8 text-indigo-600" />
            Teams & Challenges
          </h1>
          <p className="text-slate-600 mt-2">Collaborate, compete, and achieve together</p>
        </div>
        <div className="flex gap-3">
          {user?.role === 'admin' && (
            <Button
              onClick={() => setShowCreateChallenge(true)}
              className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
            >
              <Trophy className="h-4 w-4 mr-2" />
              Create Challenge
            </Button>
          )}
          {!myTeam && (
            <Button
              onClick={() => setShowCreateTeam(true)}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Team
            </Button>
          )}
        </div>
      </div>

      {/* My Team Card */}
      {myTeam && (
        <Card className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div 
                className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl"
                style={{ backgroundColor: myTeam.color + '20' }}
              >
                {myTeam.avatar}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900">{myTeam.team_name}</h3>
                <p className="text-slate-600">{myTeam.description}</p>
                <Badge className="mt-2">Your Team</Badge>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-indigo-600">
                {myTeam.total_points}
              </div>
              <div className="text-sm text-slate-600">Team Points</div>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-slate-600">
              <Users className="inline h-4 w-4 mr-1" />
              {myTeam.members?.length || 0} members
            </span>
            <span className="text-slate-600">
              <Target className="inline h-4 w-4 mr-1" />
              {myTeam.active_challenges?.length || 0} active challenges
            </span>
          </div>
        </Card>
      )}

      <Tabs defaultValue="teams" className="w-full">
        <TabsList>
          <TabsTrigger value="teams">
            <Users className="h-4 w-4 mr-2" />
            All Teams
          </TabsTrigger>
          <TabsTrigger value="challenges">
            <Trophy className="h-4 w-4 mr-2" />
            Challenges
          </TabsTrigger>
        </TabsList>

        <TabsContent value="teams" className="space-y-4">
          {teams.length === 0 ? (
            <Card className="p-12 text-center">
              <Users className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">No teams yet</h3>
              <p className="text-slate-600 mb-4">Be the first to create a team!</p>
              <Button onClick={() => setShowCreateTeam(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Team
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teams.map((team, index) => (
                <TeamCard
                  key={team.id}
                  team={team}
                  rank={index + 1}
                  userStats={userStats}
                  currentUserEmail={user?.email}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="challenges" className="space-y-6">
          {activeChallenges.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Zap className="h-5 w-5 text-orange-600" />
                Active Challenges
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activeChallenges.map(challenge => (
                  <TeamChallengeCard
                    key={challenge.id}
                    challenge={challenge}
                    teams={teams}
                    myTeam={myTeam}
                  />
                ))}
              </div>
            </div>
          )}

          {completedChallenges.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">Completed Challenges</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {completedChallenges.map(challenge => (
                  <TeamChallengeCard
                    key={challenge.id}
                    challenge={challenge}
                    teams={teams}
                    myTeam={myTeam}
                  />
                ))}
              </div>
            </div>
          )}

          {challenges.length === 0 && (
            <Card className="p-12 text-center">
              <Trophy className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">No challenges yet</h3>
              <p className="text-slate-600">Check back soon for team challenges!</p>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Team Dialog */}
      <Dialog open={showCreateTeam} onOpenChange={setShowCreateTeam}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Your Team</DialogTitle>
            <DialogDescription>
              Start building your dream team and compete together
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Team Name</Label>
              <Input
                value={teamForm.team_name}
                onChange={(e) => setTeamForm(prev => ({ ...prev, team_name: e.target.value }))}
                placeholder="The Avengers"
              />
            </div>
            <div>
              <Label>Team Motto</Label>
              <Textarea
                value={teamForm.description}
                onChange={(e) => setTeamForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Together we achieve greatness!"
                rows={2}
              />
            </div>
            <div>
              <Label>Team Icon</Label>
              <div className="flex gap-2 flex-wrap">
                {teamEmojis.map(emoji => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setTeamForm(prev => ({ ...prev, avatar: emoji }))}
                    className={`w-12 h-12 rounded-lg text-2xl transition ${
                      teamForm.avatar === emoji
                        ? 'bg-indigo-100 ring-2 ring-indigo-500'
                        : 'bg-slate-100 hover:bg-slate-200'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>Team Color</Label>
              <div className="flex gap-2 flex-wrap">
                {teamColors.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setTeamForm(prev => ({ ...prev, color }))}
                    className={`w-10 h-10 rounded-lg transition ${
                      teamForm.color === color ? 'ring-2 ring-slate-900' : ''
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <Button
              onClick={() => createTeamMutation.mutate(teamForm)}
              disabled={!teamForm.team_name}
              className="w-full"
            >
              Create Team
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Challenge Dialog */}
      <Dialog open={showCreateChallenge} onOpenChange={setShowCreateChallenge}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Team Challenge</DialogTitle>
            <DialogDescription>
              Set up a challenge for teams to compete
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Challenge Title</Label>
              <Input
                value={challengeForm.title}
                onChange={(e) => setChallengeForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Monthly Points Sprint"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={challengeForm.description}
                onChange={(e) => setChallengeForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="First team to reach the goal wins..."
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Goal Type</Label>
                <select
                  value={challengeForm.goal_type}
                  onChange={(e) => setChallengeForm(prev => ({ ...prev, goal_type: e.target.value }))}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="points">Total Points</option>
                  <option value="events">Events Attended</option>
                  <option value="activities">Activities Completed</option>
                </select>
              </div>
              <div>
                <Label>Target Value</Label>
                <Input
                  type="number"
                  value={challengeForm.goal_value}
                  onChange={(e) => setChallengeForm(prev => ({ ...prev, goal_value: parseInt(e.target.value) }))}
                />
              </div>
            </div>
            <div>
              <Label>End Date</Label>
              <Input
                type="date"
                value={challengeForm.end_date}
                onChange={(e) => setChallengeForm(prev => ({ ...prev, end_date: e.target.value }))}
              />
            </div>
            <div>
              <Label>Prize (Optional)</Label>
              <Input
                value={challengeForm.prize}
                onChange={(e) => setChallengeForm(prev => ({ ...prev, prize: e.target.value }))}
                placeholder="Trophy + Team Lunch"
              />
            </div>
            <Button
              onClick={() => createChallengeMutation.mutate(challengeForm)}
              disabled={!challengeForm.title || !challengeForm.end_date}
              className="w-full"
            >
              Create Challenge
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}