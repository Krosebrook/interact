import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { useUserData } from '../components/hooks/useUserData';
import { useEventData } from '../components/hooks/useEventData';
import { filterUpcomingEvents, getParticipationStats, getActivityForEvent } from '../components/utils/eventFilters';
import { Button } from '@/components/ui/button';
import QuickStats from '../components/dashboard/QuickStats';
import EventCalendarCard from '../components/events/EventCalendarCard';
import AISuggestionsWidget from '../components/ai/AISuggestionsWidget';
import ActivityGenerator from '../components/ai/ActivityGenerator';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import PageHeader from '../components/common/PageHeader';
import { useEventActions } from '../components/events/useEventActions';
import { 
  Calendar, 
  Users, 
  Sparkles, 
  TrendingUp, 
  Plus,
  ArrowRight
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, loading: userLoading, isAdmin } = useUserData(true, true);
  const { events, activities, participations, isLoading } = useEventData();
  const [showGenerator, setShowGenerator] = useState(false);
  const eventActions = useEventActions();

  // Calculate stats
  const upcomingEvents = filterUpcomingEvents(events);
  
  const completedThisMonth = events.filter(e => {
    const eventDate = new Date(e.scheduled_date);
    const now = new Date();
    return e.status === 'completed' && 
           eventDate.getMonth() === now.getMonth() &&
           eventDate.getFullYear() === now.getFullYear();
  }).length;

  const avgParticipation = events.length > 0 
    ? Math.round(participations.length / events.length)
    : 0;

  const handleScheduleActivity = (activity) => {
    navigate(`${createPageUrl('Calendar')}?activity=${activity.id}`);
  };

  const handleActivityCreated = (activity) => {
    handleScheduleActivity(activity);
  };

  if (userLoading || isLoading || !user) {
    return <LoadingSpinner className="min-h-[60vh]" />;
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
            <Button className="bg-int-orange hover:bg-[#C46322] text-white shadow-lg">
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
        <QuickStats 
          stats={{ title: 'Upcoming Events', value: upcomingEvents.length, subtitle: 'Scheduled activities' }}
          icon={Calendar}
          color="navy"
        />
        <QuickStats 
          stats={{ title: 'Total Activities', value: activities.length, subtitle: 'In your library' }}
          icon={Sparkles}
          color="orange"
        />
        <QuickStats 
          stats={{ 
            title: 'This Month', 
            value: completedThisMonth, 
            subtitle: 'Events completed',
            trend: completedThisMonth > 0 ? `${Math.round((completedThisMonth / upcomingEvents.length) * 100)}% completion rate` : 'Let\'s schedule more!'
          }}
          icon={TrendingUp}
          color="orange"
        />
        <QuickStats 
          stats={{ title: 'Avg Participation', value: avgParticipation, subtitle: 'People per event' }}
          icon={Users}
          color="navy"
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

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-slate-100 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : upcomingEvents.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No upcoming events"
            description="Get started by scheduling your first activity"
            actionLabel="Schedule Event"
            onAction={() => navigate(createPageUrl('Calendar'))}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.slice(0, 6).map(event => (
              <EventCalendarCard
                key={event.id}
                event={event}
                activity={getActivityForEvent(event, activities)}
                participantCount={getParticipationStats(event.id, participations).total}
                onView={(e) => {/* TODO: implement view */}}
                onCopyLink={eventActions.handleCopyLink}
                onDownloadCalendar={eventActions.handleDownloadCalendar}
                onSendReminder={eventActions.handleSendReminder}
                onSendRecap={eventActions.handleSendRecap}
                onCancel={eventActions.handleCancelEvent}
              />
            ))}
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
          <div className="bg-int-navy rounded-xl p-6 text-white hover:shadow-xl transition-shadow relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-int-orange opacity-20 rounded-full -mr-10 -mt-10"></div>
            <Sparkles className="h-8 w-8 mb-3" />
            <h3 className="text-lg font-bold mb-2">Browse Activities</h3>
            <p className="text-sky-blue-gray text-sm">Explore {activities.length} activity templates</p>
          </div>
        </Link>

        <Link to={createPageUrl('Calendar')} className="group">
          <div className="bg-int-orange rounded-xl p-6 text-white hover:shadow-xl transition-shadow">
            <Calendar className="h-8 w-8 mb-3" />
            <h3 className="text-lg font-bold mb-2">Schedule Event</h3>
            <p className="text-orange-100 text-sm">Plan your next team activity</p>
          </div>
        </Link>

        <Link to={createPageUrl('Analytics')} className="group">
          <div className="bg-[#4A6070] rounded-xl p-6 text-white hover:shadow-xl transition-shadow">
            <TrendingUp className="h-8 w-8 mb-3" />
            <h3 className="text-lg font-bold mb-2">View Analytics</h3>
            <p className="text-slate-200 text-sm">Track engagement & trends</p>
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