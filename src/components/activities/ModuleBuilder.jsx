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
import { Plus, Trash2, GripVertical, Save } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function ModuleBuilder({ open, onOpenChange, onActivityCreated }) {
  const queryClient = useQueryClient();
  const [activityData, setActivityData] = useState({
    title: '',
    description: '',
    type: 'social',
    duration: '15-30min'
  });
  const [selectedModules, setSelectedModules] = useState([]);

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
        interaction_type: 'discussion',
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

  const handleClose = () => {
    setActivityData({ title: '', description: '', type: 'social', duration: '15-30min' });
    setSelectedModules([]);
    onOpenChange(false);
  };

  const modulesByType = modules.reduce((acc, module) => {
    if (!acc[module.module_type]) acc[module.module_type] = [];
    acc[module.module_type].push(module);
    return acc;
  }, {});

  const totalDuration = selectedModules.reduce((sum, m) => sum + (m.duration_minutes || 0), 0);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
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
                    <Label>Total Duration</Label>
                    <Input value={`${totalDuration} minutes`} disabled />
                  </div>
                </div>
              </div>
            </Card>

            {/* Selected Modules */}
            <Card className="p-4">
              <h3 className="font-bold mb-3">Activity Flow ({selectedModules.length} modules)</h3>
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