import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ParticipantEventCard from '../components/participant/ParticipantEventCard';
import PersonalizedRecommendations from '../components/participant/PersonalizedRecommendations';
import PersonalizedCoachWidget from '../components/gamification/PersonalizedCoachWidget';
import FeedbackForm from '../components/participant/FeedbackForm';
import { Calendar, Sparkles, MessageSquare, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export default function ParticipantPortal() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [selectedEventForFeedback, setSelectedEventForFeedback] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        base44.auth.redirectToLogin();
      }
    };
    loadUser();
  }, []);

  const { data: myParticipations = [] } = useQuery({
    queryKey: ['my-participations', user?.email],
    queryFn: () => base44.entities.Participation.filter({ participant_email: user.email }),
    enabled: !!user
  });

  const { data: allEvents = [] } = useQuery({
    queryKey: ['events'],
    queryFn: () => base44.entities.Event.list('-scheduled_date', 100)
  });

  const { data: activities = [] } = useQuery({
    queryKey: ['activities'],
    queryFn: () => base44.entities.Activity.list()
  });

  const rsvpMutation = useMutation({
    mutationFn: ({ participationId, status }) => 
      base44.entities.Participation.update(participationId, { rsvp_status: status }),
    onSuccess: () => {
      queryClient.invalidateQueries(['my-participations']);
      toast.success('RSVP updated!');
    }
  });

  const handleRSVP = (participationId, status) => {
    rsvpMutation.mutate({ participationId, status });
  };

  // Get events I'm participating in
  const myEventIds = myParticipations.map(p => p.event_id);
  const myEvents = allEvents.filter(e => myEventIds.includes(e.id));

  const upcomingEvents = myEvents.filter(e => 
    new Date(e.scheduled_date) > new Date() && e.status !== 'cancelled'
  );

  const pastEvents = myEvents.filter(e => 
    e.status === 'completed' || new Date(e.scheduled_date) <= new Date()
  );

  const pendingFeedbackEvents = pastEvents.filter(e => {
    const participation = myParticipations.find(p => p.event_id === e.id);
    return !participation?.feedback;
  });

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-int-orange"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Welcome, {user.full_name}! 👋
          </h1>
          <p className="text-slate-600">Your personalized event hub</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-white border-0 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Upcoming</p>
                <p className="text-3xl font-bold text-int-navy">{upcomingEvents.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-int-navy" />
            </div>
          </Card>

          <Card className="p-6 bg-white border-0 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Past Events</p>
                <p className="text-3xl font-bold" style={{color: '#4A6070'}}>{pastEvents.length}</p>
              </div>
              <TrendingUp className="h-8 w-8" style={{color: '#4A6070'}} />
            </div>
          </Card>

          <Card className="p-6 bg-white border-0 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Pending Feedback</p>
                <p className="text-3xl font-bold text-int-orange">{pendingFeedbackEvents.length}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-int-orange" />
            </div>
          </Card>

          <Card className="p-6 bg-white border-0 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Total Attended</p>
                <p className="text-3xl font-bold text-int-orange">
                  {myParticipations.filter(p => p.attended).length}
                </p>
              </div>
              <Sparkles className="h-8 w-8 text-int-orange" />
            </div>
          </Card>
        </div>

        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="upcoming">
              Upcoming ({upcomingEvents.length})
            </TabsTrigger>
            <TabsTrigger value="past">
              Past Events ({pastEvents.length})
            </TabsTrigger>
            <TabsTrigger value="recommendations">
              For You
            </TabsTrigger>
            <TabsTrigger value="feedback">
              Feedback ({pendingFeedbackEvents.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-6">
            {upcomingEvents.length === 0 ? (
              <Card className="p-12 text-center border-2 border-dashed">
                <Calendar className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No upcoming events</h3>
                <p className="text-slate-600">Check back later for new activities!</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingEvents.map(event => {
                  const participation = myParticipations.find(p => p.event_id === event.id);
                  const activity = activities.find(a => a.id === event.activity_id);
                  return (
                    <ParticipantEventCard
                      key={event.id}
                      event={event}
                      activity={activity}
                      participation={participation}
                      onRSVP={handleRSVP}
                    />
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-6">
            {pastEvents.length === 0 ? (
              <Card className="p-12 text-center border-2 border-dashed">
                <TrendingUp className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No past events yet</h3>
                <p className="text-slate-600">Your event history will appear here</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pastEvents.map(event => {
                  const participation = myParticipations.find(p => p.event_id === event.id);
                  const activity = activities.find(a => a.id === event.activity_id);
                  return (
                    <ParticipantEventCard
                      key={event.id}
                      event={event}
                      activity={activity}
                      participation={participation}
                      isPast={true}
                      onProvideFeedback={() => setSelectedEventForFeedback({ event, participation })}
                    />
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-6">
            <PersonalizedCoachWidget userEmail={user.email} compact={false} />
            <PersonalizedRecommendations
              participations={myParticipations}
              allEvents={allEvents}
              activities={activities}
            />
          </TabsContent>

          <TabsContent value="feedback" className="space-y-6">
            {pendingFeedbackEvents.length === 0 ? (
              <Card className="p-12 text-center border-2 border-dashed">
                <MessageSquare className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">All caught up!</h3>
                <p className="text-slate-600">No pending feedback to provide</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {pendingFeedbackEvents.map(event => {
                  const participation = myParticipations.find(p => p.event_id === event.id);
                  const activity = activities.find(a => a.id === event.activity_id);
                  return (
                    <Card key={event.id} className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-bold text-lg mb-1">{event.title}</h3>
                          <p className="text-sm text-slate-600">{activity?.type}</p>
                        </div>
                        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                          Feedback Needed
                        </Badge>
                      </div>
                      <Button
                        onClick={() => setSelectedEventForFeedback({ event, participation })}
                        className="w-full bg-int-orange hover:bg-[#C46322] text-white"
                      >
                        Provide Feedback
                      </Button>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Feedback Form Dialog */}
        {selectedEventForFeedback && (
          <FeedbackForm
            event={selectedEventForFeedback.event}
            participation={selectedEventForFeedback.participation}
            onClose={() => setSelectedEventForFeedback(null)}
            onSubmit={() => {
              queryClient.invalidateQueries(['my-participations']);
              setSelectedEventForFeedback(null);
            }}
          />
        )}
      </div>
    </div>
  );
}