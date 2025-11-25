import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
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
  Link as LinkIcon, 
  Download, 
  Bell, 
  FileText, 
  XCircle,
  Bookmark,
  BookmarkCheck,
  MapPin,
  Video,
  RefreshCw
} from 'lucide-react';
import { format, isPast } from 'date-fns';
import { motion } from 'framer-motion';

const statusStyles = {
  scheduled: 'bg-blue-100 text-blue-700 border-blue-200',
  in_progress: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  completed: 'bg-slate-100 text-slate-700 border-slate-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
  rescheduled: 'bg-amber-100 text-amber-700 border-amber-200'
};

const formatStyles = {
  online: { icon: Video, label: 'Online', color: 'text-blue-600' },
  offline: { icon: MapPin, label: 'In-Person', color: 'text-emerald-600' },
  hybrid: { icon: Users, label: 'Hybrid', color: 'text-purple-600' }
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
  const [isBookmarked, setIsBookmarked] = useState(false);
  
  const eventDate = new Date(event.scheduled_date);
  const isEventPast = isPast(eventDate);
  const formatConfig = formatStyles[event.event_format] || formatStyles.online;
  const FormatIcon = formatConfig.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="glass-card group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge className={`${statusStyles[event.status]} border text-xs`}>
              {event.status.replace('_', ' ')}
            </Badge>
            {event.is_recurring && (
              <Badge variant="outline" className="border-slate-200 text-slate-600 text-xs">
                <RefreshCw className="h-3 w-3 mr-1" />
                Recurring
              </Badge>
            )}
          </div>
          <h3 className="font-semibold text-slate-900 truncate group-hover:text-int-orange transition-colors">
            {event.title}
          </h3>
          {activity && (
            <p className="text-sm text-slate-500 truncate">{activity.title}</p>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            onClick={() => setIsBookmarked(!isBookmarked)}
          >
            {isBookmarked ? (
              <BookmarkCheck className="h-4 w-4 text-int-orange" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-700 hover:bg-slate-100">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => onCopyLink(event)}>
                <LinkIcon className="h-4 w-4 mr-2" />
                Copy Link
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDownloadCalendar(event)}>
                <Download className="h-4 w-4 mr-2" />
                Add to Calendar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {!isEventPast && (
                <>
                  <DropdownMenuItem onClick={() => onSendReminder(event)}>
                    <Bell className="h-4 w-4 mr-2" />
                    Send Reminder
                  </DropdownMenuItem>
                  {onReschedule && (
                    <DropdownMenuItem onClick={() => onReschedule(event)}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Reschedule
                    </DropdownMenuItem>
                  )}
                </>
              )}
              {isEventPast && event.status === 'completed' && (
                <DropdownMenuItem onClick={() => onSendRecap(event)}>
                  <FileText className="h-4 w-4 mr-2" />
                  Send Recap
                </DropdownMenuItem>
              )}
              {!isEventPast && event.status !== 'cancelled' && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => onCancel(event)}
                    className="text-red-600 focus:text-red-600"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancel Event
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Event Details */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Calendar className="h-4 w-4 text-int-orange" />
          <span>{format(eventDate, 'EEE, MMM d, yyyy')}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Clock className="h-4 w-4 text-int-orange" />
          <span>{format(eventDate, 'h:mm a')}</span>
          {event.duration_minutes && (
            <span className="text-slate-400">• {event.duration_minutes} min</span>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <FormatIcon className={`h-4 w-4 ${formatConfig.color}`} />
          <span>{formatConfig.label}</span>
          {event.location && (
            <span className="text-slate-400 truncate">• {event.location}</span>
          )}
        </div>
      </div>

      {/* Participants */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-200">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Users className="h-4 w-4" />
          <span>{participantCount} participant{participantCount !== 1 ? 's' : ''}</span>
          {event.max_participants && (
            <span className="text-slate-400">/ {event.max_participants}</span>
          )}
        </div>
        
        <Link to={`${createPageUrl('FacilitatorView')}?eventId=${event.id}`}>
          <Button 
            size="sm" 
            className="bg-int-orange hover:bg-[#C46322] text-white shadow-lg"
          >
            Facilitate
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}