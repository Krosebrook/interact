import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { useUserData } from '../components/hooks/useUserData.jsx';
import { useEventData } from '../components/hooks/useEventData';
import { 
  filterUpcomingEvents, 
  getParticipationStats, 
  getActivityForEvent,
  calculateDashboardStats 
} from '../components/utils/eventUtils';
import { Button } from '@/components/ui/button';
import StatsGrid, { StatCard } from '../components/common/StatsGrid';
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
  ArrowRight,
  Zap
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  // Admin-only dashboard
  const { user, loading: userLoading, isAdmin } = useUserData(true, true, false, false);
  const { events, activities, participations, isLoading } = useEventData();
  const [showGenerator, setShowGenerator] = useState(false);
  const eventActions = useEventActions();

  // Calculate stats using centralized utility
  const upcomingEvents = filterUpcomingEvents(events);
  const stats = calculateDashboardStats(events, activities, participations);

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
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Header - Glass Panel */}
      <div className="glass-panel-solid relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-int-navy/5 via-transparent to-int-orange/5 pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-int-navy mb-2 font-display">
              Welcome back, <span className="text-gradient-orange">{user.full_name}</span>! 👋
            </h1>
            <p className="text-slate-600 font-medium">
              Here's what's happening with your team activities
            </p>
          </div>
          <div className="flex gap-3">
            <Link to={createPageUrl('Activities')}>
              <Button className="bg-gradient-orange hover:opacity-90 text-white shadow-lg hover:shadow-xl transition-all press-effect">
                <Sparkles className="h-4 w-4 mr-2" />
                Browse Activities
              </Button>
            </Link>
            <Link to={createPageUrl('Calendar')}>
              <Button variant="outline" className="border-int-navy/20 text-int-navy hover:bg-int-navy/5 font-medium">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Event
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Upcoming Events" value={stats.upcomingCount} subtitle="Scheduled activities" icon={Calendar} color="navy" delay={0} />
        <StatCard title="Total Activities" value={stats.activitiesCount} subtitle="In your library" icon={Sparkles} color="orange" delay={0.1} />
        <StatCard title="This Month" value={stats.completedThisMonth} subtitle="Events completed" trend={stats.completedThisMonth > 0 ? `${Math.round((stats.completedThisMonth / Math.max(stats.upcomingCount, 1)) * 100)}% completion rate` : "Let's schedule more!"} icon={TrendingUp} color="green" delay={0.2} />
        <StatCard title="Avg Participation" value={stats.avgParticipation} subtitle="People per event" icon={Users} color="purple" delay={0.3} />
      </div>

      {/* Upcoming Events */}
      <div className="glass-panel-solid">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-int-navy font-display">
              <span className="text-highlight-navy">Upcoming Events</span>
            </h2>
            <p className="text-slate-500 text-sm mt-1">Your next scheduled activities</p>
          </div>
          <Link to={createPageUrl('Calendar')}>
            <Button variant="ghost" className="text-int-orange hover:text-[#C46322] hover:bg-int-orange/10 font-semibold">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                userEmail={user?.email}
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <QuickActionCard 
          title="Browse Activities" 
          subtitle={`Explore ${activities.length} activity templates`}
          icon={Sparkles}
          page="Activities"
          color="orange"
        />
        <QuickActionCard 
          title="Schedule Event" 
          subtitle="Plan your next team activity"
          icon={Calendar}
          page="Calendar"
          color="navy"
        />
        <QuickActionCard 
          title="View Analytics" 
          subtitle="Track engagement & trends"
          icon={TrendingUp}
          page="Analytics"
          color="purple"
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