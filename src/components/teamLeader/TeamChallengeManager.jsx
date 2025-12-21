import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Plus, Target, Trophy, Calendar, Users, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function TeamChallengeManager({ team, challenges }) {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const createChallengeMutation = useMutation({
    mutationFn: (data) => base44.entities.TeamChallenge.create({
      ...data,
      participating_teams: [team.id],
      created_by: team.leader_email,
      status: 'upcoming'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['team-challenges']);
      setIsCreateOpen(false);
      toast.success('Team challenge created! 🎯');
    },
    onError: () => {
      toast.error('Failed to create challenge');
    }
  });

  const activeChallenges = challenges.filter(c => c.status === 'active');
  const upcomingChallenges = challenges.filter(c => c.status === 'upcoming');
  const completedChallenges = challenges.filter(c => c.status === 'completed');

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-int-navy">Team Challenges</h2>
          <p className="text-slate-600">Create and manage challenges for your team</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-int-orange hover:bg-int-orange/90 gap-2">
              <Plus className="h-4 w-4" />
              Create Challenge
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Team Challenge</DialogTitle>
            </DialogHeader>
            <ChallengeForm
              onSubmit={(data) => createChallengeMutation.mutate(data)}
              onCancel={() => setIsCreateOpen(false)}
              isSubmitting={createChallengeMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Active Challenges */}
      {activeChallenges.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-int-navy mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
            Active Challenges
          </h3>
          <div className="grid gap-4">
            {activeChallenges.map(challenge => (
              <ChallengeCard key={challenge.id} challenge={challenge} team={team} />
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Challenges */}
      {upcomingChallenges.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-int-navy mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Upcoming Challenges
          </h3>
          <div className="grid gap-4">
            {upcomingChallenges.map(challenge => (
              <ChallengeCard key={challenge.id} challenge={challenge} team={team} />
            ))}
          </div>
        </div>
      )}

      {/* Completed Challenges */}
      {completedChallenges.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-int-navy mb-4 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-int-gold" />
            Completed Challenges
          </h3>
          <div className="grid gap-4">
            {completedChallenges.map(challenge => (
              <ChallengeCard key={challenge.id} challenge={challenge} team={team} isCompleted />
            ))}
          </div>
        </div>
      )}

      {challenges.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Target className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No challenges yet</h3>
            <p className="text-slate-600 mb-4">Create your first team challenge to boost engagement</p>
            <Button onClick={() => setIsCreateOpen(true)} className="bg-int-orange hover:bg-int-orange/90">
              Create First Challenge
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ChallengeCard({ challenge, team, isCompleted }) {
  const statusColors = {
    upcoming: 'bg-blue-100 text-blue-800',
    active: 'bg-emerald-100 text-emerald-800',
    completed: 'bg-slate-100 text-slate-800'
  };

  const isWinner = challenge.winner_team_id === team.id;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <CardTitle className="text-xl">{challenge.title}</CardTitle>
              <Badge className={statusColors[challenge.status]}>
                {challenge.status}
              </Badge>
              {isCompleted && isWinner && (
                <Badge className="bg-int-gold text-slate-900">
                  <Trophy className="h-3 w-3 mr-1" />
                  Winner
                </Badge>
              )}
            </div>
            <CardDescription>{challenge.description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-slate-600">Type</p>
            <p className="font-medium capitalize">{challenge.challenge_type?.replace('_', ' ')}</p>
          </div>
          {challenge.start_date && (
            <div>
              <p className="text-slate-600">Start Date</p>
              <p className="font-medium">{format(new Date(challenge.start_date), 'MMM d')}</p>
            </div>
          )}
          {challenge.end_date && (
            <div>
              <p className="text-slate-600">End Date</p>
              <p className="font-medium">{format(new Date(challenge.end_date), 'MMM d')}</p>
            </div>
          )}
          {challenge.prize_description && (
            <div>
              <p className="text-slate-600">Prize</p>
              <p className="font-medium">{challenge.prize_description}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ChallengeForm({ onSubmit, onCancel, isSubmitting }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    challenge_type: 'points_race',
    start_date: '',
    end_date: '',
    prize_description: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Challenge Title</Label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="e.g., Monthly Engagement Sprint"
          required
        />
      </div>

      <div>
        <Label>Description</Label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="What's the goal of this challenge?"
          rows={3}
          required
        />
      </div>

      <div>
        <Label>Challenge Type</Label>
        <Select
          value={formData.challenge_type}
          onValueChange={(value) => setFormData({ ...formData, challenge_type: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="points_race">Points Race</SelectItem>
            <SelectItem value="activity_count">Activity Count</SelectItem>
            <SelectItem value="engagement">Engagement Challenge</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Start Date</Label>
          <Input
            type="date"
            value={formData.start_date}
            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
            required
          />
        </div>
        <div>
          <Label>End Date</Label>
          <Input
            type="date"
            value={formData.end_date}
            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
            required
          />
        </div>
      </div>

      <div>
        <Label>Prize/Reward (Optional)</Label>
        <Input
          value={formData.prize_description}
          onChange={(e) => setFormData({ ...formData, prize_description: e.target.value })}
          placeholder="e.g., Team lunch, Extra PTO day"
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} className="bg-int-orange hover:bg-int-orange/90">
          {isSubmitting ? 'Creating...' : 'Create Challenge'}
        </Button>
      </div>
    </form>
  );
}