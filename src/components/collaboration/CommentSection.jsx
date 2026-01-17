import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useUserData } from '../hooks/useUserData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageSquare, Send, Smile, Trash2, Edit2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function CommentSection({ entityType, entityId, title = "Comments" }) {
  const { user } = useUserData();
  const queryClient = useQueryClient();
  const [comment, setComment] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState('');

  // Fetch comments
  const { data: comments = [] } = useQuery({
    queryKey: ['comments', entityType, entityId],
    queryFn: () => base44.entities.Comment.filter({ entity_type: entityType, entity_id: entityId }, '-created_date', 100),
    enabled: !!entityType && !!entityId
  });

  // Real-time subscription
  useEffect(() => {
    if (!entityType || !entityId) return;
    
    const unsubscribe = base44.entities.Comment.subscribe((event) => {
      if (event.data?.entity_type === entityType && event.data?.entity_id === entityId) {
        queryClient.invalidateQueries(['comments', entityType, entityId]);
      }
    });
    
    return unsubscribe;
  }, [entityType, entityId, queryClient]);

  // Add comment
  const addCommentMutation = useMutation({
    mutationFn: (data) => base44.entities.Comment.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['comments']);
      setComment('');
      toast.success('Comment added');
    }
  });

  // Update comment
  const updateCommentMutation = useMutation({
    mutationFn: ({ id, content }) => base44.entities.Comment.update(id, { 
      content, 
      edited: true, 
      edited_at: new Date().toISOString() 
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['comments']);
      setEditingId(null);
      toast.success('Comment updated');
    }
  });

  // Delete comment
  const deleteCommentMutation = useMutation({
    mutationFn: (id) => base44.entities.Comment.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['comments']);
      toast.success('Comment deleted');
    }
  });

  // React to comment
  const reactMutation = useMutation({
    mutationFn: ({ id, emoji, reactions }) => {
      const userReaction = reactions.find(r => r.user_email === user.email && r.emoji === emoji);
      const updatedReactions = userReaction
        ? reactions.filter(r => !(r.user_email === user.email && r.emoji === emoji))
        : [...reactions, { emoji, user_email: user.email }];
      
      return base44.entities.Comment.update(id, { reactions: updatedReactions });
    },
    onSuccess: () => queryClient.invalidateQueries(['comments'])
  });

  const handleAddComment = () => {
    if (!comment.trim()) return;

    addCommentMutation.mutate({
      entity_type: entityType,
      entity_id: entityId,
      author_email: user.email,
      author_name: user.full_name,
      content: comment.trim()
    });
  };

  const handleEdit = (commentObj) => {
    setEditingId(commentObj.id);
    setEditContent(commentObj.content);
  };

  const handleSaveEdit = (id) => {
    if (!editContent.trim()) return;
    updateCommentMutation.mutate({ id, content: editContent.trim() });
  };

  const quickReactions = ['👍', '❤️', '🎉', '💡', '👏'];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-purple-600" />
          {title} ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Comment */}
        <div className="flex gap-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-purple-100 text-purple-700 text-xs">
              {user?.full_name?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <Textarea
              placeholder="Add a comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={2}
              className="resize-none"
            />
            <Button 
              onClick={handleAddComment} 
              disabled={!comment.trim() || addCommentMutation.isPending}
              size="sm"
            >
              <Send className="h-4 w-4 mr-2" />
              Comment
            </Button>
          </div>
        </div>

        {/* Comments List */}
        <div className="space-y-4 max-h-96 overflow-auto">
          {comments.map((c) => (
            <div key={c.id} className="flex gap-3 p-3 bg-slate-50 rounded-lg">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-slate-200 text-slate-600 text-xs">
                  {c.author_name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-sm">{c.author_name}</p>
                    <p className="text-xs text-slate-500">
                      {format(new Date(c.created_date), 'MMM d, h:mm a')}
                      {c.edited && ' (edited)'}
                    </p>
                  </div>
                  {c.author_email === user?.email && (
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6"
                        onClick={() => handleEdit(c)}
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 text-red-600"
                        onClick={() => {
                          if (confirm('Delete this comment?')) {
                            deleteCommentMutation.mutate(c.id);
                          }
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>

                {editingId === c.id ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={2}
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleSaveEdit(c.id)}>Save</Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-slate-700">{c.content}</p>
                    
                    {/* Reactions */}
                    <div className="flex items-center gap-2">
                      {quickReactions.map(emoji => {
                        const count = c.reactions?.filter(r => r.emoji === emoji).length || 0;
                        const userReacted = c.reactions?.some(r => r.emoji === emoji && r.user_email === user.email);
                        
                        return (
                          <button
                            key={emoji}
                            onClick={() => reactMutation.mutate({ id: c.id, emoji, reactions: c.reactions || [] })}
                            className={`text-sm px-2 py-1 rounded-full transition-all ${
                              userReacted 
                                ? 'bg-purple-100 border border-purple-300' 
                                : 'bg-slate-100 hover:bg-slate-200'
                            }`}
                          >
                            {emoji} {count > 0 && count}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}