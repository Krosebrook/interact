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
  DropdownMenuTrigger } from
'@/components/ui/dropdown-menu';
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
  RefreshCw } from
'lucide-react';
import GoogleCalendarActions from './GoogleCalendarActions';
import { format, isPast } from 'date-fns';
import { motion } from 'framer-motion';

const statusStyles = {
  scheduled: 'bg-gradient-icebreaker text-white',
  in_progress: 'bg-gradient-wellness text-white',
  completed: 'bg-slate-200 text-slate-700',
  cancelled: 'bg-red-500 text-white',
  rescheduled: 'bg-gradient-competitive text-white'
};

const formatStyles = {
  online: { icon: Video, label: 'Online', color: 'text-blue-600' },
  offline: { icon: MapPin, label: 'In-Person', color: 'text-emerald-600' },
  hybrid: { icon: Users, label: 'Hybrid', color: 'text-purple-600' }
};

/**
 * Event Calendar Card Component
 * Production-grade with proper error handling and accessibility
 */
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
  onDelete,
  onReschedule,
  userEmail
}) {
  // All hooks must be called before any conditional returns
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Validate required props after hooks
  if (!event) {
    console.error('EventCalendarCard: event prop is required');
    return null;
  }

  const eventDate = new Date(event.scheduled_date);
  const isEventPast = isPast(eventDate);
  const formatConfig = formatStyles[event.event_format] || formatStyles.online;
  const FormatIcon = formatConfig.icon;
  
  // Safe action handlers
  const handleCopyLink = () => onCopyLink?.(event);
  const handleDownloadCalendar = () => onDownloadCalendar?.(event);
  const handleSendReminder = () => onSendReminder?.(event);
  const handleSendRecap = () => onSendRecap?.(event);
  const handleCancel = () => onCancel?.(event);
  const handleReschedule = () => onReschedule?.(event);

  return (
    <motion.div
      data-b44-sync="true"
      data-feature="events"
      data-component="eventcalendarcard"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="activity-card group p-4">

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-gradient-icebreaker text-slate-950 px-2.5 py-0.5 text-xs font-semibold rounded-md inline-flex items-center transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent shadow hover:bg-primary/80 border">
              {event.status.replace('_', ' ')}
            </Badge>
            {event.is_recurring &&
            <Badge variant="outline" className="border-slate-200 text-slate-600 text-xs">
                <RefreshCw className="h-3 w-3 mr-1" />
                Recurring
              </Badge>
            }
          </div>
          <h3
            className="font-semibold text-slate-900 truncate group-hover:text-int-orange transition-colors"
            title={event.title}>

            {event.title}
          </h3>
          {activity &&
          <p className="text-sm text-slate-500 truncate" title={activity.title}>{activity.title}</p>
          }
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            onClick={() => setIsBookmarked(!isBookmarked)}>

            {isBookmarked ?
            <BookmarkCheck className="h-4 w-4 text-int-orange" /> :

            <Bookmark className="h-4 w-4" />
            }
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-700 hover:bg-slate-100">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {onCopyLink && (
                <DropdownMenuItem onClick={handleCopyLink}>
                  <LinkIcon className="h-4 w-4 mr-2" />
                  Copy Link
                </DropdownMenuItem>
              )}
              {onDownloadCalendar && (
                <DropdownMenuItem onClick={handleDownloadCalendar}>
                  <Download className="h-4 w-4 mr-2" />
                  Add to Calendar (.ics)
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <div className="px-2 py-1.5">
                <GoogleCalendarActions eventId={event.id} />
              </div>
              <DropdownMenuSeparator />
              {!isEventPast && (
                <>
                  {onSendReminder && (
                    <DropdownMenuItem onClick={handleSendReminder}>
                      <Bell className="h-4 w-4 mr-2" />
                      Send Reminder
                    </DropdownMenuItem>
                  )}
                  {onReschedule && (
                    <DropdownMenuItem onClick={handleReschedule}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Reschedule
                    </DropdownMenuItem>
                  )}
                </>
              )}
              {isEventPast && event.status === 'completed' && onSendRecap && (
                <DropdownMenuItem onClick={handleSendRecap}>
                  <FileText className="h-4 w-4 mr-2" />
                  Send Recap
                </DropdownMenuItem>
              )}
              {!isEventPast && event.status !== 'cancelled' && onCancel && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleCancel}
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
          {event.duration_minutes &&
          <span className="text-slate-600">• {event.duration_minutes} min</span>
          }
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <FormatIcon className={`h-4 w-4 ${formatConfig.color}`} />
          <span>{formatConfig.label}</span>
          {event.location &&
          <span className="text-slate-600 truncate">• {event.location}</span>
          }
        </div>
      </div>

      {/* Participants */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-200">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Users className="h-4 w-4" />
          <span>{participantCount} participant{participantCount !== 1 ? 's' : ''}</span>
          {event.max_participants &&
          <span className="text-slate-600">/ {event.max_participants}</span>
          }
        </div>
        
        <Link to={`${createPageUrl('FacilitatorView')}?eventId=${event.id}`}>
          <Button
            size="sm"
            className="bg-int-orange hover:bg-int-orange/90 text-slate-900 font-semibold shadow-md hover:shadow-lg transition-all">

            Facilitate
          </Button>
        </Link>
      </div>
    </motion.div>);

}