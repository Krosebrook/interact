import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Calendar, Clock, Users, ThumbsUp, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function PersonalizedRecommendations({ 
  userEmail, 
  userProfile, 
  participationHistory,
  activities,
  onScheduleActivity 
}) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);

  const generateRecommendationsMutation = useMutation({
    mutationFn: async () => {
      setLoading(true);
      
      // Analyze user's participation history
      const attendedActivityTypes = participationHistory
        .map(p => {
          const activity = activities.find(a => a.id === p.activity_id);
          return activity?.type;
        })
        .filter(Boolean);

      const typeFrequency = attendedActivityTypes.reduce((acc, type) => {
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});

      const avgEngagement = participationHistory.length > 0
        ? participationHistory.reduce((sum, p) => sum + (p.engagement_score || 0), 0) / participationHistory.length
        : 0;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Based on this user's participation history, recommend 4 activities they would enjoy:

User Profile:
- Preferred activity types: ${userProfile?.activity_preferences?.preferred_types?.join(', ') || 'Not specified'}
- Preferred duration: ${userProfile?.activity_preferences?.preferred_duration || 'Any'}
- Energy preference: ${userProfile?.activity_preferences?.energy_preference || 'Medium'}

Participation History:
- Total events attended: ${participationHistory.length}
- Most frequent activity types: ${Object.entries(typeFrequency).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([type, count]) => `${type} (${count})`).join(', ')}
- Average engagement score: ${avgEngagement.toFixed(1)}/5

Available activity types: icebreaker, creative, competitive, wellness, learning, social

Recommend activities that:
1. Match their preferences and history
2. Include some variety to try new things
3. Consider their engagement patterns

For each recommendation, explain why it's a good fit.`,
        response_json_schema: {
          type: "object",
          properties: {
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  activity_type: { type: "string" },
                  activity_title: { type: "string" },
                  description: { type: "string" },
                  why_recommended: { type: "string" },
                  match_score: { type: "number" },
                  suggested_duration: { type: "string" },
                  best_for: { type: "string" }
                }
              }
            }
          }
        }
      });

      return response.recommendations;
    },
    onSuccess: (data) => {
      setRecommendations(data);
      setLoading(false);
    },
    onError: () => {
      toast.error('Failed to generate recommendations');
      setLoading(false);
    }
  });

  return (
    <Card data-b44-sync="true" data-feature="ai" data-component="personalizedrecommendations" className="border-0 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-int-orange" />
          Recommended For You
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={() => generateRecommendationsMutation.mutate()}
          disabled={loading}
        >
          {loading ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {recommendations.length === 0 && !loading ? (
          <div className="text-center py-8">
            <Sparkles className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">Get personalized activity recommendations</p>
            <Button 
              className="mt-4 bg-int-orange hover:bg-[#C46322]"
              onClick={() => generateRecommendationsMutation.mutate()}
            >
              Generate Recommendations
            </Button>
          </div>
        ) : loading ? (
          <div className="text-center py-8">
            <RefreshCw className="h-8 w-8 text-int-orange animate-spin mx-auto mb-3" />
            <p className="text-slate-500">Analyzing your preferences...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.map((rec, idx) => (
              <div 
                key={idx}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <Badge variant="outline">{rec.activity_type}</Badge>
                  <div className="flex items-center gap-1 text-sm">
                    <ThumbsUp className="h-3 w-3 text-green-500" />
                    <span className="text-green-600">{Math.round(rec.match_score * 100)}% match</span>
                  </div>
                </div>
                
                <h4 className="font-semibold mb-1">{rec.activity_title}</h4>
                <p className="text-sm text-slate-600 mb-3">{rec.description}</p>
                
                <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {rec.suggested_duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {rec.best_for}
                  </span>
                </div>
                
                <div className="bg-slate-50 rounded p-2 mb-3">
                  <p className="text-xs text-slate-600">
                    <span className="font-medium">Why this fits you: </span>
                    {rec.why_recommended}
                  </p>
                </div>
                
                <Button 
                  size="sm" 
                  className="w-full bg-int-navy hover:bg-int-navy/90"
                  onClick={() => onScheduleActivity?.(rec)}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule This
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}