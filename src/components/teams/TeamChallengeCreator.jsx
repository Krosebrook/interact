import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Trophy, Target, Users, Calendar, Award } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';
import { toast } from 'sonner';

export default function TeamChallengeCreator({ teamId }) {
  const [goalDescription, setGoalDescription] = useState('');
  const [durationDays, setDurationDays] = useState('30');
  const queryClient = useQueryClient();

  const { data: teams } = useQuery({
    queryKey: ['teams'],
    queryFn: () => base44.entities.Team.list()
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('aiTeamChallengeGenerator', {
        team_id: teamId,
        goal_description: goalDescription,
        duration_days: parseInt(durationDays)
      });
      return response.data;
    }
  });

  const createChallengeMutation = useMutation({
    mutationFn: async (challengeData) => {
      return await base44.entities.TeamChallenge.create(challengeData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-challenges'] });
      toast.success('Team challenge created!');
      setGoalDescription('');
      generateMutation.reset();
    }
  });

  const challenge = generateMutation.data?.challenge;

  return (
    <div className="space-y-6">
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            AI Team Challenge Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Challenge Goal</label>
            <Textarea
              placeholder="e.g., 'Improve cross-team collaboration and knowledge sharing'"
              value={goalDescription}
              onChange={(e) => setGoalDescription(e.target.value)}
              rows={3}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Duration (Days)</label>
            <Input
              type="number"
              value={durationDays}
              onChange={(e) => setDurationDays(e.target.value)}
              min="7"
              max="90"
            />
          </div>
          <Button
            onClick={() => generateMutation.mutate()}
            disabled={!goalDescription || generateMutation.isPending}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Generate Challenge
          </Button>
        </CardContent>
      </Card>

      {/* Loading */}
      {generateMutation.isPending && (
        <LoadingSpinner message="Designing team challenge..." />
      )}

      {/* Challenge Preview */}
      {challenge && (
        <div className="space-y-4">
          <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">{challenge.challenge_name}</h2>
                  <p className="text-slate-700">{challenge.description}</p>
                </div>
                <Trophy className="h-8 w-8 text-purple-600" />
              </div>
              
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="text-center p-3 bg-white rounded-lg">
                  <Calendar className="h-5 w-5 mx-auto mb-1 text-purple-600" />
                  <div className="text-lg font-bold">{challenge.duration_days}</div>
                  <div className="text-xs text-slate-600">Days</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg">
                  <Target className="h-5 w-5 mx-auto mb-1 text-purple-600" />
                  <div className="text-lg font-bold">{challenge.target_metric.target_value}</div>
                  <div className="text-xs text-slate-600 capitalize">{challenge.target_metric.metric_type.replace('_', ' ')}</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg">
                  <Award className="h-5 w-5 mx-auto mb-1 text-purple-600" />
                  <div className="text-lg font-bold">x{challenge.team_incentives.bonus_multiplier}</div>
                  <div className="text-xs text-slate-600">Points Multiplier</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Milestones */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Challenge Milestones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {challenge.milestones?.map((milestone, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <div className="font-medium text-sm">{milestone.milestone_name}</div>
                      <div className="text-xs text-slate-600">{milestone.description}</div>
                    </div>
                    <Badge className="bg-amber-100 text-amber-800">
                      +{milestone.reward_points} pts
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recommended Activities */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recommended Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {challenge.recommended_activities?.map((activity, idx) => (
                  <div key={idx} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{activity.activity_name}</div>
                        <div className="text-xs text-slate-600 mt-1">{activity.reason}</div>
                      </div>
                      <Badge variant="outline" className="capitalize">{activity.frequency}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Rewards & Tactics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Team Incentives</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <strong>Individual:</strong> {challenge.team_incentives.individual_rewards}
                </div>
                <div>
                  <strong>Team:</strong> {challenge.team_incentives.team_reward}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Engagement Tactics</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1 text-sm">
                  {challenge.engagement_tactics?.map((tactic, idx) => (
                    <li key={idx}>• {tactic}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Create Button */}
          <Button
            onClick={() => createChallengeMutation.mutate({
              team_id: teamId,
              challenge_name: challenge.challenge_name,
              description: challenge.description,
              challenge_type: challenge.challenge_type,
              start_date: new Date().toISOString(),
              end_date: new Date(Date.now() + challenge.duration_days * 24 * 60 * 60 * 1000).toISOString(),
              target_metric: challenge.target_metric,
              status: 'active',
              created_by: user.email
            })}
            disabled={createChallengeMutation.isPending}
            className="w-full bg-purple-600 hover:bg-purple-700"
            size="lg"
          >
            <Trophy className="h-5 w-5 mr-2" />
            Create Team Challenge
          </Button>
        </div>
      )}
    </div>
  );
}