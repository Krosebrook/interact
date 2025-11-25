import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Sparkles, 
  Loader2, 
  RefreshCw,
  Plus,
  X,
  Pencil,
  GripVertical,
  Clock,
  Trash2,
  ArrowLeft,
  CheckCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const ACTIVITY_TYPES = [
  { value: 'icebreaker', label: 'Icebreaker' },
  { value: 'creative', label: 'Creative' },
  { value: 'competitive', label: 'Competitive' },
  { value: 'wellness', label: 'Wellness' },
  { value: 'learning', label: 'Learning' },
  { value: 'social', label: 'Social' },
];

const OUTCOME_SUGGESTIONS = [
  'Improved team bonding',
  'Better communication',
  'Increased creativity',
  'Stress relief',
  'Problem-solving skills',
  'Trust building',
  'Knowledge sharing',
  'Fun & enjoyment',
];

export default function ThemeCustomizer({ theme, inputs, onSave, onBack }) {
  const [editedTheme, setEditedTheme] = useState({ ...theme });
  const [editingSegment, setEditingSegment] = useState(null);
  const [newOutcome, setNewOutcome] = useState('');
  const [regeneratingField, setRegeneratingField] = useState(null);

  const regenerateFieldMutation = useMutation({
    mutationFn: async ({ field, context }) => {
      const prompts = {
        tagline: `Generate a new compelling tagline (8-12 words) for a team event called "${editedTheme.theme_name}". Theme description: ${editedTheme.description}. Make it catchy and memorable.`,
        icebreaker_suggestion: `Suggest a new icebreaker activity for a team event with these details:
- Theme: ${editedTheme.theme_name}
- Team size: ${inputs.teamSize} people
- Setup: ${inputs.teamContext}
- Energy level: ${inputs.energyLevel}/5
Make it specific, actionable, and 2-3 sentences.`,
        energy_arc: `Describe the ideal energy flow for this event:
- Theme: ${editedTheme.theme_name}
- Duration: ${inputs.duration} minutes
- Activity type: ${editedTheme.activity_type}
Describe how energy should build, peak, and wind down through the session in 2-3 sentences.`,
        facilitator_tips: `Provide 3-4 facilitator tips for running this team event:
- Theme: ${editedTheme.theme_name}
- Team size: ${inputs.teamSize} people
- Setup: ${inputs.teamContext}
Keep each tip concise and actionable.`,
      };

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompts[field],
        response_json_schema: {
          type: "object",
          properties: {
            result: { type: "string" }
          }
        }
      });

      return { field, result: response.result };
    },
    onSuccess: ({ field, result }) => {
      setEditedTheme(prev => ({ ...prev, [field]: result }));
      setRegeneratingField(null);
      toast.success(`${field.replace('_', ' ')} regenerated!`);
    },
    onError: () => {
      setRegeneratingField(null);
      toast.error('Failed to regenerate. Please try again.');
    }
  });

  const regenerateSegmentMutation = useMutation({
    mutationFn: async ({ segmentIndex, currentSegment }) => {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate an alternative activity segment for this team event:
- Theme: ${editedTheme.theme_name}
- Current segment name: ${currentSegment.name}
- Duration: ${currentSegment.duration_minutes} minutes
- Team size: ${inputs.teamSize} people
- Setup: ${inputs.teamContext}

Create a fresh alternative that fits the same time slot but offers a different approach.`,
        response_json_schema: {
          type: "object",
          properties: {
            name: { type: "string" },
            duration_minutes: { type: "number" },
            description: { type: "string" }
          }
        }
      });

      return { segmentIndex, segment: response };
    },
    onSuccess: ({ segmentIndex, segment }) => {
      const newSegments = [...editedTheme.segments];
      newSegments[segmentIndex] = segment;
      setEditedTheme(prev => ({ ...prev, segments: newSegments }));
      toast.success('Segment regenerated!');
    }
  });

  const handleRegenerateField = (field) => {
    setRegeneratingField(field);
    regenerateFieldMutation.mutate({ field, context: editedTheme });
  };

  const handleUpdateSegment = (index, updates) => {
    const newSegments = [...editedTheme.segments];
    newSegments[index] = { ...newSegments[index], ...updates };
    setEditedTheme(prev => ({ ...prev, segments: newSegments }));
  };

  const handleAddSegment = () => {
    const newSegment = {
      name: 'New Segment',
      duration_minutes: 5,
      description: 'Describe this segment...'
    };
    setEditedTheme(prev => ({
      ...prev,
      segments: [...(prev.segments || []), newSegment]
    }));
    setEditingSegment(editedTheme.segments?.length || 0);
  };

  const handleRemoveSegment = (index) => {
    const newSegments = editedTheme.segments.filter((_, i) => i !== index);
    setEditedTheme(prev => ({ ...prev, segments: newSegments }));
    if (editingSegment === index) setEditingSegment(null);
  };

  const handleAddOutcome = () => {
    if (!newOutcome.trim()) return;
    setEditedTheme(prev => ({
      ...prev,
      expected_outcomes: [...(prev.expected_outcomes || []), newOutcome.trim()]
    }));
    setNewOutcome('');
  };

  const handleRemoveOutcome = (index) => {
    const newOutcomes = editedTheme.expected_outcomes.filter((_, i) => i !== index);
    setEditedTheme(prev => ({ ...prev, expected_outcomes: newOutcomes }));
  };

  const handleAddSuggestedOutcome = (outcome) => {
    if (editedTheme.expected_outcomes?.includes(outcome)) return;
    setEditedTheme(prev => ({
      ...prev,
      expected_outcomes: [...(prev.expected_outcomes || []), outcome]
    }));
  };

  const totalDuration = editedTheme.segments?.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) || 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h3 className="text-lg font-bold text-slate-900">Customize Your Theme</h3>
          <p className="text-sm text-slate-600">Fine-tune every aspect of your event</p>
        </div>
      </div>

      {/* Theme Header */}
      <Card className="p-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="space-y-3">
          <div>
            <Label className="text-purple-200 text-xs">Theme Name</Label>
            <Input
              value={editedTheme.theme_name}
              onChange={(e) => setEditedTheme(prev => ({ ...prev, theme_name: e.target.value }))}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50 text-lg font-bold"
            />
          </div>
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Label className="text-purple-200 text-xs">Tagline</Label>
              <Input
                value={editedTheme.tagline}
                onChange={(e) => setEditedTheme(prev => ({ ...prev, tagline: e.target.value }))}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 italic"
              />
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="text-white hover:bg-white/20"
              onClick={() => handleRegenerateField('tagline')}
              disabled={regeneratingField === 'tagline'}
            >
              {regeneratingField === 'tagline' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </div>
          <div className="flex gap-2">
            <Select
              value={editedTheme.activity_type}
              onValueChange={(val) => setEditedTheme(prev => ({ ...prev, activity_type: val }))}
            >
              <SelectTrigger className="w-40 bg-white/10 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACTIVITY_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Description */}
      <div>
        <Label className="font-semibold">Description</Label>
        <Textarea
          value={editedTheme.description}
          onChange={(e) => setEditedTheme(prev => ({ ...prev, description: e.target.value }))}
          rows={4}
          className="mt-1"
        />
      </div>

      {/* Event Segments */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <Label className="font-semibold">Event Segments</Label>
            <p className="text-xs text-slate-500">
              Total: {totalDuration} min {inputs.duration && totalDuration !== parseInt(inputs.duration) && (
                <span className={totalDuration > parseInt(inputs.duration) ? 'text-red-500' : 'text-amber-500'}>
                  (target: {inputs.duration} min)
                </span>
              )}
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={handleAddSegment}>
            <Plus className="h-4 w-4 mr-1" />
            Add Segment
          </Button>
        </div>

        <div className="space-y-2">
          <AnimatePresence>
            {editedTheme.segments?.map((segment, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-slate-50 rounded-lg border"
              >
                {editingSegment === idx ? (
                  <div className="p-4 space-y-3">
                    <Input
                      value={segment.name}
                      onChange={(e) => handleUpdateSegment(idx, { name: e.target.value })}
                      placeholder="Segment name"
                      className="font-medium"
                    />
                    <div className="flex gap-2">
                      <div className="w-24">
                        <Label className="text-xs">Duration</Label>
                        <div className="flex items-center gap-1">
                          <Input
                            type="number"
                            value={segment.duration_minutes}
                            onChange={(e) => handleUpdateSegment(idx, { duration_minutes: parseInt(e.target.value) || 0 })}
                            className="text-center"
                            min={1}
                          />
                          <span className="text-xs text-slate-500">min</span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <Label className="text-xs">Description</Label>
                        <Textarea
                          value={segment.description}
                          onChange={(e) => handleUpdateSegment(idx, { description: e.target.value })}
                          rows={2}
                        />
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => regenerateSegmentMutation.mutate({ segmentIndex: idx, currentSegment: segment })}
                        disabled={regenerateSegmentMutation.isLoading}
                      >
                        {regenerateSegmentMutation.isLoading ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4 mr-1" />
                        )}
                        Regenerate
                      </Button>
                      <Button size="sm" onClick={() => setEditingSegment(null)}>
                        Done
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 flex items-start gap-3">
                    <div className="flex items-center gap-2 text-slate-400">
                      <GripVertical className="h-4 w-4" />
                      <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {idx + 1}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{segment.name}</span>
                        <Badge variant="outline" className="text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          {segment.duration_minutes} min
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2">{segment.description}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditingSegment(idx)}>
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500" onClick={() => handleRemoveSegment(idx)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Expected Outcomes */}
      <div>
        <Label className="font-semibold mb-2 block">Expected Outcomes</Label>
        <div className="flex flex-wrap gap-2 mb-3">
          {editedTheme.expected_outcomes?.map((outcome, idx) => (
            <Badge key={idx} variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 pr-1">
              ✓ {outcome}
              <button
                onClick={() => handleRemoveOutcome(idx)}
                className="ml-2 hover:bg-emerald-200 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
        <div className="flex gap-2 mb-2">
          <Input
            value={newOutcome}
            onChange={(e) => setNewOutcome(e.target.value)}
            placeholder="Add custom outcome..."
            onKeyPress={(e) => e.key === 'Enter' && handleAddOutcome()}
          />
          <Button onClick={handleAddOutcome} disabled={!newOutcome.trim()}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-1">
          <span className="text-xs text-slate-500 mr-1">Suggestions:</span>
          {OUTCOME_SUGGESTIONS.filter(o => !editedTheme.expected_outcomes?.includes(o)).slice(0, 4).map((outcome) => (
            <button
              key={outcome}
              onClick={() => handleAddSuggestedOutcome(outcome)}
              className="text-xs px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded-full transition"
            >
              + {outcome}
            </button>
          ))}
        </div>
      </div>

      {/* Icebreaker */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <Label className="font-semibold">Icebreaker Suggestion</Label>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleRegenerateField('icebreaker_suggestion')}
            disabled={regeneratingField === 'icebreaker_suggestion'}
          >
            {regeneratingField === 'icebreaker_suggestion' ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-1" />
            )}
            Regenerate
          </Button>
        </div>
        <Textarea
          value={editedTheme.icebreaker_suggestion}
          onChange={(e) => setEditedTheme(prev => ({ ...prev, icebreaker_suggestion: e.target.value }))}
          rows={2}
        />
      </div>

      {/* Energy Arc */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <Label className="font-semibold">Energy Arc</Label>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleRegenerateField('energy_arc')}
            disabled={regeneratingField === 'energy_arc'}
          >
            {regeneratingField === 'energy_arc' ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-1" />
            )}
            Regenerate
          </Button>
        </div>
        <Textarea
          value={editedTheme.energy_arc}
          onChange={(e) => setEditedTheme(prev => ({ ...prev, energy_arc: e.target.value }))}
          rows={2}
        />
      </div>

      {/* Facilitator Tips */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <Label className="font-semibold">Facilitator Tips</Label>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleRegenerateField('facilitator_tips')}
            disabled={regeneratingField === 'facilitator_tips'}
          >
            {regeneratingField === 'facilitator_tips' ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-1" />
            )}
            Regenerate
          </Button>
        </div>
        <Textarea
          value={editedTheme.facilitator_tips}
          onChange={(e) => setEditedTheme(prev => ({ ...prev, facilitator_tips: e.target.value }))}
          rows={3}
        />
      </div>

      {/* Materials */}
      <div>
        <Label className="font-semibold">Materials Needed</Label>
        <Textarea
          value={editedTheme.materials_needed}
          onChange={(e) => setEditedTheme(prev => ({ ...prev, materials_needed: e.target.value }))}
          rows={2}
          className="mt-1"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t">
        <Button variant="outline" onClick={onBack} className="flex-1">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Themes
        </Button>
        <Button
          onClick={() => onSave(editedTheme)}
          className="flex-1 bg-purple-600 hover:bg-purple-700"
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Save & Create Activity
        </Button>
      </div>
    </motion.div>
  );
}