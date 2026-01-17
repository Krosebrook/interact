import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Zap, Users, Lightbulb, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

const LOOP_CONFIGS = {
  discovery_loop: {
    name: 'Deal Discovery',
    icon: TrendingUp,
    color: 'from-blue-500 to-cyan-500',
    metric: 'deals_saved_from_loop',
    label: 'Deals Saved This Week'
  },
  insight_loop: {
    name: 'Portfolio Insights',
    icon: Lightbulb,
    color: 'from-amber-500 to-orange-500',
    metric: 'portfolio_adjustments',
    label: 'Adjustments Made'
  },
  social_loop: {
    name: 'Community Engagement',
    icon: Users,
    color: 'from-purple-500 to-pink-500',
    metric: 'social_interactions',
    label: 'Interactions'
  }
};

export default function HabitLoopWidget() {
  const queryClient = useQueryClient();

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

  const triggerLoopMutation = useMutation({
    mutationFn: async (loopName) => {
      const user = await base44.auth.me();
      const response = await base44.functions.invoke('habitLoopEngine', {
        action: 'trigger_loop',
        userEmail: user.email,
        loopName
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['retention-state']);
    }
  });

  if (!retentionState) return null;

  const activeLoops = retentionState.assigned_habit_loops || [];
  const totalActions = 
    (retentionState.discovery_loop?.deals_saved_from_loop || 0) +
    (retentionState.insight_loop?.portfolio_adjustments || 0) +
    (retentionState.social_loop?.social_interactions || 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {activeLoops.map(loopName => {
          const config = LOOP_CONFIGS[loopName];
          const loopData = retentionState[loopName] || {};
          const Icon = config.icon;
          const count = loopData[config.metric] || 0;

          return (
            <motion.div
              key={loopName}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${config.color}`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      {config.name}
                    </CardTitle>
                    {loopData.is_active && <Zap className="w-4 h-4 text-yellow-500" />}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <p className="text-xs text-slate-600">{config.label}</p>
                      <p className="text-sm font-bold text-slate-900">{count}</p>
                    </div>
                    <Progress value={Math.min(count * 20, 100)} className="h-2" />
                  </div>

                  {loopData.personalization_score !== undefined && (
                    <div className="text-xs text-slate-500">
                      Relevance: <span className="font-semibold text-slate-700">{Math.round(loopData.personalization_score)}%</span>
                    </div>
                  )}

                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() => triggerLoopMutation.mutate(loopName)}
                    disabled={triggerLoopMutation.isPending}
                  >
                    Explore
                    <ChevronRight className="w-3 h-3 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* WEEKLY STREAK */}
      {retentionState.total_visit_streak > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-green-900">
                {retentionState.total_visit_streak}-week active streak 🔥
              </p>
              <p className="text-sm text-green-700">Keep up the momentum!</p>
            </div>
            <div className="text-3xl font-bold text-green-600">
              {totalActions}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}