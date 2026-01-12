import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Bell, BellOff, Clock, Mail, MessageSquare, Smartphone } from 'lucide-react';
import { toast } from 'sonner';

export default function NotificationSettings({ profile, onSave }) {
  const [settings, setSettings] = useState(profile?.notification_preferences || {
    enabled_channels: ['email', 'in_app'],
    event_reminders: '24h',
    recognition_notifications: true,
    survey_reminders: true,
    milestone_celebrations: true,
    wellness_reminders: true,
    recap_emails: true,
    digest_frequency: 'weekly',
    quiet_hours: {
      enabled: false,
      start_time: '22:00',
      end_time: '08:00'
    }
  });

  const [saving, setSaving] = useState(false);

  const handleChannelToggle = (channel) => {
    setSettings(prev => ({
      ...prev,
      enabled_channels: prev.enabled_channels?.includes(channel)
        ? prev.enabled_channels.filter(c => c !== channel)
        : [...(prev.enabled_channels || []), channel]
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({ notification_preferences: settings });
      toast.success('Notification settings saved');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6" data-b44-sync="true" data-feature="profile" data-component="notificationsettings">
      {/* Notification Channels */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-int-orange" />
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
              <Label htmlFor="email-channel" className="cursor-pointer">
                <div className="font-medium">Email</div>
                <div className="text-sm text-slate-500">Receive notifications via email</div>
              </Label>
            </div>
            <Switch
              id="email-channel"
              checked={settings.enabled_channels?.includes('email')}
              onCheckedChange={() => handleChannelToggle('email')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-slate-500" />
              <Label htmlFor="teams-channel" className="cursor-pointer">
                <div className="font-medium">Microsoft Teams</div>
                <div className="text-sm text-slate-500">Notifications in Teams</div>
              </Label>
            </div>
            <Switch
              id="teams-channel"
              checked={settings.enabled_channels?.includes('teams')}
              onCheckedChange={() => handleChannelToggle('teams')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone className="h-5 w-5 text-slate-500" />
              <Label htmlFor="inapp-channel" className="cursor-pointer">
                <div className="font-medium">In-App Notifications</div>
                <div className="text-sm text-slate-500">See notifications within the app</div>
              </Label>
            </div>
            <Switch
              id="inapp-channel"
              checked={settings.enabled_channels?.includes('in_app')}
              onCheckedChange={() => handleChannelToggle('in_app')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Event Reminders */}
      <Card>
        <CardHeader>
          <CardTitle>Event Reminders</CardTitle>
          <CardDescription>
            When to receive reminders for upcoming events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            value={settings.event_reminders}
            onValueChange={(value) => setSettings(prev => ({ ...prev, event_reminders: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No reminders</SelectItem>
              <SelectItem value="1h">1 hour before</SelectItem>
              <SelectItem value="24h">24 hours before</SelectItem>
              <SelectItem value="both">Both (1h and 24h)</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Notification Types */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Types</CardTitle>
          <CardDescription>
            Choose what types of notifications you want to receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="recognition" className="cursor-pointer">
              <div className="font-medium">Recognition Received</div>
              <div className="text-sm text-slate-500">When someone recognizes you</div>
            </Label>
            <Switch
              id="recognition"
              checked={settings.recognition_notifications}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, recognition_notifications: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="surveys" className="cursor-pointer">
              <div className="font-medium">Survey Reminders</div>
              <div className="text-sm text-slate-500">Reminders for pulse surveys</div>
            </Label>
            <Switch
              id="surveys"
              checked={settings.survey_reminders}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, survey_reminders: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="milestones" className="cursor-pointer">
              <div className="font-medium">Milestone Celebrations</div>
              <div className="text-sm text-slate-500">Birthdays, anniversaries, achievements</div>
            </Label>
            <Switch
              id="milestones"
              checked={settings.milestone_celebrations}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, milestone_celebrations: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="wellness" className="cursor-pointer">
              <div className="font-medium">Wellness Reminders</div>
              <div className="text-sm text-slate-500">Wellness challenge updates</div>
            </Label>
            <Switch
              id="wellness"
              checked={settings.wellness_reminders}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, wellness_reminders: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="recap" className="cursor-pointer">
              <div className="font-medium">Event Recaps</div>
              <div className="text-sm text-slate-500">Post-event summaries and highlights</div>
            </Label>
            <Switch
              id="recap"
              checked={settings.recap_emails}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, recap_emails: checked }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Digest Frequency */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Digest</CardTitle>
          <CardDescription>
            How often to receive a summary of activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            value={settings.digest_frequency}
            onValueChange={(value) => setSettings(prev => ({ ...prev, digest_frequency: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="never">Never</SelectItem>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Quiet Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-int-orange" />
            Quiet Hours
          </CardTitle>
          <CardDescription>
            Pause notifications during specific hours
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="quiet-hours" className="cursor-pointer font-medium">
              Enable quiet hours
            </Label>
            <Switch
              id="quiet-hours"
              checked={settings.quiet_hours?.enabled}
              onCheckedChange={(checked) => setSettings(prev => ({
                ...prev,
                quiet_hours: { ...prev.quiet_hours, enabled: checked }
              }))}
            />
          </div>

          {settings.quiet_hours?.enabled && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start-time" className="text-sm text-slate-600">Start time</Label>
                <Input
                  id="start-time"
                  type="time"
                  value={settings.quiet_hours?.start_time || '22:00'}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    quiet_hours: { ...prev.quiet_hours, start_time: e.target.value }
                  }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="end-time" className="text-sm text-slate-600">End time</Label>
                <Input
                  id="end-time"
                  type="time"
                  value={settings.quiet_hours?.end_time || '08:00'}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    quiet_hours: { ...prev.quiet_hours, end_time: e.target.value }
                  }))}
                  className="mt-1"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-int-orange hover:bg-int-orange/90"
        >
          {saving ? 'Saving...' : 'Save Preferences'}
        </Button>
      </div>
    </div>
  );
}