import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Send, 
  Smile, 
  Paperclip, 
  MoreVertical,
  Users,
  Settings,
  Pin,
  Trash2,
  Edit,
  Reply,
  Hash,
  Lock
} from 'lucide-react';
import { toast } from 'sonner';
import { formatTimeAgo, formatUserName } from '../utils/formatters';
import { playSound } from '../utils/soundEffects';

const QUICK_REACTIONS = ['👍', '❤️', '😂', '🎉', '🚀', '👀'];

export default function ChannelChat({ channel, user, onOpenSettings }) {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState('');
  const [showReactions, setShowReactions] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['channel-messages', channel?.id],
    queryFn: () => base44.entities.ChannelMessage.filter(
      { channel_id: channel.id },
      '-created_date',
      100
    ),
    enabled: !!channel?.id,
    refetchInterval: 5000
  });

  const sendMutation = useMutation({
    mutationFn: async (content) => {
      const newMessage = await base44.entities.ChannelMessage.create({
        channel_id: channel.id,
        sender_email: user.email,
        sender_name: user.full_name,
        content,
        message_type: 'text'
      });
      
      // Update channel last activity
      await base44.entities.Channel.update(channel.id, {
        last_activity: new Date().toISOString(),
        message_count: (channel.message_count || 0) + 1
      });
      
      return newMessage;
    },
    onSuccess: () => {
      playSound('pop');
      queryClient.invalidateQueries(['channel-messages', channel.id]);
      queryClient.invalidateQueries(['channels']);
      setMessage('');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (messageId) => base44.entities.ChannelMessage.delete(messageId),
    onSuccess: () => {
      queryClient.invalidateQueries(['channel-messages', channel.id]);
      toast.success('Message deleted');
    }
  });

  const reactionMutation = useMutation({
    mutationFn: async ({ messageId, emoji, currentReactions }) => {
      const reactions = [...(currentReactions || [])];
      const existingIdx = reactions.findIndex(r => r.emoji === emoji);
      
      if (existingIdx >= 0) {
        const userEmails = reactions[existingIdx].user_emails || [];
        if (userEmails.includes(user.email)) {
          reactions[existingIdx].user_emails = userEmails.filter(e => e !== user.email);
          if (reactions[existingIdx].user_emails.length === 0) {
            reactions.splice(existingIdx, 1);
          }
        } else {
          reactions[existingIdx].user_emails.push(user.email);
        }
      } else {
        reactions.push({ emoji, user_emails: [user.email] });
      }
      
      return base44.entities.ChannelMessage.update(messageId, { reactions });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['channel-messages', channel.id]);
      setShowReactions(null);
    }
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    sendMutation.mutate(message.trim());
  };

  const getInitials = (name, email) => {
    if (name) return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    return email?.slice(0, 2).toUpperCase() || '??';
  };

  const sortedMessages = [...messages].sort((a, b) => 
    new Date(a.created_date) - new Date(b.created_date)
  );

  if (!channel) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-50 rounded-xl">
        <div className="text-center">
          <Hash className="h-12 w-12 mx-auto mb-3 text-slate-300" />
          <h3 className="font-semibold text-slate-600">Select a channel</h3>
          <p className="text-sm text-slate-400">Choose a channel to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-int-orange to-amber-500 flex items-center justify-center">
            {channel.icon ? (
              <span className="text-xl">{channel.icon}</span>
            ) : (
              <Hash className="h-5 w-5 text-white" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              {channel.visibility !== 'public' && <Lock className="h-3.5 w-3.5 text-slate-400" />}
              <h2 className="font-bold text-slate-900">{channel.name}</h2>
            </div>
            <p className="text-xs text-slate-500">{channel.member_count || 0} members</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Users className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onOpenSettings}>
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-slate-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-slate-200 rounded" />
                  <div className="h-4 w-full bg-slate-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : sortedMessages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                <Hash className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="font-semibold text-slate-700">No messages yet</h3>
              <p className="text-sm text-slate-500 mt-1">Be the first to say something!</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {sortedMessages.map((msg, idx) => {
                const isOwn = msg.sender_email === user.email;
                const showAvatar = idx === 0 || 
                  sortedMessages[idx - 1]?.sender_email !== msg.sender_email;
                
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`flex gap-3 group ${!showAvatar ? 'pl-13' : ''}`}
                  >
                    {showAvatar && (
                      <Avatar className="h-10 w-10 flex-shrink-0">
                        <AvatarFallback className={`${isOwn ? 'bg-int-orange text-white' : 'bg-slate-200 text-slate-600'}`}>
                          {getInitials(msg.sender_name, msg.sender_email)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    {!showAvatar && <div className="w-10" />}
                    
                    <div className="flex-1 min-w-0">
                      {showAvatar && (
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm text-slate-900">
                            {msg.sender_name || formatUserName(msg.sender_email)}
                          </span>
                          <span className="text-xs text-slate-400">
                            {formatTimeAgo(msg.created_date)}
                          </span>
                          {msg.is_edited && (
                            <span className="text-xs text-slate-400">(edited)</span>
                          )}
                        </div>
                      )}
                      
                      <div className="relative">
                        <p className="text-sm text-slate-700 whitespace-pre-wrap break-words">
                          {msg.content}
                        </p>
                        
                        {/* Reactions */}
                        {msg.reactions?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {msg.reactions.map((reaction, i) => (
                              <button
                                key={i}
                                onClick={() => reactionMutation.mutate({
                                  messageId: msg.id,
                                  emoji: reaction.emoji,
                                  currentReactions: msg.reactions
                                })}
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border transition-all ${
                                  reaction.user_emails?.includes(user.email)
                                    ? 'bg-int-orange/10 border-int-orange/30 text-int-orange'
                                    : 'bg-slate-100 border-slate-200 hover:bg-slate-200'
                                }`}
                              >
                                <span>{reaction.emoji}</span>
                                <span>{reaction.user_emails?.length || 0}</span>
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Message Actions */}
                        <div className="absolute -right-2 top-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-white border rounded-lg shadow-sm p-1">
                          <DropdownMenu open={showReactions === msg.id} onOpenChange={(open) => setShowReactions(open ? msg.id : null)}>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7">
                                <Smile className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="p-2">
                              <div className="flex gap-1">
                                {QUICK_REACTIONS.map(emoji => (
                                  <button
                                    key={emoji}
                                    onClick={() => reactionMutation.mutate({
                                      messageId: msg.id,
                                      emoji,
                                      currentReactions: msg.reactions
                                    })}
                                    className="text-xl hover:scale-125 transition-transform p-1"
                                  >
                                    {emoji}
                                  </button>
                                ))}
                              </div>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          
                          {isOwn && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7 text-red-500 hover:text-red-600"
                              onClick={() => deleteMutation.mutate(msg.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 border-t border-slate-100 bg-slate-50">
        <div className="flex items-center gap-2">
          <Input
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={`Message #${channel.name}`}
            className="flex-1 bg-white"
          />
          <Button 
            type="submit" 
            disabled={!message.trim() || sendMutation.isPending}
            className="bg-int-orange hover:bg-int-orange/90"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}