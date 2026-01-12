import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bookmark, Calendar, Clock, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import BookmarkButton from './BookmarkButton';

export default function BookmarkedEventsList({ userEmail }) {
  const { data: bookmarks = [] } = useQuery({
    queryKey: ['bookmarks', userEmail],
    queryFn: () => base44.entities.EventBookmark.filter({ user_email: userEmail }),
    enabled: !!userEmail
  });

  const { data: events = [] } = useQuery({
    queryKey: ['events'],
    queryFn: () => base44.entities.Event.list('-scheduled_date', 100)
  });

  const bookmarkedEvents = events.filter(e => 
    bookmarks.some(b => b.event_id === e.id)
  );

  const upcomingBookmarked = bookmarkedEvents.filter(e => 
    new Date(e.scheduled_date) > new Date() && e.status !== 'cancelled'
  );

  if (bookmarks.length === 0) {
    return null;
  }

  return (
    <Card data-b44-sync="true" data-feature="events" data-component="bookmarkedeventslist">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Bookmark className="h-5 w-5 text-yellow-500 fill-yellow-500" />
          Bookmarked Events ({upcomingBookmarked.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {upcomingBookmarked.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-4">No upcoming bookmarked events</p>
        ) : (
          <div className="space-y-3">
            {upcomingBookmarked.slice(0, 5).map(event => (
              <div key={event.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{event.title}</h4>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(event.scheduled_date), 'MMM d')}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {format(new Date(event.scheduled_date), 'h:mm a')}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <BookmarkButton eventId={event.id} userEmail={userEmail} />
                  <Link to={`${createPageUrl('ParticipantEvent')}?link=${event.magic_link}`}>
                    <Button variant="ghost" size="icon">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}