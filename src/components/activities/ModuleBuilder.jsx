import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Plus, Trash2, GripVertical, Save, Sparkles, Loader2, Shuffle } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function ModuleBuilder({ open, onOpenChange, onActivityCreated }) {
  const queryClient = useQueryClient();
  const [activityData, setActivityData] = useState({
    title: '',
    description: '',
    type: 'social',
    duration: '15-30min',
    interaction_type: 'discussion'
  });
  const [selectedModules, setSelectedModules] = useState([]);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const { data: modules = [] } = useQuery({
    queryKey: ['activity-modules'],
    queryFn: () => base44.entities.ActivityModule.list(),
    enabled: open
  });

  const createActivityMutation = useMutation({
    mutationFn: async (data) => {
      const totalDuration = selectedModules.reduce((sum, m) => sum + (m.duration_minutes || 0), 0);
      const allMaterials = [...new Set(selectedModules.map(m => m.materials).filter(Boolean))].join(', ');
      const combinedInstructions = selectedModules
        .map((m, i) => `${i + 1}. ${m.name} (${m.duration_minutes}min)\n${m.content}`)
        .join('\n\n');

      const activity = await base44.entities.Activity.create({
        title: data.title,
        description: data.description,
        instructions: combinedInstructions,
        type: data.type,
        duration: totalDuration > 30 ? '30+min' : totalDuration > 15 ? '15-30min' : '5-15min',
        materials_needed: allMaterials || 'None',
        interaction_type: data.interaction_type,
        is_template: false,
        popularity_score: 0
      });

      return activity;
    },
    onSuccess: (activity) => {
      queryClient.invalidateQueries(['activities']);
      toast.success('Activity created from modules! 🎉');
      onActivityCreated(activity);
      handleClose();
    }
  });

  const handleAddModule = (moduleId) => {
    const module = modules.find(m => m.id === moduleId);
    if (module) {
      setSelectedModules(prev => [...prev, module]);
    }
  };

  const handleRemoveModule = (index) => {
    setSelectedModules(prev => prev.filter((_, i) => i !== index));
  };

  const handleMoveModule = (index, direction) => {
    const newModules = [...selectedModules];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < newModules.length) {
      [newModules[index], newModules[targetIndex]] = [newModules[targetIndex], newModules[index]];
      setSelectedModules(newModules);
    }
  };

  const handleCreate = () => {
    if (!activityData.title || selectedModules.length === 0) {
      toast.error('Add a title and at least one module');
      return;
    }
    createActivityMutation.mutate(activityData);
  };

  const generateAIModuleSuggestions = async () => {
    if (!aiPrompt) {
      toast.error('Please provide a prompt for AI suggestions');
      return;
    }

    setIsGeneratingAI(true);
    try {
      const modulesList = modules.map(m => ({
        id: m.id,
        name: m.name,
        description: m.description,
        type: m.module_type,
        duration: m.duration_minutes,
        tags: m.tags
      }));

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert activity designer. Based on this request: "${aiPrompt}"

Available modules:
${JSON.stringify(modulesList, null, 2)}

Please:
1. Select the most relevant module IDs from the list above
2. Arrange them in an optimal sequence for a cohesive activity flow
3. Provide reasoning for your selection and sequence

Consider: flow, engagement, duration balance, and logical progression.`,
        response_json_schema: {
          type: "object",
          properties: {
            selected_module_ids: {
              type: "array",
              items: { type: "string" }
            },
            reasoning: { type: "string" },
            suggested_title: { type: "string" },
            suggested_description: { type: "string" }
          }
        }
      });

      // Apply AI suggestions
      const suggestedModules = response.selected_module_ids
        .map(id => modules.find(m => m.id === id))
        .filter(Boolean);

      setSelectedModules(suggestedModules);
      setActivityData(prev => ({
        ...prev,
        title: response.suggested_title || prev.title,
        description: response.suggested_description || prev.description
      }));

      toast.success('AI suggestions applied! 🎉');
    } catch (error) {
      toast.error('Failed to generate AI suggestions');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleOptimizeSequence = async () => {
    if (selectedModules.length < 2) {
      toast.error('Select at least 2 modules to optimize');
      return;
    }

    setIsGeneratingAI(true);
    try {
      const modulesList = selectedModules.map((m, i) => ({
        current_position: i + 1,
        id: m.id,
        name: m.name,
        type: m.module_type,
        duration: m.duration_minutes
      }));

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an activity flow expert. Optimize the sequence of these modules for best engagement and logical flow:

${JSON.stringify(modulesList, null, 2)}

Activity context: ${activityData.title || 'General activity'} - ${activityData.description || 'Team event'}

Return the module IDs in the optimal order with reasoning.`,
        response_json_schema: {
          type: "object",
          properties: {
            optimized_module_ids: {
              type: "array",
              items: { type: "string" }
            },
            reasoning: { type: "string" }
          }
        }
      });

      const optimizedModules = response.optimized_module_ids
        .map(id => selectedModules.find(m => m.id === id))
        .filter(Boolean);

      setSelectedModules(optimizedModules);
      toast.success(`Sequence optimized! ${response.reasoning}`);
    } catch (error) {
      toast.error('Failed to optimize sequence');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleClose = () => {
    setActivityData({ title: '', description: '', type: 'social', duration: '15-30min', interaction_type: 'discussion' });
    setSelectedModules([]);
    setAiPrompt('');
    onOpenChange(false);
  };

  const modulesByType = modules.reduce((acc, module) => {
    if (!acc[module.module_type]) acc[module.module_type] = [];
    acc[module.module_type].push(module);
    return acc;
  }, {});

  const totalDuration = selectedModules.reduce((sum, m) => sum + (m.duration_minutes || 0), 0);

  return (
    <Dialog data-b44-sync="true" data-feature="activities" data-component="modulebuilder" open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Build Custom Activity from Modules</DialogTitle>
          <DialogDescription>
            Combine reusable modules to create a custom activity
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 py-4">
          {/* Left: Activity Details */}
          <div className="space-y-4">
            {/* AI Assistance */}
            <Card className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-600" />
                AI Module Assistant
              </h3>
              <Textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g., 'Create a workshop for improving team communication with icebreaker, discussion, and reflection'"
                rows={2}
                className="mb-2"
              />
              <Button
                onClick={generateAIModuleSuggestions}
                disabled={isGeneratingAI || !aiPrompt}
                size="sm"
                className="w-full"
              >
                {isGeneratingAI ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3 w-3 mr-2" />
                    Suggest Modules
                  </>
                )}
              </Button>
            </Card>

            <Card className="p-4 bg-indigo-50 border-indigo-200">
              <h3 className="font-bold mb-3">Activity Details</h3>
              <div className="space-y-3">
                <div>
                  <Label>Activity Title</Label>
                  <Input
                    value={activityData.title}
                    onChange={(e) => setActivityData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Team Innovation Workshop"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={activityData.description}
                    onChange={(e) => setActivityData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description..."
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Type</Label>
                    <Select
                      value={activityData.type}
                      onValueChange={(value) => setActivityData(prev => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="icebreaker">Icebreaker</SelectItem>
                        <SelectItem value="creative">Creative</SelectItem>
                        <SelectItem value="competitive">Competitive</SelectItem>
                        <SelectItem value="wellness">Wellness</SelectItem>
                        <SelectItem value="learning">Learning</SelectItem>
                        <SelectItem value="social">Social</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Interaction Type</Label>
                    <Select
                      value={activityData.interaction_type}
                      onValueChange={(value) => setActivityData(prev => ({ ...prev, interaction_type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="poll">Poll</SelectItem>
                        <SelectItem value="photo_upload">Photo Upload</SelectItem>
                        <SelectItem value="text_submission">Text Submission</SelectItem>
                        <SelectItem value="quiz">Quiz</SelectItem>
                        <SelectItem value="discussion">Discussion</SelectItem>
                        <SelectItem value="whiteboard">Whiteboard</SelectItem>
                        <SelectItem value="breakout_rooms">Breakout Rooms</SelectItem>
                        <SelectItem value="multiplayer_game">Multiplayer Game</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Total Duration</Label>
                  <Input value={`${totalDuration} minutes`} disabled />
                </div>
              </div>
            </Card>

            {/* Selected Modules */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold">Activity Flow ({selectedModules.length} modules)</h3>
                {selectedModules.length >= 2 && (
                  <Button
                    onClick={handleOptimizeSequence}
                    disabled={isGeneratingAI}
                    size="sm"
                    variant="outline"
                  >
                    <Shuffle className="h-3 w-3 mr-1" />
                    Optimize
                  </Button>
                )}
              </div>
              {selectedModules.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">
                  Select modules from the right to build your activity
                </p>
              ) : (
                <div className="space-y-2">
                  {selectedModules.map((module, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border"
                    >
                      <div className="flex flex-col gap-1">
                        <button onClick={() => handleMoveModule(i, 'up')} disabled={i === 0}>
                          <GripVertical className="h-4 w-4 text-slate-400" />
                        </button>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {module.module_type}
                          </Badge>
                          <span className="font-semibold text-sm">{module.name}</span>
                        </div>
                        <p className="text-xs text-slate-600">{module.duration_minutes}min</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveModule(i)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </motion.div>
                  ))}
                </div>
              )}
            </Card>

            <Button
              onClick={handleCreate}
              disabled={createActivityMutation.isLoading || selectedModules.length === 0}
              className="w-full bg-indigo-600 hover:bg-indigo-700"
            >
              <Save className="h-4 w-4 mr-2" />
              Create Activity
            </Button>
          </div>

          {/* Right: Available Modules */}
          <div className="space-y-4">
            <Card className="p-4 bg-purple-50 border-purple-200">
              <h3 className="font-bold mb-3">Available Modules ({modules.length})</h3>
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {Object.entries(modulesByType).map(([type, mods]) => (
                  <div key={type}>
                    <h4 className="font-semibold text-sm text-slate-700 mb-2 capitalize">
                      {type.replace('_', ' ')}
                    </h4>
                    <div className="space-y-2">
                      {mods.map(module => (
                        <Card key={module.id} className="p-3 hover:shadow-md transition-all">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h5 className="font-semibold text-sm mb-1">{module.name}</h5>
                              <p className="text-xs text-slate-600 mb-2">{module.description}</p>
                              <div className="flex gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {module.duration_minutes}min
                                </Badge>
                                {module.tags?.slice(0, 2).map(tag => (
                                  <Badge key={tag} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => handleAddModule(module.id)}
                              className="ml-2"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}