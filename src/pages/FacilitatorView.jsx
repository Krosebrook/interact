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
import EventMediaGallery from '../components/events/EventMediaGallery';
import ParticipantManager from '../components/facilitator/ParticipantManager';
import QAModerator from '../components/facilitator/QAModerator';
import RecordingUploader from '../components/facilitator/RecordingUploader';
import CommunicationHub from '../components/facilitator/CommunicationHub';
import AIQAModerator from '../components/facilitator/AIQAModerator';
import AIEventSummarizer from '../components/facilitator/AIEventSummarizer';
import AIBreakoutSuggester from '../components/facilitator/AIBreakoutSuggester';
import AIContentGenerator from '../components/facilitator/AIContentGenerator';
import ParticipantProfilesView from '../components/facilitator/ParticipantProfilesView';
import { Calendar, Users, Clock, ArrowLeft, MessageCircle, Video, Mail, Brain, UserCog } from 'lucide-react';
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
    setEventId(urlParams.get('eventId') || urlParams.get('event'));
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
        <Tabs defaultValue={isCompleted ? 'recap' : isUpcoming ? 'participants' : 'live'} className="w-full">
          <TabsList className="grid w-full grid-cols-5 lg:grid-cols-10 mb-6">
            <TabsTrigger value="participants" className="text-xs">
              <Users className="h-3.5 w-3.5 mr-1 hidden sm:inline" />
              Participants
            </TabsTrigger>
            <TabsTrigger value="profiles" className="text-xs">
              <UserCog className="h-3.5 w-3.5 mr-1 hidden sm:inline" />
              Profiles
            </TabsTrigger>
            <TabsTrigger value="prep" className="text-xs">Pre-Event</TabsTrigger>
            <TabsTrigger value="live" className="text-xs">Live</TabsTrigger>
            <TabsTrigger value="ai" className="text-xs">
              <Brain className="h-3.5 w-3.5 mr-1 hidden sm:inline" />
              AI Tools
            </TabsTrigger>
            <TabsTrigger value="qa" className="text-xs">
              <MessageCircle className="h-3.5 w-3.5 mr-1 hidden sm:inline" />
              Q&A
            </TabsTrigger>
            <TabsTrigger value="tools" className="text-xs">Tools</TabsTrigger>
            <TabsTrigger value="recordings" className="text-xs">
              <Video className="h-3.5 w-3.5 mr-1 hidden sm:inline" />
              Recordings
            </TabsTrigger>
            <TabsTrigger value="comms" className="text-xs">
              <Mail className="h-3.5 w-3.5 mr-1 hidden sm:inline" />
              Comms
            </TabsTrigger>
            <TabsTrigger value="recap" className="text-xs">Recap</TabsTrigger>
          </TabsList>

          {/* Participants Management */}
          <TabsContent value="participants">
            <ParticipantManager eventId={eventId} />
          </TabsContent>

          {/* Participant Profiles */}
          <TabsContent value="profiles">
            <ParticipantProfilesView eventId={eventId} />
          </TabsContent>

          <TabsContent value="prep">
            <PreEventAssistant eventId={eventId} />
          </TabsContent>

          <TabsContent value="live">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card className="p-6 border-0 shadow-lg">
                  <h3 className="font-bold text-lg mb-4">Live Participant Feed</h3>
                  <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {participations.length === 0 ? (
                      <p className="text-center text-slate-500 py-8">No participants yet</p>
                    ) : (
                      participations.map((p, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-200 flex items-center justify-center font-bold text-indigo-700">
                              {p.participant_name?.charAt(0)}
                            </div>
                            <div>
                              <span className="font-medium">{p.participant_name}</span>
                              <p className="text-xs text-slate-500">{p.participant_email}</p>
                            </div>
                          </div>
                          <Badge variant={p.attended ? 'default' : 'outline'}>
                            {p.attended ? 'Active' : 'RSVP'}
                          </Badge>
                        </div>
                      ))
                    )}
                  </div>
                </Card>
                <div className="grid grid-cols-2 gap-4">
                  <SessionTimer />
                  <LiveAnnouncements eventId={eventId} />
                </div>
              </div>
              <div>
                <RealTimeTips eventId={eventId} />
              </div>
            </div>
          </TabsContent>

          {/* AI Tools Tab */}
          <TabsContent value="ai">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AIQAModerator eventId={eventId} eventTitle={event.title} />
              <AIEventSummarizer eventId={eventId} eventTitle={event.title} />
              <AIContentGenerator 
                eventId={eventId} 
                eventTitle={event.title}
                activityType={activity?.type}
              />
              <AIBreakoutSuggester eventId={eventId} eventTitle={event.title} />
            </div>
          </TabsContent>

          {/* Q&A Moderation */}
          <TabsContent value="qa">
            <div className="h-[600px]">
              <QAModerator 
                eventId={eventId} 
                userName={user.full_name}
                userEmail={user.email}
              />
            </div>
          </TabsContent>

          <TabsContent value="tools">
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <LivePollCreator eventId={eventId} />
                <LiveAnnouncements eventId={eventId} />
              </div>
              <EventMediaGallery eventId={eventId} canUpload={true} />
            </div>
          </TabsContent>

          {/* Recordings */}
          <TabsContent value="recordings">
            <RecordingUploader 
              eventId={eventId}
              eventTitle={event.title}
              userEmail={user.email}
            />
          </TabsContent>

          {/* Communications */}
          <TabsContent value="comms">
            <CommunicationHub 
              eventId={eventId}
              eventTitle={event.title}
            />
          </TabsContent>

          <TabsContent value="recap">
            <PostEventRecap eventId={eventId} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}