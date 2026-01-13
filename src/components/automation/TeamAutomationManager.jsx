import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, Clock, Zap, CheckCircle2, TrendingUp, Bell } from 'lucide-react';
import { toast } from 'sonner';

export default function TeamAutomationManager({ teamId }) {
  const [selectedAutomation, setSelectedAutomation] = useState(null);
  const queryClient = useQueryClient();

  const { data: team } = useQuery({
    queryKey: ['team', teamId],
    queryFn: () => base44.entities.Team.filter({ id: teamId }).then(r => r[0])
  });

  const { data: scheduledTasks = [], isLoading } = useQuery({
    queryKey: ['scheduled-tasks'],
    queryFn: async () => {
      // In a real implementation, this would fetch scheduled tasks
      // For now, return mock data structure
      return [];
    }
  });

  const createCheckInMutation = useMutation({
    mutationFn: async ({ frequency, time, questions }) => {
      const response = await base44.functions.invoke('automatedTeamCheckIn', {
        team_id: teamId,
        questions
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Team check-in automation created!');
      queryClient.invalidateQueries(['scheduled-tasks']);
    }
  });

  const automationTypes = [
    {
      id: 'check-in',
      title: 'Weekly Team Check-In',
      description: 'Automated pulse surveys to track team sentiment and progress',
      icon: CheckCircle2,
      color: 'bg-blue-500',
      defaultSchedule: 'Every Monday at 9:00 AM'
    },
    {
      id: 'goal-reminder',
      title: 'Goal Progress Reminders',
      description: 'Automatic reminders for upcoming goal deadlines',
      icon: TrendingUp,
      color: 'bg-green-500',
      defaultSchedule: 'Daily at 8:00 AM'
    },
    {
      id: 'activity-summary',
      title: 'Weekly Activity Summary',
      description: 'AI-generated summaries of team activities and achievements',
      icon: Calendar,
      color: 'bg-purple-500',
      defaultSchedule: 'Every Friday at 4:00 PM'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Team Automations</h2>
          <p className="text-slate-600">Streamline team processes with automated workflows</p>
        </div>
      </div>

      {/* Automation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {automationTypes.map((automation) => {
          const Icon = automation.icon;
          const isActive = false; // Check if automation is active

          return (
            <Card key={automation.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-lg ${automation.color} text-white mb-3`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <Switch checked={isActive} />
                </div>
                <CardTitle className="text-lg">{automation.title}</CardTitle>
                <CardDescription>{automation.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Clock className="h-4 w-4" />
                  <span>{automation.defaultSchedule}</span>
                </div>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <Zap className="h-4 w-4 mr-2" />
                      Configure
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>{automation.title} Settings</DialogTitle>
                    </DialogHeader>
                    <AutomationConfig 
                      automationType={automation.id}
                      teamId={teamId}
                      onSave={(config) => {
                        if (automation.id === 'check-in') {
                          createCheckInMutation.mutate(config);
                        }
                      }}
                    />
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Active Automations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Active Automations
          </CardTitle>
        </CardHeader>
        <CardContent>
          {scheduledTasks.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Zap className="h-12 w-12 mx-auto mb-3 text-slate-300" />
              <p>No active automations yet</p>
              <p className="text-sm">Configure automations above to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {scheduledTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium">{task.name}</p>
                    <p className="text-sm text-slate-600">{task.description}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge>{task.status}</Badge>
                    <Button variant="ghost" size="sm">Edit</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function AutomationConfig({ automationType, teamId, onSave }) {
  const [frequency, setFrequency] = useState('weekly');
  const [time, setTime] = useState('09:00');
  const [dayOfWeek, setDayOfWeek] = useState('monday');

  const handleSave = () => {
    onSave({ frequency, time, dayOfWeek, questions: [] });
  };

  return (
    <div className="space-y-4 py-4">
      <div>
        <label className="text-sm font-medium mb-2 block">Frequency</label>
        <Select value={frequency} onValueChange={setFrequency}>
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

      {frequency === 'weekly' && (
        <div>
          <label className="text-sm font-medium mb-2 block">Day of Week</label>
          <Select value={dayOfWeek} onValueChange={setDayOfWeek}>
            <SelectTrigger>
              <SelectValue />
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

      <div>
        <label className="text-sm font-medium mb-2 block">Time</label>
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg"
        />
      </div>

      <Button onClick={handleSave} className="w-full bg-int-orange hover:bg-int-orange-dark">
        Save Automation
      </Button>
    </div>
  );
}