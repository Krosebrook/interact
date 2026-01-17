import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, CheckCircle, XCircle, Zap } from 'lucide-react';

export default function AIBadgeSuggestions() {
  const queryClient = useQueryClient();

  const { data: suggestions, isLoading } = useQuery({
    queryKey: ['badgeSuggestions'],
    queryFn: () => base44.asServiceRole.entities.BadgeCriteriaSuggestion.list()
  });

  const generateSuggestionsMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('aiDynamicBadgeSuggestions', {});
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['badgeSuggestions'] })
  });

  const approveSuggestionMutation = useMutation({
    mutationFn: async (suggestionId) => {
      return base44.asServiceRole.entities.BadgeCriteriaSuggestion.update(suggestionId, {
        status: 'approved'
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['badgeSuggestions'] })
  });

  const rejectSuggestionMutation = useMutation({
    mutationFn: async (suggestionId) => {
      return base44.asServiceRole.entities.BadgeCriteriaSuggestion.update(suggestionId, {
        status: 'rejected'
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['badgeSuggestions'] })
  });

  const rarityColors = {
    common: 'bg-slate-100 text-slate-800',
    uncommon: 'bg-green-100 text-green-800',
    rare: 'bg-blue-100 text-blue-800',
    legendary: 'bg-purple-100 text-purple-800'
  };

  const statusColor = {
    suggested: 'bg-yellow-50',
    approved: 'bg-green-50',
    implemented: 'bg-blue-50',
    rejected: 'bg-red-50'
  };

  const suggested = suggestions?.filter(s => s.status === 'suggested') || [];
  const approved = suggestions?.filter(s => s.status === 'approved') || [];
  const implemented = suggestions?.filter(s => s.status === 'implemented') || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">AI Badge Suggestions</h1>
          <p className="text-slate-600 mt-1">AI-generated badge criteria based on emerging skill trends</p>
        </div>
        <Button onClick={() => generateSuggestionsMutation.mutate()}>
          <Sparkles className="w-4 h-4 mr-2" />
          Generate New Suggestions
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{suggested.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{approved.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Implemented</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{implemented.length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold mb-3">Pending Review</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {suggested.map(suggestion => (
              <Card key={suggestion.id} className={statusColor[suggestion.status]}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{suggestion.badge_name}</CardTitle>
                      <CardDescription>{suggestion.badge_description}</CardDescription>
                    </div>
                    <Badge className={rarityColors[suggestion.expected_rarity]}>
                      {suggestion.expected_rarity}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-medium mb-1">Skill Trend:</p>
                    <p className="text-sm text-slate-700">{suggestion.skill_trend}</p>
                  </div>

                  {suggestion.user_behavior_insights?.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-1">Why Users Will Value This:</p>
                      <ul className="text-sm space-y-1">
                        {suggestion.user_behavior_insights.map((insight, idx) => (
                          <li key={idx} className="flex items-start">
                            <span className="mr-2">•</span>
                            {insight}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => approveSuggestionMutation.mutate(suggestion.id)}
                      className="flex-1"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => rejectSuggestionMutation.mutate(suggestion.id)}
                      className="flex-1"
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {approved.length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-3">Approved (Ready to Implement)</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {approved.map(suggestion => (
                <Card key={suggestion.id} className={statusColor[suggestion.status]}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{suggestion.badge_name}</CardTitle>
                      <Badge className={rarityColors[suggestion.expected_rarity]}>
                        {suggestion.expected_rarity}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-700 mb-3">{suggestion.badge_description}</p>
                    <Button size="sm" className="w-full">
                      <Zap className="w-4 h-4 mr-1" />
                      Implement Badge
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}