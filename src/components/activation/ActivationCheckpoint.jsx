import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * ActivationCheckpoint: Modal that surfaces deferred setup prompts contextually
 * E.g., when user views analytics, prompt them to set portfolio goals
 */
export default function ActivationCheckpoint({ triggerContext, onDismiss }) {
  const queryClient = useQueryClient();

  const { data: activationState } = useQuery({
    queryKey: ['activation-state'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const results = await base44.entities.ActivationState.filter({
        user_email: user.email
      });
      return results[0];
    }
  });

  const dismissMutation = useMutation({
    mutationFn: async () => {
      const user = await base44.auth.me();
      if (!activationState) return;

      const pending = activationState.pending_deferred_prompts || [];
      const updated = pending.filter(p => p.trigger_context !== triggerContext);

      await base44.entities.ActivationState.update(activationState.id, {
        pending_deferred_prompts: updated
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['activation-state']);
      onDismiss?.();
    }
  });

  if (!activationState) return null;

  // Check if there's a relevant deferred prompt for this context
  const deferredPrompt = getContextualPrompt(activationState, triggerContext);
  if (!deferredPrompt) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Lightbulb className="w-5 h-5 text-blue-600" />
            Complete Your Setup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-slate-700">
            {deferredPrompt.message}
          </p>
          <div className="flex gap-2">
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => {
                window.location.href = deferredPrompt.actionLink;
              }}
            >
              {deferredPrompt.actionLabel}
            </Button>
            <Button
              variant="outline"
              onClick={() => dismissMutation.mutate()}
            >
              Later
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function getContextualPrompt(activationState, triggerContext) {
  const milestones = activationState.activation_milestones || {};
  const onboardingType = activationState.onboarding_flow_type;

  const prompts = {
    viewing_analytics: {
      condition: onboardingType === 'quick_start' && !milestones.portfolio_goal_configured,
      message: 'Set your portfolio goals to unlock detailed analytics and benchmarking against your targets.',
      actionLabel: 'Configure Goals',
      actionLink: '/settings/portfolio'
    },
    browsing_deals: {
      condition: !milestones.portfolio_goal_configured && activationState.assigned_activation_path === 'portfolio_first',
      message: 'Let\'s set your investment goals first—we\'ll match deals to your targets automatically.',
      actionLabel: 'Set Goals',
      actionLink: '/settings/portfolio'
    },
    exploring_community: {
      condition: !milestones.expert_followed && activationState.assigned_activation_path === 'community_first',
      message: 'Follow experts in your area of interest to build your personalized feed.',
      actionLabel: 'Find Experts',
      actionLink: '/community/experts'
    }
  };

  const prompt = prompts[triggerContext];
  return prompt && prompt.condition ? {
    message: prompt.message,
    actionLabel: prompt.actionLabel,
    actionLink: prompt.actionLink
  } : null;
}