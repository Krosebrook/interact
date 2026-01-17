import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Zap, X, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

export default function ActivationGuidance() {
  const queryClient = useQueryClient();
  const [showGuidance, setShowGuidance] = useState(true);

  const { data: activationState, isLoading } = useQuery({
    queryKey: ['activation-state'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const results = await base44.entities.ActivationState.filter({
        user_email: user.email
      });
      return results[0];
    }
  });

  const { data: nudges, refetch: refetchNudges } = useQuery({
    queryKey: ['activation-nudges'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const response = await base44.functions.invoke('activationPathEngine', {
        action: 'generate_nudges',
        userEmail: user.email
      });
      return response.data.nudges || [];
    },
    enabled: !!activationState
  });

  const dismissNudgeMutation = useMutation({
    mutationFn: async (nudgeId) => {
      const user = await base44.auth.me();
      const updated = await base44.entities.ActivationState.update(activationState.id, {
        dismissed_guidance: [...(activationState.dismissed_guidance || []), nudgeId]
      });
      return updated;
    },
    onSuccess: () => {
      refetchNudges();
    }
  });

  const trackMilestoneMutation = useMutation({
    mutationFn: async (milestone) => {
      const user = await base44.auth.me();
      const response = await base44.functions.invoke('activationPathEngine', {
        action: 'track_milestone',
        userEmail: user.email,
        milestone
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['activation-state']);
    }
  });

  if (isLoading || !activationState) return null;
  if (activationState.is_activated) return null; // User already activated

  const milestones = activationState.activation_milestones || {};
  const completedCount = Object.values(milestones).filter(Boolean).length;
  const progressPercent = (completedCount / 3) * 100;

  return (
    <AnimatePresence>
      {showGuidance && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-6 right-6 max-w-sm bg-white rounded-xl shadow-xl border border-slate-200 p-4 z-40"
        >
          {/* HEADER */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Zap className="w-4 h-4 text-int-orange" />
              Getting Started
            </h3>
            <button
              onClick={() => setShowGuidance(false)}
              className="p-1 hover:bg-slate-100 rounded transition-colors"
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          {/* PROGRESS */}
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-xs text-slate-600">
              <span>Your path: <strong>{activationState.assigned_activation_path?.replace(/_/g, ' ')}</strong></span>
              <span>{completedCount}/3</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>

          {/* MILESTONES CHECKLIST */}
          <div className="space-y-2 mb-4">
            {getMilestoneLabels(activationState.assigned_activation_path).map((milestone, idx) => (
              <div
                key={milestone}
                className={`flex items-center gap-2 p-2 rounded-lg ${
                  milestones[milestone] ? 'bg-green-50' : 'bg-slate-50'
                }`}
              >
                {milestones[milestone] ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <div className="w-4 h-4 rounded border border-slate-300" />
                )}
                <span className={`text-sm ${milestones[milestone] ? 'text-green-700 line-through' : 'text-slate-700'}`}>
                  {getMilestoneLabel(milestone)}
                </span>
              </div>
            ))}
          </div>

          {/* NUDGES */}
          {nudges?.length > 0 && (
            <div className="bg-int-orange/10 border border-int-orange/30 rounded-lg p-3 mb-3">
              <p className="text-sm text-slate-900 mb-2">{nudges[0].message}</p>
              <Button
                size="sm"
                className="w-full bg-int-orange hover:bg-int-orange/90 text-white"
                onClick={() => {
                  // Handle nudge action
                }}
              >
                {getActionLabel(nudges[0].action)}
                <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
          )}

          {/* FOOTER */}
          <p className="text-xs text-slate-500">
            Goal: reach first key moment in your first 7 days
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function getMilestoneLabels(path) {
  const pathMilestones = {
    deal_first: ['first_deal_viewed', 'first_deal_saved'],
    portfolio_first: ['portfolio_goal_configured'],
    community_first: ['first_community_interaction', 'expert_followed']
  };
  return pathMilestones[path] || [];
}

function getMilestoneLabel(milestone) {
  const labels = {
    first_deal_viewed: 'View a relevant deal',
    first_deal_saved: 'Save a deal',
    portfolio_goal_configured: 'Configure goals',
    first_community_interaction: 'Join a community',
    expert_followed: 'Follow an expert'
  };
  return labels[milestone] || milestone;
}

function getActionLabel(action) {
  const labels = {
    view_deal: 'Browse Deals',
    save_deal: 'Find Deals',
    setup_goals: 'Set Goals',
    view_communities: 'Explore Communities',
    follow_expert: 'Find Experts',
    next_guidance_step: 'Continue'
  };
  return labels[action] || action;
}