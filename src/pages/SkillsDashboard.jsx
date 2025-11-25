import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useUserData } from '../components/hooks/useUserData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import PageHeader from '../components/common/PageHeader';
import LoadingSpinner from '../components/common/LoadingSpinner';
import UserSkillDashboard from '../components/skills/UserSkillDashboard';
import AISkillAnalyzer from '../components/skills/AISkillAnalyzer';
import SkillDevelopmentCorrelation from '../components/analytics/SkillDevelopmentCorrelation';
import { GraduationCap, Brain, BarChart3, Users, TrendingUp } from 'lucide-react';

export default function SkillsDashboard() {
  const { user, loading, isAdmin } = useUserData(true);
  const [selectedTeam, setSelectedTeam] = useState('all');

  const { data: participations = [] } = useQuery({
    queryKey: ['participations'],
    queryFn: () => base44.entities.Participation.list('-created_date', 500)
  });

  const { data: events = [] } = useQuery({
    queryKey: ['events'],
    queryFn: () => base44.entities.Event.list()
  });

  const { data: activities = [] } = useQuery({
    queryKey: ['activities'],
    queryFn: () => base44.entities.Activity.list()
  });

  const { data: userProfiles = [] } = useQuery({
    queryKey: ['user-profiles'],
    queryFn: () => base44.entities.UserProfile.list()
  });

  const { data: teams = [] } = useQuery({
    queryKey: ['teams'],
    queryFn: () => base44.entities.Team.list()
  });

  const { data: allSkillTracking = [] } = useQuery({
    queryKey: ['all-skill-tracking'],
    queryFn: () => base44.entities.SkillTracking.list('-proficiency_score', 500),
    enabled: isAdmin
  });

  // Calculate organization-wide stats
  const uniqueSkills = [...new Set(allSkillTracking.map(s => s.skill_name))].length;
  const usersWithSkills = [...new Set(allSkillTracking.map(s => s.user_email))].length;
  const mentorCount = allSkillTracking.filter(s => s.mentorship_status === 'is_mentor').length;
  const avgProficiency = allSkillTracking.length > 0
    ? Math.round(allSkillTracking.reduce((sum, s) => sum + (s.proficiency_score || 0), 0) / allSkillTracking.length)
    : 0;

  // Top skills across organization
  const skillCounts = allSkillTracking.reduce((acc, s) => {
    acc[s.skill_name] = (acc[s.skill_name] || 0) + 1;
    return acc;
  }, {});
  const topSkills = Object.entries(skillCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }));

  if (loading || !user) {
    return <LoadingSpinner className="min-h-[60vh]" />;
  }

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Skills Development" 
        description="Track skill growth, find mentors, and get personalized learning recommendations"
      />

      {/* Organization Stats (Admin only) */}
      {isAdmin && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-int-navy to-[#4A6070] text-white">
            <CardContent className="pt-4">
              <div className="text-sm opacity-80">Unique Skills Tracked</div>
              <div className="text-3xl font-bold">{uniqueSkills}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Users className="h-4 w-4" />
                Users with Skills
              </div>
              <div className="text-2xl font-bold">{usersWithSkills}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <GraduationCap className="h-4 w-4" />
                Active Mentors
              </div>
              <div className="text-2xl font-bold text-purple-600">{mentorCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <TrendingUp className="h-4 w-4" />
                Avg Proficiency
              </div>
              <div className="text-2xl font-bold text-green-600">{avgProficiency}%</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue={isAdmin ? "overview" : "my-skills"} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          {isAdmin && (
            <TabsTrigger value="overview">
              <BarChart3 className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
          )}
          <TabsTrigger value="my-skills">
            <GraduationCap className="h-4 w-4 mr-2" />
            My Skills
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="ai-analysis">
              <Brain className="h-4 w-4 mr-2" />
              AI Analysis
            </TabsTrigger>
          )}
          {isAdmin && (
            <TabsTrigger value="correlation">
              <TrendingUp className="h-4 w-4 mr-2" />
              Correlation
            </TabsTrigger>
          )}
        </TabsList>

        {isAdmin && (
          <TabsContent value="overview" className="space-y-6">
            {/* Team Filter */}
            <div className="flex justify-end">
              <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by team" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Teams</SelectItem>
                  {teams.map(team => (
                    <SelectItem key={team.id} value={team.id}>{team.team_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Top Skills */}
            <Card>
              <CardHeader>
                <CardTitle>Most Common Skills Across Organization</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topSkills.map((skill, i) => (
                    <div key={skill.name} className="flex items-center gap-4">
                      <span className="w-6 text-sm font-medium text-slate-500">{i + 1}.</span>
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className="font-medium">{skill.name}</span>
                          <span className="text-sm text-slate-500">{skill.count} users</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-int-orange rounded-full"
                            style={{ width: `${(skill.count / topSkills[0].count) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  {topSkills.length === 0 && (
                    <p className="text-slate-500 text-center py-8">
                      No skills tracked yet. Users will build their skill profiles through event participation.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Mentorship Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-500" />
                  Mentorship Network
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-3xl font-bold text-purple-600">
                      {allSkillTracking.filter(s => s.mentorship_status === 'is_mentor').length}
                    </div>
                    <div className="text-sm text-slate-600">Active Mentors</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-3xl font-bold text-blue-600">
                      {allSkillTracking.filter(s => s.mentorship_status === 'seeking_mentor').length}
                    </div>
                    <div className="text-sm text-slate-600">Seeking Mentors</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-3xl font-bold text-green-600">
                      {allSkillTracking.filter(s => s.mentorship_status === 'has_mentor').length}
                    </div>
                    <div className="text-sm text-slate-600">Active Pairings</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="my-skills">
          <UserSkillDashboard 
            userEmail={user.email} 
            userName={user.full_name}
          />
        </TabsContent>

        {isAdmin && (
          <TabsContent value="ai-analysis">
            <AISkillAnalyzer
              participations={participations}
              events={events}
              activities={activities}
              userProfiles={userProfiles}
              teams={teams}
              scope="organization"
            />
          </TabsContent>
        )}

        {isAdmin && (
          <TabsContent value="correlation">
            <SkillDevelopmentCorrelation
              participations={participations}
              userProfiles={userProfiles}
              events={events}
              activities={activities}
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}