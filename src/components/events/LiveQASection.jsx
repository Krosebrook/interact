import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageCircle, 
  HelpCircle, 
  Send, 
  ThumbsUp, 
  Pin, 
  CheckCircle2,
  Megaphone
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function LiveQASection({ eventId, userEmail, userName, isHost }) {
  const queryClient = useQueryClient();
  const [newMessage, setNewMessage] = useState('');
  const [messageType, setMessageType] = useState('chat');

  const { data: messages = [] } = useQuery({
    queryKey: ['event-messages', eventId],
    queryFn: () => base44.entities.EventMessage.filter({ event_id: eventId }),
    refetchInterval: 3000 // Poll every 3 seconds for live updates
  });

  const sendMessageMutation = useMutation({
    mutationFn: (data) => base44.entities.EventMessage.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['event-messages', eventId]);
      setNewMessage('');
    }
  });

  const updateMessageMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.EventMessage.update(id, data),
    onSuccess: () => queryClient.invalidateQueries(['event-messages', eventId])
  });

  const handleSend = () => {
    if (!newMessage.trim()) return;
    sendMessageMutation.mutate({
      event_id: eventId,
      sender_email: userEmail,
      sender_name: userName,
      message: newMessage,
      message_type: messageType
    });
  };

  const handleUpvote = (msg) => {
    const upvotes = msg.upvotes || [];
    const newUpvotes = upvotes.includes(userEmail)
      ? upvotes.filter(e => e !== userEmail)
      : [...upvotes, userEmail];
    updateMessageMutation.mutate({ id: msg.id, data: { upvotes: newUpvotes } });
  };

  const handlePin = (msg) => {
    updateMessageMutation.mutate({ id: msg.id, data: { is_pinned: !msg.is_pinned } });
  };

  const handleMarkAnswered = (msg) => {
    updateMessageMutation.mutate({ id: msg.id, data: { is_answered: !msg.is_answered } });
    toast.success(msg.is_answered ? 'Unmarked as answered' : 'Marked as answered');
  };

  const chatMessages = messages.filter(m => m.message_type === 'chat' || m.message_type === 'announcement');
  const questions = messages.filter(m => m.message_type === 'question');
  const pinnedMessages = messages.filter(m => m.is_pinned);

  const MessageItem = ({ msg, showActions = true }) => (
    <div className={`p-3 rounded-lg ${msg.is_pinned ? 'bg-yellow-50 border border-yellow-200' : 'bg-slate-50'} ${msg.message_type === 'announcement' ? 'bg-blue-50 border border-blue-200' : ''}`} data-b44-sync="true" data-feature="events" data-component="liveqasection">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm">{msg.sender_name}</span>
            {msg.message_type === 'question' && (
              <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700">Question</Badge>
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
            <span className="text-xs text-slate-400">
              {format(new Date(msg.created_date), 'h:mm a')}
            </span>
          </div>
          <p className="text-sm text-slate-700">{msg.message}</p>
        </div>
        
        {showActions && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => handleUpvote(msg)}
            >
              <ThumbsUp className={`h-3.5 w-3.5 ${msg.upvotes?.includes(userEmail) ? 'fill-blue-500 text-blue-500' : ''}`} />
            </Button>
            <span className="text-xs text-slate-500">{msg.upvotes?.length || 0}</span>
            
            {isHost && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => handlePin(msg)}
                >
                  <Pin className={`h-3.5 w-3.5 ${msg.is_pinned ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                </Button>
                {msg.message_type === 'question' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => handleMarkAnswered(msg)}
                  >
                    <CheckCircle2 className={`h-3.5 w-3.5 ${msg.is_answered ? 'text-green-500' : ''}`} />
                  </Button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <Card className="h-full flex flex-col">
      <Tabs defaultValue="chat" className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-2 m-2">
          <TabsTrigger value="chat" className="text-xs">
            <MessageCircle className="h-3.5 w-3.5 mr-1" /> Chat
          </TabsTrigger>
          <TabsTrigger value="questions" className="text-xs">
            <HelpCircle className="h-3.5 w-3.5 mr-1" /> Q&A ({questions.filter(q => !q.is_answered).length})
          </TabsTrigger>
        </TabsList>

        {/* Pinned Messages */}
        {pinnedMessages.length > 0 && (
          <div className="px-3 py-2 border-b bg-yellow-50/50">
            <p className="text-xs font-medium text-yellow-700 mb-2 flex items-center gap-1">
              <Pin className="h-3 w-3" /> Pinned
            </p>
            <div className="space-y-2">
              {pinnedMessages.slice(0, 2).map(msg => (
                <MessageItem key={msg.id} msg={msg} showActions={false} />
              ))}
            </div>
          </div>
        )}

        <TabsContent value="chat" className="flex-1 flex flex-col m-0 p-0">
          <ScrollArea className="flex-1 p-3">
            <div className="space-y-2">
              {chatMessages.length === 0 ? (
                <p className="text-center text-sm text-slate-400 py-8">No messages yet. Start the conversation!</p>
              ) : (
                chatMessages.map(msg => <MessageItem key={msg.id} msg={msg} />)
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="questions" className="flex-1 flex flex-col m-0 p-0">
          <ScrollArea className="flex-1 p-3">
            <div className="space-y-2">
              {questions.length === 0 ? (
                <p className="text-center text-sm text-slate-400 py-8">No questions yet. Ask something!</p>
              ) : (
                questions
                  .sort((a, b) => (b.upvotes?.length || 0) - (a.upvotes?.length || 0))
                  .map(msg => <MessageItem key={msg.id} msg={msg} />)
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {/* Message Input */}
      <div className="p-3 border-t">
        <div className="flex gap-2 mb-2">
          <Button
            variant={messageType === 'chat' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMessageType('chat')}
            className="text-xs"
          >
            <MessageCircle className="h-3 w-3 mr-1" /> Chat
          </Button>
          <Button
            variant={messageType === 'question' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMessageType('question')}
            className="text-xs"
          >
            <HelpCircle className="h-3 w-3 mr-1" /> Question
          </Button>
          {isHost && (
            <Button
              variant={messageType === 'announcement' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMessageType('announcement')}
              className="text-xs"
            >
              <Megaphone className="h-3 w-3 mr-1" /> Announce
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={messageType === 'question' ? 'Ask a question...' : 'Type a message...'}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1"
          />
          <Button onClick={handleSend} disabled={sendMessageMutation.isLoading}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}