import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bell, Mail, MessageSquare, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function NotificationSettings({ userProfile }) {
  const queryClient = useQueryClient();
  const [preferences, setPreferences] = useState(
    userProfile?.notification_preferences || {
      enabled_channels: ['email', 'in_app'],
      event_reminders: '24h',
      recognition_notifications: true,
      survey_reminders: true,
      milestone_celebrations: true,
      wellness_reminders: true,
      recap_emails: true,
      mentorship_match_alerts: true,
      learning_resource_suggestions: true,
      digest_frequency: 'weekly',
      quiet_hours: {
        enabled: false,
        start_time: '22:00',
        end_time: '08:00'
      }
    }
  );

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      if (userProfile?.id) {
        return base44.entities.UserProfile.update(userProfile.id, {
          notification_preferences: data
        });
      }
      return base44.entities.UserProfile.create({
        user_email: base44.auth.me()?.email,
        notification_preferences: data
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['user-profile']);
      toast.success('Notification preferences updated');
    }
  });

  const handleSave = () => {
    updateMutation.mutate(preferences);
  };

  const toggleChannel = (channel) => {
    const current = preferences.enabled_channels || [];
    const updated = current.includes(channel)
      ? current.filter(c => c !== channel)
      : [...current, channel];
    setPreferences({ ...preferences, enabled_channels: updated });
  };

  return (
    <div className="space-y-6">
      {/* Notification Channels */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-purple-600" />
            Notification Channels
          </CardTitle>
          <CardDescription>
            Choose how you want to receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-slate-500" />
              <Label>Email notifications</Label>
            </div>
            <Switch
              checked={preferences.enabled_channels?.includes('email')}
              onCheckedChange={() => toggleChannel('email')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-slate-500" />
              <Label>In-app notifications</Label>
            </div>
            <Switch
              checked={preferences.enabled_channels?.includes('in_app')}
              onCheckedChange={() => toggleChannel('in_app')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-slate-500" />
              <Label>Slack notifications</Label>
            </div>
            <Switch
              checked={preferences.enabled_channels?.includes('slack')}
              onCheckedChange={() => toggleChannel('slack')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-slate-500" />
              <Label>Microsoft Teams notifications</Label>
            </div>
            <Switch
              checked={preferences.enabled_channels?.includes('teams')}
              onCheckedChange={() => toggleChannel('teams')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Event Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Event Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Event reminders</Label>
            <Select
              value={preferences.event_reminders}
              onValueChange={(value) => setPreferences({ ...preferences, event_reminders: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No reminders</SelectItem>
                <SelectItem value="1h">1 hour before</SelectItem>
                <SelectItem value="24h">24 hours before</SelectItem>
                <SelectItem value="both">Both 1h and 24h</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label>Recognition notifications</Label>
            <Switch
              checked={preferences.recognition_notifications}
              onCheckedChange={(checked) => setPreferences({ ...preferences, recognition_notifications: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Survey reminders</Label>
            <Switch
              checked={preferences.survey_reminders}
              onCheckedChange={(checked) => setPreferences({ ...preferences, survey_reminders: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Milestone celebrations</Label>
            <Switch
              checked={preferences.milestone_celebrations}
              onCheckedChange={(checked) => setPreferences({ ...preferences, milestone_celebrations: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Wellness reminders</Label>
            <Switch
              checked={preferences.wellness_reminders}
              onCheckedChange={(checked) => setPreferences({ ...preferences, wellness_reminders: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Digest Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Email Digest</CardTitle>
          <CardDescription>
            Receive a summary of activity and updates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Weekly recap emails</Label>
            <Switch
              checked={preferences.recap_emails}
              onCheckedChange={(checked) => setPreferences({ ...preferences, recap_emails: checked })}
            />
          </div>

          <div className="space-y-2">
            <Label>Digest frequency</Label>
            <Select
              value={preferences.digest_frequency}
              onValueChange={(value) => setPreferences({ ...preferences, digest_frequency: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="never">Never</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Quiet Hours */}
      <Card>
        <CardHeader>
          <CardTitle>Quiet Hours</CardTitle>
          <CardDescription>
            Don't send notifications during these hours
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Enable quiet hours</Label>
            <Switch
              checked={preferences.quiet_hours?.enabled}
              onCheckedChange={(checked) => setPreferences({
                ...preferences,
                quiet_hours: { ...preferences.quiet_hours, enabled: checked }
              })}
            />
          </div>

          {preferences.quiet_hours?.enabled && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start time</Label>
                <Input
                  type="time"
                  value={preferences.quiet_hours?.start_time || '22:00'}
                  onChange={(e) => setPreferences({
                    ...preferences,
                    quiet_hours: { ...preferences.quiet_hours, start_time: e.target.value }
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label>End time</Label>
                <Input
                  type="time"
                  value={preferences.quiet_hours?.end_time || '08:00'}
                  onChange={(e) => setPreferences({
                    ...preferences,
                    quiet_hours: { ...preferences.quiet_hours, end_time: e.target.value }
                  })}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={updateMutation.isPending}>
          <Save className="h-4 w-4 mr-2" />
          {updateMutation.isPending ? 'Saving...' : 'Save Preferences'}
        </Button>
      </div>
    </div>
  );
}