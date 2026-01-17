import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { AlertCircle, TrendingUp, Flame, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import HabitLoopWidget from './HabitLoopWidget';
import WeeklyDigestPreview from './WeeklyDigestPreview';

export default function RetentionDashboard() {
  const { data: retentionState } = useQuery({
    queryKey: ['retention-state'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const response = await base44.functions.invoke('habitLoopEngine', {
        action: 'get_or_create_retention_state',
        userEmail: user.email
      });
      return response.data.state;
    }
  });

  const { data: riskAnalysis } = useQuery({
    queryKey: ['retention-risk'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const response = await base44.functions.invoke('habitLoopEngine', {
        action: 'calculate_retention_risk',
        userEmail: user.email
      });
      return response.data;
    },
    enabled: !!retentionState
  });

  if (!retentionState) return null;

  const daysSinceDayOne = Math.floor(
    (new Date() - new Date(retentionState.created_at)) / (1000 * 60 * 60 * 24)
  );
  const progressTo30 = (daysSinceDayOne / 30) * 100;

  const getRiskColor = (score) => {
    if (score > 70) return 'text-red-600 bg-red-50';
    if (score > 40) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  const getRiskLabel = (score) => {
    if (score > 70) return 'At Risk';
    if (score > 40) return 'Caution';
    return 'Healthy';
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Your 30-Day Journey</h1>
        <p className="text-slate-600">Building habits that stick</p>
      </div>

      {/* PROGRESS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* TIMELINE */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="w-4 h-4" />
              Day {daysSinceDayOne} of 30
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Progress value={progressTo30} className="h-3" />
            <p className="text-xs text-slate-600">
              {30 - daysSinceDayOne} days left to solidify habits
            </p>
          </CardContent>
        </Card>

        {/* STREAK */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Flame className="w-4 h-4" />
              Weekly Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-orange-600">
              {retentionState.total_visit_streak || 0}
            </p>
            <p className="text-xs text-slate-600 mt-2">
              {retentionState.total_visit_streak > 1 ? 'weeks active' : 'week active'}
            </p>
          </CardContent>
        </Card>

        {/* HEALTH */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Retention Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`p-3 rounded-lg ${getRiskColor(riskAnalysis?.risk_score || 50)}`}>
              <p className="font-bold text-sm">
                {getRiskLabel(riskAnalysis?.risk_score || 50)}
              </p>
              <p className="text-xs mt-1">
                {riskAnalysis?.risk_score || 50}/100
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* HABIT LOOPS */}
      <div>
        <h2 className="text-xl font-bold mb-4">Active Habit Loops</h2>
        <HabitLoopWidget />
      </div>

      {/* COMPOUNDING ACTIONS */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-int-orange" />
            Your Compounding Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {retentionState.discovery_loop?.deals_saved_from_loop || 0}
              </p>
              <p className="text-xs text-slate-600">Deals Saved</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-600">
                {retentionState.insight_loop?.portfolio_adjustments || 0}
              </p>
              <p className="text-xs text-slate-600">Portfolio Updates</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">
                {retentionState.social_loop?.social_interactions || 0}
              </p>
              <p className="text-xs text-slate-600">Social Actions</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* WEEKLY DIGEST */}
      <div>
        <h2 className="text-xl font-bold mb-4">This Week's Digest</h2>
        <WeeklyDigestPreview />
      </div>

      {/* RISK INDICATOR */}
      {(riskAnalysis?.risk_score || 50) > 60 && (
        <Card className="bg-yellow-50 border border-yellow-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-900">
              <AlertCircle className="w-5 h-5" />
              Increase Your Engagement
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-yellow-800">
            We've noticed lower activity. Here's a deal matching your interests—check it out!
          </CardContent>
        </Card>
      )}
    </div>
  );
}