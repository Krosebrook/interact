import React, { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Megaphone, Send, Info, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

const typeConfig = {
  info: {
    icon: Info,
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    badgeColor: 'bg-blue-600'
  },
  warning: {
    icon: AlertTriangle,
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    badgeColor: 'bg-yellow-600'
  },
  success: {
    icon: CheckCircle2,
    color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    badgeColor: 'bg-emerald-600'
  }
};

export default function LiveAnnouncements({ eventId }) {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState('');
  const [type, setType] = useState('info');

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const { data: announcements = [] } = useQuery({
    queryKey: ['announcements', eventId],
    queryFn: () => base44.entities.Announcement.filter({ event_id: eventId }),
    refetchInterval: 5000
  });

  const sendAnnouncementMutation = useMutation({
    mutationFn: async () => {
      if (!message.trim()) throw new Error('Message required');
      
      return await base44.entities.Announcement.create({
        event_id: eventId,
        message: message.trim(),
        type,
        sent_by: user?.full_name || user?.email
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['announcements']);
      setMessage('');
      toast.success('Announcement sent! 📢');
    }
  });

  const handleQuickMessage = (msg) => {
    setMessage(msg);
  };

  return (
    <div className="space-y-4" data-b44-sync="true" data-feature="facilitator" data-component="liveannouncements">
      <Card className="p-6">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Megaphone className="h-5 w-5" />
          Send Announcement
        </h3>

        <div className="space-y-4">
          <div>
            <Textarea
              placeholder="Type your announcement to all participants..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          <div className="flex gap-2">
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="success">Success</SelectItem>
              </SelectContent>
            </Select>

            <Button
              onClick={() => sendAnnouncementMutation.mutate()}
              disabled={!message.trim() || sendAnnouncementMutation.isLoading}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700"
            >
              <Send className="h-4 w-4 mr-2" />
              Send to All
            </Button>
          </div>

          {/* Quick Messages */}
          <div className="space-y-2">
            <p className="text-xs text-slate-600">Quick messages:</p>
            <div className="flex flex-wrap gap-2">
              {[
                'Take a 5-minute break',
                'Moving to breakout rooms',
                'Please submit your responses',
                'Great participation everyone!',
                'Questions? Raise your hand'
              ].map(msg => (
                <Badge
                  key={msg}
                  variant="outline"
                  className="cursor-pointer hover:bg-slate-100"
                  onClick={() => handleQuickMessage(msg)}
                >
                  {msg}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Announcement History */}
      <div className="space-y-3">
        <h3 className="font-bold">Sent Announcements ({announcements.length})</h3>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          <AnimatePresence>
            {announcements.slice().reverse().map(announcement => {
              const Icon = typeConfig[announcement.type].icon;
              return (
                <motion.div
                  key={announcement.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <Card className={`p-4 border ${typeConfig[announcement.type].color}`}>
                    <div className="flex items-start gap-3">
                      <Icon className="h-5 w-5 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium mb-1">{announcement.message}</p>
                        <div className="flex items-center gap-2 text-xs">
                          <span>{announcement.sent_by}</span>
                          <span className="text-slate-400">•</span>
                          <span>{format(new Date(announcement.created_date), 'h:mm a')}</span>
                        </div>
                      </div>
                      <Badge className={typeConfig[announcement.type].badgeColor}>
                        {announcement.type}
                      </Badge>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}