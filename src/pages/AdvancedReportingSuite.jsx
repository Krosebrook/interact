import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useUserData } from '@/components/hooks/useUserData';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { FileText, Download, TrendingUp, Users, Award, BarChart3, AlertCircle } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

const COLORS = ['#D97230', '#14294D', '#8B5CF6', '#10B981', '#F59E0B', '#EC4899'];

export default function AdvancedReportingSuite() {
  const { user, loading: userLoading, isAdmin } = useUserData(true, true);
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [dateRange, setDateRange] = useState('30');
  
  const { data: allPoints = [] } = useQuery({
    queryKey: ['allUserPoints'],
    queryFn: () => base44.asServiceRole.entities.UserPoints.list('-total_points')
  });
  
  const { data: badges = [] } = useQuery({
    queryKey: ['badges'],
    queryFn: () => base44.entities.Badge.list()
  });
  
  const { data: challenges = [] } = useQuery({
    queryKey: ['personalChallenges'],
    queryFn: () => base44.asServiceRole.entities.PersonalChallenge.list()
  });
  
  const { data: teams = [] } = useQuery({
    queryKey: ['teams'],
    queryFn: () => base44.entities.Team.list()
  });
  
  // Points distribution
  const pointsDistribution = [
    { range: '0-100', count: allPoints.filter(p => p.total_points < 100).length },
    { range: '100-500', count: allPoints.filter(p => p.total_points >= 100 && p.total_points < 500).length },
    { range: '500-1000', count: allPoints.filter(p => p.total_points >= 500 && p.total_points < 1000).length },
    { range: '1000-2000', count: allPoints.filter(p => p.total_points >= 1000 && p.total_points < 2000).length },
    { range: '2000+', count: allPoints.filter(p => p.total_points >= 2000).length }
  ];
  
  // Badge rarity distribution
  const badgesByRarity = badges.reduce((acc, badge) => {
    const rarity = badge.rarity || 'common';
    acc[rarity] = (acc[rarity] || 0) + 1;
    return acc;
  }, {});
  
  const badgeRarityData = Object.entries(badgesByRarity).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value
  }));
  
  // Challenge participation
  const challengeStats = {
    total: challenges.length,
    active: challenges.filter(c => c.status === 'active').length,
    completed: challenges.filter(c => c.status === 'completed').length,
    suggested: challenges.filter(c => c.status === 'suggested').length,
    ai_generated: challenges.filter(c => c.ai_generated).length
  };
  
  const exportReport = async (type, format) => {
    try {
      let reportData;
      
      if (type === 'user_progress') {
        const response = await base44.functions.invoke('generateUserProgressReport', {
          userEmail: user.email,
          startDate: new Date(Date.now() - parseInt(dateRange) * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString()
        });
        reportData = response.data.report;
      } else if (type === 'team_report' && selectedTeam !== 'all') {
        const response = await base44.functions.invoke('generateTeamReport', {
          teamId: selectedTeam
        });
        reportData = response.data.report;
      }
      
      if (!reportData) {
        toast.error('No data to export');
        return;
      }
      
      const exportResponse = await base44.functions.invoke('exportReport', {
        reportType: type,
        reportData,
        format
      });
      
      // Download file
      const blob = new Blob([exportResponse.data], { 
        type: format === 'pdf' ? 'application/pdf' : 'text/csv' 
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}_${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      
      toast.success(`Report exported as ${format.toUpperCase()}!`);
    } catch (error) {
      toast.error('Export failed');
    }
  };
  
  if (userLoading) return <LoadingSpinner />;
  
  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-int-navy">Advanced Reporting Suite</h1>
          <p className="text-slate-600">Comprehensive analytics and insights</p>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 Days</SelectItem>
              <SelectItem value="30">30 Days</SelectItem>
              <SelectItem value="90">90 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Tabs defaultValue="gamification">
        <TabsList>
          <TabsTrigger value="gamification">
            <Award className="h-4 w-4 mr-2" />
            Gamification
          </TabsTrigger>
          <TabsTrigger value="personal">
            <FileText className="h-4 w-4 mr-2" />
            Personal
          </TabsTrigger>
          <TabsTrigger value="teams">
            <Users className="h-4 w-4 mr-2" />
            Teams
          </TabsTrigger>
        </TabsList>
        
        {/* Gamification Analytics */}
        <TabsContent value="gamification" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{allPoints.length}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Total Points</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-int-orange">
                  {allPoints.reduce((sum, p) => sum + (p.total_points || 0), 0).toLocaleString()}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Active Challenges</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-blue-600">{challengeStats.active}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Total Badges</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-purple-600">{badges.length}</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Points Distribution</CardTitle>
                <CardDescription>User distribution across point ranges</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={pointsDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#D97230" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Badge Rarity Distribution</CardTitle>
                <CardDescription>Available badges by rarity</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={badgeRarityData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {badgeRarityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Challenge Participation Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <p className="text-2xl font-bold">{challengeStats.total}</p>
                  <p className="text-xs text-slate-500">Total</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{challengeStats.active}</p>
                  <p className="text-xs text-slate-500">Active</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{challengeStats.completed}</p>
                  <p className="text-xs text-slate-500">Completed</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">{challengeStats.suggested}</p>
                  <p className="text-xs text-slate-500">Suggested</p>
                </div>
                <div className="text-center p-4 bg-int-orange/10 rounded-lg">
                  <p className="text-2xl font-bold text-int-orange">{challengeStats.ai_generated}</p>
                  <p className="text-xs text-slate-500">AI-Generated</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Personal Report */}
        <TabsContent value="personal" className="space-y-6 mt-6">
          <UserProgressReport userEmail={user?.email} onExport={exportReport} />
        </TabsContent>
        
        {/* Team Reports */}
        <TabsContent value="teams" className="space-y-6 mt-6">
          <div className="flex items-center gap-3">
            <Select value={selectedTeam} onValueChange={setSelectedTeam}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select team..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Teams</SelectItem>
                {teams.map(team => (
                  <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {selectedTeam !== 'all' ? (
            <TeamAnalyticsReport teamId={selectedTeam} onExport={exportReport} />
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Users className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                <p className="text-slate-600">Select a team to view detailed analytics</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// User Progress Report Component
function UserProgressReport({ userEmail, onExport }) {
  const { data: report, isLoading } = useQuery({
    queryKey: ['userProgressReport', userEmail],
    queryFn: async () => {
      const response = await base44.functions.invoke('generateUserProgressReport', {
        userEmail,
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString()
      });
      return response.data.report;
    },
    enabled: !!userEmail
  });
  
  if (isLoading) return <LoadingSpinner />;
  
  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Personal Progress Report</CardTitle>
              <CardDescription>Your achievements and engagement metrics</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onExport('user_progress', 'csv')}
              >
                <Download className="h-4 w-4 mr-2" />
                CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onExport('user_progress', 'pdf')}
              >
                <Download className="h-4 w-4 mr-2" />
                PDF
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-int-orange/10 rounded-lg">
              <p className="text-sm text-slate-600">Total Points</p>
              <p className="text-2xl font-bold text-int-orange">{report?.overview.total_points}</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-slate-600">Current Level</p>
              <p className="text-2xl font-bold text-blue-600">{report?.overview.current_level}</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-slate-600">Badges Earned</p>
              <p className="text-2xl font-bold text-purple-600">{report?.overview.badges_earned}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-slate-600">Current Streak</p>
              <p className="text-2xl font-bold text-green-600">{report?.overview.current_streak} days</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="font-semibold">Personal Goals</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Completed</span>
                  <span className="font-bold">{report?.goals_summary.personal_goals.completed}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>In Progress</span>
                  <span className="font-bold">{report?.goals_summary.personal_goals.in_progress}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Completion Rate</span>
                  <span className="font-bold text-int-orange">
                    {Math.round(report?.goals_summary.personal_goals.completion_rate || 0)}%
                  </span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="font-semibold">Engagement</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Events Attended</span>
                  <span className="font-bold">{report?.engagement.events_attended}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Recognitions Sent</span>
                  <span className="font-bold">{report?.engagement.recognitions_sent}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Recognitions Received</span>
                  <span className="font-bold">{report?.engagement.recognitions_received}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {report?.achievements.recent_badges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {report.achievements.completed_goals.map((goal, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{goal.title}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(goal.completed_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge className="bg-int-orange">+{goal.points_awarded} pts</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}

// Team Analytics Report Component
function TeamAnalyticsReport({ teamId, onExport }) {
  const { data: report, isLoading } = useQuery({
    queryKey: ['teamReport', teamId],
    queryFn: async () => {
      const response = await base44.functions.invoke('generateTeamReport', {
        teamId
      });
      return response.data.report;
    },
    enabled: !!teamId
  });
  
  if (isLoading) return <LoadingSpinner />;
  
  const getEngagementColor = (level) => {
    if (level === 'high') return 'text-green-600 bg-green-50';
    if (level === 'medium') return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };
  
  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Team Report: {report?.team_name}</CardTitle>
              <CardDescription>{report?.member_count} team members</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onExport('team_report', 'csv')}
              >
                <Download className="h-4 w-4 mr-2" />
                CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onExport('team_report', 'pdf')}
              >
                <Download className="h-4 w-4 mr-2" />
                PDF
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-600">Total Points</p>
              <p className="text-2xl font-bold">{report?.metrics.total_points?.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-slate-600">Avg/Member</p>
              <p className="text-2xl font-bold text-blue-600">{report?.metrics.avg_points_per_member}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-slate-600">Active Members</p>
              <p className="text-2xl font-bold text-green-600">{report?.metrics.active_members}</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-slate-600">Activity Rate</p>
              <p className="text-2xl font-bold text-purple-600">{Math.round(report?.metrics.activity_rate || 0)}%</p>
            </div>
          </div>
          
          <div className="p-4 rounded-lg border-2 mb-6" style={{
            backgroundColor: report?.ai_insights.engagement_level === 'high' ? '#f0fdf4' : 
                           report?.ai_insights.engagement_level === 'medium' ? '#fef9c3' : '#fef2f2',
            borderColor: report?.ai_insights.engagement_level === 'high' ? '#86efac' :
                        report?.ai_insights.engagement_level === 'medium' ? '#fde047' : '#fca5a5'
          }}>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5" />
              <p className="font-semibold">AI Engagement Analysis</p>
              <Badge className={getEngagementColor(report?.ai_insights.engagement_level)}>
                {report?.ai_insights.engagement_level?.toUpperCase()}
              </Badge>
            </div>
            <p className="text-sm">Score: {Math.round(report?.ai_insights.engagement_score || 0)}/100</p>
          </div>
          
          {report?.ai_insights.strengths?.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Award className="h-4 w-4 text-green-600" />
                Team Strengths
              </h3>
              <ul className="space-y-2">
                {report.ai_insights.strengths.map((strength, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-green-600">✓</span>
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {report?.ai_insights.concerns?.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                Areas of Concern
              </h3>
              <div className="space-y-3">
                {report.ai_insights.concerns.map((concern, i) => (
                  <div key={i} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start justify-between mb-1">
                      <p className="text-sm font-medium">{concern.issue}</p>
                      <Badge variant="outline" className="text-xs">
                        {concern.severity}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-600">
                      Affects ~{concern.affected_members} members
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {report?.ai_insights.hr_recommendations?.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-int-orange" />
                HR Recommended Actions
              </h3>
              <div className="space-y-3">
                {report.ai_insights.hr_recommendations.map((rec, i) => (
                  <div key={i} className="p-4 bg-int-orange/5 border border-int-orange/20 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-medium text-sm">{rec.action}</p>
                      <Badge className={
                        rec.priority === 'high' ? 'bg-red-500' :
                        rec.priority === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                      }>
                        {rec.priority}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-600">{rec.expected_impact}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {report?.top_performers?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Performers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {report.top_performers.map((performer, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      i === 0 ? 'bg-int-gold text-white' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {i + 1}
                    </div>
                    <span className="font-medium">{performer.email}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-int-orange">{performer.points}</p>
                    <p className="text-xs text-slate-500">Lv. {performer.level}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}