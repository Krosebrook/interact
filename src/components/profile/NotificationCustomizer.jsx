import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Bell, Mail, Smartphone, CheckCircle } from 'lucide-react';

const NOTIFICATION_TYPES = [
  {
    id: 'achievement_unlocked',
    label: 'Achievement Unlocked',
    description: 'When you earn a new badge or reach a milestone',
    icon: '🏆',
    channels: ['email', 'in_app']
  },
  {
    id: 'points_earned',
    label: 'Points Earned',
    description: 'When you receive points from activities',
    icon: '⭐',
    channels: ['in_app']
  },
  {
    id: 'tier_upgrade',
    label: 'Tier Upgrade',
    description: 'When you advance to a new tier',
    icon: '👑',
    channels: ['email', 'in_app']
  },
  {
    id: 'challenge_progress',
    label: 'Challenge Updates',
    description: 'Progress updates on active challenges',
    icon: '🎯',
    channels: ['in_app']
  },
  {
    id: 'leaderboard_position',
    label: 'Leaderboard Changes',
    description: 'When your ranking changes significantly',
    icon: '📊',
    channels: ['in_app']
  },
  {
    id: 'recognition_received',
    label: 'Recognition Received',
    description: 'When someone gives you recognition',
    icon: '💝',
    channels: ['email', 'in_app', 'teams']
  },
  {
    id: 'streak_reminder',
    label: 'Streak Reminders',
    description: 'Daily reminders to maintain your streak',
    icon: '🔥',
    channels: ['in_app']
  },
  {
    id: 'weekly_digest',
    label: 'Weekly Digest',
    description: 'Summary of your weekly achievements',
    icon: '📈',
    channels: ['email']
  }
];

export default function NotificationCustomizer({ preferences = {}, onSave, isSaving }) {
  const [settings, setSettings] = useState(preferences || {});

  useEffect(() => {
    setSettings(preferences || {});
  }, [preferences]);

  const handleToggle = (notifId, channel) => {
    setSettings(prev => ({
      ...prev,
      [notifId]: {
        ...(prev[notifId] || {}),
        [channel]: !(prev[notifId]?.[channel])
      }
    }));
  };

  const handleSave = () => {
    onSave(settings);
  };

  const enabledCount = Object.values(settings).reduce((count, notif) => 
    count + Object.values(notif || {}).filter(Boolean).length, 0
  );

  return (
    <div className="space-y-6" data-b44-sync="true" data-feature="profile" data-component="notificationcustomizer">
      {/* Summary */}
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-900">Notification Settings</p>
              <p className="text-sm text-slate-600">{enabledCount} notifications enabled</p>
            </div>
            <Bell className="h-8 w-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>

      {/* Notification Types */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Configure Notifications</CardTitle>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {NOTIFICATION_TYPES.map((notif) => (
              <div key={notif.id} className="p-4 rounded-lg border bg-slate-50">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{notif.icon}</span>
                    <div>
                      <h4 className="font-semibold text-slate-900">{notif.label}</h4>
                      <p className="text-sm text-slate-600">{notif.description}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-4 ml-11">
                  {notif.channels.includes('email') && (
                    <div className="flex items-center gap-2">
                      <Switch
                        id={`${notif.id}-email`}
                        checked={settings[notif.id]?.email || false}
                        onCheckedChange={() => handleToggle(notif.id, 'email')}
                      />
                      <Label htmlFor={`${notif.id}-email`} className="flex items-center gap-1 text-sm cursor-pointer">
                        <Mail className="h-4 w-4" />
                        Email
                      </Label>
                    </div>
                  )}
                  
                  {notif.channels.includes('in_app') && (
                    <div className="flex items-center gap-2">
                      <Switch
                        id={`${notif.id}-in_app`}
                        checked={settings[notif.id]?.in_app || false}
                        onCheckedChange={() => handleToggle(notif.id, 'in_app')}
                      />
                      <Label htmlFor={`${notif.id}-in_app`} className="flex items-center gap-1 text-sm cursor-pointer">
                        <Bell className="h-4 w-4" />
                        In-App
                      </Label>
                    </div>
                  )}
                  
                  {notif.channels.includes('teams') && (
                    <div className="flex items-center gap-2">
                      <Switch
                        id={`${notif.id}-teams`}
                        checked={settings[notif.id]?.teams || false}
                        onCheckedChange={() => handleToggle(notif.id, 'teams')}
                      />
                      <Label htmlFor={`${notif.id}-teams`} className="flex items-center gap-1 text-sm cursor-pointer">
                        <Smartphone className="h-4 w-4" />
                        Teams
                      </Label>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardContent className="py-4">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const allEnabled = {};
                NOTIFICATION_TYPES.forEach(notif => {
                  allEnabled[notif.id] = {};
                  notif.channels.forEach(channel => {
                    allEnabled[notif.id][channel] = true;
                  });
                });
                setSettings(allEnabled);
              }}
            >
              Enable All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSettings({})}
            >
              Disable All
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}