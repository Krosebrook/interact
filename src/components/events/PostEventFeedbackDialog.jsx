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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Star, Smile, Meh, Frown, ThumbsUp, ThumbsDown } from 'lucide-react';
import { toast } from 'sonner';

export default function PostEventFeedbackDialog({ open, onOpenChange, event, userEmail }) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [engagementLevel, setEngagementLevel] = useState('');
  const [wouldRecommend, setWouldRecommend] = useState(null);
  const [favoriteAspect, setFavoriteAspect] = useState('');
  const [improvements, setImprovements] = useState('');
  const [facilitatorRating, setFacilitatorRating] = useState(0);
  const queryClient = useQueryClient();
  
  const submitFeedback = useMutation({
    mutationFn: async () => {
      const feedback = await base44.entities.PostEventFeedback.create({
        event_id: event.id,
        user_email: userEmail,
        rating,
        engagement_level: engagementLevel,
        would_recommend: wouldRecommend,
        favorite_aspect: favoriteAspect,
        improvement_suggestions: improvements,
        facilitator_rating: facilitatorRating,
        submitted_at: new Date().toISOString()
      });
      
      // Award feedback points
      await base44.functions.invoke('recordPointsTransaction', {
        user_email: userEmail,
        amount: 10,
        transaction_type: 'feedback_submitted',
        reference_type: 'PostEventFeedback',
        reference_id: feedback.id,
        description: `Feedback for event: ${event.title}`
      });
      
      return feedback;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['userPoints']);
      toast.success('Feedback submitted! +10 points earned 🎉');
      onOpenChange(false);
      resetForm();
    }
  });
  
  const resetForm = () => {
    setRating(0);
    setEngagementLevel('');
    setWouldRecommend(null);
    setFavoriteAspect('');
    setImprovements('');
    setFacilitatorRating(0);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Event Feedback</DialogTitle>
          <DialogDescription>
            Help us improve! Share your thoughts and earn 10 points.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Overall Rating */}
          <div>
            <Label>Overall Rating *</Label>
            <div className="flex gap-2 mt-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= (hoveredRating || rating)
                        ? 'fill-int-orange text-int-orange'
                        : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
          
          {/* Engagement Level */}
          <div>
            <Label>How engaged were you? *</Label>
            <div className="flex gap-3 mt-2">
              {[
                { value: 'low', label: 'Low', icon: Frown, color: 'red' },
                { value: 'medium', label: 'Medium', icon: Meh, color: 'yellow' },
                { value: 'high', label: 'High', icon: Smile, color: 'green' }
              ].map(level => {
                const Icon = level.icon;
                const isSelected = engagementLevel === level.value;
                return (
                  <button
                    key={level.value}
                    type="button"
                    onClick={() => setEngagementLevel(level.value)}
                    className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                      isSelected
                        ? `border-${level.color}-500 bg-${level.color}-50`
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <Icon className={`h-6 w-6 mx-auto mb-1 ${
                      isSelected ? `text-${level.color}-600` : 'text-slate-400'
                    }`} />
                    <p className="text-sm font-medium">{level.label}</p>
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Would Recommend */}
          <div>
            <Label>Would you recommend this event to colleagues? *</Label>
            <div className="flex gap-3 mt-2">
              <button
                type="button"
                onClick={() => setWouldRecommend(true)}
                className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                  wouldRecommend === true
                    ? 'border-green-500 bg-green-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <ThumbsUp className={`h-6 w-6 mx-auto mb-1 ${
                  wouldRecommend === true ? 'text-green-600' : 'text-slate-400'
                }`} />
                <p className="text-sm font-medium">Yes</p>
              </button>
              <button
                type="button"
                onClick={() => setWouldRecommend(false)}
                className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                  wouldRecommend === false
                    ? 'border-red-500 bg-red-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <ThumbsDown className={`h-6 w-6 mx-auto mb-1 ${
                  wouldRecommend === false ? 'text-red-600' : 'text-slate-400'
                }`} />
                <p className="text-sm font-medium">No</p>
              </button>
            </div>
          </div>
          
          {/* Favorite Aspect */}
          <div>
            <Label>What did you enjoy most?</Label>
            <Textarea
              value={favoriteAspect}
              onChange={(e) => setFavoriteAspect(e.target.value)}
              placeholder="The team collaboration, the energy, the topics covered..."
              rows={2}
            />
          </div>
          
          {/* Improvements */}
          <div>
            <Label>What could be better?</Label>
            <Textarea
              value={improvements}
              onChange={(e) => setImprovements(e.target.value)}
              placeholder="Timing, format, content, facilitation..."
              rows={2}
            />
          </div>
          
          {/* Facilitator Rating */}
          <div>
            <Label>Facilitator Rating</Label>
            <div className="flex gap-2 mt-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFacilitatorRating(star)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-6 w-6 ${
                      star <= facilitatorRating
                        ? 'fill-blue-500 text-blue-500'
                        : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
          
          <Button
            onClick={() => submitFeedback.mutate()}
            disabled={!rating || !engagementLevel || wouldRecommend === null || submitFeedback.isPending}
            className="w-full bg-int-orange hover:bg-int-orange-dark"
          >
            {submitFeedback.isPending ? 'Submitting...' : 'Submit Feedback (+10 pts)'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}