import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  User, 
  Save, 
  Eye, 
  EyeOff,
  Trophy,
  Award,
  Flame,
  Bell,
  Shield,
  HelpCircle,
  Check
} from 'lucide-react';
import { toast } from 'sonner';

const DEFAULT_PREFERENCES = {
  show_on_leaderboard: true,
  show_badges_publicly: true,
  show_streak_publicly: true,
  show_level_publicly: true,
  show_points_publicly: true,
  receive_achievement_notifications: true,
  receive_leaderboard_notifications: true,
  receive_challenge_notifications: true,
  leaderboard_name_display: 'full_name', // 'full_name', 'first_name', 'anonymous'
  profile_visibility: 'team', // 'public', 'team', 'private'
};

export default function UserGamificationPreferences({ userEmail }) {
  const queryClient = useQueryClient();
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
  const [hasChanges, setHasChanges] = useState(false);

  const { data: userPrefsData = [] } = useQuery({
    queryKey: ['user-preferences', userEmail],
    queryFn: () => base44.entities.UserPreferences.filter({ user_email: userEmail }),
    enabled: !!userEmail
  });

  useEffect(() => {
    if (userPrefsData[0]?.gamification_preferences) {
      setPreferences({
        ...DEFAULT_PREFERENCES,
        ...userPrefsData[0].gamification_preferences
      });
    }
  }, [userPrefsData]);

  const saveMutation = useMutation({
    mutationFn: async (prefs) => {
      const existing = userPrefsData[0];
      if (existing) {
        return base44.entities.UserPreferences.update(existing.id, {
          gamification_preferences: prefs
        });
      } else {
        return base44.entities.UserPreferences.create({
          user_email: userEmail,
          gamification_preferences: prefs
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-preferences'] });
      setHasChanges(false);
      toast.success('Preferences saved successfully');
    }
  });

  const handleChange = (key, value) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    saveMutation.mutate(preferences);
  };

  const PreferenceRow = ({ icon: Icon, label, description, children }) => (
    <div className="flex items-center justify-between py-4 border-b border-slate-100 last:border-0">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-slate-100">
          <Icon className="h-4 w-4 text-slate-600" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-900">{label}</span>
            {description && (
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-4 w-4 text-slate-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">{description}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
      </div>
      {children}
    </div>
  );

  return (
    <TooltipProvider>
      <Card className="border-2 border-slate-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 shadow-sm">
                <User className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle>Your Gamification Preferences</CardTitle>
                <p className="text-sm text-slate-500 mt-1">
                  Control how your achievements are displayed
                </p>
              </div>
            </div>
            {hasChanges && (
              <Button
                onClick={handleSave}
                disabled={saveMutation.isPending}
                className="bg-gradient-orange hover:opacity-90 text-white"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Visibility Section */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4">
              Profile Visibility
            </h3>
            
            <PreferenceRow
              icon={Eye}
              label="Profile Visibility"
              description="Who can see your gamification profile"
            >
              <Select 
                value={preferences.profile_visibility} 
                onValueChange={(v) => handleChange('profile_visibility', v)}
              >
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Everyone</SelectItem>
                  <SelectItem value="team">Team Only</SelectItem>
                  <SelectItem value="private">Only Me</SelectItem>
                </SelectContent>
              </Select>
            </PreferenceRow>

            <PreferenceRow
              icon={Trophy}
              label="Leaderboard Display Name"
              description="How your name appears on leaderboards"
            >
              <Select 
                value={preferences.leaderboard_name_display} 
                onValueChange={(v) => handleChange('leaderboard_name_display', v)}
              >
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full_name">Full Name</SelectItem>
                  <SelectItem value="first_name">First Name Only</SelectItem>
                  <SelectItem value="anonymous">Anonymous</SelectItem>
                </SelectContent>
              </Select>
            </PreferenceRow>
          </div>

          {/* Display Options */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4">
              Public Display Options
            </h3>

            <PreferenceRow
              icon={Trophy}
              label="Show on Leaderboard"
              description="Appear in public and team leaderboards"
            >
              <Switch
                checked={preferences.show_on_leaderboard}
                onCheckedChange={(v) => handleChange('show_on_leaderboard', v)}
              />
            </PreferenceRow>

            <PreferenceRow
              icon={Award}
              label="Show Badges Publicly"
              description="Display your earned badges on your profile"
            >
              <Switch
                checked={preferences.show_badges_publicly}
                onCheckedChange={(v) => handleChange('show_badges_publicly', v)}
              />
            </PreferenceRow>

            <PreferenceRow
              icon={Flame}
              label="Show Streak Publicly"
              description="Display your participation streak"
            >
              <Switch
                checked={preferences.show_streak_publicly}
                onCheckedChange={(v) => handleChange('show_streak_publicly', v)}
              />
            </PreferenceRow>

            <PreferenceRow
              icon={Shield}
              label="Show Level Publicly"
              description="Display your current level"
            >
              <Switch
                checked={preferences.show_level_publicly}
                onCheckedChange={(v) => handleChange('show_level_publicly', v)}
              />
            </PreferenceRow>
          </div>

          {/* Notifications */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4">
              Notification Preferences
            </h3>

            <PreferenceRow
              icon={Bell}
              label="Achievement Notifications"
              description="Get notified when you earn badges or level up"
            >
              <Switch
                checked={preferences.receive_achievement_notifications}
                onCheckedChange={(v) => handleChange('receive_achievement_notifications', v)}
              />
            </PreferenceRow>

            <PreferenceRow
              icon={Trophy}
              label="Leaderboard Updates"
              description="Get notified about rank changes"
            >
              <Switch
                checked={preferences.receive_leaderboard_notifications}
                onCheckedChange={(v) => handleChange('receive_leaderboard_notifications', v)}
              />
            </PreferenceRow>

            <PreferenceRow
              icon={Award}
              label="Challenge Notifications"
              description="Get notified about new challenges"
            >
              <Switch
                checked={preferences.receive_challenge_notifications}
                onCheckedChange={(v) => handleChange('receive_challenge_notifications', v)}
              />
            </PreferenceRow>
          </div>

          {/* Save indicator */}
          {saveMutation.isSuccess && !hasChanges && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 flex items-center justify-center gap-2 text-emerald-600"
            >
              <Check className="h-5 w-5" />
              <span className="text-sm font-medium">All changes saved</span>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}