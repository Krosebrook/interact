/**
 * Gamification Rule Builder
 * Create custom rules with AND/OR logic for points, badges, events
 */

import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUserData } from '../components/hooks/useUserData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Save, Play } from 'lucide-react';
import { toast } from 'sonner';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function GamificationRuleBuilder() {
  const { user } = useUserData(true, true); // admin only
  const [isCreating, setIsCreating] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const queryClient = useQueryClient();

  const { data: rules, isLoading } = useQuery({
    queryKey: ['gamification-rules'],
    queryFn: () => base44.entities.GamificationRule.list(),
    staleTime: 5 * 60 * 1000
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-int-navy">Gamification Rules</h1>
          <p className="text-slate-600 mt-1">Define custom logic for awarding points, badges, and events</p>
        </div>
        <Button onClick={() => setIsCreating(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Rule
        </Button>
      </div>

      {/* Rules List */}
      <div className="grid gap-4">
        {rules?.map(rule => (
          <RuleCard
            key={rule.id}
            rule={rule}
            onEdit={() => setEditingRule(rule)}
            onRefresh={() => queryClient.invalidateQueries(['gamification-rules'])}
          />
        ))}
      </div>

      {/* Create/Edit Dialog */}
      {(isCreating || editingRule) && (
        <RuleEditorDialog
          rule={editingRule}
          onClose={() => {
            setIsCreating(false);
            setEditingRule(null);
          }}
          onRefresh={() => queryClient.invalidateQueries(['gamification-rules'])}
        />
      )}
    </div>
  );
}

function RuleCard({ rule, onEdit, onRefresh }) {
  const toggleMutation = useMutation({
    mutationFn: () =>
      base44.entities.GamificationRule.update(rule.id, { is_active: !rule.is_active }),
    onSuccess: () => {
      onRefresh();
      toast.success(rule.is_active ? 'Rule deactivated' : 'Rule activated');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: () => base44.entities.GamificationRule.delete(rule.id),
    onSuccess: () => {
      onRefresh();
      toast.success('Rule deleted');
    }
  });

  return (
    <Card className={!rule.is_active ? 'opacity-50' : ''}>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">{rule.rule_name}</h3>
              <p className="text-sm text-slate-600 mt-1">{rule.description}</p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={onEdit}
              >
                Edit
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => toggleMutation.mutate()}
                disabled={toggleMutation.isPending}
              >
                {rule.is_active ? 'Disable' : 'Enable'}
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => {
                  if (confirm('Delete this rule?')) {
                    deleteMutation.mutate();
                  }
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Conditions */}
          <div className="bg-slate-50 p-3 rounded-lg text-sm">
            <p className="font-medium text-slate-900 mb-2">Conditions ({rule.logic}):</p>
            <div className="space-y-1">
              {rule.conditions?.map((cond, idx) => (
                <p key={idx} className="text-slate-700">
                  {cond.entity} → {cond.field} {cond.operator} {JSON.stringify(cond.value)}
                </p>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="bg-green-50 p-3 rounded-lg text-sm">
            <p className="font-medium text-green-900 mb-2">Actions:</p>
            <div className="space-y-1">
              {rule.actions?.award_points && (
                <p className="text-green-700">✓ Award {rule.actions.award_points} points</p>
              )}
              {rule.actions?.award_badge && (
                <p className="text-green-700">✓ Award badge: {rule.actions.award_badge}</p>
              )}
              {rule.actions?.send_notification && (
                <p className="text-green-700">✓ Send notification</p>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-4 text-sm">
            <div>
              <p className="text-slate-600">Executions</p>
              <p className="font-bold text-slate-900">{rule.execution_count}</p>
            </div>
            {rule.cooldown_hours > 0 && (
              <div>
                <p className="text-slate-600">Cooldown</p>
                <p className="font-bold text-slate-900">{rule.cooldown_hours}h</p>
              </div>
            )}
            {rule.max_triggers_per_month && (
              <div>
                <p className="text-slate-600">Max/Month</p>
                <p className="font-bold text-slate-900">{rule.max_triggers_per_month}</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RuleEditorDialog({ rule, onClose, onRefresh }) {
  const [name, setName] = useState(rule?.rule_name || '');
  const [description, setDescription] = useState(rule?.description || '');
  const [ruleType, setRuleType] = useState(rule?.rule_type || 'points');
  const [logic, setLogic] = useState(rule?.logic || 'AND');
  const [conditions, setConditions] = useState(rule?.conditions || []);
  const [actions, setActions] = useState(rule?.actions || {});
  const [cooldown, setCooldown] = useState(rule?.cooldown_hours || 0);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const data = {
        rule_name: name,
        description,
        rule_type: ruleType,
        logic,
        conditions,
        actions,
        cooldown_hours: cooldown
      };

      if (rule) {
        await base44.entities.GamificationRule.update(rule.id, data);
      } else {
        await base44.entities.GamificationRule.create({
          ...data,
          is_active: true,
          created_by: 'system'
        });
      }
    },
    onSuccess: () => {
      onRefresh();
      toast.success(rule ? 'Rule updated' : 'Rule created');
      onClose();
    }
  });

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogTitle>{rule ? 'Edit Rule' : 'Create Rule'}</DialogTitle>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Rule Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., 3-Day Streak + Recognition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What does this rule do?"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Rule Type</label>
                <Select value={ruleType} onValueChange={setRuleType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="points">Award Points</SelectItem>
                    <SelectItem value="badge">Award Badge</SelectItem>
                    <SelectItem value="event">Trigger Event</SelectItem>
                    <SelectItem value="notification">Send Notification</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Condition Logic</label>
                <Select value={logic} onValueChange={setLogic}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AND">ALL conditions (AND)</SelectItem>
                    <SelectItem value="OR">ANY condition (OR)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Cooldown (hours)</label>
              <Input
                type="number"
                value={cooldown}
                onChange={(e) => setCooldown(parseInt(e.target.value))}
                min={0}
                placeholder="0 for no cooldown"
              />
              <p className="text-xs text-slate-600 mt-1">Time before rule can trigger again for same user</p>
            </div>
          </div>

          {/* Conditions */}
          <div>
            <label className="block text-sm font-bold mb-2">Conditions</label>
            <div className="space-y-2">
              {conditions.map((cond, idx) => (
                <div key={idx} className="flex gap-2 p-2 bg-slate-50 rounded">
                  <p className="text-sm flex-1">
                    {cond.entity} → {cond.field} {cond.operator} {JSON.stringify(cond.value)}
                  </p>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setConditions(conditions.filter((_, i) => i !== idx))}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-600 mt-2">Example: Event.attendance_status = attended AND Event.event_type = training</p>
          </div>

          {/* Actions */}
          <div>
            <label className="block text-sm font-bold mb-2">Actions</label>
            {ruleType === 'points' && (
              <Input
                type="number"
                value={actions.award_points || 0}
                onChange={(e) => setActions({ ...actions, award_points: parseInt(e.target.value) })}
                placeholder="Points to award"
              />
            )}
            {ruleType === 'badge' && (
              <Input
                value={actions.award_badge || ''}
                onChange={(e) => setActions({ ...actions, award_badge: e.target.value })}
                placeholder="Badge ID"
              />
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {saveMutation.isPending ? 'Saving...' : 'Save Rule'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}