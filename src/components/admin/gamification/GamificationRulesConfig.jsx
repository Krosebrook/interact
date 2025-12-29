import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Settings, Plus, Save, Trash2, Edit2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import LoadingSpinner from '../../common/LoadingSpinner';

export default function GamificationRulesConfig() {
  const [editingRule, setEditingRule] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const queryClient = useQueryClient();

  // Fetch gamification rules
  const { data: rules, isLoading } = useQuery({
    queryKey: ['gamification-rules-config'],
    queryFn: () => base44.entities.GamificationRule.list('-created_date')
  });

  // Fetch badges for reference
  const { data: badges } = useQuery({
    queryKey: ['badges-config'],
    queryFn: () => base44.entities.Badge.list()
  });

  // Toggle rule active status
  const toggleRuleMutation = useMutation({
    mutationFn: async ({ ruleId, isActive }) => {
      await base44.entities.GamificationRule.update(ruleId, { is_active: isActive });
    },
    onSuccess: () => {
      toast.success('Rule status updated');
      queryClient.invalidateQueries(['gamification-rules-config']);
    }
  });

  // Delete rule
  const deleteRuleMutation = useMutation({
    mutationFn: async (ruleId) => {
      await base44.entities.GamificationRule.delete(ruleId);
    },
    onSuccess: () => {
      toast.success('Rule deleted');
      queryClient.invalidateQueries(['gamification-rules-config']);
    }
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-blue-600" />
                Gamification Rules Configuration
              </CardTitle>
              <CardDescription className="mt-1">
                Manage automation rules for points, badges, and challenges
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  New Rule
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Gamification Rule</DialogTitle>
                </DialogHeader>
                <RuleForm 
                  rule={editingRule} 
                  badges={badges}
                  onSuccess={() => {
                    setIsDialogOpen(false);
                    setEditingRule(null);
                  }} 
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Rules List */}
      <div className="grid gap-4">
        {rules?.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Settings className="h-12 w-12 mx-auto mb-3 text-slate-300" />
              <p className="text-slate-600 mb-2">No rules configured yet</p>
              <p className="text-sm text-slate-500">Create your first automation rule</p>
            </CardContent>
          </Card>
        ) : (
          rules?.map(rule => (
            <Card key={rule.id} className={!rule.is_active ? 'opacity-60' : ''}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-slate-900">{rule.rule_name}</h3>
                      <Badge variant={rule.is_active ? 'default' : 'secondary'}>
                        {rule.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {rule.trigger_event}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600 mb-3">{rule.description}</p>
                    
                    {/* Rule Details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      {rule.points_awarded > 0 && (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-2">
                          <p className="text-amber-900 font-medium">+{rule.points_awarded} points</p>
                        </div>
                      )}
                      {rule.badge_id && (
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-2">
                          <p className="text-purple-900 font-medium">Awards badge</p>
                        </div>
                      )}
                      {rule.conditions && Object.keys(rule.conditions).length > 0 && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                          <p className="text-blue-900 font-medium">{Object.keys(rule.conditions).length} conditions</p>
                        </div>
                      )}
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-2">
                        <p className="text-slate-900 font-medium">Priority: {rule.priority}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Switch
                      checked={rule.is_active}
                      onCheckedChange={(checked) => toggleRuleMutation.mutate({ ruleId: rule.id, isActive: checked })}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingRule(rule);
                        setIsDialogOpen(true);
                      }}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
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
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

function RuleForm({ rule, badges, onSuccess }) {
  const [formData, setFormData] = useState({
    rule_name: rule?.rule_name || '',
    description: rule?.description || '',
    trigger_event: rule?.trigger_event || 'event_attendance',
    points_awarded: rule?.points_awarded || 10,
    badge_id: rule?.badge_id || '',
    priority: rule?.priority || 1,
    is_active: rule?.is_active ?? true
  });

  const queryClient = useQueryClient();

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!formData.rule_name || !formData.trigger_event) {
        throw new Error('Rule name and trigger event are required');
      }
      if (rule) {
        await base44.entities.GamificationRule.update(rule.id, formData);
      } else {
        await base44.entities.GamificationRule.create(formData);
      }
    },
    onSuccess: () => {
      toast.success(rule ? 'Rule updated' : 'Rule created');
      queryClient.invalidateQueries(['gamification-rules-config']);
      onSuccess();
    },
    onError: (error) => {
      toast.error('Failed to save rule: ' + error.message);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Rule Name</Label>
        <Input
          value={formData.rule_name}
          onChange={(e) => setFormData({ ...formData, rule_name: e.target.value })}
          placeholder="e.g., Event Attendance Bonus"
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <Input
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe what this rule does..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Trigger Event</Label>
          <Select
            value={formData.trigger_event}
            onValueChange={(value) => setFormData({ ...formData, trigger_event: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="event_attendance">Event Attendance</SelectItem>
              <SelectItem value="recognition_sent">Recognition Sent</SelectItem>
              <SelectItem value="recognition_received">Recognition Received</SelectItem>
              <SelectItem value="challenge_completed">Challenge Completed</SelectItem>
              <SelectItem value="module_completed">Module Completed</SelectItem>
              <SelectItem value="learning_path_completed">Learning Path Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Points Awarded</Label>
          <Input
            type="number"
            value={formData.points_awarded}
            onChange={(e) => setFormData({ ...formData, points_awarded: parseInt(e.target.value) })}
            min="0"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Badge to Award (Optional)</Label>
          <Select
            value={formData.badge_id}
            onValueChange={(value) => setFormData({ ...formData, badge_id: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="No badge" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={null}>No badge</SelectItem>
              {badges?.map(badge => (
                <SelectItem key={badge.id} value={badge.id}>
                  {badge.badge_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Priority</Label>
          <Input
            type="number"
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
            min="1"
            max="10"
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Switch
            checked={formData.is_active}
            onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
          />
          <Label>Active</Label>
        </div>

        <Button
          type="submit"
          disabled={saveMutation.isPending}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Save className="h-4 w-4 mr-2" />
          {rule ? 'Update Rule' : 'Create Rule'}
        </Button>
      </div>
    </form>
  );
}