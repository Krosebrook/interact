import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, Loader2, Hash } from 'lucide-react';
import { toast } from 'sonner';

export default function ChannelDiscussion({ channelId, userEmail }) {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: channel } = useQuery({
    queryKey: ['channel', channelId],
    queryFn: async () => {
      return await base44.entities.Channel.get(channelId);
    },
    enabled: !!channelId
  });

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['channel-messages', channelId],
    queryFn: async () => {
      return await base44.entities.ChannelMessage.filter({
        channel_id: channelId
      }, 'created_date', 100);
    },
    enabled: !!channelId,
    refetchInterval: 5000 // Poll every 5 seconds for new messages
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content) => {
      const user = await base44.auth.me();
      await base44.entities.ChannelMessage.create({
        channel_id: channelId,
        author_email: user.email,
        author_name: user.full_name,
        content,
        message_type: 'text'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['channel-messages', channelId]);
      setMessage('');
    },
    onError: (error) => {
      toast.error('Failed to send message: ' + error.message);
    }
  });

  const handleSend = () => {
    const trimmed = message.trim();
    if (!trimmed) return;
    sendMessageMutation.mutate(trimmed);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!channel) return null;

  return (
    <Card className="flex flex-col h-[600px]">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2">
          <Hash className="h-5 w-5 text-slate-600" />
          {channel.channel_name}
        </CardTitle>
        {channel.description && (
          <p className="text-sm text-slate-600">{channel.description}</p>
        )}
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const showAvatar = index === 0 || messages[index - 1].author_email !== msg.author_email;
            const isCurrentUser = msg.author_email === userEmail;

            return (
              <div key={msg.id} className={`flex gap-3 ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
                {showAvatar ? (
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className={
                      isCurrentUser 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-slate-200 text-slate-600'
                    }>
                      {msg.author_name?.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="w-10" />
                )}
                
                <div className={`flex-1 max-w-[70%] ${isCurrentUser ? 'items-end' : ''}`}>
                  {showAvatar && (
                    <div className={`flex items-center gap-2 mb-1 ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
                      <span className="font-medium text-sm text-slate-900">
                        {msg.author_name}
                      </span>
                      <span className="text-xs text-slate-500">
                        {new Date(msg.created_date).toLocaleTimeString()}
                      </span>
                    </div>
                  )}
                  <div className={`rounded-2xl px-4 py-2 ${
                    isCurrentUser
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-100 text-slate-900'
                  }`}>
                    <p className="text-sm break-words">{msg.content}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </CardContent>

      <div className="border-t p-4">
        <div className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type a message..."
            disabled={sendMessageMutation.isPending}
          />
          <Button
            onClick={handleSend}
            disabled={!message.trim() || sendMessageMutation.isPending}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}