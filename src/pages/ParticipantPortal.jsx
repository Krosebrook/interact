import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUserData } from '../components/hooks/useUserData.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import StatsGrid from '../components/common/StatsGrid';
import EmptyState from '../components/common/EmptyState';
import ParticipantEventCard from '../components/participant/ParticipantEventCard';
import PersonalizedRecommendations from '../components/participant/PersonalizedRecommendations';
import PersonalizedCoachWidget from '../components/gamification/PersonalizedCoachWidget';
import StreakTracker from '../components/gamification/StreakTracker';
import FeedbackForm from '../components/participant/FeedbackForm';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Calendar, Sparkles, MessageSquare, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import ErrorBoundary from '../components/common/ErrorBoundary';

export default function ParticipantPortal() {
  const queryClient = useQueryClient();
  // Participant-only portal
  const { user, loading: userLoading, userPoints: myUserPoints } = useUserData(true, false, false, true);
  const [selectedEventForFeedback, setSelectedEventForFeedback] = useState(null);

  const { data: myParticipations = [], isLoading: participationsLoading } = useQuery({
    queryKey: ['my-participations', user?.email],
    queryFn: () => base44.entities.Participation.filter({ participant_email: user.email }),
    enabled: !!user?.email,
    retry: 2,
    staleTime: 30000
  });

  const { data: allEvents = [], isLoading: eventsLoading } = useQuery({
    queryKey: ['events'],
    queryFn: () => base44.entities.Event.list('-scheduled_date', 100),
    enabled: !!user?.email,
    retry: 2,
    staleTime: 60000
  });

  const { data: activities = [], isLoading: activitiesLoading } = useQuery({
    queryKey: ['activities'],
    queryFn: () => base44.entities.Activity.list(),
    enabled: !!user?.email,
    retry: 2,
    staleTime: 300000 // 5 minutes
  });

  const rsvpMutation = useMutation({
    mutationFn: ({ participationId, status }) => 
      base44.entities.Participation.update(participationId, { rsvp_status: status }),
    onMutate: async ({ participationId, status }) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries(['my-participations', user?.email]);
      
      // Snapshot previous value
      const previousParticipations = queryClient.getQueryData(['my-participations', user?.email]);
      
      // Optimistically update
      queryClient.setQueryData(['my-participations', user?.email], (old = []) => 
        old.map(p => p.id === participationId ? { ...p, rsvp_status: status } : p)
      );
      
      return { previousParticipations };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      queryClient.setQueryData(['my-participations', user?.email], context.previousParticipations);
      toast.error('Failed to update RSVP');
    },
    onSuccess: () => {
      toast.success('RSVP updated!');
    },
    onSettled: () => {
      queryClient.invalidateQueries(['my-participations', user?.email]);
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

  const isLoading = userLoading || participationsLoading || eventsLoading || activitiesLoading;

  if (isLoading || !user) {
    return <LoadingSpinner className="min-h-[60vh]" message="Loading your portal..." />;
  }



  return (
    <ErrorBoundary fallbackMessage="Unable to load your portal. Please refresh the page.">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Welcome, {user.full_name}! 👋
          </h1>
          <p className="text-slate-600">Your INTeract engagement hub</p>
        </div>

        {/* Stats Cards */}
        <div className="mb-8">
          <StatsGrid stats={[
            { title: 'Upcoming', value: upcomingEvents.length, icon: Calendar, color: 'navy' },
            { title: 'Past Events', value: pastEvents.length, icon: TrendingUp, color: 'slate' },
            { title: 'Pending Feedback', value: pendingFeedbackEvents.length, icon: MessageSquare, color: 'orange' },
            { title: 'Total Attended', value: myParticipations.filter(p => p.attended).length, icon: Sparkles, color: 'orange' }
          ]} />
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
              <EmptyState
                icon={Calendar}
                title="No upcoming events"
                description="Check back later for new activities!"
              />
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
              <EmptyState
                icon={TrendingUp}
                title="No past events yet"
                description="Your event history will appear here"
              />
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <PersonalizedCoachWidget userEmail={user.email} compact={false} />
                <div className="mt-6">
                  <PersonalizedRecommendations
                    participations={myParticipations}
                    allEvents={allEvents}
                    activities={activities}
                  />
                </div>
              </div>
              <div>
                <StreakTracker 
                  streakDays={myUserPoints?.streak_days || 0}
                  eventsThisMonth={myParticipations.filter(p => {
                    const d = new Date(p.created_date);
                    const now = new Date();
                    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
                  }).length}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="feedback" className="space-y-6">
            {pendingFeedbackEvents.length === 0 ? (
              <EmptyState
                icon={MessageSquare}
                title="All caught up!"
                description="No pending feedback to provide"
              />
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
    </ErrorBoundary>
  );
}