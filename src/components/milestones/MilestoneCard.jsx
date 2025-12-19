import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Calendar, Heart, MessageCircle, Send, Cake, Trophy, Star, PartyPopper } from 'lucide-react';
import { format } from 'date-fns';

const MILESTONE_ICONS = {
  birthday: Cake,
  work_anniversary: Trophy,
  first_day: Star,
  achievement: PartyPopper,
  custom: Calendar
};

const MILESTONE_COLORS = {
  birthday: 'from-pink-500 to-rose-500',
  work_anniversary: 'from-amber-500 to-orange-500',
  first_day: 'from-blue-500 to-indigo-500',
  achievement: 'from-purple-500 to-pink-500',
  custom: 'from-slate-500 to-gray-500'
};

/**
 * MilestoneCard - Display and interact with employee milestones
 */
export default function MilestoneCard({ milestone, currentUserEmail, compact = false }) {
  const queryClient = useQueryClient();
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [comment, setComment] = useState('');

  const Icon = MILESTONE_ICONS[milestone.milestone_type] || Calendar;
  const colorClass = MILESTONE_COLORS[milestone.milestone_type] || MILESTONE_COLORS.custom;

  // React mutation
  const reactMutation = useMutation({
    mutationFn: async (emoji) => {
      const reactions = [...(milestone.reactions || [])];
      const existingIdx = reactions.findIndex(r => r.user_email === currentUserEmail);

      if (existingIdx >= 0) {
        if (reactions[existingIdx].emoji === emoji) {
          reactions.splice(existingIdx, 1); // Remove
        } else {
          reactions[existingIdx].emoji = emoji; // Change
        }
      } else {
        reactions.push({
          user_email: currentUserEmail,
          emoji,
          timestamp: new Date().toISOString()
        });
      }

      return base44.entities.Milestone.update(milestone.id, { reactions });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['milestones']);
    }
  });

  // Comment mutation
  const commentMutation = useMutation({
    mutationFn: async () => {
      const comments = [...(milestone.comments || [])];
      comments.push({
        user_email: currentUserEmail,
        message: comment,
        timestamp: new Date().toISOString()
      });

      return base44.entities.Milestone.update(milestone.id, { comments });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['milestones']);
      setComment('');
      setShowCommentBox(false);
      toast.success('Comment added!');
    }
  });

  const reactionEmojis = ['🎉', '❤️', '👏', '🎊', '🙌', '🎈'];
  const reactionCounts = (milestone.reactions || []).reduce((acc, r) => {
    acc[r.emoji] = (acc[r.emoji] || 0) + 1;
    return acc;
  }, {});

  const userReaction = milestone.reactions?.find(r => r.user_email === currentUserEmail)?.emoji;

  if (compact) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-lg bg-white border hover:shadow-sm transition-shadow">
        <div className={`p-2 rounded-lg bg-gradient-to-br ${colorClass}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{milestone.title}</p>
          <p className="text-xs text-slate-500">{format(new Date(milestone.milestone_date), 'MMM d, yyyy')}</p>
        </div>
        {milestone.milestone_year && (
          <Badge className="bg-amber-100 text-amber-700 whitespace-nowrap">
            {milestone.milestone_year} {milestone.milestone_year === 1 ? 'year' : 'years'}
          </Badge>
        )}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <Card className="overflow-hidden">
        {/* Header Banner */}
        <div className={`h-24 bg-gradient-to-br ${colorClass} relative`}>
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute bottom-4 left-4 flex items-center gap-3">
            <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
              <Icon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">{milestone.title}</h3>
              {milestone.milestone_year && (
                <p className="text-white/90 text-sm">
                  {milestone.milestone_year} {milestone.milestone_year === 1 ? 'Year' : 'Years'}!
                </p>
              )}
            </div>
          </div>
        </div>

        <CardContent className="p-4 space-y-4">
          {/* Date and Description */}
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
              <Calendar className="h-4 w-4" />
              {format(new Date(milestone.milestone_date), 'MMMM d, yyyy')}
            </div>
            {milestone.description && (
              <p className="text-slate-700">{milestone.description}</p>
            )}
            {milestone.celebration_message && (
              <p className="text-slate-600 italic mt-2">{milestone.celebration_message}</p>
            )}
          </div>

          {/* Reactions */}
          <div className="flex flex-wrap gap-2">
            {reactionEmojis.map(emoji => {
              const count = reactionCounts[emoji] || 0;
              const isSelected = userReaction === emoji;
              
              return (
                <button
                  key={emoji}
                  onClick={() => reactMutation.mutate(emoji)}
                  className={`px-3 py-1 rounded-full border transition-all ${
                    isSelected
                      ? 'border-int-orange bg-orange-50 scale-110'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-lg">{emoji}</span>
                  {count > 0 && <span className="text-xs ml-1 text-slate-600">{count}</span>}
                </button>
              );
            })}
          </div>

          {/* Comments */}
          {milestone.comments && milestone.comments.length > 0 && (
            <div className="border-t pt-3 space-y-2">
              <p className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                Comments ({milestone.comments.length})
              </p>
              {milestone.comments.slice(-3).map((c, idx) => (
                <div key={idx} className="bg-slate-50 rounded-lg p-2">
                  <p className="text-xs text-slate-600 mb-1">{c.user_name || c.user_email}</p>
                  <p className="text-sm text-slate-800">{c.message}</p>
                </div>
              ))}
            </div>
          )}

          {/* Add Comment */}
          {showCommentBox ? (
            <div className="space-y-2">
              <Textarea
                placeholder="Add a congratulatory message..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={2}
                className="resize-none"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => commentMutation.mutate()}
                  disabled={!comment.trim() || commentMutation.isLoading}
                  className="bg-int-orange hover:bg-int-orange/90"
                >
                  <Send className="h-3 w-3 mr-1" />
                  Send
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowCommentBox(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCommentBox(true)}
              className="w-full"
            >
              <Heart className="h-4 w-4 mr-2" />
              Add Congratulations
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}