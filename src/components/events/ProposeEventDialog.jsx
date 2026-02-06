import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Lightbulb, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function ProposeEventDialog({ open, onOpenChange, user }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [activityType, setActivityType] = useState('');
  const [suggestedDate, setSuggestedDate] = useState('');
  const [duration, setDuration] = useState(60);
  const [isVirtual, setIsVirtual] = useState(true);
  const [location, setLocation] = useState('');
  const queryClient = useQueryClient();
  
  const [aiGenerating, setAiGenerating] = useState(false);
  
  const generateDescription = async () => {
    if (!title || !activityType) {
      toast.error('Please enter title and activity type first');
      return;
    }
    
    setAiGenerating(true);
    try {
      const response = await base44.functions.invoke('generateEventDescription', {
        title,
        activityType,
        duration
      });
      
      setDescription(response.data.description);
      toast.success('AI description generated!');
    } catch (error) {
      toast.error('Failed to generate description');
    } finally {
      setAiGenerating(false);
    }
  };
  
  const proposeMutation = useMutation({
    mutationFn: async () => {
      return base44.entities.EventProposal.create({
        proposed_by: user.email,
        proposer_name: user.full_name,
        title,
        description,
        activity_type: activityType,
        suggested_date: suggestedDate,
        duration_minutes: duration,
        is_virtual: isVirtual,
        location: isVirtual ? null : location,
        status: 'pending',
        upvote_count: 0,
        upvotes: []
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['eventProposals']);
      toast.success('Event proposed! Awaiting admin approval.');
      onOpenChange(false);
      resetForm();
    }
  });
  
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setActivityType('');
    setSuggestedDate('');
    setDuration(60);
    setIsVirtual(true);
    setLocation('');
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-int-orange" />
            Propose an Event
          </DialogTitle>
          <DialogDescription>
            Share your event idea with the team. Admins will review and schedule if approved.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label>Event Title *</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Virtual Coffee Chat"
            />
          </div>
          
          <div>
            <Label>Activity Type *</Label>
            <Select value={activityType} onValueChange={setActivityType}>
              <SelectTrigger>
                <SelectValue placeholder="Select type..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="icebreaker">🧊 Icebreaker</SelectItem>
                <SelectItem value="creative">🎨 Creative</SelectItem>
                <SelectItem value="competitive">🏆 Competitive</SelectItem>
                <SelectItem value="wellness">💪 Wellness</SelectItem>
                <SelectItem value="learning">📚 Learning</SelectItem>
                <SelectItem value="social">🎉 Social</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Description</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={generateDescription}
                disabled={aiGenerating}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {aiGenerating ? 'Generating...' : 'AI Generate'}
              </Button>
            </div>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what participants can expect..."
              rows={4}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Suggested Date & Time</Label>
              <Input
                type="datetime-local"
                value={suggestedDate}
                onChange={(e) => setSuggestedDate(e.target.value)}
              />
            </div>
            <div>
              <Label>Duration (minutes)</Label>
              <Input
                type="number"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                min={15}
                max={240}
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Checkbox
              checked={isVirtual}
              onCheckedChange={setIsVirtual}
              id="virtual"
            />
            <Label htmlFor="virtual">Virtual Event</Label>
          </div>
          
          {!isVirtual && (
            <div>
              <Label>Location</Label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Conference Room A, Downtown Office..."
              />
            </div>
          )}
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-900">
              💡 <strong>Tip:</strong> Popular proposals get upvoted by colleagues and are more likely to be scheduled!
            </p>
          </div>
          
          <Button
            onClick={() => proposeMutation.mutate()}
            disabled={!title || !activityType || proposeMutation.isPending}
            className="w-full bg-int-orange hover:bg-int-orange-dark"
          >
            {proposeMutation.isPending ? 'Proposing...' : 'Propose Event'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}