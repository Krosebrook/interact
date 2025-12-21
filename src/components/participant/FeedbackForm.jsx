import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useGamificationTrigger } from '../hooks/useGamificationTrigger';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star, Send } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function FeedbackForm({ event, participation, onClose, onSubmit }) {
  const [engagementScore, setEngagementScore] = useState(participation?.engagement_score || 0);
  const [feedback, setFeedback] = useState(participation?.feedback || '');
  const { trigger } = useGamificationTrigger();

  const submitFeedbackMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.Participation.update(participation.id, {
        engagement_score: engagementScore,
        feedback,
        attended: true
      });
    },
    onSuccess: async () => {
      toast.success('Thank you for your feedback! 🙏');
      
      // Trigger gamification rules
      await trigger('feedback_submitted', participation.user_email, {
        event_id: event.id,
        engagement_score: engagementScore,
        reference_id: participation.id
      });
      
      onSubmit();
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (engagementScore === 0) {
      toast.error('Please provide an engagement rating');
      return;
    }
    submitFeedbackMutation.mutate();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Share Your Experience</DialogTitle>
          <DialogDescription>
            Help us improve future events with your feedback
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
            <h3 className="font-semibold text-indigo-900">{event.title}</h3>
            <p className="text-sm text-indigo-700 mt-1">
              {new Date(event.scheduled_date).toLocaleDateString()}
            </p>
          </div>

          <div>
            <Label className="text-base font-semibold mb-3 block">
              How engaging was this event?
            </Label>
            <div className="flex gap-2 justify-center">
              {[1, 2, 3, 4, 5].map((score) => (
                <motion.button
                  key={score}
                  type="button"
                  onClick={() => setEngagementScore(score)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="focus:outline-none"
                >
                  <Star
                    className={`h-12 w-12 transition-all ${
                      score <= engagementScore
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-slate-300 hover:text-slate-400'
                    }`}
                  />
                </motion.button>
              ))}
            </div>
            <div className="flex justify-between text-sm text-slate-600 mt-2 px-2">
              <span>Not engaging</span>
              <span>Very engaging</span>
            </div>
          </div>

          <div>
            <Label className="text-base font-semibold mb-2 block">
              Share your thoughts (Optional)
            </Label>
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="What did you like? What could be improved? Any suggestions for future events?"
              rows={5}
              className="resize-none"
            />
            <p className="text-xs text-slate-500 mt-1">
              Your feedback helps us create better experiences for everyone
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitFeedbackMutation.isLoading}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700"
            >
              {submitFeedbackMutation.isLoading ? (
                'Submitting...'
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Feedback
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}