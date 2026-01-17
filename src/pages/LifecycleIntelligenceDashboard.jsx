import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { TrendingUp, Zap, Brain } from 'lucide-react';
import LifecycleOverview from '../components/lifecycle/LifecycleOverview';
import InterventionWidget from '../components/lifecycle/InterventionWidget';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function LifecycleIntelligenceDashboard() {
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

  const { data: metrics } = useQuery({
    queryKey: ['lifecycle-metrics'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const retention = await base44.entities.RetentionState.filter({
        user_email: user.email
      });
      return retention[0]?.lifecycle_metrics || {};
    },
    enabled: !!lifecycleState
  });

  if (!lifecycleState) return null;

  const daysWithPlatform = Math.floor(
    (new Date() - new Date(lifecycleState.created_at)) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2 mb-2">
          <Brain className="w-8 h-8 text-int-orange" />
          Lifecycle Intelligence
        </h1>
        <p className="text-slate-600">Your journey with us, continuously optimized</p>
      </div>

      {/* INTERVENTION */}
      <InterventionWidget />

      {/* MAIN OVERVIEW */}
      <LifecycleOverview />

      {/* METRICS */}
      {lifecycleState.lifecycle_metrics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  Days Active
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-slate-900">{daysWithPlatform}</p>
                <p className="text-xs text-slate-600 mt-1">Since signup</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Zap className="w-4 h-4 text-orange-600" />
                  Sessions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-slate-900">
                  {lifecycleState.lifecycle_metrics?.session_count || 0}
                </p>
                <p className="text-xs text-slate-600 mt-1">Total visits</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Feature Adoption</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-slate-900">
                  {Math.round(lifecycleState.lifecycle_metrics?.feature_adoption || 0)}%
                </p>
                <p className="text-xs text-slate-600 mt-1">Features used</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}

      {/* HOW THIS WORKS */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-int-orange" />
            How We Adapt
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="space-y-3">
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-sm font-medium text-slate-900 mb-1">📊 Continuous Monitoring</p>
              <p className="text-xs text-slate-600">We track engagement patterns, habit formation, and feature adoption in real-time.</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-sm font-medium text-slate-900 mb-1">🎯 State Transitions</p>
              <p className="text-xs text-slate-600">As you progress, we automatically unlock new capabilities and adjust guidance.</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-sm font-medium text-slate-900 mb-1">🚨 Risk Detection</p>
              <p className="text-xs text-slate-600">If we notice declining engagement, we step in with supportive, value-first interventions.</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-sm font-medium text-slate-900 mb-1">🛤️ Context Preservation</p>
              <p className="text-xs text-slate-600">If you take a break, we remember your work so you can pick up right where you left off.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* STATE EXPLANATION */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Current State: {lifecycleState.current_state}</CardTitle>
        </CardHeader>

        <CardContent>
          <p className="text-sm text-slate-700 mb-4">
            {lifecycleState.current_state === 'new' && 'You're exploring the platform and completing onboarding. We're here to guide every step.'}
            {lifecycleState.current_state === 'activated' && 'Great! You've taken your first meaningful action. We're building on this momentum.'}
            {lifecycleState.current_state === 'engaged' && 'You're using us regularly and building habits. We'll continue to make the experience more valuable.'}
            {lifecycleState.current_state === 'power_user' && 'You've unlocked advanced capabilities and are getting significant value. Keep exploring!'}
            {lifecycleState.current_state === 'at_risk' && 'We noticed a dip in engagement. No judgment—we're here to help you get back on track with value-first reminders.'}
            {lifecycleState.current_state === 'dormant' && 'You've been away for a while. Come back anytime—we'll have everything ready for you, no pressure.'}
            {lifecycleState.current_state === 'returning' && 'Welcome back! We've preserved your context and are excited to continue our partnership.'}
          </p>

          <div className="bg-gradient-to-r from-int-orange/10 to-transparent p-3 rounded-lg">
            <p className="text-xs text-slate-700">
              <strong>💡 This system is designed around you:</strong> We never use dark patterns, countdown timers, or guilt. Everything we do is to help you succeed.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}