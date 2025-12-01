import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Sparkles, RefreshCw, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';

const ACTIVITY_TYPES = ['icebreaker', 'creative', 'competitive', 'wellness', 'learning', 'social'];

export default function AISettingsPanel() {
  const queryClient = useQueryClient();
  const [generating, setGenerating] = useState(false);

  const { data: preferences = [] } = useQuery({
    queryKey: ['preferences'],
    queryFn: () => base44.entities.ActivityPreference.list()
  });

  const currentPreference = preferences[0] || {
    preference_key: 'default',
    company_culture_notes: '',
    team_size: 40,
    preferred_types: [],
    avoid_types: [],
    optimal_times: [],
    ai_creativity_level: 'balanced',
    min_recommendation_confidence: 0.6
  };

  const [formData, setFormData] = useState(currentPreference);

  useEffect(() => {
    if (preferences[0]) {
      setFormData(preferences[0]);
    }
  }, [preferences]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (preferences[0]) {
        return base44.entities.ActivityPreference.update(preferences[0].id, data);
      } else {
        return base44.entities.ActivityPreference.create({
          ...data,
          preference_key: 'default'
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['preferences']);
      toast.success('Preferences saved! 🎉');
    }
  });

  const generateRecommendationsMutation = useMutation({
    mutationFn: () => base44.functions.invoke('generateRecommendations'),
    onSuccess: (response) => {
      queryClient.invalidateQueries(['ai-recommendations']);
      toast.success(`Generated ${response.data.recommendations_generated} new recommendations!`);
    }
  });

  const generateAIInsightsMutation = useMutation({
    mutationFn: () => base44.functions.invoke('generateAIInsights'),
    onSuccess: () => {
      queryClient.invalidateQueries(['ai-recommendations']);
      toast.success('AI insights generated! Check your dashboard.');
      setGenerating(false);
    },
    onError: () => {
      setGenerating(false);
      toast.error('Failed to generate insights');
    }
  });

  const toggleType = (type, field) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field]?.includes(type)
        ? prev[field].filter(t => t !== type)
        : [...(prev[field] || []), type]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <Card className="p-6 border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-purple-50">
        <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-indigo-600" />
          AI Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            onClick={() => generateRecommendationsMutation.mutate()}
            disabled={generateRecommendationsMutation.isPending}
            className="h-auto py-4 flex flex-col items-start gap-2 bg-white hover:bg-slate-50 text-left border-2 border-indigo-200"
            variant="outline"
          >
            {generateRecommendationsMutation.isPending ? (
              <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
            ) : (
              <RefreshCw className="h-5 w-5 text-indigo-600" />
            )}
            <div>
              <div className="font-semibold text-slate-900">Generate Rule-Based Recommendations</div>
              <div className="text-sm text-slate-600">Quick suggestions based on patterns</div>
            </div>
          </Button>

          <Button
            onClick={() => {
              setGenerating(true);
              generateAIInsightsMutation.mutate();
            }}
            disabled={generating}
            className="h-auto py-4 flex flex-col items-start gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-left"
          >
            {generating ? (
              <Loader2 className="h-5 w-5 animate-spin text-white" />
            ) : (
              <Sparkles className="h-5 w-5 text-white" />
            )}
            <div>
              <div className="font-semibold text-white">Generate Deep AI Insights</div>
              <div className="text-sm text-indigo-100">Advanced analysis with LLM (uses credits)</div>
            </div>
          </Button>
        </div>
      </Card>

      {/* Company Culture */}
      <Card className="p-6 border-0 shadow-lg">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Company Culture Context</h2>
        <div className="space-y-4">
          <div>
            <Label>Tell AI about your company culture</Label>
            <Textarea
              value={formData.company_culture_notes || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, company_culture_notes: e.target.value }))}
              placeholder="e.g., 'We're a tech startup with a casual culture. Team loves gaming and pop culture...'"
              rows={4}
              className="resize-none"
            />
            <p className="text-sm text-slate-500 mt-2">
              This context helps AI generate more relevant recommendations
            </p>
          </div>

          <div>
            <Label>Typical Team Size</Label>
            <Input
              type="number"
              value={formData.team_size || 40}
              onChange={(e) => setFormData(prev => ({ ...prev, team_size: parseInt(e.target.value) }))}
            />
          </div>
        </div>
      </Card>

      {/* Activity Preferences */}
      <Card className="p-6 border-0 shadow-lg">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Activity Preferences</h2>
        <div className="space-y-6">
          <div>
            <Label className="mb-3 block">Preferred Activity Types</Label>
            <div className="flex flex-wrap gap-2">
              {ACTIVITY_TYPES.map(type => (
                <Badge
                  key={type}
                  variant={formData.preferred_types?.includes(type) ? 'default' : 'outline'}
                  className="cursor-pointer px-4 py-2"
                  onClick={() => toggleType(type, 'preferred_types')}
                >
                  {type}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label className="mb-3 block">Types to Avoid</Label>
            <div className="flex flex-wrap gap-2">
              {ACTIVITY_TYPES.map(type => (
                <Badge
                  key={type}
                  variant={formData.avoid_types?.includes(type) ? 'destructive' : 'outline'}
                  className="cursor-pointer px-4 py-2"
                  onClick={() => toggleType(type, 'avoid_types')}
                >
                  {type}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* AI Tuning */}
      <Card className="p-6 border-0 shadow-lg">
        <h2 className="text-xl font-bold text-slate-900 mb-4">AI Behavior</h2>
        <div className="space-y-4">
          <div>
            <Label>AI Creativity Level</Label>
            <Select
              value={formData.ai_creativity_level || 'balanced'}
              onValueChange={(value) => setFormData(prev => ({ ...prev, ai_creativity_level: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="conservative">Conservative - Stick to proven activities</SelectItem>
                <SelectItem value="balanced">Balanced - Mix of safe and new ideas</SelectItem>
                <SelectItem value="creative">Creative - Push boundaries with novel suggestions</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Minimum Recommendation Confidence (0-1)</Label>
            <Input
              type="number"
              step="0.1"
              min="0"
              max="1"
              value={formData.min_recommendation_confidence || 0.6}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                min_recommendation_confidence: parseFloat(e.target.value) 
              }))}
            />
            <p className="text-sm text-slate-500 mt-2">
              Higher values = fewer but more confident recommendations
            </p>
          </div>
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={() => saveMutation.mutate(formData)}
          disabled={saveMutation.isPending}
          className="bg-emerald-600 hover:bg-emerald-700 px-8"
        >
          {saveMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Preferences
            </>
          )}
        </Button>
      </div>
    </div>
  );
}