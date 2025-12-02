import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ScatterChart, Scatter, ZAxis } from 'recharts';
import { Target, Flame, Clock, Trophy, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { Cell } from 'recharts';

const DIFFICULTY_COLORS = {
  easy: '#22c55e',
  medium: '#f59e0b',
  hard: '#ef4444',
  epic: '#a855f7'
};

const TYPE_COLORS = {
  daily: '#3b82f6',
  weekly: '#8B5CF6',
  milestone: '#F59E0B',
  streak: '#EF4444',
  social: '#EC4899',
  skill: '#10B981',
  exploration: '#06B6D4'
};

export default function ChallengePerformanceMetrics({ 
  personalChallenges = [], 
  teamChallenges = [],
  userPoints = []
}) {
  const allChallenges = useMemo(() => {
    return [...personalChallenges, ...teamChallenges.map(tc => ({
      ...tc,
      challenge_type: 'team',
      difficulty: tc.difficulty || 'medium'
    }))];
  }, [personalChallenges, teamChallenges]);

  const metrics = useMemo(() => {
    // By type analysis
    const byType = {};
    allChallenges.forEach(c => {
      const type = c.challenge_type || 'weekly';
      if (!byType[type]) {
        byType[type] = { total: 0, completed: 0, abandoned: 0, avgProgress: 0, avgTime: 0 };
      }
      byType[type].total++;
      if (c.status === 'completed') byType[type].completed++;
      if (c.status === 'abandoned' || c.status === 'expired') byType[type].abandoned++;
      byType[type].avgProgress += (c.current_progress || 0) / (c.target_value || 1);
    });

    Object.keys(byType).forEach(type => {
      byType[type].completionRate = byType[type].total > 0 
        ? ((byType[type].completed / byType[type].total) * 100).toFixed(1)
        : 0;
      byType[type].avgProgress = byType[type].total > 0
        ? ((byType[type].avgProgress / byType[type].total) * 100).toFixed(1)
        : 0;
    });

    // By difficulty analysis
    const byDifficulty = {};
    allChallenges.forEach(c => {
      const diff = c.difficulty || 'medium';
      if (!byDifficulty[diff]) {
        byDifficulty[diff] = { total: 0, completed: 0, avgPoints: 0 };
      }
      byDifficulty[diff].total++;
      if (c.status === 'completed') byDifficulty[diff].completed++;
      byDifficulty[diff].avgPoints += c.points_reward || 0;
    });

    Object.keys(byDifficulty).forEach(diff => {
      byDifficulty[diff].completionRate = byDifficulty[diff].total > 0
        ? ((byDifficulty[diff].completed / byDifficulty[diff].total) * 100).toFixed(1)
        : 0;
      byDifficulty[diff].avgPoints = byDifficulty[diff].total > 0
        ? Math.round(byDifficulty[diff].avgPoints / byDifficulty[diff].total)
        : 0;
    });

    // Time to complete analysis
    const completionTimes = allChallenges
      .filter(c => c.status === 'completed' && c.start_date && c.completed_date)
      .map(c => {
        const start = new Date(c.start_date);
        const end = new Date(c.completed_date);
        return (end - start) / (1000 * 60 * 60 * 24); // days
      });

    const avgCompletionTime = completionTimes.length > 0
      ? (completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length).toFixed(1)
      : 0;

    // Point efficiency
    const completedWithPoints = allChallenges.filter(c => c.status === 'completed' && c.points_reward);
    const totalPointsFromChallenges = completedWithPoints.reduce((sum, c) => sum + (c.points_reward || 0), 0);

    return {
      byType: Object.entries(byType).map(([type, data]) => ({ type, ...data })),
      byDifficulty: Object.entries(byDifficulty).map(([difficulty, data]) => ({ difficulty, ...data })),
      avgCompletionTime,
      totalChallenges: allChallenges.length,
      completedChallenges: allChallenges.filter(c => c.status === 'completed').length,
      activeChallenges: allChallenges.filter(c => c.status === 'active').length,
      abandonedChallenges: allChallenges.filter(c => c.status === 'abandoned' || c.status === 'expired').length,
      totalPointsFromChallenges,
      overallCompletionRate: allChallenges.length > 0
        ? ((allChallenges.filter(c => c.status === 'completed').length / allChallenges.length) * 100).toFixed(1)
        : 0
    };
  }, [allChallenges]);

  const radarData = metrics.byType.map(t => ({
    type: t.type.charAt(0).toUpperCase() + t.type.slice(1),
    completion: parseFloat(t.completionRate),
    participation: t.total,
    fullMark: 100
  }));

  const difficultyData = metrics.byDifficulty.map(d => ({
    difficulty: d.difficulty.charAt(0).toUpperCase() + d.difficulty.slice(1),
    completionRate: parseFloat(d.completionRate),
    count: d.total,
    avgPoints: d.avgPoints,
    fill: DIFFICULTY_COLORS[d.difficulty]
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-int-orange" />
          Challenge Performance Metrics
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Summary Stats */}
        <div className="grid grid-cols-5 gap-3 mb-6">
          <div className="bg-slate-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-int-navy">{metrics.totalChallenges}</p>
            <p className="text-xs text-slate-500">Total</p>
          </div>
          <div className="bg-emerald-50 rounded-lg p-3 text-center">
            <CheckCircle className="h-4 w-4 mx-auto mb-1 text-emerald-600" />
            <p className="text-2xl font-bold text-emerald-600">{metrics.completedChallenges}</p>
            <p className="text-xs text-slate-500">Completed</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <Flame className="h-4 w-4 mx-auto mb-1 text-blue-600" />
            <p className="text-2xl font-bold text-blue-600">{metrics.activeChallenges}</p>
            <p className="text-xs text-slate-500">Active</p>
          </div>
          <div className="bg-red-50 rounded-lg p-3 text-center">
            <XCircle className="h-4 w-4 mx-auto mb-1 text-red-500" />
            <p className="text-2xl font-bold text-red-500">{metrics.abandonedChallenges}</p>
            <p className="text-xs text-slate-500">Abandoned</p>
          </div>
          <div className="bg-int-orange/10 rounded-lg p-3 text-center">
            <Trophy className="h-4 w-4 mx-auto mb-1 text-int-orange" />
            <p className="text-2xl font-bold text-int-orange">{metrics.overallCompletionRate}%</p>
            <p className="text-xs text-slate-500">Success Rate</p>
          </div>
        </div>

        <Tabs defaultValue="type" className="w-full">
          <TabsList className="grid grid-cols-3 w-full mb-4">
            <TabsTrigger value="type">By Type</TabsTrigger>
            <TabsTrigger value="difficulty">By Difficulty</TabsTrigger>
            <TabsTrigger value="efficiency">Efficiency</TabsTrigger>
          </TabsList>

          <TabsContent value="type">
            <div className="grid grid-cols-2 gap-4">
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="type" tick={{ fontSize: 11 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar
                      name="Completion Rate"
                      dataKey="completion"
                      stroke="#D97230"
                      fill="#D97230"
                      fillOpacity={0.5}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                {metrics.byType.map(t => (
                  <div key={t.type} className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: TYPE_COLORS[t.type] || '#64748b' }}
                    />
                    <span className="text-sm capitalize flex-1">{t.type}</span>
                    <div className="w-24">
                      <Progress value={parseFloat(t.completionRate)} className="h-2" />
                    </div>
                    <span className="text-sm font-medium w-12 text-right">{t.completionRate}%</span>
                    <span className="text-xs text-slate-400 w-8">({t.total})</span>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="difficulty">
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={difficultyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="difficulty" />
                  <YAxis yAxisId="left" orientation="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Bar yAxisId="left" dataKey="completionRate" name="Completion %" radius={[4, 4, 0, 0]}>
                    {difficultyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                  <Bar yAxisId="right" dataKey="avgPoints" name="Avg Points" fill="#14294D" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-4 gap-2 mt-4">
              {difficultyData.map(d => (
                <div 
                  key={d.difficulty} 
                  className="p-3 rounded-lg text-center"
                  style={{ backgroundColor: `${d.fill}15` }}
                >
                  <p className="text-sm font-medium" style={{ color: d.fill }}>{d.difficulty}</p>
                  <p className="text-lg font-bold">{d.count}</p>
                  <p className="text-xs text-slate-500">challenges</p>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="efficiency">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <span className="font-medium">Avg Completion Time</span>
                  </div>
                  <p className="text-3xl font-bold text-blue-600">{metrics.avgCompletionTime} days</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="h-5 w-5 text-amber-600" />
                    <span className="font-medium">Points from Challenges</span>
                  </div>
                  <p className="text-3xl font-bold text-amber-600">{metrics.totalPointsFromChallenges.toLocaleString()}</p>
                </div>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <h4 className="font-medium mb-3">Insights</h4>
                <ul className="space-y-2 text-sm">
                  {parseFloat(metrics.overallCompletionRate) < 50 && (
                    <li className="flex items-start gap-2 text-amber-700">
                      <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      Low completion rate suggests challenges may be too difficult
                    </li>
                  )}
                  {metrics.abandonedChallenges > metrics.completedChallenges && (
                    <li className="flex items-start gap-2 text-red-700">
                      <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      High abandonment rate - consider shorter or easier challenges
                    </li>
                  )}
                  {parseFloat(metrics.avgCompletionTime) < 2 && (
                    <li className="flex items-start gap-2 text-emerald-700">
                      <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      Quick completion times indicate good challenge design
                    </li>
                  )}
                  <li className="flex items-start gap-2 text-slate-600">
                    <Target className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    {metrics.completedChallenges} challenges completed yielding {metrics.totalPointsFromChallenges} points
                  </li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}