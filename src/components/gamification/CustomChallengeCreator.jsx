/**
 * Custom Challenge Creator
 * Users create personal challenges with custom goals
 */

import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Target, Zap, Calendar } from 'lucide-react';
import { toast } from 'sonner';

export default function CustomChallengeCreator({ open, onClose, userEmail }) {
  const [formData, setFormData] = useState({
    challenge_name: '',
    description: '',
    challenge_type: 'points',
    target_metric: {
      metric_type: 'total_points',
      target_value: 100,
      current_value: 0
    },
    difficulty: 'medium',
    is_public: false,
    self_reward: ''
  });

  const queryClient = useQueryClient();

  const createChallengeMutation = useMutation({
    mutationFn: async (data) => {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30); // Default 30 days

      return base44.entities.PersonalChallenge.create({
        ...data,
        created_by: userEmail,
        start_date: new Date().toISOString(),
        end_date: endDate.toISOString(),
        status: 'active'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['personal-challenges']);
      toast.success('Challenge created! 🎯');
      onClose();
      resetForm();
    }
  });

  const resetForm = () => {
    setFormData({
      challenge_name: '',
      description: '',
      challenge_type: 'points',
      target_metric: {
        metric_type: 'total_points',
        target_value: 100,
        current_value: 0
      },
      difficulty: 'medium',
      is_public: false,
      self_reward: ''
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createChallengeMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-int-orange" />
            Create Custom Challenge
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Challenge Name */}
          <div>
            <Label>Challenge Name</Label>
            <Input
              value={formData.challenge_name}
              onChange={(e) => setFormData({ ...formData, challenge_name: e.target.value })}
              placeholder="e.g., 'Master Networker'"
              required
            />
          </div>

          {/* Description */}
          <div>
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What will you accomplish?"
              rows={3}
            />
          </div>

          {/* Challenge Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Challenge Type</Label>
              <Select
                value={formData.challenge_type}
                onValueChange={(value) => {
                  const metricMap = {
                    points: 'total_points',
                    events: 'events_attended',
                    recognition: 'recognitions_given',
                    learning: 'custom_count',
                    wellness: 'custom_count'
                  };
                  setFormData({
                    ...formData,
                    challenge_type: value,
                    target_metric: {
                      ...formData.target_metric,
                      metric_type: metricMap[value]
                    }
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="points">Points Goal</SelectItem>
                  <SelectItem value="events">Event Attendance</SelectItem>
                  <SelectItem value="recognition">Give Recognition</SelectItem>
                  <SelectItem value="learning">Learning Goal</SelectItem>
                  <SelectItem value="wellness">Wellness Goal</SelectItem>
                  <SelectItem value="custom">Custom Metric</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Difficulty</Label>
              <Select
                value={formData.difficulty}
                onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">🟢 Easy</SelectItem>
                  <SelectItem value="medium">🟡 Medium</SelectItem>
                  <SelectItem value="hard">🟠 Hard</SelectItem>
                  <SelectItem value="extreme">🔴 Extreme</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Target Value */}
          <div>
            <Label>Target Goal</Label>
            <Input
              type="number"
              value={formData.target_metric.target_value}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  target_metric: {
                    ...formData.target_metric,
                    target_value: parseInt(e.target.value)
                  }
                })
              }
              placeholder="e.g., 500 points"
              min={1}
              required
            />
            <p className="text-xs text-slate-600 mt-1">
              {formData.challenge_type === 'points' && 'Total points to earn'}
              {formData.challenge_type === 'events' && 'Number of events to attend'}
              {formData.challenge_type === 'recognition' && 'Recognitions to give'}
              {formData.challenge_type === 'learning' && 'Learning modules to complete'}
              {formData.challenge_type === 'wellness' && 'Wellness activities to do'}
            </p>
          </div>

          {/* Self Reward */}
          <div>
            <Label>Personal Reward (Optional)</Label>
            <Input
              value={formData.self_reward}
              onChange={(e) => setFormData({ ...formData, self_reward: e.target.value })}
              placeholder="e.g., 'Treat myself to coffee' or 'Take Friday afternoon off'"
            />
            <p className="text-xs text-slate-600 mt-1">Set a personal treat for completing this challenge</p>
          </div>

          {/* Public/Private */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.is_public}
              onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
              className="h-4 w-4 rounded border-slate-300"
            />
            <Label className="font-normal">
              Make this challenge public (teammates can see and join)
            </Label>
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createChallengeMutation.isPending}
              className="gap-2 bg-int-orange hover:bg-int-orange/90"
            >
              <Zap className="h-4 w-4" />
              Create Challenge
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}