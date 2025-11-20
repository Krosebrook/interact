import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, TrendingUp, Heart, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PersonalizedRecommendations({ participations, allEvents, activities }) {
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: recommendations, refetch } = useQuery({
    queryKey: ['personalized-recommendations'],
    queryFn: async () => {
      setIsGenerating(true);
      try {
        // Analyze participation history
        const attendedEvents = participations.filter(p => p.attended);
        const feedbackData = participations
          .filter(p => p.feedback || p.engagement_score)
          .map(p => ({
            event: allEvents.find(e => e.id === p.event_id),
            activity: activities.find(a => a.id === allEvents.find(e => e.id === p.event_id)?.activity_id),
            engagement: p.engagement_score,
            feedback: p.feedback
          }));

        const activityTypePreferences = {};
        feedbackData.forEach(({ activity, engagement }) => {
          if (activity?.type) {
            activityTypePreferences[activity.type] = 
              (activityTypePreferences[activity.type] || 0) + (engagement || 3);
          }
        });

        const prompt = `You are a team engagement expert. Based on this participant's history, recommend 3 activities they'd love:

Attendance: ${attendedEvents.length} events
Activity preferences: ${JSON.stringify(activityTypePreferences)}
Past feedback highlights: ${feedbackData.slice(0, 3).map(f => f.feedback).filter(Boolean).join('; ')}

Available activity types: icebreaker, creative, competitive, wellness, learning, social

For each recommendation, provide:
1. Activity type
2. Specific activity title suggestion
3. Why this matches their interests (personal, engaging)
4. Predicted engagement level (1-5)

Be specific and personalized.`;

        const response = await base44.integrations.Core.InvokeLLM({
          prompt,
          response_json_schema: {
            type: "object",
            properties: {
              recommendations: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    activity_type: { type: "string" },
                    title: { type: "string" },
                    reasoning: { type: "string" },
                    predicted_engagement: { type: "number" }
                  }
                }
              },
              insights: { type: "string" }
            }
          }
        });

        return response;
      } finally {
        setIsGenerating(false);
      }
    },
    enabled: participations.length > 0,
    staleTime: 1000 * 60 * 30 // 30 minutes
  });

  if (participations.length === 0) {
    return (
      <Card className="p-12 text-center border-2 border-dashed">
        <Sparkles className="h-12 w-12 text-slate-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Build Your Profile</h3>
        <p className="text-slate-600">
          Attend events and provide feedback to get personalized recommendations!
        </p>
      </Card>
    );
  }

  if (isGenerating) {
    return (
      <Card className="p-12 text-center">
        <Loader2 className="h-12 w-12 text-indigo-600 mx-auto mb-4 animate-spin" />
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          Analyzing your preferences...
        </h3>
        <p className="text-slate-600">Creating personalized recommendations</p>
      </Card>
    );
  }

  if (!recommendations) {
    return (
      <Card className="p-12 text-center">
        <Button onClick={() => refetch()} className="bg-gradient-to-r from-purple-600 to-indigo-600">
          <Sparkles className="h-4 w-4 mr-2" />
          Generate Recommendations
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Insights */}
      <Card className="p-6 bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
        <div className="flex items-start gap-3">
          <TrendingUp className="h-6 w-6 text-purple-600 mt-1" />
          <div>
            <h3 className="font-bold text-lg text-purple-900 mb-2">Your Activity Insights</h3>
            <p className="text-purple-700">{recommendations.insights}</p>
          </div>
        </div>
      </Card>

      {/* Recommendations */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-900">Recommended for You</h3>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <Sparkles className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.recommendations?.map((rec, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="p-6 border-2 border-indigo-200 hover:border-indigo-400 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <Badge className="bg-indigo-600">{rec.activity_type}</Badge>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Heart
                        key={idx}
                        className={`h-4 w-4 ${
                          idx < rec.predicted_engagement
                            ? 'fill-pink-500 text-pink-500'
                            : 'text-slate-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <h4 className="font-bold text-lg mb-2">{rec.title}</h4>
                <p className="text-sm text-slate-700 mb-4">{rec.reasoning}</p>

                <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                  Request This Activity
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Activity Match Stats */}
      <Card className="p-6">
        <h3 className="font-bold text-lg mb-4">Your Activity Profile</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <p className="text-2xl font-bold text-indigo-600">
              {participations.filter(p => p.attended).length}
            </p>
            <p className="text-sm text-slate-600">Events Attended</p>
          </div>
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <p className="text-2xl font-bold text-emerald-600">
              {(participations.reduce((sum, p) => sum + (p.engagement_score || 0), 0) / 
                participations.filter(p => p.engagement_score).length || 0).toFixed(1)}
            </p>
            <p className="text-sm text-slate-600">Avg Engagement</p>
          </div>
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <p className="text-2xl font-bold text-purple-600">
              {participations.filter(p => p.feedback).length}
            </p>
            <p className="text-sm text-slate-600">Feedbacks Given</p>
          </div>
        </div>
      </Card>
    </div>
  );
}