import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { format, isToday, isTomorrow, differenceInHours } from 'date-fns';
import { 
  Calendar, 
  Clock, 
  Users, 
  ChevronRight, 
  Sparkles,
  Play,
  Bell,
  Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const EventCard = ({ event, activity, stats, index, onAction }) => {
  const [isHovered, setIsHovered] = useState(false);
  const eventDate = new Date(event.scheduled_date);
  const hoursUntil = differenceInHours(eventDate, new Date());
  
  const getUrgencyStyle = () => {
    if (hoursUntil < 0) return 'border-l-4 border-l-slate-300';
    if (hoursUntil < 1) return 'border-l-4 border-l-red-500 bg-red-50/50';
    if (hoursUntil < 24) return 'border-l-4 border-l-orange-500';
    if (hoursUntil < 72) return 'border-l-4 border-l-blue-500';
    return 'border-l-4 border-l-slate-200';
  };

  const getTimeLabel = () => {
    if (isToday(eventDate)) return { text: 'Today', class: 'bg-red-100 text-red-700' };
    if (isTomorrow(eventDate)) return { text: 'Tomorrow', class: 'bg-orange-100 text-orange-700' };
    return { text: format(eventDate, 'EEE, MMM d'), class: 'bg-slate-100 text-slate-700' };
  };

  const timeLabel = getTimeLabel();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card className={`p-4 transition-all duration-200 hover:shadow-lg ${getUrgencyStyle()}`}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={timeLabel.class}>{timeLabel.text}</Badge>
              {event.status === 'in_progress' && (
                <Badge className="bg-green-100 text-green-700 animate-pulse">
                  <Play className="h-3 w-3 mr-1" /> Live
                </Badge>
              )}
            </div>
            
            <h4 className="font-semibold text-slate-900 truncate">{event.title}</h4>
            
            <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {format(eventDate, 'h:mm a')}
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {stats?.attended || 0}/{stats?.total || 0}
              </span>
              {activity?.type && (
                <Badge variant="outline" className="text-xs">{activity.type}</Badge>
              )}
            </div>
          </div>

          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="flex gap-1"
              >
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => onAction?.('remind', event)}
                  className="h-8 w-8"
                >
                  <Bell className="h-4 w-4" />
                </Button>
                <Link to={createPageUrl(`FacilitatorView?eventId=${event.id}`)}>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Eye className="h-4 w-4" />
                  </Button>
                </Link>
              </motion.div>
            )}
          </AnimatePresence>

          {!isHovered && (
            <ChevronRight className="h-5 w-5 text-slate-300" />
          )}
        </div>
      </Card>
    </motion.div>
  );
};

export default function ReactiveEventList({ 
  events, 
  activities, 
  participations,
  title,
  emptyMessage,
  onEventAction,
  maxItems = 5,
  showViewAll = true
}) {
  const getStatsForEvent = (eventId) => {
    const eventParticipations = participations?.filter(p => p.event_id === eventId) || [];
    return {
      total: eventParticipations.length,
      attended: eventParticipations.filter(p => p.attended).length
    };
  };

  const getActivityForEvent = (event) => {
    return activities?.find(a => a.id === event.activity_id);
  };

  const displayEvents = events?.slice(0, maxItems) || [];

  return (
    <div className="space-y-4">
      {title && (
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg text-slate-900">{title}</h3>
          {showViewAll && events?.length > maxItems && (
            <Link to={createPageUrl('Calendar')}>
              <Button variant="ghost" size="sm">
                View all ({events.length})
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          )}
        </div>
      )}

      {displayEvents.length === 0 ? (
        <Card className="p-8 text-center border-dashed">
          <Calendar className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">{emptyMessage || 'No events'}</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {displayEvents.map((event, i) => (
            <EventCard
              key={event.id}
              event={event}
              activity={getActivityForEvent(event)}
              stats={getStatsForEvent(event.id)}
              index={i}
              onAction={onEventAction}
            />
          ))}
        </div>
      )}
    </div>
  );
}