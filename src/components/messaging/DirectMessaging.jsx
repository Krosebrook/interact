import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useUserData } from '../hooks/useUserData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Send, Search, X } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function DirectMessaging({ recipientEmail, onClose }) {
  const { user } = useUserData();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Generate conversation ID (consistent between two users)
  const conversationId = useMemo(() => {
    if (!user?.email || !recipientEmail) return null;
    const emails = [user.email, recipientEmail].sort();
    return `${emails[0]}_${emails[1]}`;
  }, [user?.email, recipientEmail]);

  // Fetch messages
  const { data: messages = [] } = useQuery({
    queryKey: ['direct-messages', conversationId],
    queryFn: () => base44.entities.DirectMessage.filter({ conversation_id: conversationId }, '-created_date', 100),
    enabled: !!conversationId,
    refetchInterval: 3000 // Poll every 3 seconds
  });

  // Real-time subscription
  useEffect(() => {
    if (!conversationId) return;
    
    const unsubscribe = base44.entities.DirectMessage.subscribe((event) => {
      if (event.data?.conversation_id === conversationId) {
        queryClient.invalidateQueries(['direct-messages', conversationId]);
      }
    });
    
    return unsubscribe;
  }, [conversationId, queryClient]);

  // Send message
  const sendMutation = useMutation({
    mutationFn: (data) => base44.entities.DirectMessage.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['direct-messages']);
      setMessage('');
    }
  });

  // Mark as read
  const markReadMutation = useMutation({
    mutationFn: (id) => base44.entities.DirectMessage.update(id, { read: true, read_at: new Date().toISOString() })
  });

  useEffect(() => {
    // Mark unread messages as read
    messages
      .filter(m => m.recipient_email === user?.email && !m.read)
      .forEach(m => markReadMutation.mutate(m.id));
  }, [messages, user?.email]);

  const handleSend = () => {
    if (!message.trim() || !conversationId) return;

    sendMutation.mutate({
      conversation_id: conversationId,
      sender_email: user.email,
      recipient_email: recipientEmail,
      message: message.trim()
    });
  };

  const filteredMessages = messages.filter(m =>
    m.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card className="flex flex-col h-[600px]">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-purple-600" />
            Chat with {recipientEmail}
          </CardTitle>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        <div className="relative mt-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-auto p-4 space-y-3">
        {filteredMessages.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <MessageSquare className="h-12 w-12 mx-auto mb-2 text-slate-300" />
            <p className="text-sm">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          filteredMessages.map((msg) => {
            const isSent = msg.sender_email === user?.email;
            return (
              <div key={msg.id} className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] ${isSent ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-900'} rounded-lg p-3`}>
                  <p className="text-sm">{msg.message}</p>
                  <div className={`flex items-center gap-2 mt-1 text-xs ${isSent ? 'text-purple-200' : 'text-slate-500'}`}>
                    <span>{format(new Date(msg.created_date), 'h:mm a')}</span>
                    {isSent && msg.read && <span>• Read</span>}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </CardContent>

      <div className="border-t p-4">
        <div className="flex gap-2">
          <Input
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          <Button onClick={handleSend} disabled={!message.trim() || sendMutation.isPending}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}