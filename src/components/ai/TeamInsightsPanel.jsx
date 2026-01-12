import React, { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  TrendingUp, 
  TrendingDown,
  Heart,
  Zap,
  Award,
  Target,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Brain,
  BarChart3,
  Clock,
  RefreshCw
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts';
import { format, subDays, subMonths } from 'date-fns';
import LoadingSpinner from '../common/LoadingSpinner';

const CHART_COLORS = ['#D97230', '#14294D', '#8B5CF6', '#10B981', '#F59E0B', '#EC4899'];

export default function TeamInsightsPanel() {
  const [generating, setGenerating] = useState(false);
  const [aiInsights, setAiInsights] = useState(null);

  const { data: teams = [] } = useQuery({
    queryKey: ['teams'],
    queryFn: () => base44.entities.Team.list('-total_points')
  });

  const { data: userPoints = [] } = useQuery({
    queryKey: ['user-points'],
    queryFn: () => base44.entities.UserPoints.list('-total_points', 100)
  });

  const { data: participations = [] } = useQuery({
    queryKey: ['participations'],
    queryFn: () => base44.entities.Participation.list('-created_date', 500)
  });

  const { data: memberships = [] } = useQuery({
    queryKey: ['team-memberships'],
    queryFn: () => base44.entities.TeamMembership.list()
  });

  const { data: userProfiles = [] } = useQuery({
    queryKey: ['user-profiles'],
    queryFn: () => base44.entities.UserProfile.list()
  });

  // Calculate team health metrics
  const teamHealthMetrics = useMemo(() => {
    return teams.map(team => {
      const teamMemberships = memberships.filter(m => m.team_id === team.id);
      const memberEmails = teamMemberships.map(m => m.user_email);
      const memberPoints = userPoints.filter(up => memberEmails.includes(up.user_email));
      
      const totalPoints = memberPoints.reduce((sum, up) => sum + (up.total_points || 0), 0);
      const avgPoints = memberPoints.length > 0 ? Math.round(totalPoints / memberPoints.length) : 0;
      const activeMembers = memberPoints.filter(up => up.events_attended > 0).length;
      const avgStreak = memberPoints.length > 0 
        ? memberPoints.reduce((sum, up) => sum + (up.streak_days || 0), 0) / memberPoints.length 
        : 0;
      const engagementRate = memberPoints.length > 0 ? (activeMembers / memberPoints.length) * 100 : 0;

      // Calculate health score (0-100)
      const healthScore = Math.min(100, Math.round(
        (engagementRate * 0.4) + 
        (Math.min(avgPoints / 10, 30)) + 
        (Math.min(avgStreak * 5, 30))
      ));

      return {
        ...team,
        memberCount: memberPoints.length,
        totalPoints,
        avgPoints,
        activeMembers,
        avgStreak: avgStreak.toFixed(1),
        engagementRate: engagementRate.toFixed(0),
        healthScore
      };
    });
  }, [teams, memberships, userPoints]);

  // Activity type distribution
  const activityDistribution = useMemo(() => {
    const dist = {};
    participations.forEach(p => {
      // Would need event data for actual type
      const type = 'engaged';
      dist[type] = (dist[type] || 0) + 1;
    });
    return [
      { name: 'Engaged', value: participations.filter(p => p.attended).length },
      { name: 'Registered', value: participations.filter(p => !p.attended).length }
    ];
  }, [participations]);

  // Engagement over time
  const engagementTrend = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      const dayParticipations = participations.filter(p => {
        const pDate = new Date(p.created_date);
        return pDate.toDateString() === date.toDateString();
      });
      return {
        date: format(date, 'EEE'),
        engaged: dayParticipations.filter(p => p.attended).length,
        registered: dayParticipations.length
      };
    });
  }, [participations]);

  // Generate AI insights
  const generateInsightsMutation = useMutation({
    mutationFn: async () => {
      setGenerating(true);
      
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze team engagement data and provide actionable insights.

Team Health Data:
${teamHealthMetrics.map(t => `- ${t.name}: Health ${t.healthScore}%, Engagement ${t.engagementRate}%, Avg Streak ${t.avgStreak} days`).join('\n')}

Total Participations: ${participations.length}
Total Users with Points: ${userPoints.length}
Average Points per User: ${userPoints.length > 0 ? Math.round(userPoints.reduce((s, u) => s + u.total_points, 0) / userPoints.length) : 0}

Provide:
1. Overall team health assessment
2. Top 3 strengths
3. Top 3 areas for improvement
4. Specific action recommendations
5. Risk alerts if any`,
        response_json_schema: {
          type: 'object',
          properties: {
            overall_assessment: { type: 'string' },
            health_grade: { type: 'string' },
            strengths: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' }
                }
              }
            },
            improvements: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  priority: { type: 'string' }
                }
              }
            },
            actions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  action: { type: 'string' },
                  impact: { type: 'string' }
                }
              }
            },
            risks: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  risk: { type: 'string' },
                  severity: { type: 'string' }
                }
              }
            }
          }
        }
      });

      setGenerating(false);
      return response;
    },
    onSuccess: (data) => {
      setAiInsights(data);
    },
    onError: () => {
      setGenerating(false);
    }
  });

  return (
    <div data-b44-sync="true" data-feature="ai" data-component="teaminsightspanel" className="space-y-6">
      {/* Header */}
      <Card className="border-2 border-int-navy/20">
        <CardHeader className="bg-gradient-to-r from-int-navy to-blue-800 text-white">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-6 w-6" />
              Team Insights Dashboard
            </CardTitle>
            <Button
              onClick={() => generateInsightsMutation.mutate()}
              disabled={generating}
              variant="secondary"
              className="bg-white/20 hover:bg-white/30 text-white"
            >
              {generating ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Brain className="h-4 w-4 mr-2" />
              )}
              Generate AI Analysis
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* AI Insights */}
      {generating && (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <LoadingSpinner size="large" type="navy" />
            <p className="mt-4 text-slate-600 animate-pulse">
              Analyzing team dynamics and generating insights...
            </p>
          </CardContent>
        </Card>
      )}

      {aiInsights && !generating && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Overall Assessment */}
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-4 rounded-xl bg-gradient-purple shadow-lg">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-xl text-slate-900">Team Health: {aiInsights.health_grade}</h3>
                    <Badge className="bg-gradient-purple text-white">AI Analysis</Badge>
                  </div>
                  <p className="text-slate-700">{aiInsights.overall_assessment}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Strengths & Improvements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-2 border-emerald-200">
              <CardHeader className="bg-emerald-50">
                <CardTitle className="flex items-center gap-2 text-emerald-700">
                  <CheckCircle2 className="h-5 w-5" />
                  Strengths
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                {aiInsights.strengths?.map((s, idx) => (
                  <div key={idx} className="p-3 bg-emerald-50/50 rounded-lg">
                    <h4 className="font-semibold text-emerald-800">{s.title}</h4>
                    <p className="text-sm text-emerald-700">{s.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-2 border-amber-200">
              <CardHeader className="bg-amber-50">
                <CardTitle className="flex items-center gap-2 text-amber-700">
                  <Target className="h-5 w-5" />
                  Areas for Improvement
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                {aiInsights.improvements?.map((i, idx) => (
                  <div key={idx} className="p-3 bg-amber-50/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-amber-800">{i.title}</h4>
                      <Badge variant="outline" className="text-xs">{i.priority}</Badge>
                    </div>
                    <p className="text-sm text-amber-700">{i.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Risk Alerts */}
          {aiInsights.risks?.length > 0 && (
            <Card className="border-2 border-red-200">
              <CardHeader className="bg-red-50">
                <CardTitle className="flex items-center gap-2 text-red-700">
                  <AlertTriangle className="h-5 w-5" />
                  Risk Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {aiInsights.risks.map((r, idx) => (
                    <div key={idx} className="p-3 bg-red-50/50 rounded-lg border border-red-200">
                      <Badge className={`mb-2 ${
                        r.severity === 'high' ? 'bg-red-500' : 
                        r.severity === 'medium' ? 'bg-amber-500' : 
                        'bg-slate-500'
                      } text-white`}>
                        {r.severity}
                      </Badge>
                      <p className="text-sm text-red-700">{r.risk}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}

      {/* Team Health Cards */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-int-navy" />
            Team Health Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teamHealthMetrics.map((team, idx) => (
              <motion.div
                key={team.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className={`border-2 transition-all hover:shadow-lg ${
                  team.healthScore >= 70 ? 'border-emerald-200' :
                  team.healthScore >= 40 ? 'border-amber-200' :
                  'border-red-200'
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: team.color || '#D97230' }}
                        />
                        <h3 className="font-bold">{team.name}</h3>
                      </div>
                      <Badge className={`${
                        team.healthScore >= 70 ? 'bg-emerald-100 text-emerald-700' :
                        team.healthScore >= 40 ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {team.healthScore}%
                      </Badge>
                    </div>
                    
                    <Progress 
                      value={team.healthScore} 
                      className={`h-2 mb-4 ${
                        team.healthScore >= 70 ? '[&>div]:bg-emerald-500' :
                        team.healthScore >= 40 ? '[&>div]:bg-amber-500' :
                        '[&>div]:bg-red-500'
                      }`}
                    />
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-1 text-slate-600">
                        <Users className="h-3 w-3" />
                        {team.memberCount} members
                      </div>
                      <div className="flex items-center gap-1 text-slate-600">
                        <Zap className="h-3 w-3" />
                        {team.avgPoints} avg pts
                      </div>
                      <div className="flex items-center gap-1 text-slate-600">
                        <TrendingUp className="h-3 w-3" />
                        {team.engagementRate}% engaged
                      </div>
                      <div className="flex items-center gap-1 text-slate-600">
                        <Clock className="h-3 w-3" />
                        {team.avgStreak} streak
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Engagement Trend */}
        <Card className="border-2 border-int-orange/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-int-orange" />
              Weekly Engagement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={engagementTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="date" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#14294D',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="engaged" 
                  stroke="#D97230" 
                  strokeWidth={3}
                  dot={{ fill: '#D97230' }}
                  name="Attended"
                />
                <Line 
                  type="monotone" 
                  dataKey="registered" 
                  stroke="#14294D" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: '#14294D' }}
                  name="Registered"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Participation Distribution */}
        <Card className="border-2 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-purple-600" />
              Participation Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={activityDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {activityDistribution.map((entry, index) => (
                    <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}