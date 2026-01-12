import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const AVATAR_OPTIONS = ['🚀', '⚡', '🔥', '💎', '🌟', '🎯', '🏆', '👑', '🦁', '🐉'];

export default function CreateTeamDialog({ 
  open, 
  onOpenChange, 
  onSubmit, 
  isSubmitting 
}) {
  const [formData, setFormData] = useState({
    team_name: '',
    description: '',
    team_avatar: '🚀'
  });

  const handleSubmit = () => {
    if (formData.team_name) {
      onSubmit(formData);
    }
  };

  const handleClose = () => {
    setFormData({ team_name: '', description: '', team_avatar: '🚀' });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} data-b44-sync="true" data-feature="teams" data-component="createteamdialog">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Team</DialogTitle>
          <DialogDescription>Start your own team and invite members</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label>Team Avatar</Label>
            <div className="grid grid-cols-5 gap-2 mt-2">
              {AVATAR_OPTIONS.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => setFormData(prev => ({ ...prev, team_avatar: emoji }))}
                  className={`text-3xl p-2 rounded-lg border-2 hover:border-int-orange transition-all ${
                    formData.team_avatar === emoji ? 'border-int-orange bg-orange-50' : 'border-slate-200'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label>Team Name</Label>
            <Input
              value={formData.team_name}
              onChange={(e) => setFormData(prev => ({ ...prev, team_name: e.target.value }))}
              placeholder="Enter team name..."
            />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="What's your team about?"
              rows={3}
            />
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleClose} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!formData.team_name || isSubmitting}
            className="flex-1 bg-int-orange hover:bg-[#C46322] text-white"
          >
            Create Team
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}