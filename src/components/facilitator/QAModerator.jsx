import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageCircle, 
  HelpCircle, 
  Pin, 
  CheckCircle2, 
  Trash2,
  ThumbsUp,
  Send,
  Megaphone,
  Filter
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function QAModerator({ eventId, userName, userEmail }) {
  const queryClient = useQueryClient();
  const [newAnnouncement, setNewAnnouncement] = useState('');
  const [filter, setFilter] = useState('all'); // all, questions, unanswered, pinned

  const { data: messages = [] } = useQuery({
    queryKey: ['event-messages', eventId],
    queryFn: () => base44.entities.EventMessage.filter({ event_id: eventId }),
    refetchInterval: 3000,
    enabled: !!eventId
  });

  const sendMessageMutation = useMutation({
    mutationFn: (data) => base44.entities.EventMessage.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['event-messages', eventId]);
      setNewAnnouncement('');
      toast.success('Announcement sent!');
    }
  });

  const updateMessageMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.EventMessage.update(id, data),
    onSuccess: () => queryClient.invalidateQueries(['event-messages', eventId])
  });

  const deleteMessageMutation = useMutation({
    mutationFn: (id) => base44.entities.EventMessage.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['event-messages', eventId]);
      toast.success('Message deleted');
    }
  });

  const sendAnnouncement = () => {
    if (!newAnnouncement.trim()) return;
    sendMessageMutation.mutate({
      event_id: eventId,
      sender_email: userEmail,
      sender_name: userName,
      message: newAnnouncement,
      message_type: 'announcement',
      is_pinned: true
    });
  };

  const togglePin = (msg) => {
    updateMessageMutation.mutate({ id: msg.id, data: { is_pinned: !msg.is_pinned } });
    toast.success(msg.is_pinned ? 'Unpinned' : 'Pinned');
  };

  const markAnswered = (msg) => {
    updateMessageMutation.mutate({ id: msg.id, data: { is_answered: !msg.is_answered } });
    toast.success(msg.is_answered ? 'Unmarked' : 'Marked as answered');
  };

  const deleteMessage = (msg) => {
    deleteMessageMutation.mutate(msg.id);
  };

  // Filter messages
  let filteredMessages = [...messages];
  if (filter === 'questions') {
    filteredMessages = messages.filter(m => m.message_type === 'question');
  } else if (filter === 'unanswered') {
    filteredMessages = messages.filter(m => m.message_type === 'question' && !m.is_answered);
  } else if (filter === 'pinned') {
    filteredMessages = messages.filter(m => m.is_pinned);
  }

  // Sort by date, pinned first
  filteredMessages.sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;
    return new Date(b.created_date) - new Date(a.created_date);
  });

  const questions = messages.filter(m => m.message_type === 'question');
  const unansweredCount = questions.filter(q => !q.is_answered).length;

  return (
    <Card className="border-0 shadow-lg h-full flex flex-col" data-b44-sync="true" data-feature="facilitator" data-component="qamoderator">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-purple-600" />
            Q&A Moderator
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{messages.length} messages</Badge>
            {unansweredCount > 0 && (
              <Badge className="bg-red-100 text-red-700">{unansweredCount} unanswered</Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        {/* Quick Announcement */}
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm font-medium text-blue-800 mb-2 flex items-center gap-1">
            <Megaphone className="h-4 w-4" /> Send Announcement
          </p>
          <div className="flex gap-2">
            <Input
              value={newAnnouncement}
              onChange={(e) => setNewAnnouncement(e.target.value)}
              placeholder="Type announcement..."
              onKeyDown={(e) => e.key === 'Enter' && sendAnnouncement()}
            />
            <Button onClick={sendAnnouncement} disabled={sendMessageMutation.isLoading}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-4">
          {[
            { value: 'all', label: 'All' },
            { value: 'questions', label: 'Questions' },
            { value: 'unanswered', label: 'Unanswered' },
            { value: 'pinned', label: 'Pinned' }
          ].map(f => (
            <Button
              key={f.value}
              variant={filter === f.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(f.value)}
            >
              {f.label}
            </Button>
          ))}
        </div>

        {/* Messages List */}
        <ScrollArea className="flex-1">
          <div className="space-y-3">
            {filteredMessages.length === 0 ? (
              <p className="text-center text-slate-500 py-8">No messages to display</p>
            ) : (
              filteredMessages.map(msg => (
                <div 
                  key={msg.id}
                  className={`p-3 rounded-lg border ${
                    msg.is_pinned ? 'bg-yellow-50 border-yellow-200' :
                    msg.message_type === 'announcement' ? 'bg-blue-50 border-blue-200' :
                    msg.message_type === 'question' && !msg.is_answered ? 'bg-purple-50 border-purple-200' :
                    'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{msg.sender_name}</span>
                        {msg.message_type === 'question' && (
                          <Badge variant="outline" className="text-xs bg-purple-100 text-purple-700">
                            <HelpCircle className="h-3 w-3 mr-1" /> Question
                          </Badge>
                        )}
                        {msg.message_type === 'announcement' && (
                          <Badge className="text-xs bg-blue-100 text-blue-700">
                            <Megaphone className="h-3 w-3 mr-1" /> Announcement
                          </Badge>
                        )}
                        {msg.is_answered && (
                          <Badge className="text-xs bg-green-100 text-green-700">
                            <CheckCircle2 className="h-3 w-3 mr-1" /> Answered
                          </Badge>
                        )}
                        {msg.is_pinned && (
                          <Pin className="h-3 w-3 text-yellow-600 fill-yellow-600" />
                        )}
                        <span className="text-xs text-slate-400">
                          {format(new Date(msg.created_date), 'h:mm a')}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700">{msg.message}</p>
                      {msg.upvotes?.length > 0 && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
                          <ThumbsUp className="h-3 w-3" /> {msg.upvotes.length}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => togglePin(msg)}
                        title={msg.is_pinned ? 'Unpin' : 'Pin'}
                      >
                        <Pin className={`h-3.5 w-3.5 ${msg.is_pinned ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                      </Button>
                      {msg.message_type === 'question' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => markAnswered(msg)}
                          title={msg.is_answered ? 'Unmark answered' : 'Mark as answered'}
                        >
                          <CheckCircle2 className={`h-3.5 w-3.5 ${msg.is_answered ? 'text-green-500' : ''}`} />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-red-500 hover:text-red-700"
                        onClick={() => deleteMessage(msg)}
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}