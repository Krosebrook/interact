import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Swords, 
  Trophy, 
  Users, 
  Target,
  Award,
  Zap,
  Calendar,
  Save,
  Plus
} from 'lucide-react';
import { toast } from 'sonner';
import { addDays, format } from 'date-fns';

const CHALLENGE_TYPES = [
  { value: 'head_to_head', label: 'Head to Head', description: 'Two teams compete directly', icon: Swords },
  { value: 'league', label: 'League', description: 'All teams compete over time', icon: Trophy },
  { value: 'race', label: 'Race', description: 'First team to reach target wins', icon: Target },
  { value: 'collaborative', label: 'Collaborative', description: 'Teams work together for shared goal', icon: Users }
];

const METRIC_TYPES = [
  { value: 'points', label: 'Total Points' },
  { value: 'events_attended', label: 'Events Attended' },
  { value: 'activities_completed', label: 'Activities Completed' },
  { value: 'feedback_submitted', label: 'Feedback Submitted' },
  { value: 'badges_earned', label: 'Badges Earned' },
  { value: 'streak_days', label: 'Combined Streak Days' }
];

export default function CreateTeamChallengeDialog({ open, onOpenChange, onSuccess }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    challenge_type: 'head_to_head',
    metric_type: 'points',
    target_value: '',
    start_date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    end_date: format(addDays(new Date(), 7), "yyyy-MM-dd'T'HH:mm"),
    points_reward: 100,
    rules: '',
    visibility: 'public',
    selectedTeams: []
  });

  const { data: teams = [] } = useQuery({
    queryKey: ['teams'],
    queryFn: () => base44.entities.Team.list()
  });

  const { data: badges = [] } = useQuery({
    queryKey: ['badges'],
    queryFn: () => base44.entities.Badge.list()
  });

  const createChallengeMutation = useMutation({
    mutationFn: async (data) => {
      const participatingTeams = data.selectedTeams.map(teamId => {
        const team = teams.find(t => t.id === teamId);
        return {
          team_id: teamId,
          team_name: team?.name || 'Unknown',
          current_score: 0,
          rank: 0
        };
      });

      return base44.entities.TeamChallenge.create({
        title: data.title,
        description: data.description,
        challenge_type: data.challenge_type,
        metric_type: data.metric_type,
        target_value: data.target_value ? parseInt(data.target_value) : null,
        start_date: data.start_date,
        end_date: data.end_date,
        points_reward: parseInt(data.points_reward) || 100,
        rules: data.rules,
        visibility: data.visibility,
        participating_teams: participatingTeams,
        status: 'active'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-challenges'] });
      toast.success('Team challenge created successfully!');
      onOpenChange(false);
      resetForm();
      onSuccess?.();
    },
    onError: () => {
      toast.error('Failed to create challenge');
    }
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      challenge_type: 'head_to_head',
      metric_type: 'points',
      target_value: '',
      start_date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      end_date: format(addDays(new Date(), 7), "yyyy-MM-dd'T'HH:mm"),
      points_reward: 100,
      rules: '',
      visibility: 'public',
      selectedTeams: []
    });
  };

  const toggleTeam = (teamId) => {
    setFormData(prev => ({
      ...prev,
      selectedTeams: prev.selectedTeams.includes(teamId)
        ? prev.selectedTeams.filter(id => id !== teamId)
        : [...prev.selectedTeams, teamId]
    }));
  };

  const handleSubmit = () => {
    if (!formData.title || formData.selectedTeams.length < 2) {
      toast.error('Please fill in all required fields and select at least 2 teams');
      return;
    }
    createChallengeMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} data-b44-sync="true" data-feature="teams" data-component="createteamchallengedialog">
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Swords className="h-5 w-5 text-int-orange" />
            Create Team Challenge
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <Label>Challenge Title *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(d => ({ ...d, title: e.target.value }))}
                placeholder="e.g., Q4 Points Battle"
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(d => ({ ...d, description: e.target.value }))}
                placeholder="Describe the challenge..."
                rows={2}
              />
            </div>
          </div>

          {/* Challenge Type */}
          <div>
            <Label>Challenge Type</Label>
            <div className="grid grid-cols-2 gap-3 mt-2">
              {CHALLENGE_TYPES.map(type => {
                const Icon = type.icon;
                const isSelected = formData.challenge_type === type.value;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData(d => ({ ...d, challenge_type: type.value }))}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${
                      isSelected 
                        ? 'border-int-orange bg-int-orange/5' 
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className={`h-4 w-4 ${isSelected ? 'text-int-orange' : 'text-slate-500'}`} />
                      <span className="font-medium text-sm">{type.label}</span>
                    </div>
                    <p className="text-xs text-slate-500">{type.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Metric and Target */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Competition Metric</Label>
              <Select 
                value={formData.metric_type} 
                onValueChange={(v) => setFormData(d => ({ ...d, metric_type: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {METRIC_TYPES.map(m => (
                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {formData.challenge_type === 'race' && (
              <div>
                <Label>Target Value</Label>
                <Input
                  type="number"
                  value={formData.target_value}
                  onChange={(e) => setFormData(d => ({ ...d, target_value: e.target.value }))}
                  placeholder="e.g., 1000"
                />
              </div>
            )}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Start Date</Label>
              <Input
                type="datetime-local"
                value={formData.start_date}
                onChange={(e) => setFormData(d => ({ ...d, start_date: e.target.value }))}
              />
            </div>
            <div>
              <Label>End Date</Label>
              <Input
                type="datetime-local"
                value={formData.end_date}
                onChange={(e) => setFormData(d => ({ ...d, end_date: e.target.value }))}
              />
            </div>
          </div>

          {/* Reward */}
          <div>
            <Label>Winner Reward (Points per Member)</Label>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-int-orange" />
              <Input
                type="number"
                value={formData.points_reward}
                onChange={(e) => setFormData(d => ({ ...d, points_reward: e.target.value }))}
                className="w-32"
              />
              <span className="text-sm text-slate-500">points</span>
            </div>
          </div>

          {/* Team Selection */}
          <div>
            <Label>Select Participating Teams * (min 2)</Label>
            <div className="grid grid-cols-2 gap-2 mt-2 max-h-48 overflow-y-auto p-2 border rounded-lg">
              {teams.map(team => (
                <div
                  key={team.id}
                  onClick={() => toggleTeam(team.id)}
                  className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all ${
                    formData.selectedTeams.includes(team.id)
                      ? 'bg-int-orange/10 border-2 border-int-orange'
                      : 'bg-slate-50 border-2 border-transparent hover:border-slate-200'
                  }`}
                >
                  <Checkbox 
                    checked={formData.selectedTeams.includes(team.id)}
                    className="pointer-events-none"
                  />
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: team.color || '#D97230' }}
                  />
                  <span className="text-sm font-medium">{team.name}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {formData.selectedTeams.length} teams selected
            </p>
          </div>

          {/* Rules */}
          <div>
            <Label>Rules (Optional)</Label>
            <Textarea
              value={formData.rules}
              onChange={(e) => setFormData(d => ({ ...d, rules: e.target.value }))}
              placeholder="Any specific rules or criteria..."
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={createChallengeMutation.isPending || formData.selectedTeams.length < 2}
            className="bg-gradient-orange hover:opacity-90 text-white"
          >
            {createChallengeMutation.isPending ? (
              'Creating...'
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Create Challenge
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}