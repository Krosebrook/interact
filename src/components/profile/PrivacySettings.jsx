import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Eye, EyeOff, Lock } from 'lucide-react';
import { toast } from 'sonner';

export default function PrivacySettings({ profile, onSave }) {
  const [settings, setSettings] = useState(profile?.privacy_settings || {
    profile_visibility: 'team_only',
    show_activity_history: true,
    show_badges: true,
    show_points: true,
    show_recognition: true,
    default_recognition_visibility: 'public',
    allow_mentions: true,
    show_location: true,
    show_department: true
  });

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({ privacy_settings: settings });
      toast.success('Privacy settings saved');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6" data-b44-sync="true" data-feature="profile" data-component="privacysettings">
      {/* Profile Visibility */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-int-orange" />
            Profile Visibility
          </CardTitle>
          <CardDescription>
            Control who can view your profile information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="profile-visibility" className="text-sm font-medium mb-2 block">
              Who can view your full profile?
            </Label>
            <Select
              value={settings.profile_visibility}
              onValueChange={(value) => setSettings(prev => ({ ...prev, profile_visibility: value }))}
            >
              <SelectTrigger id="profile-visibility">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    <div>
                      <div className="font-medium">Public</div>
                      <div className="text-xs text-slate-500">Everyone in the company</div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="team_only">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    <div>
                      <div className="font-medium">Team Only</div>
                      <div className="text-xs text-slate-500">Only your team members</div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="private">
                  <div className="flex items-center gap-2">
                    <EyeOff className="h-4 w-4" />
                    <div>
                      <div className="font-medium">Private</div>
                      <div className="text-xs text-slate-500">Only you and HR</div>
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="pt-2 space-y-3 border-t">
            <p className="text-sm text-slate-600 font-medium">What to show on your profile:</p>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="show-history" className="cursor-pointer">
                <div className="font-medium">Activity History</div>
                <div className="text-sm text-slate-500">Events attended and participation</div>
              </Label>
              <Switch
                id="show-history"
                checked={settings.show_activity_history}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, show_activity_history: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="show-badges" className="cursor-pointer">
                <div className="font-medium">Badges & Achievements</div>
                <div className="text-sm text-slate-500">Display earned badges</div>
              </Label>
              <Switch
                id="show-badges"
                checked={settings.show_badges}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, show_badges: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="show-points" className="cursor-pointer">
                <div className="font-medium">Points & Level</div>
                <div className="text-sm text-slate-500">Show gamification stats</div>
              </Label>
              <Switch
                id="show-points"
                checked={settings.show_points}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, show_points: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="show-recognition" className="cursor-pointer">
                <div className="font-medium">Recognition Received</div>
                <div className="text-sm text-slate-500">Show recognition posts</div>
              </Label>
              <Switch
                id="show-recognition"
                checked={settings.show_recognition}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, show_recognition: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="show-location" className="cursor-pointer">
                <div className="font-medium">Location/Timezone</div>
                <div className="text-sm text-slate-500">Display your location</div>
              </Label>
              <Switch
                id="show-location"
                checked={settings.show_location}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, show_location: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="show-department" className="cursor-pointer">
                <div className="font-medium">Department</div>
                <div className="text-sm text-slate-500">Show your department</div>
              </Label>
              <Switch
                id="show-department"
                checked={settings.show_department}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, show_department: checked }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recognition Privacy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-int-orange" />
            Recognition Privacy
          </CardTitle>
          <CardDescription>
            Default visibility for recognition posts you create
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="recognition-visibility" className="text-sm font-medium mb-2 block">
              Default visibility for posts you create
            </Label>
            <Select
              value={settings.default_recognition_visibility}
              onValueChange={(value) => setSettings(prev => ({ ...prev, default_recognition_visibility: value }))}
            >
              <SelectTrigger id="recognition-visibility">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public (Everyone)</SelectItem>
                <SelectItem value="team_only">Team Only</SelectItem>
                <SelectItem value="private">Private (Recipient only)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500 mt-2">
              You can change this per post when creating recognition
            </p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t">
            <Label htmlFor="allow-mentions" className="cursor-pointer">
              <div className="font-medium">Allow Mentions</div>
              <div className="text-sm text-slate-500">Let others tag you in posts</div>
            </Label>
            <Switch
              id="allow-mentions"
              checked={settings.allow_mentions}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, allow_mentions: checked }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Data Privacy Notice */}
      <Card className="bg-slate-50 border-slate-200">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Shield className="h-5 w-5 text-int-navy flex-shrink-0 mt-0.5" />
            <div className="text-sm text-slate-600">
              <p className="font-medium text-slate-900 mb-1">Your data is protected</p>
              <p className="leading-relaxed">
                We follow strict privacy guidelines and never share your personal information outside the organization. 
                HR and admins can access employee data as needed for company operations, in compliance with privacy regulations.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-int-orange hover:bg-int-orange/90"
        >
          {saving ? 'Saving...' : 'Save Privacy Settings'}
        </Button>
      </div>
    </div>
  );
}