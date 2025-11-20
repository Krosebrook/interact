import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PreEventAssistant from '../components/facilitator/PreEventAssistant';
import RealTimeTips from '../components/facilitator/RealTimeTips';
import PostEventRecap from '../components/facilitator/PostEventRecap';
import LivePollCreator from '../components/facilitator/LivePollCreator';
import SessionTimer from '../components/facilitator/SessionTimer';
import LiveAnnouncements from '../components/facilitator/LiveAnnouncements';
import { Calendar, Users, Clock, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { format } from 'date-fns';

export default function FacilitatorView() {
  const [eventId, setEventId] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        if (currentUser.role !== 'admin') {
          base44.auth.redirectToLogin();
        }
      } catch (error) {
        base44.auth.redirectToLogin();
      }
    };
    loadUser();

    const urlParams = new URLSearchParams(window.location.search);
    setEventId(urlParams.get('event'));
  }, []);

  const { data: event } = useQuery({
    queryKey: ['event', eventId],
    queryFn: async () => {
      const events = await base44.entities.Event.filter({ id: eventId });
      return events[0];
    },
    enabled: !!eventId
  });

  const { data: activity } = useQuery({
    queryKey: ['activity', event?.activity_id],
    queryFn: async () => {
      const activities = await base44.entities.Activity.filter({ id: event.activity_id });
      return activities[0];
    },
    enabled: !!event?.activity_id
  });

  const { data: participations = [] } = useQuery({
    queryKey: ['participations', eventId],
    queryFn: () => base44.entities.Participation.filter({ event_id: eventId }),
    enabled: !!eventId
  });

  if (!user || !event) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const isUpcoming = new Date(event.scheduled_date) > new Date();
  const isCompleted = event.status === 'completed';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link to={createPageUrl('Calendar')}>
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Calendar
            </Button>
          </Link>

          <Card className="p-6 border-0 shadow-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <Badge className="bg-white/20 text-white border-0 mb-3">
                  {activity?.type}
                </Badge>
                <h1 className="text-3xl font-bold mb-4">{event.title}</h1>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(event.scheduled_date), 'EEEE, MMMM d, yyyy')}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {format(new Date(event.scheduled_date), 'h:mm a')}
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    {participations.length} RSVPs
                  </div>
                </div>
              </div>
              <Badge className={`text-lg px-4 py-2 ${
                isCompleted ? 'bg-emerald-600' : 
                isUpcoming ? 'bg-blue-600' : 'bg-yellow-600'
              }`}>
                {event.status}
              </Badge>
            </div>
          </Card>
        </div>

        {/* Facilitator Assistant */}
        <Tabs defaultValue={isCompleted ? 'recap' : isUpcoming ? 'prep' : 'live'} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="prep">Pre-Event</TabsTrigger>
            <TabsTrigger value="live">Live Tips</TabsTrigger>
            <TabsTrigger value="tools">Tools</TabsTrigger>
            <TabsTrigger value="polls">Polls</TabsTrigger>
            <TabsTrigger value="recap">Recap</TabsTrigger>
          </TabsList>

          <TabsContent value="prep">
            <PreEventAssistant eventId={eventId} />
          </TabsContent>

          <TabsContent value="live">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card className="p-6 border-0 shadow-lg">
                  <h3 className="font-bold text-lg mb-4">Live Participant Feed</h3>
                  <div className="space-y-3">
                    {participations.slice(0, 10).map((p, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-200 flex items-center justify-center font-bold text-indigo-700">
                            {p.participant_name?.charAt(0)}
                          </div>
                          <span className="font-medium">{p.participant_name}</span>
                        </div>
                        <Badge variant={p.attended ? 'default' : 'outline'}>
                          {p.attended ? 'Active' : 'RSVP'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              <div>
                <RealTimeTips eventId={eventId} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tools">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SessionTimer />
              <LiveAnnouncements eventId={eventId} />
            </div>
          </TabsContent>

          <TabsContent value="polls">
            <LivePollCreator eventId={eventId} />
          </TabsContent>

          <TabsContent value="recap">
            <PostEventRecap eventId={eventId} />
          </TabsContent>
          </Tabs>
      </div>
    </div>
  );
}