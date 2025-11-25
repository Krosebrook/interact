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
  scheduled: 'bg-blue-500/20 text-blue-200 border-blue-400/30',
  in_progress: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30',
  completed: 'bg-slate-500/20 text-slate-200 border-slate-400/30',
  cancelled: 'bg-red-500/20 text-red-200 border-red-400/30',
  rescheduled: 'bg-amber-500/20 text-amber-200 border-amber-400/30'
};

const formatStyles = {
  online: { icon: Video, label: 'Online', color: 'text-blue-300' },
  offline: { icon: MapPin, label: 'In-Person', color: 'text-emerald-300' },
  hybrid: { icon: Users, label: 'Hybrid', color: 'text-purple-300' }
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
              <Badge variant="outline" className="border-white/20 text-white/70 text-xs">
                <RefreshCw className="h-3 w-3 mr-1" />
                Recurring
              </Badge>
            )}
          </div>
          <h3 className="font-semibold text-white truncate group-hover:text-int-orange transition-colors">
            {event.title}
          </h3>
          {activity && (
            <p className="text-sm text-white/60 truncate">{activity.title}</p>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white/50 hover:text-white hover:bg-white/10"
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
              <Button variant="ghost" size="icon" className="h-8 w-8 text-white/50 hover:text-white hover:bg-white/10">
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
        <div className="flex items-center gap-2 text-sm text-white/70">
          <Calendar className="h-4 w-4 text-int-orange" />
          <span>{format(eventDate, 'EEE, MMM d, yyyy')}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-white/70">
          <Clock className="h-4 w-4 text-int-orange" />
          <span>{format(eventDate, 'h:mm a')}</span>
          {event.duration_minutes && (
            <span className="text-white/50">• {event.duration_minutes} min</span>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-white/70">
          <FormatIcon className={`h-4 w-4 ${formatConfig.color}`} />
          <span>{formatConfig.label}</span>
          {event.location && (
            <span className="text-white/50 truncate">• {event.location}</span>
          )}
        </div>
      </div>

      {/* Participants */}
      <div className="flex items-center justify-between pt-3 border-t border-white/10">
        <div className="flex items-center gap-2 text-sm text-white/60">
          <Users className="h-4 w-4" />
          <span>{participantCount} participant{participantCount !== 1 ? 's' : ''}</span>
          {event.max_participants && (
            <span className="text-white/40">/ {event.max_participants}</span>
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