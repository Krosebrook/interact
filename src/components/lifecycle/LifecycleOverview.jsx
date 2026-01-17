import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { TrendingUp, AlertTriangle, RotateCcw, Zap, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const STATE_CONFIG = {
  new: { color: 'from-blue-500 to-cyan-500', icon: Zap, label: 'New User' },
  activated: { color: 'from-green-500 to-emerald-500', icon: TrendingUp, label: 'Activated' },
  engaged: { color: 'from-purple-500 to-pink-500', icon: TrendingUp, label: 'Engaged' },
  power_user: { color: 'from-orange-500 to-red-500', icon: Zap, label: 'Power User' },
  at_risk: { color: 'from-yellow-500 to-orange-500', icon: AlertTriangle, label: 'At-Risk' },
  dormant: { color: 'from-slate-500 to-gray-500', icon: Clock, label: 'Dormant' },
  returning: { color: 'from-green-500 to-teal-500', icon: RotateCcw, label: 'Returning' }
};

export default function LifecycleOverview() {
  const { data: lifecycleState } = useQuery({
    queryKey: ['lifecycle-state'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const response = await base44.functions.invoke('lifecycleStateEngine', {
        action: 'get_or_create_state',
        userEmail: user.email
      });
      return response.data.state;
    }
  });

  const { data: churnRisk } = useQuery({
    queryKey: ['churn-risk'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const response = await base44.functions.invoke('lifecycleStateEngine', {
        action: 'calculate_churn_risk',
        userEmail: user.email
      });
      return response.data;
    },
    enabled: !!lifecycleState
  });

  if (!lifecycleState) return null;

  const config = STATE_CONFIG[lifecycleState.current_state];
  const Icon = config.icon;
  const daysInState = Math.floor(
    (new Date() - new Date(lifecycleState.state_entered_at)) / (1000 * 60 * 60 * 24)
  );

  const getRiskColor = (score) => {
    if (score > 70) return 'text-red-600 bg-red-50';
    if (score > 40) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  return (
    <div className="space-y-4">
      {/* MAIN STATE CARD */}
      <Card className={`bg-gradient-to-br ${config.color} text-white border-0`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon className="w-6 h-6" />
            {config.label}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-white/90">
            {lifecycleState.current_state === 'new' && "You're just getting started!"}
            {lifecycleState.current_state === 'activated' && "Great first steps—momentum building."}
            {lifecycleState.current_state === 'engaged' && "You're building a habit with us."}
            {lifecycleState.current_state === 'power_user' && "Advanced capabilities unlocked."}
            {lifecycleState.current_state === 'at_risk' && "We'd love to help you get back on track."}
            {lifecycleState.current_state === 'dormant' && "We miss you—welcome back anytime."}
            {lifecycleState.current_state === 'returning' && "Glad you're back!"}
          </p>
          <p className="text-sm text-white/70">
            {daysInState} day{daysInState !== 1 ? 's' : ''} in this state
          </p>
        </CardContent>
      </Card>

      {/* STATE HISTORY */}
      {lifecycleState.state_history?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Your Journey</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lifecycleState.state_history.slice(-3).reverse().map((transition, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-900">{STATE_CONFIG[transition.state]?.label}</span>
                  <span className="text-slate-600">{transition.duration_days} days</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* CHURN RISK */}
      {churnRisk && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center justify-between">
              Health Check
              <Badge className={getRiskColor(churnRisk.churn_risk_score)}>
                {churnRisk.risk_level}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="flex justify-between mb-1">
                <p className="text-xs text-slate-600">Engagement Health</p>
                <p className="text-sm font-bold text-slate-900">{Math.round(100 - churnRisk.churn_risk_score)}/100</p>
              </div>
              <Progress value={100 - churnRisk.churn_risk_score} className="h-2" />
            </div>

            {churnRisk.signals && (
              <div className="text-xs text-slate-600 space-y-1 pt-2">
                {churnRisk.signals.inactivity_days > 0 && (
                  <p>• No activity for {churnRisk.signals.inactivity_days} days</p>
                )}
                {churnRisk.signals.abandoned_flows > 0 && (
                  <p>• {churnRisk.signals.abandoned_flows} incomplete actions</p>
                )}
                {churnRisk.signals.ignored_nudges > 0 && (
                  <p>• {churnRisk.signals.ignored_nudges} dismissed prompts</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* PERSONALIZATION LEVEL */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Personalization Level</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-900 capitalize">
              {lifecycleState.personalization_level}
            </p>
            <p className="text-xs text-slate-600">
              {lifecycleState.personalization_level === 'onboarding' && 'Full guidance'}
              {lifecycleState.personalization_level === 'learning' && 'Learning mode'}
              {lifecycleState.personalization_level === 'autonomous' && 'Light guidance'}
              {lifecycleState.personalization_level === 'expert' && 'Advanced mode'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}