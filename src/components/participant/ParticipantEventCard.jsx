import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Calendar, Clock, MapPin, CheckCircle2, XCircle, HelpCircle, ExternalLink, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

export default function ParticipantEventCard({ 
  event, 
  activity, 
  participation,
  isPast = false,
  onRSVP,
  onProvideFeedback 
}) {
  const rsvpIcons = {
    yes: CheckCircle2,
    no: XCircle,
    maybe: HelpCircle
  };

  const rsvpColors = {
    yes: 'text-green-600',
    no: 'text-red-600',
    maybe: 'text-yellow-600'
  };

  const RSVPIcon = rsvpIcons[participation?.rsvp_status] || HelpCircle;

  const hasFeedback = !!participation?.feedback;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all">
        {activity?.image_url && (
          <div className="h-32 bg-gradient-to-br from-indigo-500 to-purple-600" />
        )}
        <div className="p-6">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <Badge className="mb-2">{activity?.type || 'Activity'}</Badge>
              <h3 className="font-bold text-lg text-slate-900 mb-1">
                {event.title}
              </h3>
              <p className="text-sm text-slate-600 line-clamp-2">
                {activity?.description}
              </p>
            </div>
          </div>

          <div className="space-y-2 mb-4 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{format(new Date(event.scheduled_date), 'EEEE, MMM d, yyyy')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{format(new Date(event.scheduled_date), 'h:mm a')}</span>
              <span className="text-slate-400">•</span>
              <span>{event.duration_minutes || activity?.duration || 'TBD'}</span>
            </div>
            {event.meeting_link && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span className="text-indigo-600">Virtual Event</span>
              </div>
            )}
          </div>

          {/* Pre-Event Materials */}
          {!isPast && event.custom_instructions && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs font-semibold text-blue-900 mb-1">Pre-Event Notes:</p>
              <p className="text-xs text-blue-700">{event.custom_instructions}</p>
            </div>
          )}

          {!isPast ? (
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="flex-1"
                  >
                    <RSVPIcon className={`h-4 w-4 mr-2 ${rsvpColors[participation?.rsvp_status]}`} />
                    RSVP: {participation?.rsvp_status || 'No Response'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem 
                    onClick={() => onRSVP(participation.id, 'yes')}
                    disabled={participation?.rsvp_status === 'yes'}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
                    Yes, I'll attend ✨
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onRSVP(participation.id, 'maybe')}
                    disabled={participation?.rsvp_status === 'maybe'}
                  >
                    <HelpCircle className="h-4 w-4 mr-2 text-yellow-600" />
                    Maybe
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onRSVP(participation.id, 'no')}
                    disabled={participation?.rsvp_status === 'no'}
                  >
                    <XCircle className="h-4 w-4 mr-2 text-red-600" />
                    Can't make it
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              {event.meeting_link && (
                <Button
                  onClick={() => window.open(event.meeting_link, '_blank')}
                  size="icon"
                  variant="outline"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {participation?.attended && (
                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Attended
                </Badge>
              )}
              {!hasFeedback && (
                <Button
                  onClick={onProvideFeedback}
                  variant="outline"
                  className="w-full border-orange-300 text-orange-700 hover:bg-orange-50"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Provide Feedback
                </Button>
              )}
              {hasFeedback && (
                <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                  Feedback Submitted ✓
                </Badge>
              )}
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}