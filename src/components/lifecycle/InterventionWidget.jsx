import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function InterventionWidget() {
  const queryClient = useQueryClient();

  const { data: interventions } = useQuery({
    queryKey: ['active-interventions'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const response = await base44.functions.invoke('interventionEngine', {
        action: 'get_active_interventions',
        userEmail: user.email
      });
      return response.data.interventions;
    }
  });

  const dismissMutation = useMutation({
    mutationFn: async (interventionId) => {
      const user = await base44.auth.me();
      await base44.functions.invoke('interventionEngine', {
        action: 'dismiss_intervention',
        userEmail: user.email,
        intervention_id: interventionId
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['active-interventions']);
    }
  });

  const actionMutation = useMutation({
    mutationFn: async (interventionId) => {
      const user = await base44.auth.me();
      await base44.functions.invoke('interventionEngine', {
        action: 'track_intervention_action',
        userEmail: user.email,
        intervention_id: interventionId,
        acted_on: true
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['active-interventions']);
    }
  });

  if (!interventions || interventions.length === 0) return null;

  const intervention = interventions[0];

  const getToneColor = (tone) => {
    const colors = {
      supportive: 'from-amber-50 to-orange-50 border-amber-200',
      respectful: 'from-slate-50 to-slate-100 border-slate-200',
      welcoming: 'from-green-50 to-emerald-50 border-green-200',
      enabling: 'from-blue-50 to-cyan-50 border-blue-200',
      partnership: 'from-purple-50 to-pink-50 border-purple-200'
    };
    return colors[tone] || colors.enabling;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
      >
        <Card className={`bg-gradient-to-r ${getToneColor(interventions[0]?.tone || 'enabling')} border`}>
          <CardContent className="pt-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <p className="font-medium text-slate-900 mb-1">{intervention.message}</p>
                <p className="text-xs text-slate-600">
                  {intervention.type === 'value_reminder' && "We've curated updates for you."}
                  {intervention.type === 'context_restoration' && "Your previous activities are waiting."}
                  {intervention.type === 'habit_reinforcement' && "Keep the momentum going."}
                  {intervention.type === 'feature_discovery' && "Unlock new capabilities."}
                </p>
              </div>
              <button
                onClick={() => dismissMutation.mutate(intervention.id)}
                className="p-1 hover:bg-black/5 rounded transition-colors"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                className="flex-1 bg-slate-900 hover:bg-slate-800 text-white"
                onClick={() => actionMutation.mutate(intervention.id)}
              >
                Explore
                <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => dismissMutation.mutate(intervention.id)}
              >
                Later
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}