import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Zap, Clock, Users, X } from 'lucide-react';
import { toast } from 'sonner';

const ACTIVITY_TYPES = [
  { value: 'icebreaker', label: 'Icebreakers', icon: '❄️' },
  { value: 'creative', label: 'Creative', icon: '🎨' },
  { value: 'competitive', label: 'Competitive', icon: '🏆' },
  { value: 'wellness', label: 'Wellness', icon: '🧘' },
  { value: 'learning', label: 'Learning', icon: '📚' },
  { value: 'social', label: 'Social', icon: '🎉' }
];

const DAYS = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' }
];

const TIMES = [
  { value: 'morning', label: 'Morning (9-11 AM)' },
  { value: 'midday', label: 'Midday (11 AM-1 PM)' },
  { value: 'afternoon', label: 'Afternoon (1-4 PM)' },
  { value: 'evening', label: 'Evening (4-6 PM)' }
];

export default function PersonalizationSettings({ profile, onSave }) {
  const [settings, setSettings] = useState(profile?.activity_preferences || {
    preferred_types: [],
    avoid_types: [],
    preferred_duration: '15-30min',
    energy_preference: 'medium',
    group_size_preference: 'any',
    optimal_days: [],
    optimal_times: [],
    ai_creativity_level: 'balanced',
    custom_instructions: ''
  });

  const [saving, setSaving] = useState(false);

  const toggleType = (type, field) => {
    setSettings(prev => {
      const current = prev[field] || [];
      return {
        ...prev,
        [field]: current.includes(type)
          ? current.filter(t => t !== type)
          : [...current, type]
      };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({ activity_preferences: settings });
      toast.success('Personalization settings saved');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6" data-b44-sync="true" data-feature="profile" data-component="personalizationsettings">
      {/* AI Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-int-orange" />
            AI Recommendation Style
          </CardTitle>
          <CardDescription>
            Customize how AI suggests activities for you
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="ai-creativity" className="text-sm font-medium mb-2 block">
              AI Creativity Level
            </Label>
            <Select
              value={settings.ai_creativity_level}
              onValueChange={(value) => setSettings(prev => ({ ...prev, ai_creativity_level: value }))}
            >
              <SelectTrigger id="ai-creativity">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="conservative">
                  <div>
                    <div className="font-medium">Conservative</div>
                    <div className="text-xs text-slate-500">Stick to proven activities</div>
                  </div>
                </SelectItem>
                <SelectItem value="balanced">
                  <div>
                    <div className="font-medium">Balanced</div>
                    <div className="text-xs text-slate-500">Mix of familiar and new</div>
                  </div>
                </SelectItem>
                <SelectItem value="creative">
                  <div>
                    <div className="font-medium">Creative</div>
                    <div className="text-xs text-slate-500">Surprise me with unique ideas</div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="custom-instructions" className="text-sm font-medium mb-2 block">
              Custom Instructions (Optional)
            </Label>
            <Textarea
              id="custom-instructions"
              placeholder="Tell AI more about your preferences... e.g., 'I prefer low-pressure activities' or 'I love anything involving music'"
              value={settings.custom_instructions || ''}
              onChange={(e) => setSettings(prev => ({ ...prev, custom_instructions: e.target.value }))}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-slate-500 mt-2">
              Help AI tailor recommendations to your unique preferences
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Activity Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-int-orange" />
            Activity Preferences
          </CardTitle>
          <CardDescription>
            Choose what types of activities you enjoy
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium mb-3 block">Preferred Activity Types</Label>
            <div className="flex flex-wrap gap-2">
              {ACTIVITY_TYPES.map(({ value, label, icon }) => (
                <Badge
                  key={value}
                  variant={settings.preferred_types?.includes(value) ? 'default' : 'outline'}
                  className={`cursor-pointer ${
                    settings.preferred_types?.includes(value)
                      ? 'bg-int-orange hover:bg-int-orange/90'
                      : 'hover:bg-slate-100'
                  }`}
                  onClick={() => toggleType(value, 'preferred_types')}
                >
                  <span className="mr-1">{icon}</span>
                  {label}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium mb-3 block">Activities to Avoid</Label>
            <div className="flex flex-wrap gap-2">
              {ACTIVITY_TYPES.map(({ value, label, icon }) => (
                <Badge
                  key={value}
                  variant={settings.avoid_types?.includes(value) ? 'destructive' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => toggleType(value, 'avoid_types')}
                >
                  <span className="mr-1">{icon}</span>
                  {label}
                  {settings.avoid_types?.includes(value) && (
                    <X className="ml-1 h-3 w-3" />
                  )}
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div>
              <Label htmlFor="duration" className="text-sm font-medium mb-2 block">
                Preferred Duration
              </Label>
              <Select
                value={settings.preferred_duration}
                onValueChange={(value) => setSettings(prev => ({ ...prev, preferred_duration: value }))}
              >
                <SelectTrigger id="duration">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5-15min">5-15 minutes</SelectItem>
                  <SelectItem value="15-30min">15-30 minutes</SelectItem>
                  <SelectItem value="30+min">30+ minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="energy" className="text-sm font-medium mb-2 block">
                Energy Level
              </Label>
              <Select
                value={settings.energy_preference}
                onValueChange={(value) => setSettings(prev => ({ ...prev, energy_preference: value }))}
              >
                <SelectTrigger id="energy">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low energy</SelectItem>
                  <SelectItem value="medium">Medium energy</SelectItem>
                  <SelectItem value="high">High energy</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="group-size" className="text-sm font-medium mb-2 block">
                Group Size
              </Label>
              <Select
                value={settings.group_size_preference}
                onValueChange={(value) => setSettings(prev => ({ ...prev, group_size_preference: value }))}
              >
                <SelectTrigger id="group-size">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small (2-5)</SelectItem>
                  <SelectItem value="medium">Medium (6-15)</SelectItem>
                  <SelectItem value="large">Large (16+)</SelectItem>
                  <SelectItem value="any">Any size</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scheduling Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-int-orange" />
            Optimal Times
          </CardTitle>
          <CardDescription>
            When are you most available for events?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium mb-3 block">Best Days</Label>
            <div className="flex flex-wrap gap-2">
              {DAYS.map(({ value, label }) => (
                <Badge
                  key={value}
                  variant={settings.optimal_days?.includes(value) ? 'default' : 'outline'}
                  className={`cursor-pointer ${
                    settings.optimal_days?.includes(value)
                      ? 'bg-int-navy hover:bg-int-navy/90'
                      : 'hover:bg-slate-100'
                  }`}
                  onClick={() => toggleType(value, 'optimal_days')}
                >
                  {label}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium mb-3 block">Best Times</Label>
            <div className="flex flex-wrap gap-2">
              {TIMES.map(({ value, label }) => (
                <Badge
                  key={value}
                  variant={settings.optimal_times?.includes(value) ? 'default' : 'outline'}
                  className={`cursor-pointer ${
                    settings.optimal_times?.includes(value)
                      ? 'bg-int-navy hover:bg-int-navy/90'
                      : 'hover:bg-slate-100'
                  }`}
                  onClick={() => toggleType(value, 'optimal_times')}
                >
                  {label}
                </Badge>
              ))}
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
          {saving ? 'Saving...' : 'Save Personalization'}
        </Button>
      </div>
    </div>
  );
}