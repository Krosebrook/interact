import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  Award, 
  Plus, 
  Edit2, 
  Trash2, 
  Save,
  HelpCircle,
  Star,
  Zap,
  Users,
  Calendar,
  Target,
  Flame
} from 'lucide-react';
import { toast } from 'sonner';

const CRITERIA_TYPES = [
  { value: 'events_attended', label: 'Events Attended', icon: Calendar },
  { value: 'feedback_submitted', label: 'Feedback Submitted', icon: Target },
  { value: 'points_total', label: 'Total Points', icon: Zap },
  { value: 'streak_days', label: 'Streak Days', icon: Flame },
  { value: 'activities_completed', label: 'Activities Completed', icon: Star },
  { value: 'team_challenges_completed', label: 'Team Challenges', icon: Users },
  { value: 'manual', label: 'Manual Award', icon: Award }
];

const RARITY_OPTIONS = [
  { value: 'common', label: 'Common', color: 'bg-slate-100 text-slate-700' },
  { value: 'uncommon', label: 'Uncommon', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'rare', label: 'Rare', color: 'bg-blue-100 text-blue-700' },
  { value: 'epic', label: 'Epic', color: 'bg-purple-100 text-purple-700' },
  { value: 'legendary', label: 'Legendary', color: 'bg-amber-100 text-amber-700' }
];

const CATEGORY_OPTIONS = [
  'engagement', 'collaboration', 'innovation', 'community', 'leadership', 'special', 'seasonal', 'challenge'
];

export default function BadgeCriteriaManager() {
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [editingBadge, setEditingBadge] = useState(null);
  const [formData, setFormData] = useState({
    badge_name: '',
    badge_description: '',
    badge_icon: '🏆',
    badge_type: 'achievement',
    rarity: 'common',
    category: 'engagement',
    points_value: 20,
    is_active: true,
    is_hidden: false,
    is_manual_award: false,
    award_criteria: {
      type: 'events_attended',
      threshold: 5,
      comparison: 'gte'
    }
  });

  const { data: badges = [], isLoading } = useQuery({
    queryKey: ['badges'],
    queryFn: () => base44.entities.Badge.list()
  });

  const createBadgeMutation = useMutation({
    mutationFn: (data) => base44.entities.Badge.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['badges'] });
      setShowDialog(false);
      resetForm();
      toast.success('Badge created successfully');
    }
  });

  const updateBadgeMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Badge.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['badges'] });
      setShowDialog(false);
      resetForm();
      toast.success('Badge updated successfully');
    }
  });

  const deleteBadgeMutation = useMutation({
    mutationFn: (id) => base44.entities.Badge.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['badges'] });
      toast.success('Badge deleted successfully');
    }
  });

  const resetForm = () => {
    setEditingBadge(null);
    setFormData({
      badge_name: '',
      badge_description: '',
      badge_icon: '🏆',
      badge_type: 'achievement',
      rarity: 'common',
      category: 'engagement',
      points_value: 20,
      is_active: true,
      is_hidden: false,
      is_manual_award: false,
      award_criteria: {
        type: 'events_attended',
        threshold: 5,
        comparison: 'gte'
      }
    });
  };

  const handleEdit = (badge) => {
    setEditingBadge(badge);
    setFormData({
      badge_name: badge.badge_name,
      badge_description: badge.badge_description,
      badge_icon: badge.badge_icon,
      badge_type: badge.badge_type || 'achievement',
      rarity: badge.rarity || 'common',
      category: badge.category || 'engagement',
      points_value: badge.points_value || 20,
      is_active: badge.is_active !== false,
      is_hidden: badge.is_hidden || false,
      is_manual_award: badge.is_manual_award || false,
      award_criteria: badge.award_criteria || { type: 'events_attended', threshold: 5 }
    });
    setShowDialog(true);
  };

  const handleSave = () => {
    if (editingBadge) {
      updateBadgeMutation.mutate({ id: editingBadge.id, data: formData });
    } else {
      createBadgeMutation.mutate(formData);
    }
  };

  const getRarityConfig = (rarity) => {
    return RARITY_OPTIONS.find(r => r.value === rarity) || RARITY_OPTIONS[0];
  };

  return (
    <TooltipProvider>
      <Card className="border-2 border-purple-200">
        <CardHeader className="bg-gradient-to-r from-purple-500/10 to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-purple shadow-sm">
                <Award className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle>Badge Management</CardTitle>
                <p className="text-sm text-slate-500 mt-1">
                  Define badge criteria and award rules
                </p>
              </div>
            </div>
            <Button
              onClick={() => { resetForm(); setShowDialog(true); }}
              className="bg-gradient-purple hover:opacity-90 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Badge
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {/* Badge Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {badges.map((badge, index) => {
                const rarityConfig = getRarityConfig(badge.rarity);
                const criteriaType = CRITERIA_TYPES.find(c => c.value === badge.award_criteria?.type);
                const CriteriaIcon = criteriaType?.icon || Award;

                return (
                  <motion.div
                    key={badge.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className={`relative overflow-hidden border-2 ${
                      badge.is_active ? 'border-slate-200' : 'border-slate-200 opacity-60'
                    }`}>
                      {/* Rarity bar */}
                      <div className={`h-1 ${rarityConfig.color.replace('text-', 'bg-').replace('100', '400')}`} />
                      
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <span className="text-3xl">{badge.badge_icon}</span>
                            <div>
                              <h4 className="font-semibold text-slate-900">{badge.badge_name}</h4>
                              <Badge className={rarityConfig.color}>
                                {rarityConfig.label}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleEdit(badge)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => deleteBadgeMutation.mutate(badge.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>

                        <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                          {badge.badge_description}
                        </p>

                        {/* Criteria */}
                        <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg text-sm">
                          <CriteriaIcon className="h-4 w-4 text-slate-500" />
                          {badge.is_manual_award ? (
                            <span className="text-slate-600">Manual Award</span>
                          ) : (
                            <span className="text-slate-600">
                              {criteriaType?.label || badge.award_criteria?.type} ≥ {badge.award_criteria?.threshold}
                            </span>
                          )}
                        </div>

                        {/* Meta */}
                        <div className="flex items-center justify-between mt-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Zap className="h-3 w-3" />
                            +{badge.points_value} pts
                          </span>
                          <span>{badge.awarded_count || 0} awarded</span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {badges.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <Award className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No badges configured yet. Create your first badge!</p>
            </div>
          )}
        </CardContent>

        {/* Create/Edit Dialog */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingBadge ? 'Edit Badge' : 'Create New Badge'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-1">
                  <Label>Icon</Label>
                  <Input
                    value={formData.badge_icon}
                    onChange={(e) => setFormData(d => ({ ...d, badge_icon: e.target.value }))}
                    className="text-center text-2xl"
                    maxLength={2}
                  />
                </div>
                <div className="col-span-3">
                  <Label>Badge Name</Label>
                  <Input
                    value={formData.badge_name}
                    onChange={(e) => setFormData(d => ({ ...d, badge_name: e.target.value }))}
                    placeholder="e.g., Team Player"
                  />
                </div>
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.badge_description}
                  onChange={(e) => setFormData(d => ({ ...d, badge_description: e.target.value }))}
                  placeholder="What this badge represents..."
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Rarity</Label>
                  <Select 
                    value={formData.rarity} 
                    onValueChange={(v) => setFormData(d => ({ ...d, rarity: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {RARITY_OPTIONS.map(r => (
                        <SelectItem key={r.value} value={r.value}>
                          {r.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Category</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(v) => setFormData(d => ({ ...d, category: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORY_OPTIONS.map(c => (
                        <SelectItem key={c} value={c}>
                          {c.charAt(0).toUpperCase() + c.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Points Value</Label>
                <Input
                  type="number"
                  value={formData.points_value}
                  onChange={(e) => setFormData(d => ({ ...d, points_value: parseInt(e.target.value) || 0 }))}
                  min="0"
                />
              </div>

              {/* Award Criteria */}
              <div className="space-y-3 p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Award Criteria</Label>
                  <div className="flex items-center gap-2">
                    <Label className="text-sm">Manual Award</Label>
                    <Switch
                      checked={formData.is_manual_award}
                      onCheckedChange={(v) => setFormData(d => ({ ...d, is_manual_award: v }))}
                    />
                  </div>
                </div>

                {!formData.is_manual_award && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Criteria Type</Label>
                      <Select 
                        value={formData.award_criteria.type} 
                        onValueChange={(v) => setFormData(d => ({ 
                          ...d, 
                          award_criteria: { ...d.award_criteria, type: v }
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CRITERIA_TYPES.filter(c => c.value !== 'manual').map(c => (
                            <SelectItem key={c.value} value={c.value}>
                              {c.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Threshold</Label>
                      <Input
                        type="number"
                        value={formData.award_criteria.threshold}
                        onChange={(e) => setFormData(d => ({ 
                          ...d, 
                          award_criteria: { ...d.award_criteria, threshold: parseInt(e.target.value) || 0 }
                        }))}
                        min="1"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Toggles */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(v) => setFormData(d => ({ ...d, is_active: v }))}
                  />
                  <Label>Active</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_hidden}
                    onCheckedChange={(v) => setFormData(d => ({ ...d, is_hidden: v }))}
                  />
                  <Label>Hidden (Surprise)</Label>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSave}
                disabled={createBadgeMutation.isPending || updateBadgeMutation.isPending}
                className="bg-gradient-purple hover:opacity-90 text-white"
              >
                <Save className="h-4 w-4 mr-2" />
                {editingBadge ? 'Update Badge' : 'Create Badge'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Card>
    </TooltipProvider>
  );
}