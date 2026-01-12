import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Settings, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function DashboardCustomizer({ userEmail, open, onOpenChange }) {
  const queryClient = useQueryClient();

  const { data: preferences = [] } = useQuery({
    queryKey: ['user-preferences', userEmail],
    queryFn: () => base44.entities.UserPreferences.filter({ user_email: userEmail }),
    enabled: !!userEmail
  });

  const currentPrefs = preferences[0] || {
    dashboard_widgets: {
      show_points_tracker: true,
      show_leaderboard: true,
      show_badges: true,
      show_recent_activities: true,
      show_personal_coach: true,
      show_team_stats: true,
      show_quick_stats: true
    },
    notification_preferences: {
      badge_alerts: true,
      event_reminders: true,
      level_up_alerts: true,
      team_achievements: true
    }
  };

  const [settings, setSettings] = useState(currentPrefs);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (preferences[0]) {
        return base44.entities.UserPreferences.update(preferences[0].id, data);
      } else {
        return base44.entities.UserPreferences.create({ user_email: userEmail, ...data });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['user-preferences', userEmail]);
      toast.success('Dashboard settings saved! 🎨');
      onOpenChange(false);
    }
  });

  const handleSave = () => {
    saveMutation.mutate(settings);
  };

  const widgetOptions = [
    { key: 'show_quick_stats', label: 'Quick Stats Cards', description: 'Overview statistics' },
    { key: 'show_points_tracker', label: 'Points Tracker', description: 'Your current level and progress' },
    { key: 'show_leaderboard', label: 'Leaderboard', description: 'Top performers ranking' },
    { key: 'show_badges', label: 'Badge Collection', description: 'Earned and available badges' },
    { key: 'show_recent_activities', label: 'Recent Activities', description: 'Latest participation history' },
    { key: 'show_personal_coach', label: 'Personal Coach', description: 'AI-powered recommendations' },
    { key: 'show_team_stats', label: 'Team Statistics', description: 'Team performance overview' }
  ];

  const notificationOptions = [
    { key: 'badge_alerts', label: 'Badge Alerts', description: 'When you earn new badges' },
    { key: 'event_reminders', label: 'Event Reminders', description: 'Upcoming event notifications' },
    { key: 'level_up_alerts', label: 'Level Up Alerts', description: 'When you reach a new level' },
    { key: 'team_achievements', label: 'Team Achievements', description: 'Team milestone notifications' }
  ];

  return (
    <Dialog data-b44-sync="true" data-feature="dashboard" data-component="dashboardcustomizer" open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Customize Dashboard
          </DialogTitle>
          <DialogDescription>
            Choose which widgets and notifications you want to see
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Widget Settings */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Dashboard Widgets</h3>
            <div className="space-y-3">
              {widgetOptions.map((option) => (
                <div key={option.key} className="flex items-center justify-between p-3 rounded-lg border bg-slate-50">
                  <div className="flex-1">
                    <Label htmlFor={option.key} className="font-medium cursor-pointer">
                      {option.label}
                    </Label>
                    <p className="text-sm text-slate-600">{option.description}</p>
                  </div>
                  <Switch
                    id={option.key}
                    checked={settings.dashboard_widgets?.[option.key] ?? true}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({
                        ...prev,
                        dashboard_widgets: {
                          ...prev.dashboard_widgets,
                          [option.key]: checked
                        }
                      }))
                    }
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Notification Settings */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Notification Preferences</h3>
            <div className="space-y-3">
              {notificationOptions.map((option) => (
                <div key={option.key} className="flex items-center justify-between p-3 rounded-lg border bg-slate-50">
                  <div className="flex-1">
                    <Label htmlFor={option.key} className="font-medium cursor-pointer">
                      {option.label}
                    </Label>
                    <p className="text-sm text-slate-600">{option.description}</p>
                  </div>
                  <Switch
                    id={option.key}
                    checked={settings.notification_preferences?.[option.key] ?? true}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({
                        ...prev,
                        notification_preferences: {
                          ...prev.notification_preferences,
                          [option.key]: checked
                        }
                      }))
                    }
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={saveMutation.isPending}
              className="bg-int-orange hover:bg-[#C46322]"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}