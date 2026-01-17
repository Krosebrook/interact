import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lightbulb, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const NUDGE_ICONS = {
  setup_incomplete: '⚙️',
  feature_suggestion: '💡',
  community_discovery: '🤝',
  engagement_boost: '🚀',
  skill_alignment: '🎯'
};

export default function NudgeWidget() {
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => base44.auth.me()
  });

  const { data: nudges = [], isLoading } = useQuery({
    queryKey: ['active-nudges', user?.email],
    queryFn: async () => {
      if (!user) return [];
      const response = await base44.functions.invoke('aiNudgeGenerator', {
        action: 'get_active_nudges',
        userId: user.email
      });
      return response.data.nudges;
    },
    enabled: !!user
  });

  const dismissMutation = useMutation({
    mutationFn: async (nudgeId) => {
      const response = await base44.functions.invoke('aiNudgeGenerator', {
        action: 'dismiss_nudge',
        nudgeId
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['active-nudges']);
    }
  });

  // GROUP BY LOCATION
  const bannerNudges = nudges.filter(n => n.display_location === 'banner');
  const sidebarNudges = nudges.filter(n => n.display_location === 'sidebar');

  return (
    <div className="space-y-3">
      {/* BANNER NUDGES */}
      <AnimatePresence>
        {bannerNudges.map(nudge => (
          <motion.div
            key={nudge.id}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
              'p-4 rounded-lg border-l-4 flex items-start gap-3',
              nudge.priority === 'high' && 'bg-red-50 border-red-400',
              nudge.priority === 'medium' && 'bg-orange-50 border-orange-400',
              nudge.priority === 'low' && 'bg-blue-50 border-blue-400'
            )}
          >
            <span className="text-xl mt-1">{NUDGE_ICONS[nudge.nudge_type]}</span>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-900">{nudge.message}</p>
              {nudge.suggested_action && (
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-2 text-xs"
                  onClick={() => handleNudgeAction(nudge.suggested_action)}
                >
                  {formatActionLabel(nudge.suggested_action)}
                </Button>
              )}
            </div>
            <button
              onClick={() => dismissMutation.mutate(nudge.id)}
              className="p-1 hover:bg-white/50 rounded transition-colors mt-1"
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* SIDEBAR NUDGES */}
      <div className="space-y-2">
        <AnimatePresence>
          {sidebarNudges.slice(0, 2).map(nudge => (
            <motion.div
              key={nudge.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="p-3 bg-gradient-to-r from-int-orange/10 to-int-navy/10 rounded-lg border border-slate-200 text-xs"
            >
              <p className="font-medium text-slate-900">{nudge.message}</p>
              <button
                onClick={() => dismissMutation.mutate(nudge.id)}
                className="text-slate-500 hover:text-slate-700 mt-2 text-xs"
              >
                Dismiss
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function handleNudgeAction(action) {
  // Route to appropriate page/action
  const routes = {
    complete_setup: '/settings',
    join_event: '/calendar',
    join_team: '/teams',
    view_leaderboard: '/leaderboards',
    post_recognition: '/recognition'
  };

  if (routes[action]) {
    window.location.href = routes[action];
  }
}

function formatActionLabel(action) {
  return action.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}