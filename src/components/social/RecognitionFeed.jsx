import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, Award, Send, Loader2, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

export default function RecognitionFeed({ userEmail }) {
  const queryClient = useQueryClient();
  const [expandedComments, setExpandedComments] = useState(new Set());
  const [commentText, setCommentText] = useState({});

  const { data: recognitions = [], isLoading } = useQuery({
    queryKey: ['recognition-feed'],
    queryFn: async () => {
      const data = await base44.entities.Recognition.filter({
        status: 'approved',
        visibility: { $in: ['public', 'team_only'] }
      }, '-created_date', 50);
      return data;
    }
  });

  const { data: comments = [] } = useQuery({
    queryKey: ['recognition-comments'],
    queryFn: async () => {
      return await base44.entities.RecognitionComment.list();
    }
  });

  const toggleReactionMutation = useMutation({
    mutationFn: async ({ recognitionId, emoji }) => {
      const recognition = recognitions.find(r => r.id === recognitionId);
      const reactions = recognition.reactions || [];
      const existingIndex = reactions.findIndex(r => 
        r.emoji === emoji && r.user_email === userEmail
      );

      let updatedReactions;
      if (existingIndex >= 0) {
        updatedReactions = reactions.filter((_, i) => i !== existingIndex);
      } else {
        updatedReactions = [...reactions, { emoji, user_email: userEmail }];
      }

      await base44.entities.Recognition.update(recognitionId, {
        reactions: updatedReactions
      });

      return { recognitionId, reactions: updatedReactions };
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['recognition-feed']);
    }
  });

  const addCommentMutation = useMutation({
    mutationFn: async ({ recognitionId, content }) => {
      const user = await base44.auth.me();
      await base44.entities.RecognitionComment.create({
        recognition_id: recognitionId,
        author_email: user.email,
        author_name: user.full_name,
        content
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['recognition-comments']);
      setCommentText({ ...commentText, [variables.recognitionId]: '' });
      toast.success('Comment added!');
    }
  });

  const toggleComments = (recognitionId) => {
    const newSet = new Set(expandedComments);
    if (newSet.has(recognitionId)) {
      newSet.delete(recognitionId);
    } else {
      newSet.add(recognitionId);
    }
    setExpandedComments(newSet);
  };

  const handleAddComment = (recognitionId) => {
    const content = commentText[recognitionId]?.trim();
    if (!content) return;
    addCommentMutation.mutate({ recognitionId, content });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {recognitions.map(recognition => {
        const recognitionComments = comments.filter(c => 
          c.recognition_id === recognition.id && !c.is_deleted
        );
        const reactionCounts = {};
        (recognition.reactions || []).forEach(r => {
          reactionCounts[r.emoji] = (reactionCounts[r.emoji] || 0) + 1;
        });
        const userReactions = new Set(
          (recognition.reactions || [])
            .filter(r => r.user_email === userEmail)
            .map(r => r.emoji)
        );

        return (
          <Card key={recognition.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-600 text-white">
                    {recognition.sender_name?.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-slate-900">
                      {recognition.sender_name}
                    </span>
                    <span className="text-slate-500 text-sm">recognized</span>
                    <span className="font-semibold text-slate-900">
                      {recognition.recipient_name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Badge className="bg-purple-100 text-purple-800 text-xs">
                      {recognition.category}
                    </Badge>
                    <span>•</span>
                    <span>{new Date(recognition.created_date).toLocaleDateString()}</span>
                  </div>
                </div>
                {recognition.points_awarded > 0 && (
                  <div className="flex items-center gap-1 bg-amber-100 text-amber-800 px-3 py-1 rounded-full">
                    <Award className="h-4 w-4" />
                    <span className="font-semibold">+{recognition.points_awarded}</span>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-slate-700 leading-relaxed">{recognition.message}</p>

              {/* Reactions */}
              <div className="flex items-center gap-2 flex-wrap border-t pt-3">
                {['❤️', '👏', '🎉', '🔥', '💯'].map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => toggleReactionMutation.mutate({ 
                      recognitionId: recognition.id, 
                      emoji 
                    })}
                    className={`px-3 py-1.5 rounded-full border transition-all ${
                      userReactions.has(emoji)
                        ? 'bg-purple-100 border-purple-300 scale-110'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-lg">{emoji}</span>
                    {reactionCounts[emoji] > 0 && (
                      <span className="ml-1 text-xs font-medium text-slate-700">
                        {reactionCounts[emoji]}
                      </span>
                    )}
                  </button>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleComments(recognition.id)}
                  className="ml-auto"
                >
                  <MessageCircle className="h-4 w-4 mr-1" />
                  {recognitionComments.length}
                </Button>
              </div>

              {/* Comments Section */}
              {expandedComments.has(recognition.id) && (
                <div className="space-y-3 border-t pt-3">
                  {recognitionComments.map(comment => (
                    <div key={comment.id} className="flex gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-slate-200 text-slate-600 text-xs">
                          {comment.author_name?.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 bg-slate-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm text-slate-900">
                            {comment.author_name}
                          </span>
                          <span className="text-xs text-slate-500">
                            {new Date(comment.created_date).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm text-slate-700">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a comment..."
                      value={commentText[recognition.id] || ''}
                      onChange={(e) => setCommentText({
                        ...commentText,
                        [recognition.id]: e.target.value
                      })}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') handleAddComment(recognition.id);
                      }}
                    />
                    <Button
                      size="icon"
                      onClick={() => handleAddComment(recognition.id)}
                      disabled={!commentText[recognition.id]?.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}