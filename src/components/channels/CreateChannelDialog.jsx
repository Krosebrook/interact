import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Hash, 
  Lock, 
  Users, 
  Globe,
  FolderKanban,
  Lightbulb,
  Megaphone,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import { playSound } from '../utils/soundEffects';

const CHANNEL_TYPES = [
  { value: 'team', label: 'Team', icon: Users, description: 'For department or team communication' },
  { value: 'project', label: 'Project', icon: FolderKanban, description: 'For project-specific discussions' },
  { value: 'interest', label: 'Interest', icon: Lightbulb, description: 'For shared hobbies or interests' },
  { value: 'announcement', label: 'Announcement', icon: Megaphone, description: 'For important updates' }
];

const CHANNEL_ICONS = ['💬', '🎯', '🚀', '💡', '🎨', '🏆', '🌟', '🔥', '📚', '🎮', '🎵', '☕', '🌴', '🏃', '🧘', '📊'];

export default function CreateChannelDialog({ open, onOpenChange, user }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'team',
    visibility: 'public',
    icon: '💬'
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Channel.create({
      ...data,
      owner_email: user.email,
      member_emails: [user.email],
      admin_emails: [user.email],
      member_count: 1,
      message_count: 0
    }),
    onSuccess: () => {
      playSound('success');
      queryClient.invalidateQueries(['channels']);
      toast.success('Channel created!');
      onOpenChange(false);
      setFormData({
        name: '',
        description: '',
        type: 'team',
        visibility: 'public',
        icon: '💬'
      });
    },
    onError: (error) => {
      toast.error('Failed to create channel');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Channel name is required');
      return;
    }
    createMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-int-orange" />
            Create Channel
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Icon Selection */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Icon</Label>
            <div className="flex flex-wrap gap-2">
              {CHANNEL_ICONS.map(icon => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setFormData({ ...formData, icon })}
                  className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all ${
                    formData.icon === icon
                      ? 'bg-int-orange text-white scale-110'
                      : 'bg-slate-100 hover:bg-slate-200'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <Label htmlFor="name">Channel Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., engineering-team"
              className="mt-1"
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What's this channel about?"
              rows={2}
              className="mt-1"
            />
          </div>

          {/* Type */}
          <div>
            <Label>Channel Type</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {CHANNEL_TYPES.map(type => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, type: type.value })}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${
                      formData.type === type.value
                        ? 'border-int-orange bg-int-orange/5'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className={`h-4 w-4 ${formData.type === type.value ? 'text-int-orange' : 'text-slate-500'}`} />
                      <span className="font-medium text-sm">{type.label}</span>
                    </div>
                    <p className="text-xs text-slate-500">{type.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Visibility */}
          <div>
            <Label>Visibility</Label>
            <RadioGroup
              value={formData.visibility}
              onValueChange={(value) => setFormData({ ...formData, visibility: value })}
              className="mt-2 space-y-2"
            >
              <div className="flex items-center space-x-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50">
                <RadioGroupItem value="public" id="public" />
                <Label htmlFor="public" className="flex items-center gap-2 cursor-pointer flex-1">
                  <Globe className="h-4 w-4 text-emerald-500" />
                  <div>
                    <p className="font-medium">Public</p>
                    <p className="text-xs text-slate-500">Anyone can find and join</p>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50">
                <RadioGroupItem value="private" id="private" />
                <Label htmlFor="private" className="flex items-center gap-2 cursor-pointer flex-1">
                  <Lock className="h-4 w-4 text-amber-500" />
                  <div>
                    <p className="font-medium">Private</p>
                    <p className="text-xs text-slate-500">Only invited members can access</p>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createMutation.isPending}
              className="flex-1 bg-int-orange hover:bg-int-orange/90"
            >
              {createMutation.isPending ? 'Creating...' : 'Create Channel'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}