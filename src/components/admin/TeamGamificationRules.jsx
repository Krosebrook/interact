/**
 * Team-Specific Gamification Rules Manager
 * Configure rules that apply only to specific teams
 */

import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Zap, Users } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';

export default function TeamGamificationRules() {
  const [selectedTeam, setSelectedTeam] = useState('');
  const queryClient = useQueryClient();

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['teams-list'],
    queryFn: () => base44.entities.Team.list()
  });

  const { data: teamRules, isLoading: rulesLoading } = useQuery({
    queryKey: ['team-rules', selectedTeam],
    queryFn: () =>
      base44.entities.GamificationRule.filter({
        team_id: selectedTeam,
        scope: 'team'
      }),
    enabled: !!selectedTeam
  });

  const createTeamRuleMutation = useMutation({
    mutationFn: async (ruleData) => {
      return base44.entities.GamificationRule.create({
        ...ruleData,
        scope: 'team',
        team_id: selectedTeam,
        is_active: true
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['team-rules']);
    }
  });

  if (teamsLoading) return <LoadingSpinner />;

  const currentTeam = selectedTeam || teams?.[0]?.id;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Team Gamification Rules</h2>
          <p className="text-sm text-slate-600">Configure team-specific point rules and bonuses</p>
        </div>
      </div>

      {/* Team Selector */}
      <div className="flex gap-4 items-center">
        <Select value={currentTeam} onValueChange={setSelectedTeam}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Select team" />
          </SelectTrigger>
          <SelectContent>
            {teams?.map((team) => (
              <SelectItem key={team.id} value={team.id}>
                {team.team_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Team Rules */}
      {rulesLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="space-y-4">
          {teamRules?.length > 0 ? (
            teamRules.map((rule) => (
              <Card key={rule.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900">{rule.rule_name}</h3>
                      <p className="text-sm text-slate-600 mt-1">{rule.description}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge>
                          {rule.actions?.award_points} points
                        </Badge>
                        <Badge variant="outline">{rule.logic} logic</Badge>
                      </div>
                    </div>
                    <Badge className={rule.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}>
                      {rule.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="border-dashed">
              <CardContent className="pt-12 pb-12 text-center">
                <Zap className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="font-semibold text-slate-900 mb-2">No Team Rules Yet</h3>
                <p className="text-sm text-slate-600 mb-4">
                  Create custom rules specific to this team
                </p>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Team Rule
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Quick Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Team Rule Templates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <RuleTemplate
            title="Team Event Bonus"
            description="Award +50 bonus points for team events"
            onClick={() => {
              createTeamRuleMutation.mutate({
                rule_name: `${teams?.find(t => t.id === currentTeam)?.team_name} Event Bonus`,
                description: 'Bonus points for attending team events',
                rule_type: 'points',
                conditions: [
                  { entity: 'Event', field: 'team_id', operator: 'equals', value: currentTeam },
                  { entity: 'Participation', field: 'attendance_status', operator: 'equals', value: 'attended' }
                ],
                logic: 'AND',
                actions: { award_points: 50 }
              });
            }}
          />
          <RuleTemplate
            title="Internal Recognition Multiplier"
            description="2x points for team-internal recognition"
            onClick={() => {
              createTeamRuleMutation.mutate({
                rule_name: `${teams?.find(t => t.id === currentTeam)?.team_name} Recognition Boost`,
                description: 'Double points for recognizing teammates',
                rule_type: 'points',
                conditions: [
                  { entity: 'Recognition', field: 'status', operator: 'equals', value: 'approved' }
                ],
                logic: 'AND',
                actions: { award_points: 40 }
              });
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function RuleTemplate({ title, description, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left p-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors"
    >
      <p className="font-medium text-slate-900 text-sm">{title}</p>
      <p className="text-xs text-slate-600 mt-1">{description}</p>
    </button>
  );
}