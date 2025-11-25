import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  Calendar, 
  TrendingUp, 
  CheckCircle, 
  X,
  Info,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import AIEventThemeGenerator from './AIEventThemeGenerator';

export default function AISuggestionsWidget({ onScheduleActivity, onGenerateCustom }) {
  const [showThemeGenerator, setShowThemeGenerator] = useState(false);
  const queryClient = useQueryClient();
  const [generating, setGenerating] = useState(false);

  const { data: recommendations = [], isLoading } = useQuery({
    queryKey: ['ai-recommendations'],
    queryFn: () => base44.entities.AIRecommendation.filter({ status: 'pending' }),
    refetchInterval: 60000 // Refresh every minute
  });

  const { data: activities = [] } = useQuery({
    queryKey: ['activities'],
    queryFn: () => base44.entities.Activity.list()
  });

  const updateRecommendationMutation = useMutation({
    mutationFn: ({ id, status, feedback }) => 
      base44.entities.AIRecommendation.update(id, { 
        status, 
        lisa_feedback: feedback 
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(['ai-recommendations']);
    }
  });

  const handleAccept = (recommendation) => {
    if (recommendation.activity_id) {
      const activity = activities.find(a => a.id === recommendation.activity_id);
      if (activity) {
        onScheduleActivity(activity);
      }
    } else if (recommendation.custom_activity_data) {
      // Create custom activity then schedule
      toast.success('Opening custom activity...');
    }
    updateRecommendationMutation.mutate({ 
      id: recommendation.id, 
      status: 'accepted',
      feedback: 'Accepted and scheduled'
    });
  };

  const handleDismiss = (recommendation) => {
    updateRecommendationMutation.mutate({ 
      id: recommendation.id, 
      status: 'dismissed' 
    });
    toast.success('Recommendation dismissed');
  };

  const typeIcons = {
    rule_based: '🎯',
    ai_generated: '🤖',
    hybrid: '✨'
  };

  const typeColors = {
    rule_based: 'bg-blue-100 text-blue-700',
    ai_generated: 'bg-purple-100 text-purple-700',
    hybrid: 'bg-indigo-100 text-indigo-700'
  };

  if (isLoading) {
    return (
      <Card className="p-6 border-0 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="h-6 w-6 text-indigo-600" />
          <h3 className="text-lg font-bold text-slate-900">AI Suggestions</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-slate-100 animate-pulse rounded-lg" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 border-0 shadow-lg relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500 to-purple-600 opacity-5 rounded-full transform translate-x-8 -translate-y-8" />
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Sparkles className="h-6 w-6 text-indigo-600" />
          <h3 className="text-lg font-bold text-slate-900">AI Suggestions</h3>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowThemeGenerator(true)}
            size="sm"
            variant="outline"
            className="border-purple-300 text-purple-700 hover:bg-purple-50"
          >
            <Sparkles className="h-4 w-4 mr-1" />
            Theme Generator
          </Button>
          <Button
            onClick={onGenerateCustom}
            size="sm"
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
          >
            <Sparkles className="h-4 w-4 mr-1" />
            Quick Generate
          </Button>
        </div>
      </div>

      <AnimatePresence mode="popLayout">
        {recommendations.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-8"
          >
            <Sparkles className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 text-sm">
              No new recommendations yet. Click "Generate Custom" to create one!
            </p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {recommendations.slice(0, 5).map((rec, index) => {
              const activity = rec.activity_id ? 
                activities.find(a => a.id === rec.activity_id) : null;
              
              return (
                <motion.div
                  key={rec.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gradient-to-r from-slate-50 to-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">{typeIcons[rec.recommendation_type]}</span>
                        <Badge className={`${typeColors[rec.recommendation_type]} text-xs`}>
                          {rec.recommendation_type.replace('_', ' ')}
                        </Badge>
                        {rec.confidence_score && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Badge variant="outline" className="text-xs">
                                  {Math.round(rec.confidence_score * 100)}% confident
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                AI confidence score based on historical data
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                      
                      <h4 className="font-semibold text-slate-900 mb-1">
                        {activity?.title || rec.custom_activity_data?.title || 'Custom Activity'}
                      </h4>
                      
                      <div className="flex items-start gap-2 mb-2">
                        <Info className="h-4 w-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-slate-600">{rec.reasoning}</p>
                      </div>

                      {rec.context?.date_context && (
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <Calendar className="h-3 w-3" />
                          <span>{rec.context.date_context}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 mt-3">
                    <Button
                      onClick={() => handleAccept(rec)}
                      size="sm"
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Accept
                    </Button>
                    <Button
                      onClick={() => handleDismiss(rec)}
                      size="sm"
                      variant="ghost"
                      className="text-slate-600"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </AnimatePresence>

      <AIEventThemeGenerator
        open={showThemeGenerator}
        onOpenChange={setShowThemeGenerator}
        onThemeGenerated={(activity) => {
          if (activity) {
            onScheduleActivity(activity);
          }
        }}
      />
    </Card>
  );
}