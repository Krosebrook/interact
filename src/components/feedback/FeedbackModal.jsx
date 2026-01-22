import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { MessageSquare } from 'lucide-react';
import StarRating from './StarRating';

export default function FeedbackModal({ isOpen, onClose, pageName }) {
  const [rating, setRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    setIsSubmitting(true);
    try {
      const user = await base44.auth.me();
      
      await base44.entities.UserFeedback.create({
        user_email: user.email,
        page_name: pageName,
        rating,
        feedback_text: feedbackText || '',
        status: 'new'
      });

      toast.success('Thank you for your feedback!');
      setRating(0);
      setFeedbackText('');
      onClose();
    } catch (error) {
      toast.error('Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[var(--orb-accent)]" />
            Share Your Feedback
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-sm font-medium mb-2 block">
              How would you rate this page?
            </Label>
            <StarRating value={rating} onChange={setRating} size="lg" />
          </div>

          <div>
            <Label htmlFor="feedback" className="text-sm font-medium mb-2 block">
              Tell us more (optional)
            </Label>
            <Textarea
              id="feedback"
              placeholder="What did you like? What could be improved?"
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || rating === 0}
              className="bg-[var(--orb-accent)] hover:bg-[var(--orb-accent)]/90"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}