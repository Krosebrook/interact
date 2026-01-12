import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Bot, Calendar, Target, FileText, Plus, Edit, Trash2, Play, Pause } from 'lucide-react';
import { toast } from 'sonner';

const AUTOMATION_TYPES = {
  check_in: {
    icon: Calendar,
    label: 'Team Check-Ins',
    description: 'Automated prompts for team members to share progress',
    color: 'text-blue-600'
  },
  goal_reminder: {
    icon: Target,
    label: 'Goal Reminders',
    description: 'Automatic reminders for goal progress updates',
    color: 'text-green-600'
  },
  activity_summary: {
    icon: FileText,
    label: 'Activity Summary',
    description: 'AI-generated summaries of team activities',
    color: 'text-purple-600'
  }
};

export default function TeamAutomationManager({ teamId, isAdmin }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAutomation, setEditingAutomation] = useState(null);
  const queryClient = useQueryClient();

  const { data: automations = [] } = useQuery({
    queryKey: ['team-automations', teamId],
    queryFn: () => base44.entities.TeamAutomation.filter({ team_id: teamId })
  });

  const { data: team } = useQuery({
    queryKey: ['team', teamId],
    queryFn: async () => {
      const teams = await base44.entities.Team.filter({ id: teamId });
      return teams[0];
    }
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.TeamAutomation.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['team-automations']);
      toast.success('Automation created');
      setDialogOpen(false);
      setEditingAutomation(null);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.TeamAutomation.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['team-automations']);
      toast.success('Automation updated');
      setDialogOpen(false);
      setEditingAutomation(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.TeamAutomation.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['team-automations']);
      toast.success('Automation deleted');
    }
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, is_active }) => 
      base44.entities.TeamAutomation.update(id, { is_active }),
    onSuccess: () => {
      queryClient.invalidateQueries(['team-automations']);
      toast.success('Automation updated');
    }
  });

  if (!isAdmin) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Bot className="h-5 w-5 text-purple-600" />
            Team Automations
          </h3>
          <p className="text-sm text-slate-500">Automate team processes and communications</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingAutomation(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Automation
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingAutomation ? 'Edit Automation' : 'Create Automation'}
              </DialogTitle>
            </DialogHeader>
            <AutomationForm
              teamId={teamId}
              automation={editingAutomation}
              onSubmit={(data) => {
                if (editingAutomation) {
                  updateMutation.mutate({ id: editingAutomation.id, data });
                } else {
                  createMutation.mutate(data);
                }
              }}
              onCancel={() => {
                setDialogOpen(false);
                setEditingAutomation(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {automations.map((automation) => {
          const config = AUTOMATION_TYPES[automation.automation_type];
          const Icon = config.icon;

          return (
            <Card key={automation.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 rounded-lg">
                      <Icon className={`h-5 w-5 ${config.color}`} />
                    </div>
                    <div>
                      <CardTitle className="text-base">{config.label}</CardTitle>
                      <CardDescription>{config.description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={automation.is_active}
                      onCheckedChange={(checked) => 
                        toggleMutation.mutate({ id: automation.id, is_active: checked })
                      }
                    />
                    <Badge variant={automation.is_active ? 'default' : 'secondary'}>
                      {automation.is_active ? 'Active' : 'Paused'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">Frequency:</span>
                    <Badge variant="outline" className="capitalize">{automation.frequency}</Badge>
                    {automation.day_of_week && (
                      <Badge variant="outline" className="capitalize">{automation.day_of_week}s</Badge>
                    )}
                    {automation.time_of_day && (
                      <Badge variant="outline">{automation.time_of_day}</Badge>
                    )}
                  </div>
                  {automation.notification_channel && (
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">Channel:</span>
                      <Badge variant="outline" className="capitalize">
                        {automation.notification_channel}
                      </Badge>
                    </div>
                  )}
                  {automation.last_run && (
                    <div className="text-xs text-slate-500">
                      Last run: {new Date(automation.last_run).toLocaleString()}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingAutomation(automation);
                      setDialogOpen(true);
                    }}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (confirm('Delete this automation?')) {
                        deleteMutation.mutate(automation.id);
                      }
                    }}
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {automations.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Bot className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 mb-4">No automations configured yet</p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Automation
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function AutomationForm({ teamId, automation, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(automation || {
    team_id: teamId,
    automation_type: 'check_in',
    is_active: true,
    frequency: 'weekly',
    notification_channel: 'email',
    questions: []
  });

  const [questionInput, setQuestionInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Automation Type</Label>
        <Select
          value={formData.automation_type}
          onValueChange={(value) => setFormData({ ...formData, automation_type: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(AUTOMATION_TYPES).map(([key, config]) => (
              <SelectItem key={key} value={key}>
                {config.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Frequency</Label>
          <Select
            value={formData.frequency}
            onValueChange={(value) => setFormData({ ...formData, frequency: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="biweekly">Bi-weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {(formData.frequency === 'weekly' || formData.frequency === 'biweekly') && (
          <div>
            <Label>Day of Week</Label>
            <Select
              value={formData.day_of_week}
              onValueChange={(value) => setFormData({ ...formData, day_of_week: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select day" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monday">Monday</SelectItem>
                <SelectItem value="tuesday">Tuesday</SelectItem>
                <SelectItem value="wednesday">Wednesday</SelectItem>
                <SelectItem value="thursday">Thursday</SelectItem>
                <SelectItem value="friday">Friday</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div>
        <Label>Time of Day (HH:MM)</Label>
        <Input
          type="time"
          value={formData.time_of_day || '09:00'}
          onChange={(e) => setFormData({ ...formData, time_of_day: e.target.value })}
        />
      </div>

      <div>
        <Label>Notification Channel</Label>
        <Select
          value={formData.notification_channel}
          onValueChange={(value) => setFormData({ ...formData, notification_channel: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="in_app">In-App</SelectItem>
            <SelectItem value="teams">Microsoft Teams</SelectItem>
            <SelectItem value="slack">Slack</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Custom Message (Optional)</Label>
        <Textarea
          value={formData.custom_message || ''}
          onChange={(e) => setFormData({ ...formData, custom_message: e.target.value })}
          placeholder="Add a custom message..."
          rows={3}
        />
      </div>

      {formData.automation_type === 'check_in' && (
        <div>
          <Label>Custom Questions</Label>
          <div className="space-y-2">
            {formData.questions?.map((q, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Input value={q} disabled className="flex-1" />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const newQuestions = [...formData.questions];
                    newQuestions.splice(idx, 1);
                    setFormData({ ...formData, questions: newQuestions });
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
            <div className="flex gap-2">
              <Input
                value={questionInput}
                onChange={(e) => setQuestionInput(e.target.value)}
                placeholder="Add a question..."
              />
              <Button
                type="button"
                onClick={() => {
                  if (questionInput.trim()) {
                    setFormData({
                      ...formData,
                      questions: [...(formData.questions || []), questionInput.trim()]
                    });
                    setQuestionInput('');
                  }
                }}
              >
                Add
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {automation ? 'Update' : 'Create'} Automation
        </Button>
      </div>
    </form>
  );
}