import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Calendar, 
  Clock, 
  Users, 
  MoreVertical, 
  Copy, 
  Download, 
  Bell, 
  Mail,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  XCircle,
  Edit,
  CalendarClock,
  Repeat
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { motion } from 'framer-motion';
import BookmarkButton from './BookmarkButton';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';

const STATUS_STYLES = {
  scheduled: 'bg-blue-100 text-blue-800 border-blue-200',
  in_progress: 'bg-green-100 text-green-800 border-green-200',
  completed: 'bg-slate-100 text-slate-800 border-slate-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
  rescheduled: 'bg-amber-100 text-amber-800 border-amber-200',
  draft: 'bg-gray-100 text-gray-600 border-gray-200'
};

export default function EventCalendarCard({
  event,
  activity,
  participantCount = 0,
  onView,
  onCopyLink,
  onDownloadCalendar,
  onSendReminder,
  onSendRecap,
  onCancel,
  onReschedule,
  userEmail
}) {
  const [isHovered, setIsHovered] = useState(false);

  const eventDate = event.scheduled_date ? parseISO(event.scheduled_date) : null;
  const isPast = eventDate && eventDate < new Date();
  const statusStyle = STATUS_STYLES[event.status] || STATUS_STYLES.scheduled;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card className={`h-full hover:shadow-lg transition-all border-2 ${
        isPast ? 'opacity-75' : 'border-transparent hover:border-int-orange'
      }`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg line-clamp-2">{event.title}</CardTitle>
              {activity && (
                <div className="flex flex-wrap gap-1 mt-2">
                  <Badge variant="outline" className="text-xs">
                    {activity.type}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {activity.duration}
                  </Badge>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-1">
              <Badge className={statusStyle}>
                {event.status === 'rescheduled' && '↻ '}
                {event.status?.replace('_', ' ')}
              </Badge>
              
              {event.is_recurring && (
                <Badge variant="outline" className="text-xs">
                  <Repeat className="h-3 w-3 mr-1" />
                  Series
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Date & Time */}
          {eventDate && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Calendar className="h-4 w-4 text-int-orange" />
              <span>{format(eventDate, 'EEE, MMM d, yyyy')}</span>
            </div>
          )}
          
          {eventDate && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Clock className="h-4 w-4 text-int-navy" />
              <span>{format(eventDate, 'h:mm a')}</span>
              {event.duration_minutes && (
                <span className="text-slate-400">• {event.duration_minutes} min</span>
              )}
            </div>
          )}

          {/* Rescheduled indicator */}
          {event.original_date && event.original_date !== event.scheduled_date && (
            <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 p-2 rounded">
              <CalendarClock className="h-4 w-4" />
              <span>Rescheduled from {format(parseISO(event.original_date), 'MMM d')}</span>
            </div>
          )}

          {/* Participants */}
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Users className="h-4 w-4 text-slate-400" />
            <span>
              {participantCount} {event.max_participants ? `/ ${event.max_participants}` : ''} participants
            </span>
          </div>

          {/* Location/Format */}
          {event.event_format && event.event_format !== 'online' && (
            <Badge variant="outline" className="text-xs">
              {event.event_format === 'hybrid' ? '🌐 Hybrid' : '📍 In-person'}
            </Badge>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2">
            <Link to={createPageUrl('FacilitatorView') + `?eventId=${event.id}`} className="flex-1">
              <Button 
                className="w-full bg-int-orange hover:bg-[#C46322] text-white"
                size="sm"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Facilitate
              </Button>
            </Link>

            <BookmarkButton eventId={event.id} userEmail={userEmail} />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onCopyLink?.(event)}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Magic Link
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDownloadCalendar?.(event)}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Calendar
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                {onReschedule && event.status !== 'completed' && event.status !== 'cancelled' && (
                  <DropdownMenuItem onClick={() => onReschedule(event)}>
                    <CalendarClock className="h-4 w-4 mr-2" />
                    Reschedule
                  </DropdownMenuItem>
                )}
                
                {!isPast && (
                  <>
                    <DropdownMenuItem onClick={() => onSendReminder?.(event)}>
                      <Bell className="h-4 w-4 mr-2" />
                      Send Reminder
                    </DropdownMenuItem>
                  </>
                )}
                
                {isPast && event.status === 'completed' && (
                  <DropdownMenuItem onClick={() => onSendRecap?.(event)}>
                    <Mail className="h-4 w-4 mr-2" />
                    Send Recap
                  </DropdownMenuItem>
                )}
                
                {event.status !== 'cancelled' && event.status !== 'completed' && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => onCancel?.(event)}
                      className="text-red-600"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Cancel Event
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}