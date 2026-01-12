import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  Calendar, 
  CheckCircle, 
  X,
  Info,
  Wand2,
  Zap
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
  // All hooks must be called before any conditional returns
  const [showThemeGenerator, setShowThemeGenerator] = useState(false);
  const queryClient = useQueryClient();

  const { data: recommendations = [], isLoading } = useQuery({
    queryKey: ['ai-recommendations'],
    queryFn: () => base44.entities.AIRecommendation.filter({ status: 'pending' }),
    refetchInterval: 60000
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

  // Conditional rendering after all hooks
  if (isLoading) {
    return (
      <div data-b44-sync="true" data-feature="ai" data-component="aisuggestionswidget" className="glass-panel-solid">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-indigo-500/20">
            <Sparkles className="h-5 w-5 text-purple-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">AI Suggestions</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-slate-100 animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel-solid relative overflow-hidden">
      {/* Decorative gradient */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 rounded-full transform translate-x-12 -translate-y-12 blur-2xl" />
      
      <div className="relative">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-indigo-500/20">
              <Sparkles className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">AI Suggestions</h3>
              <p className="text-sm text-slate-600">Smart activity recommendations</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowThemeGenerator(true)}
              size="sm"
              variant="outline"
              className="border-purple-200 text-purple-700 hover:bg-purple-50"
            >
              <Wand2 className="h-4 w-4 mr-1" />
              Theme Generator
            </Button>
            <Button
              onClick={onGenerateCustom}
              size="sm"
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg"
            >
              <Zap className="h-4 w-4 mr-1" />
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
              className="text-center py-10 px-4"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-purple-400" />
              </div>
              <p className="text-slate-600 font-medium mb-2">No new recommendations</p>
              <p className="text-sm text-slate-600">
                Click "Quick Generate" to create a custom activity!
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
                    className="bg-gradient-to-r from-slate-50 to-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-all hover:border-purple-200"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xl">{typeIcons[rec.recommendation_type]}</span>
                          <Badge className="bg-purple-100 text-purple-700 text-xs">
                            {rec.recommendation_type.replace('_', ' ')}
                          </Badge>
                          {rec.confidence_score && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Badge variant="outline" className="text-xs bg-white">
                                    {Math.round(rec.confidence_score * 100)}% match
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
                          <Info className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-slate-600 line-clamp-2">{rec.reasoning}</p>
                        </div>

                        {rec.context?.date_context && (
                          <div className="flex items-center gap-1 text-xs text-slate-600">
                            <Calendar className="h-3 w-3" />
                            <span>{rec.context.date_context}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleAccept(rec)}
                        size="sm"
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Accept & Schedule
                      </Button>
                      <Button
                        onClick={() => handleDismiss(rec)}
                        size="sm"
                        variant="ghost"
                        className="text-slate-500 hover:text-slate-700 hover:bg-slate-100"
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
      </div>

      <AIEventThemeGenerator
        open={showThemeGenerator}
        onOpenChange={setShowThemeGenerator}
        onThemeGenerated={(activity) => {
          if (activity) {
            onScheduleActivity(activity);
          }
        }}
      />
    </div>
  );
}