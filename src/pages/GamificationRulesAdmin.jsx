import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useUserData } from '../components/hooks/useUserData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Award, TrendingUp, Users, Target, Check, X } from 'lucide-react';
import { toast } from 'sonner';

const RULE_TYPES = [
  { value: 'event_attendance', label: 'Event Attendance', icon: '📅' },
  { value: 'event_completion', label: 'Event Completion', icon: '✅' },
  { value: 'feedback_submitted', label: 'Feedback Submitted', icon: '💬' },
  { value: 'recognition_given', label: 'Recognition Given', icon: '👏' },
  { value: 'recognition_received', label: 'Recognition Received', icon: '🏆' },
  { value: 'skill_achievement', label: 'Skill Achievement', icon: '🎓' },
  { value: 'streak_milestone', label: 'Streak Milestone', icon: '🔥' },
  { value: 'challenge_completed', label: 'Challenge Completed', icon: '🎯' },
  { value: 'survey_completed', label: 'Survey Completed', icon: '📊' },
  { value: 'profile_completed', label: 'Profile Completed', icon: '👤' },
  { value: 'team_join', label: 'Team Joined', icon: '👥' },
  { value: 'channel_participation', label: 'Channel Participation', icon: '💬' }
];

export default function GamificationRulesAdmin() {
  const { user } = useUserData(true, true);
  const queryClient = useQueryClient();
  const [editingRule, setEditingRule] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Fetch rules
  const { data: rules = [], isLoading } = useQuery({
    queryKey: ['gamification-rules'],
    queryFn: () => base44.entities.GamificationRule.list('-priority')
  });

  // Fetch badges for selection
  const { data: badges = [] } = useQuery({
    queryKey: ['badges-list'],
    queryFn: () => base44.entities.Badge.list()
  });

  // Create rule mutation
  const createRuleMutation = useMutation({
    mutationFn: (data) => base44.entities.GamificationRule.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['gamification-rules']);
      setIsCreateOpen(false);
      toast.success('Rule created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create rule: ' + error.message);
    }
  });

  // Update rule mutation
  const updateRuleMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.GamificationRule.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['gamification-rules']);
      setEditingRule(null);
      toast.success('Rule updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update rule: ' + error.message);
    }
  });

  // Delete rule mutation
  const deleteRuleMutation = useMutation({
    mutationFn: (id) => base44.entities.GamificationRule.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['gamification-rules']);
      toast.success('Rule deleted');
    },
    onError: (error) => {
      toast.error('Failed to delete rule: ' + error.message);
    }
  });

  // Toggle rule active status
  const toggleRuleStatus = async (rule) => {
    await updateRuleMutation.mutateAsync({
      id: rule.id,
      data: { is_active: !rule.is_active }
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-int-orange mx-auto mb-4"></div>
          <p className="text-slate-600">Loading rules...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-int-navy mb-2">Gamification Rules</h1>
          <p className="text-slate-600">Configure dynamic point and badge earning rules</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-int-orange hover:bg-int-orange/90 gap-2">
              <Plus className="h-4 w-4" />
              Create Rule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Rule</DialogTitle>
            </DialogHeader>
            <RuleForm
              onSubmit={(data) => createRuleMutation.mutate(data)}
              badges={badges}
              onCancel={() => setIsCreateOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Rules</p>
                <p className="text-2xl font-bold text-int-navy">{rules.length}</p>
              </div>
              <Award className="h-8 w-8 text-int-orange" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Active Rules</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {rules.filter(r => r.is_active).length}
                </p>
              </div>
              <Check className="h-8 w-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Triggers</p>
                <p className="text-2xl font-bold text-blue-600">
                  {rules.reduce((sum, r) => sum + (r.times_triggered || 0), 0)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Avg Points/Rule</p>
                <p className="text-2xl font-bold text-purple-600">
                  {Math.round(rules.reduce((sum, r) => sum + (r.points_reward || 0), 0) / rules.length || 0)}
                </p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rules List */}
      <div className="space-y-4">
        {rules.map((rule) => {
          const ruleType = RULE_TYPES.find(t => t.value === rule.rule_type);
          
          return (
            <Card key={rule.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="text-3xl">{ruleType?.icon || '⭐'}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-xl">{rule.rule_name}</CardTitle>
                        {rule.is_active ? (
                          <Badge className="bg-emerald-100 text-emerald-800">Active</Badge>
                        ) : (
                          <Badge variant="outline">Inactive</Badge>
                        )}
                        {rule.badge_id && (
                          <Badge className="bg-purple-100 text-purple-800 gap-1">
                            <Award className="h-3 w-3" />
                            Awards Badge
                          </Badge>
                        )}
                      </div>
                      <CardDescription>{rule.description}</CardDescription>
                      <div className="flex gap-4 mt-3 text-sm text-slate-600">
                        <span className="flex items-center gap-1">
                          <Target className="h-4 w-4" />
                          {rule.points_reward || 0} points
                        </span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4" />
                          {rule.times_triggered || 0} triggers
                        </span>
                        <span>Priority: {rule.priority || 0}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleRuleStatus(rule)}
                    >
                      {rule.is_active ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => setEditingRule(rule)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Edit Rule</DialogTitle>
                        </DialogHeader>
                        <RuleForm
                          initialData={rule}
                          onSubmit={(data) => updateRuleMutation.mutate({ id: rule.id, data })}
                          badges={badges}
                          onCancel={() => setEditingRule(null)}
                        />
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (confirm('Delete this rule?')) {
                          deleteRuleMutation.mutate(rule.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          );
        })}

        {rules.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Award className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No rules yet</h3>
              <p className="text-slate-600 mb-4">Create your first gamification rule to start rewarding users</p>
              <Button onClick={() => setIsCreateOpen(true)} className="bg-int-orange hover:bg-int-orange/90">
                Create First Rule
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// Rule Form Component
function RuleForm({ initialData, onSubmit, badges, onCancel }) {
  const [formData, setFormData] = useState(initialData || {
    rule_name: '',
    rule_type: '',
    description: '',
    points_reward: 10,
    is_active: true,
    priority: 0,
    limit_per_user: 'unlimited',
    trigger_conditions: {},
    notification_settings: { notify_on_award: true }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label>Rule Name</Label>
          <Input
            value={formData.rule_name}
            onChange={(e) => setFormData({ ...formData, rule_name: e.target.value })}
            placeholder="e.g., First Event Attendance"
            required
          />
        </div>

        <div>
          <Label>Rule Type</Label>
          <Select
            value={formData.rule_type}
            onValueChange={(value) => setFormData({ ...formData, rule_type: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select trigger type" />
            </SelectTrigger>
            <SelectContent>
              {RULE_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.icon} {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Description</Label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="What does this rule reward?"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Points Reward</Label>
            <Input
              type="number"
              value={formData.points_reward}
              onChange={(e) => setFormData({ ...formData, points_reward: parseInt(e.target.value) })}
              min="0"
            />
          </div>

          <div>
            <Label>Priority</Label>
            <Input
              type="number"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
            />
          </div>
        </div>

        <div>
          <Label>Badge Reward (Optional)</Label>
          <Select
            value={formData.badge_id || ''}
            onValueChange={(value) => setFormData({ ...formData, badge_id: value || null })}
          >
            <SelectTrigger>
              <SelectValue placeholder="No badge" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={null}>No Badge</SelectItem>
              {badges.map((badge) => (
                <SelectItem key={badge.id} value={badge.id}>
                  {badge.badge_icon} {badge.badge_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Earning Limit</Label>
          <Select
            value={formData.limit_per_user}
            onValueChange={(value) => setFormData({ ...formData, limit_per_user: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="once">Once per user</SelectItem>
              <SelectItem value="daily">Once per day</SelectItem>
              <SelectItem value="weekly">Once per week</SelectItem>
              <SelectItem value="monthly">Once per month</SelectItem>
              <SelectItem value="unlimited">Unlimited</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <Label>Active</Label>
          <Switch
            checked={formData.is_active}
            onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="bg-int-orange hover:bg-int-orange/90">
          {initialData ? 'Update Rule' : 'Create Rule'}
        </Button>
      </div>
    </form>
  );
}