import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, TrendingUp, Users, Plus, Loader2 } from 'lucide-react';

export default function AISegmentSuggestions() {
  const queryClient = useQueryClient();
  const [expandedSuggestion, setExpandedSuggestion] = useState(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['ai-segment-suggestions'],
    queryFn: async () => {
      const response = await base44.functions.invoke('aiSegmentationEngine', {
        action: 'suggest_segments'
      });
      return response.data;
    },
    staleTime: 300000 // 5 minutes
  });

  const createSegmentMutation = useMutation({
    mutationFn: async (suggestion) => {
      return await base44.entities.UserSegment.create({
        segment_name: suggestion.segment_name,
        display_name: suggestion.display_name,
        description: suggestion.description,
        criteria: suggestion.criteria,
        is_dynamic: true,
        auto_recalculate_frequency: 'daily',
        tags: ['ai_suggested']
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['user-segments']);
      alert('AI-suggested segment created successfully!');
    }
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-purple-600" />
          <p className="text-sm text-slate-600 mt-2">AI is analyzing user behavior patterns...</p>
        </CardContent>
      </Card>
    );
  }

  const suggestions = data?.suggestions || [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <CardTitle>AI Segment Suggestions</CardTitle>
          </div>
          <Button size="sm" variant="outline" onClick={() => refetch()}>
            <Sparkles className="w-4 h-4 mr-2" />
            Regenerate
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {suggestions.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-8">
            No suggestions available. Click Regenerate to analyze current data.
          </p>
        ) : (
          suggestions.map((suggestion, idx) => (
            <div
              key={idx}
              className="border rounded-lg p-4 hover:border-purple-300 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-slate-900">
                      {suggestion.display_name}
                    </h3>
                    <Badge variant="outline" className="text-xs">
                      {suggestion.confidence}% confidence
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600 mb-3">
                    {suggestion.description}
                  </p>
                  
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      ~{suggestion.predicted_size} users
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {suggestion.campaign_recommendations?.channel}
                    </div>
                  </div>

                  {expandedSuggestion === idx && (
                    <div className="mt-4 pt-4 border-t space-y-2">
                      <div>
                        <p className="text-xs font-semibold text-slate-700 mb-1">Reasoning:</p>
                        <p className="text-xs text-slate-600">{suggestion.reasoning}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-700 mb-1">
                          Campaign Recommendations:
                        </p>
                        <div className="flex gap-2">
                          <Badge variant="outline" className="text-xs">
                            Channel: {suggestion.campaign_recommendations?.channel}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Timing: {suggestion.campaign_recommendations?.timing}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Tone: {suggestion.campaign_recommendations?.message_tone}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  <Button
                    size="sm"
                    onClick={() => createSegmentMutation.mutate(suggestion)}
                    disabled={createSegmentMutation.isPending}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Create
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setExpandedSuggestion(expandedSuggestion === idx ? null : idx)}
                  >
                    {expandedSuggestion === idx ? 'Less' : 'Details'}
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}