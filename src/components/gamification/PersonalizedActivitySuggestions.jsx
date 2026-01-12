import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, RefreshCw, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function PersonalizedActivitySuggestions({ userEmail, onScheduleActivity }) {
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: userPoints = [] } = useQuery({
    queryKey: ['user-points', userEmail],
    queryFn: () => base44.entities.UserPoints.filter({ user_email: userEmail }),
    enabled: !!userEmail
  });

  const { data: participations = [] } = useQuery({
    queryKey: ['user-participations', userEmail],
    queryFn: () => base44.entities.Participation.filter({ participant_email: userEmail }),
    enabled: !!userEmail
  });

  const { data: activities = [] } = useQuery({
    queryKey: ['activities'],
    queryFn: () => base44.entities.Activity.list()
  });

  const { data: suggestions, refetch, isLoading } = useQuery({
    queryKey: ['activity-suggestions', userEmail],
    queryFn: async () => {
      const userData = userPoints[0];
      if (!userData) return null;

      // Analyze user preferences
      const activityTypes = {};
      participations.forEach(p => {
        const activity = activities.find(a => a.id === p.event_id);
        if (activity?.type) {
          activityTypes[activity.type] = (activityTypes[activity.type] || 0) + 1;
        }
      });

      const prompt = `Based on this user's engagement data, suggest 3 personalized activities they would enjoy:

User Profile:
- Total Points: ${userData.total_points}
- Level: ${userData.level}
- Events Attended: ${userData.events_attended}
- Activities Completed: ${userData.activities_completed}
- Feedback Submitted: ${userData.feedback_submitted}
- Current Streak: ${userData.streak_days} days
- Preferred Activity Types: ${Object.entries(activityTypes).sort((a, b) => b[1] - a[1]).map(([type, count]) => `${type} (${count})`).join(', ') || 'None yet'}

Available Activity Types: icebreaker, creative, competitive, wellness, learning, social

For each suggestion, provide:
1. Activity type (from the list above)
2. Title (engaging and specific)
3. Description (2-3 sentences why this is perfect for them)
4. Reason (why this matches their profile)

Consider their engagement level, preferences, and what would challenge/motivate them next.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            suggestions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: { type: "string" },
                  title: { type: "string" },
                  description: { type: "string" },
                  reason: { type: "string" }
                }
              }
            }
          }
        }
      });

      return response.suggestions;
    },
    enabled: !!userEmail && userPoints.length > 0 && activities.length > 0,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  const handleRefresh = async () => {
    setIsGenerating(true);
    try {
      await refetch();
      toast.success('New suggestions generated! ✨');
    } catch (error) {
      toast.error('Failed to generate suggestions');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!userPoints[0]) return null;

  return (
    <Card data-b44-sync="true" data-feature="gamification" data-component="personalizedactivitysuggestions" className="border-2 border-int-orange/30 bg-gradient-to-br from-orange-50 to-slate-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-int-orange" />
            AI Suggestions Just For You
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isGenerating || isLoading}
            className="border-int-orange text-int-orange hover:bg-int-orange hover:text-white"
          >
            <RefreshCw className={`h-4 w-4 ${isGenerating || isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-slate-200 animate-pulse rounded-lg" />
            ))}
          </div>
        ) : suggestions && suggestions.length > 0 ? (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {suggestions.map((suggestion, index) => (
                <motion.div
                  key={`${suggestion.title}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 bg-white rounded-lg border-2 border-slate-200 hover:border-int-orange transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-int-navy">{suggestion.title}</h4>
                        <Badge className="bg-int-orange text-white text-xs">{suggestion.type}</Badge>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{suggestion.description}</p>
                      <p className="text-xs text-slate-500 italic">💡 {suggestion.reason}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => onScheduleActivity?.(suggestion)}
                    className="w-full bg-int-orange hover:bg-[#C46322] text-white mt-3"
                  >
                    <Calendar className="h-3 w-3 mr-2" />
                    Schedule This Activity
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-6 text-slate-600">
            <Sparkles className="h-12 w-12 mx-auto mb-3 text-slate-400" />
            <p>Complete more activities to get personalized suggestions!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}