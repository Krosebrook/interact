import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  Bookmark, 
  Clock, 
  MapPin, 
  Users,
  ExternalLink,
  Video
} from 'lucide-react';
import { format, isAfter, isBefore, isToday } from 'date-fns';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import BookmarkButton from '../events/BookmarkButton';
import EmptyState from '../common/EmptyState';

export default function ProfileEventsDashboard({ userEmail }) {
  const { data: participations = [] } = useQuery({
    queryKey: ['user-participations', userEmail],
    queryFn: () => base44.entities.Participation.filter({ participant_email: userEmail }),
    enabled: !!userEmail
  });

  const { data: bookmarks = [] } = useQuery({
    queryKey: ['bookmarks', userEmail],
    queryFn: () => base44.entities.EventBookmark.filter({ user_email: userEmail }),
    enabled: !!userEmail
  });

  const { data: events = [] } = useQuery({
    queryKey: ['events'],
    queryFn: () => base44.entities.Event.list('-scheduled_date', 200)
  });

  const { data: activities = [] } = useQuery({
    queryKey: ['activities'],
    queryFn: () => base44.entities.Activity.list()
  });

  const now = new Date();
  
  // Get events user is participating in
  const myEventIds = participations.map(p => p.event_id);
  const myEvents = events.filter(e => myEventIds.includes(e.id));
  
  // Categorize events
  const upcomingEvents = myEvents.filter(e => 
    isAfter(new Date(e.scheduled_date), now) && e.status !== 'cancelled'
  ).sort((a, b) => new Date(a.scheduled_date) - new Date(b.scheduled_date));

  const todayEvents = upcomingEvents.filter(e => isToday(new Date(e.scheduled_date)));

  // Bookmarked events
  const bookmarkedEventIds = bookmarks.map(b => b.event_id);
  const bookmarkedEvents = events.filter(e => 
    bookmarkedEventIds.includes(e.id) && 
    isAfter(new Date(e.scheduled_date), now) &&
    e.status !== 'cancelled'
  ).sort((a, b) => new Date(a.scheduled_date) - new Date(b.scheduled_date));

  const getActivity = (activityId) => activities.find(a => a.id === activityId);
  const getParticipation = (eventId) => participations.find(p => p.event_id === eventId);

  const EventCard = ({ event, showBookmark = true }) => {
    const activity = getActivity(event.activity_id);
    const participation = getParticipation(event.id);
    const eventDate = new Date(event.scheduled_date);
    const isEventToday = isToday(eventDate);

    return (
      <div className="p-4 bg-white border rounded-xl hover:shadow-md transition-shadow" data-b44-sync="true" data-feature="profile" data-component="profileeventsdashboard">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {isEventToday && (
                <Badge className="bg-green-100 text-green-700 text-xs">Today</Badge>
              )}
              <Badge variant="outline" className="text-xs">{activity?.type}</Badge>
            </div>
            <h4 className="font-semibold text-slate-900">{event.title}</h4>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-slate-500">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {format(eventDate, 'MMM d')}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {format(eventDate, 'h:mm a')}
              </span>
              {event.event_format !== 'online' && event.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {event.location}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {showBookmark && (
              <BookmarkButton eventId={event.id} userEmail={userEmail} />
            )}
            <Link to={`${createPageUrl('ParticipantEvent')}?link=${event.magic_link}`}>
              <Button size="sm" variant="outline">
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
        {participation?.rsvp_status && (
          <div className="mt-3 pt-3 border-t flex items-center justify-between">
            <span className="text-xs text-slate-500">RSVP Status</span>
            <Badge className={
              participation.rsvp_status === 'yes' ? 'bg-green-100 text-green-700' :
              participation.rsvp_status === 'maybe' ? 'bg-yellow-100 text-yellow-700' :
              'bg-slate-100 text-slate-700'
            }>
              {participation.rsvp_status === 'yes' ? 'Going' : 
               participation.rsvp_status === 'maybe' ? 'Maybe' : 'Not Going'}
            </Badge>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-int-orange" />
          My Events Dashboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Today's Events Highlight */}
        {todayEvents.length > 0 && (
          <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
            <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
              <Video className="h-4 w-4" />
              Today's Events ({todayEvents.length})
            </h4>
            <div className="space-y-2">
              {todayEvents.map(event => (
                <div key={event.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{event.title}</p>
                    <p className="text-xs text-slate-500">
                      {format(new Date(event.scheduled_date), 'h:mm a')}
                    </p>
                  </div>
                  <Link to={`${createPageUrl('ParticipantEvent')}?link=${event.magic_link}`}>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      Join Now
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        <Tabs defaultValue="upcoming">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="upcoming" className="text-sm">
              <Calendar className="h-4 w-4 mr-1" />
              Upcoming ({upcomingEvents.length})
            </TabsTrigger>
            <TabsTrigger value="bookmarked" className="text-sm">
              <Bookmark className="h-4 w-4 mr-1" />
              Bookmarked ({bookmarkedEvents.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            {upcomingEvents.length === 0 ? (
              <EmptyState
                icon={Calendar}
                title="No upcoming events"
                description="You haven't RSVP'd to any upcoming events yet"
              />
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {upcomingEvents.slice(0, 10).map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="bookmarked">
            {bookmarkedEvents.length === 0 ? (
              <EmptyState
                icon={Bookmark}
                title="No bookmarked events"
                description="Bookmark events you're interested in to see them here"
              />
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {bookmarkedEvents.slice(0, 10).map(event => (
                  <EventCard key={event.id} event={event} showBookmark={true} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}