import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

export default function CreateChallengeDialog({ open, onOpenChange }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    challenge_type: 'skill',
    skill_category: 'technical',
    difficulty: 'intermediate',
    target_metric: {
      metric_name: '',
      target_value: 100,
      unit: 'points'
    },
    points_reward: 500,
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    requirements: []
  });

  const [requirementInput, setRequirementInput] = useState('');

  const createMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.Challenge.create({
        ...data,
        start_date: new Date(data.start_date).toISOString(),
        end_date: new Date(data.end_date).toISOString(),
        status: 'active'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['challenges']);
      onOpenChange(false);
      resetForm();
      toast.success('Challenge created!');
    },
    onError: () => toast.error('Failed to create challenge')
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      challenge_type: 'skill',
      skill_category: 'technical',
      difficulty: 'intermediate',
      target_metric: {
        metric_name: '',
        target_value: 100,
        unit: 'points'
      },
      points_reward: 500,
      start_date: new Date().toISOString().split('T')[0],
      end_date: '',
      requirements: []
    });
    setRequirementInput('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const addRequirement = () => {
    if (requirementInput.trim()) {
      setFormData({
        ...formData,
        requirements: [...formData.requirements, requirementInput.trim()]
      });
      setRequirementInput('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Challenge</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="e.g., Master React Hooks"
              required
            />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="What will participants learn or achieve?"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Challenge Type</Label>
              <Select 
                value={formData.challenge_type} 
                onValueChange={(value) => setFormData({...formData, challenge_type: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="skill">Skill-Based</SelectItem>
                  <SelectItem value="activity">Activity</SelectItem>
                  <SelectItem value="learning">Learning</SelectItem>
                  <SelectItem value="wellness">Wellness</SelectItem>
                  <SelectItem value="social">Social</SelectItem>
                  <SelectItem value="contribution">Contribution</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Skill Category</Label>
              <Select 
                value={formData.skill_category} 
                onValueChange={(value) => setFormData({...formData, skill_category: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="leadership">Leadership</SelectItem>
                  <SelectItem value="communication">Communication</SelectItem>
                  <SelectItem value="creativity">Creativity</SelectItem>
                  <SelectItem value="problem_solving">Problem Solving</SelectItem>
                  <SelectItem value="collaboration">Collaboration</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Difficulty</Label>
              <Select 
                value={formData.difficulty} 
                onValueChange={(value) => setFormData({...formData, difficulty: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Target Value</Label>
              <Input
                type="number"
                value={formData.target_metric.target_value}
                onChange={(e) => setFormData({
                  ...formData,
                  target_metric: {...formData.target_metric, target_value: parseInt(e.target.value)}
                })}
                min="1"
              />
            </div>

            <div>
              <Label>Points Reward</Label>
              <Input
                type="number"
                value={formData.points_reward}
                onChange={(e) => setFormData({...formData, points_reward: parseInt(e.target.value)})}
                min="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Start Date</Label>
              <Input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                required
              />
            </div>

            <div>
              <Label>End Date</Label>
              <Input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                min={formData.start_date}
                required
              />
            </div>
          </div>

          <div>
            <Label>Requirements (optional)</Label>
            <div className="flex gap-2">
              <Input
                value={requirementInput}
                onChange={(e) => setRequirementInput(e.target.value)}
                placeholder="Add a requirement..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
              />
              <Button type="button" onClick={addRequirement} variant="outline">
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.requirements.map((req, idx) => (
                <Badge key={idx} variant="secondary">
                  {req}
                  <button
                    type="button"
                    onClick={() => setFormData({
                      ...formData,
                      requirements: formData.requirements.filter((_, i) => i !== idx)
                    })}
                    className="ml-1 text-slate-500 hover:text-slate-700"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-int-orange hover:bg-[#C46322]"
              disabled={createMutation.isPending}
            >
              Create Challenge
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}