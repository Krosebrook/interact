import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useUserData } from '../components/hooks/useUserData';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import TeamAutomationManager from '../components/teams/TeamAutomationManager';
import { Bot, Sparkles, TrendingUp, Calendar } from 'lucide-react';

export default function TeamAutomationsPage() {
  const { user, loading: userLoading, isAdmin, isFacilitator } = useUserData(true);

  const { data: teams = [], isLoading: teamsLoading } = useQuery({
    queryKey: ['my-teams', user?.email],
    queryFn: async () => {
      if (isAdmin) {
        return await base44.entities.Team.list();
      }
      const memberships = await base44.entities.TeamMembership.filter({
        user_email: user.email
      });
      const teamIds = memberships.map(m => m.team_id);
      const allTeams = await base44.entities.Team.list();
      return allTeams.filter(t => teamIds.includes(t.id));
    },
    enabled: !!user
  });

  const { data: allAutomations = [] } = useQuery({
    queryKey: ['all-automations'],
    queryFn: () => base44.entities.TeamAutomation.list(),
    enabled: isAdmin || isFacilitator
  });

  if (userLoading || teamsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner message="Loading automations..." />
      </div>
    );
  }

  if (!isAdmin && !isFacilitator) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="py-12 text-center">
            <Bot className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">Only team leaders and admins can manage automations</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const activeAutomations = allAutomations.filter(a => a.is_active).length;
  const checkInAutomations = allAutomations.filter(a => a.automation_type === 'check_in').length;
  const reminderAutomations = allAutomations.filter(a => a.automation_type === 'goal_reminder').length;
  const summaryAutomations = allAutomations.filter(a => a.automation_type === 'activity_summary').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <Bot className="h-8 w-8 text-purple-600" />
          Team Automations
        </h1>
        <p className="text-slate-600 mt-1">
          Automate team processes, reminders, and communications
        </p>
      </div>

      {/* Stats */}
      {isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Active Automations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{activeAutomations}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Check-Ins</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{checkInAutomations}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Reminders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{reminderAutomations}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Summaries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-600">{summaryAutomations}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Info Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Calendar className="h-5 w-5" />
              Team Check-Ins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-blue-800">
              Automatically prompt team members to share progress, blockers, and goals at regular intervals
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-900">
              <TrendingUp className="h-5 w-5" />
              Goal Reminders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-green-800">
              Send automated reminders to update goal progress and notify team when deadlines approach
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-purple-200 bg-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-900">
              <Sparkles className="h-5 w-5" />
              AI Summaries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-purple-800">
              AI-generated weekly summaries of team activities, highlights, and recommendations
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Team Automations */}
      <div className="space-y-6">
        {teams.map((team) => (
          <Card key={team.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {team.name}
                <Badge variant="outline">{team.department}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TeamAutomationManager teamId={team.id} isAdmin={isAdmin || isFacilitator} />
            </CardContent>
          </Card>
        ))}
      </div>

      {teams.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-slate-500">No teams found. Create a team first to set up automations.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}