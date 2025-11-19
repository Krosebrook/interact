import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import EventActionsMenu from './EventActionsMenu';
import { Calendar, Clock, Users, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

const statusColors = {
  scheduled: "bg-blue-100 text-blue-700 border-blue-200",
  in_progress: "bg-yellow-100 text-yellow-700 border-yellow-200",
  completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
  cancelled: "bg-slate-100 text-slate-700 border-slate-200"
};

export default function EventCalendarCard({ 
  event, 
  activity, 
  participantCount, 
  onView, 
  onCopyLink, 
  onDownloadCalendar,
  onSendReminder,
  onSendRecap,
  onCancel 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-all group">
        <div className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="font-bold text-lg text-slate-900 mb-1">
                {event.title}
              </h3>
              <p className="text-sm text-slate-600">
                {activity?.type} • {activity?.duration}
              </p>
            </div>
            <Badge className={`${statusColors[event.status]} border`}>
              {event.status}
            </Badge>
          </div>

          <div className="space-y-2 mb-4 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{format(new Date(event.scheduled_date), 'MMM d, yyyy')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{format(new Date(event.scheduled_date), 'h:mm a')}</span>
              <span className="text-slate-400">•</span>
              <span>{event.duration_minutes || activity?.duration || 'TBD'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>{participantCount} RSVPs</span>
              {event.max_participants && (
                <span className="text-slate-400">/ {event.max_participants} max</span>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => onView(event)}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              View
            </Button>
            <EventActionsMenu
              event={event}
              onCopyLink={onCopyLink}
              onDownloadCalendar={onDownloadCalendar}
              onSendReminder={onSendReminder}
              onSendRecap={onSendRecap}
              onCancel={onCancel}
            />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}