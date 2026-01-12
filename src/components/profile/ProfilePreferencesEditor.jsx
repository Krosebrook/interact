import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  User, 
  Upload, 
  X, 
  Plus,
  Loader2,
  Save
} from 'lucide-react';
import { toast } from 'sonner';

const ACTIVITY_TYPES = [
  { value: 'icebreaker', label: 'Icebreaker', icon: '🧊' },
  { value: 'creative', label: 'Creative', icon: '🎨' },
  { value: 'competitive', label: 'Competitive', icon: '🏆' },
  { value: 'wellness', label: 'Wellness', icon: '🧘' },
  { value: 'learning', label: 'Learning', icon: '📚' },
  { value: 'social', label: 'Social', icon: '🎉' },
];

const SKILL_SUGGESTIONS = [
  'Leadership', 'Communication', 'Creativity', 'Problem Solving',
  'Teamwork', 'Time Management', 'Public Speaking', 'Networking',
  'Strategic Thinking', 'Emotional Intelligence', 'Adaptability'
];

const INTEREST_SUGGESTIONS = [
  'Technology', 'Design', 'Music', 'Sports', 'Travel', 'Photography',
  'Gaming', 'Cooking', 'Reading', 'Fitness', 'Art', 'Movies'
];

export default function ProfilePreferencesEditor({ profile, onSave, onCancel }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    display_name: profile?.display_name || '',
    bio: profile?.bio || '',
    avatar_url: profile?.avatar_url || '',
    department: profile?.department || '',
    location: profile?.location || '',
    activity_preferences: profile?.activity_preferences || {
      preferred_types: [],
      preferred_duration: '15-30min',
      energy_preference: 'medium',
      group_size_preference: 'any'
    },
    skill_interests: profile?.skill_interests || [],
    interests_tags: profile?.interests_tags || [],
    communication_preferences: profile?.communication_preferences || {
      reminder_timing: '24h',
      notification_channels: ['email', 'in_app'],
      recap_emails: true
    },
    profile_visibility: profile?.profile_visibility || 'team_only'
  });
  const [newSkill, setNewSkill] = useState('');
  const [newInterest, setNewInterest] = useState('');
  const [uploading, setUploading] = useState(false);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (profile?.id) {
        return base44.entities.UserProfile.update(profile.id, data);
      } else {
        return base44.entities.UserProfile.create({
          ...data,
          user_email: profile?.user_email,
          onboarding_completed: true
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['user-profile']);
      toast.success('Profile saved!');
      onSave?.();
    }
  });

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({ ...prev, avatar_url: file_url }));
      toast.success('Photo uploaded!');
    } catch (error) {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const toggleActivityType = (type) => {
    setFormData(prev => ({
      ...prev,
      activity_preferences: {
        ...prev.activity_preferences,
        preferred_types: prev.activity_preferences.preferred_types.includes(type)
          ? prev.activity_preferences.preferred_types.filter(t => t !== type)
          : [...prev.activity_preferences.preferred_types, type]
      }
    }));
  };

  const addSkill = (skill) => {
    if (!skill.trim() || formData.skill_interests.includes(skill)) return;
    setFormData(prev => ({
      ...prev,
      skill_interests: [...prev.skill_interests, skill.trim()]
    }));
    setNewSkill('');
  };

  const removeSkill = (skill) => {
    setFormData(prev => ({
      ...prev,
      skill_interests: prev.skill_interests.filter(s => s !== skill)
    }));
  };

  const addInterest = (interest) => {
    if (!interest.trim() || formData.interests_tags.includes(interest)) return;
    setFormData(prev => ({
      ...prev,
      interests_tags: [...prev.interests_tags, interest.trim()]
    }));
    setNewInterest('');
  };

  const removeInterest = (interest) => {
    setFormData(prev => ({
      ...prev,
      interests_tags: prev.interests_tags.filter(i => i !== interest)
    }));
  };

  const toggleNotificationChannel = (channel) => {
    setFormData(prev => ({
      ...prev,
      communication_preferences: {
        ...prev.communication_preferences,
        notification_channels: prev.communication_preferences.notification_channels.includes(channel)
          ? prev.communication_preferences.notification_channels.filter(c => c !== channel)
          : [...prev.communication_preferences.notification_channels, channel]
      }
    }));
  };

  return (
    <div className="space-y-6" data-b44-sync="true" data-feature="profile" data-component="profilepreferenceseditor">
      {/* Basic Info */}
      <Card className="p-6">
        <h3 className="font-bold text-lg mb-4">Basic Information</h3>
        
        {/* Avatar */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            {formData.avatar_url ? (
              <img 
                src={formData.avatar_url} 
                alt="Avatar"
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-slate-200 flex items-center justify-center">
                <User className="h-10 w-10 text-slate-400" />
              </div>
            )}
          </div>
          <div>
            <Label htmlFor="avatar" className="cursor-pointer">
              <Button variant="outline" size="sm" asChild disabled={uploading}>
                <span>
                  {uploading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  Upload Photo
                </span>
              </Button>
            </Label>
            <input
              id="avatar"
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Display Name</Label>
            <Input
              value={formData.display_name}
              onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
              placeholder="How should we call you?"
            />
          </div>
          <div>
            <Label>Department</Label>
            <Input
              value={formData.department}
              onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
              placeholder="e.g., Engineering, Marketing"
            />
          </div>
          <div>
            <Label>Location</Label>
            <Input
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="e.g., New York, EST"
            />
          </div>
          <div>
            <Label>Profile Visibility</Label>
            <Select
              value={formData.profile_visibility}
              onValueChange={(val) => setFormData(prev => ({ ...prev, profile_visibility: val }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="team_only">Team Only</SelectItem>
                <SelectItem value="private">Private</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-4">
          <Label>Bio</Label>
          <Textarea
            value={formData.bio}
            onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
            placeholder="Tell us about yourself..."
            rows={3}
          />
        </div>
      </Card>

      {/* Activity Preferences */}
      <Card className="p-6">
        <h3 className="font-bold text-lg mb-4">Activity Preferences</h3>
        
        <div className="mb-4">
          <Label className="mb-2 block">Preferred Activity Types</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {ACTIVITY_TYPES.map((type) => (
              <button
                key={type.value}
                onClick={() => toggleActivityType(type.value)}
                className={`p-3 rounded-lg border-2 text-left transition-all ${
                  formData.activity_preferences.preferred_types.includes(type.value)
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <span className="text-xl mr-2">{type.icon}</span>
                <span className="text-sm font-medium">{type.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Preferred Duration</Label>
            <Select
              value={formData.activity_preferences.preferred_duration}
              onValueChange={(val) => setFormData(prev => ({
                ...prev,
                activity_preferences: { ...prev.activity_preferences, preferred_duration: val }
              }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5-15min">Quick (5-15 min)</SelectItem>
                <SelectItem value="15-30min">Standard (15-30 min)</SelectItem>
                <SelectItem value="30+min">Extended (30+ min)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Energy Preference</Label>
            <Select
              value={formData.activity_preferences.energy_preference}
              onValueChange={(val) => setFormData(prev => ({
                ...prev,
                activity_preferences: { ...prev.activity_preferences, energy_preference: val }
              }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">🧘 Low Energy</SelectItem>
                <SelectItem value="medium">⚖️ Balanced</SelectItem>
                <SelectItem value="high">🔥 High Energy</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Group Size</Label>
            <Select
              value={formData.activity_preferences.group_size_preference}
              onValueChange={(val) => setFormData(prev => ({
                ...prev,
                activity_preferences: { ...prev.activity_preferences, group_size_preference: val }
              }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small (2-5)</SelectItem>
                <SelectItem value="medium">Medium (6-15)</SelectItem>
                <SelectItem value="large">Large (15+)</SelectItem>
                <SelectItem value="any">Any Size</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Skills & Interests */}
      <Card className="p-6">
        <h3 className="font-bold text-lg mb-4">Skills & Interests</h3>
        
        {/* Skills */}
        <div className="mb-6">
          <Label className="mb-2 block">Skills I Want to Develop</Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.skill_interests.map((skill, idx) => (
              <Badge key={idx} className="bg-emerald-100 text-emerald-700 pr-1">
                {skill}
                <button onClick={() => removeSkill(skill)} className="ml-1 hover:bg-emerald-200 rounded-full p-0.5">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2 mb-2">
            <Input
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="Add a skill..."
              onKeyPress={(e) => e.key === 'Enter' && addSkill(newSkill)}
            />
            <Button onClick={() => addSkill(newSkill)} disabled={!newSkill.trim()}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-1">
            {SKILL_SUGGESTIONS.filter(s => !formData.skill_interests.includes(s)).slice(0, 5).map((skill) => (
              <button
                key={skill}
                onClick={() => addSkill(skill)}
                className="text-xs px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded-full transition"
              >
                + {skill}
              </button>
            ))}
          </div>
        </div>

        {/* Interests */}
        <div>
          <Label className="mb-2 block">Personal Interests</Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.interests_tags.map((interest, idx) => (
              <Badge key={idx} className="bg-purple-100 text-purple-700 pr-1">
                {interest}
                <button onClick={() => removeInterest(interest)} className="ml-1 hover:bg-purple-200 rounded-full p-0.5">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2 mb-2">
            <Input
              value={newInterest}
              onChange={(e) => setNewInterest(e.target.value)}
              placeholder="Add an interest..."
              onKeyPress={(e) => e.key === 'Enter' && addInterest(newInterest)}
            />
            <Button onClick={() => addInterest(newInterest)} disabled={!newInterest.trim()}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-1">
            {INTEREST_SUGGESTIONS.filter(i => !formData.interests_tags.includes(i)).slice(0, 6).map((interest) => (
              <button
                key={interest}
                onClick={() => addInterest(interest)}
                className="text-xs px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded-full transition"
              >
                + {interest}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Communication Preferences */}
      <Card className="p-6">
        <h3 className="font-bold text-lg mb-4">Communication Preferences</h3>
        
        <div className="space-y-4">
          <div>
            <Label className="mb-2 block">Reminder Timing</Label>
            <Select
              value={formData.communication_preferences.reminder_timing}
              onValueChange={(val) => setFormData(prev => ({
                ...prev,
                communication_preferences: { ...prev.communication_preferences, reminder_timing: val }
              }))}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">1 hour before</SelectItem>
                <SelectItem value="24h">24 hours before</SelectItem>
                <SelectItem value="both">Both</SelectItem>
                <SelectItem value="none">No reminders</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-2 block">Notification Channels</Label>
            <div className="flex flex-wrap gap-2">
              {['email', 'teams', 'in_app'].map((channel) => (
                <button
                  key={channel}
                  onClick={() => toggleNotificationChannel(channel)}
                  className={`px-3 py-2 rounded-lg border-2 transition-all ${
                    formData.communication_preferences.notification_channels.includes(channel)
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-slate-200'
                  }`}
                >
                  {channel === 'email' && '📧 Email'}
                  {channel === 'teams' && '💬 Teams'}
                  {channel === 'in_app' && '🔔 In-App'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Event Recap Emails</Label>
              <p className="text-sm text-slate-500">Receive summary emails after events</p>
            </div>
            <Switch
              checked={formData.communication_preferences.recap_emails}
              onCheckedChange={(val) => setFormData(prev => ({
                ...prev,
                communication_preferences: { ...prev.communication_preferences, recap_emails: val }
              }))}
            />
          </div>
        </div>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button
          onClick={() => saveMutation.mutate(formData)}
          disabled={saveMutation.isLoading}
          className="flex-1 bg-purple-600 hover:bg-purple-700"
        >
          {saveMutation.isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Profile
        </Button>
      </div>
    </div>
  );
}