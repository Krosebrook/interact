import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { useUserData } from '../components/hooks/useUserData';
import { useEventData } from '../components/hooks/useEventData';
import { filterUpcomingEvents, getParticipationStats, getActivityForEvent } from '../components/utils/eventFilters';
import { Button } from '@/components/ui/button';
import StatsGrid from '../components/common/StatsGrid';
import SkeletonGrid from '../components/common/SkeletonGrid';
import QuickActionCard from '../components/common/QuickActionCard';
import EventCalendarCard from '../components/events/EventCalendarCard';
import AISuggestionsWidget from '../components/ai/AISuggestionsWidget';
import ActivityGenerator from '../components/ai/ActivityGenerator';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import { useEventActions } from '../components/events/useEventActions';
import { 
  Calendar, 
  Users, 
  Sparkles, 
  TrendingUp, 
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
      <StatsGrid stats={[
        { title: 'Upcoming Events', value: upcomingEvents.length, subtitle: 'Scheduled activities', icon: Calendar, color: 'navy' },
        { title: 'Total Activities', value: activities.length, subtitle: 'In your library', icon: Sparkles, color: 'orange' },
        { title: 'This Month', value: completedThisMonth, subtitle: 'Events completed', trend: completedThisMonth > 0 ? `${Math.round((completedThisMonth / Math.max(upcomingEvents.length, 1)) * 100)}% completion rate` : "Let's schedule more!", icon: TrendingUp, color: 'orange' },
        { title: 'Avg Participation', value: avgParticipation, subtitle: 'People per event', icon: Users, color: 'navy' }
      ]} />

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
          <SkeletonGrid count={3} />
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
        <QuickActionCard 
          title="Browse Activities" 
          subtitle={`Explore ${activities.length} activity templates`}
          icon={Sparkles}
          page="Activities"
          color="navy"
        />
        <QuickActionCard 
          title="Schedule Event" 
          subtitle="Plan your next team activity"
          icon={Calendar}
          page="Calendar"
          color="orange"
        />
        <QuickActionCard 
          title="View Analytics" 
          subtitle="Track engagement & trends"
          icon={TrendingUp}
          page="Analytics"
          color="slate"
        />
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