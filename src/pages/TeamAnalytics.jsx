import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '../components/auth/AuthProvider';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoadingSpinner from '../components/common/LoadingSpinner';
import TeamPerformanceDashboard from '../components/teams/TeamPerformanceDashboard';
import CustomTeamReportBuilder from '../components/teams/CustomTeamReportBuilder';
import { BarChart3, FileText } from 'lucide-react';

export default function TeamAnalytics() {
  const { user } = useAuth();
  const [selectedTeamId, setSelectedTeamId] = useState(null);

  // Fetch user's teams
  const { data: teams = [], isLoading: teamsLoading } = useQuery({
    queryKey: ['my-teams', user?.email],
    queryFn: async () => {
      const memberships = await base44.entities.TeamMembership.filter({ user_email: user?.email });
      const teamIds = memberships.map(m => m.team_id);
      
      if (teamIds.length === 0) return [];
      
      const teams = await Promise.all(
        teamIds.map(id => base44.entities.Team.get(id).catch(() => null))
      );
      
      return teams.filter(t => t !== null);
    },
    enabled: !!user?.email
  });

  // Auto-select first team
  if (!selectedTeamId && teams.length > 0) {
    setSelectedTeamId(teams[0].id);
  }

  if (teamsLoading) {
    return <LoadingSpinner className="min-h-screen" />;
  }

  if (teams.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <BarChart3 className="h-12 w-12 mx-auto text-slate-300 mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Teams Found</h2>
            <p className="text-slate-600">You need to be a member of a team to view analytics.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Team Analytics</h1>
          <p className="text-slate-600">Advanced performance insights and reporting</p>
        </div>
        
        {/* Team Selector */}
        <div className="w-64">
          <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a team" />
            </SelectTrigger>
            <SelectContent>
              {teams.map(team => (
                <SelectItem key={team.id} value={team.id}>
                  {team.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Analytics Content */}
      {selectedTeamId && (
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList>
            <TabsTrigger value="dashboard">
              <BarChart3 className="h-4 w-4 mr-2" />
              Performance Dashboard
            </TabsTrigger>
            <TabsTrigger value="reports">
              <FileText className="h-4 w-4 mr-2" />
              Custom Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <TeamPerformanceDashboard teamId={selectedTeamId} />
          </TabsContent>

          <TabsContent value="reports">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <TeamPerformanceDashboard teamId={selectedTeamId} />
              </div>
              <div>
                <CustomTeamReportBuilder teamId={selectedTeamId} />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}