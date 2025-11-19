import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from '@/components/ui/button';
import StatsCard from '../components/dashboard/StatsCard';
import EventCalendarCard from '../components/events/EventCalendarCard';
import AISuggestionsWidget from '../components/ai/AISuggestionsWidget';
import ActivityGenerator from '../components/ai/ActivityGenerator';
import { 
  Calendar, 
  Users, 
  Sparkles, 
  TrendingUp, 
  Plus,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showGenerator, setShowGenerator] = useState(false);

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
  }, []);

  const { data: events = [], isLoading: eventsLoading } = useQuery({
    queryKey: ['events'],
    queryFn: () => base44.entities.Event.list('-scheduled_date', 50)
  });

  const { data: activities = [] } = useQuery({
    queryKey: ['activities'],
    queryFn: () => base44.entities.Activity.list()
  });

  const { data: allParticipations = [] } = useQuery({
    queryKey: ['participations'],
    queryFn: () => base44.entities.Participation.list()
  });

  // Calculate stats
  const upcomingEvents = events.filter(e => 
    e.status === 'scheduled' && new Date(e.scheduled_date) > new Date()
  );
  
  const completedThisMonth = events.filter(e => {
    const eventDate = new Date(e.scheduled_date);
    const now = new Date();
    return e.status === 'completed' && 
           eventDate.getMonth() === now.getMonth() &&
           eventDate.getFullYear() === now.getFullYear();
  }).length;

  const avgParticipation = events.length > 0 
    ? Math.round(allParticipations.length / events.length)
    : 0;

  const getParticipantCount = (eventId) => {
    return allParticipations.filter(p => p.event_id === eventId).length;
  };

  const handleCopyLink = (event) => {
    const link = `${window.location.origin}${createPageUrl('ParticipantEvent')}?event=${event.magic_link || event.id}`;
    navigator.clipboard.writeText(link);
    toast.success('Magic link copied to clipboard!');
  };

  const handleCancelEvent = async (event) => {
    await base44.entities.Event.update(event.id, { status: 'cancelled' });
    toast.success('Event cancelled');
  };

  const handleScheduleActivity = (activity) => {
    navigate(`${createPageUrl('Calendar')}?activity=${activity.id}`);
  };

  const handleActivityCreated = (activity) => {
    handleScheduleActivity(activity);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Welcome back, {user.full_name}! 👋
          </h1>
          <p className="text-slate-600">
            Here's what's happening with your team activities
          </p>
        </div>
        <div className="flex gap-3">
          <Link to={createPageUrl('Activities')}>
            <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg">
              <Sparkles className="h-4 w-4 mr-2" />
              Browse Activities
            </Button>
          </Link>
          <Link to={createPageUrl('Calendar')}>
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Event
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Upcoming Events"
          value={upcomingEvents.length}
          subtitle="Scheduled activities"
          icon={Calendar}
          color="indigo"
        />
        <StatsCard
          title="Total Activities"
          value={activities.length}
          subtitle="In your library"
          icon={Sparkles}
          color="coral"
        />
        <StatsCard
          title="This Month"
          value={completedThisMonth}
          subtitle="Events completed"
          icon={TrendingUp}
          color="mint"
          trend="+12% from last month"
        />
        <StatsCard
          title="Avg Participation"
          value={avgParticipation}
          subtitle="People per event"
          icon={Users}
          color="sky"
        />
      </div>

      {/* Upcoming Events */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Upcoming Events</h2>
            <p className="text-slate-600 text-sm mt-1">Your next scheduled activities</p>
          </div>
          <Link to={createPageUrl('Calendar')}>
            <Button variant="ghost" className="text-indigo-600 hover:text-indigo-700">
              View All <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>

        {eventsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-slate-100 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : upcomingEvents.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-slate-300">
            <Calendar className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No upcoming events</h3>
            <p className="text-slate-600 mb-4">Get started by scheduling your first activity</p>
            <Link to={createPageUrl('Calendar')}>
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                <Plus className="h-4 w-4 mr-2" />
                Schedule Event
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.slice(0, 6).map(event => {
              const activity = activities.find(a => a.id === event.activity_id);
              return (
                <EventCalendarCard
                  key={event.id}
                  event={event}
                  activity={activity}
                  participantCount={getParticipantCount(event.id)}
                  onView={(e) => {/* TODO: implement view */}}
                  onCopyLink={handleCopyLink}
                  onCancel={handleCancelEvent}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* AI Suggestions */}
      <AISuggestionsWidget 
        onScheduleActivity={handleScheduleActivity}
        onGenerateCustom={() => setShowGenerator(true)}
      />

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to={createPageUrl('Activities')} className="group">
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-6 text-white hover:shadow-xl transition-shadow">
            <Sparkles className="h-8 w-8 mb-3" />
            <h3 className="text-lg font-bold mb-2">Browse Activities</h3>
            <p className="text-indigo-100 text-sm">Explore {activities.length} activity templates</p>
          </div>
        </Link>
        
        <Link to={createPageUrl('Calendar')} className="group">
          <div className="bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl p-6 text-white hover:shadow-xl transition-shadow">
            <Calendar className="h-8 w-8 mb-3" />
            <h3 className="text-lg font-bold mb-2">Schedule Event</h3>
            <p className="text-rose-100 text-sm">Plan your next team activity</p>
          </div>
        </Link>
        
        <Link to={createPageUrl('Analytics')} className="group">
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-6 text-white hover:shadow-xl transition-shadow">
            <TrendingUp className="h-8 w-8 mb-3" />
            <h3 className="text-lg font-bold mb-2">View Analytics</h3>
            <p className="text-emerald-100 text-sm">Track engagement & trends</p>
          </div>
        </Link>
      </div>

      {/* Activity Generator Dialog */}
      <ActivityGenerator
        open={showGenerator}
        onOpenChange={setShowGenerator}
        onActivityCreated={handleActivityCreated}
      />
    </div>
  );
}