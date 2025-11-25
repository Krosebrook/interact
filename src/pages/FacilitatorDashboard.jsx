import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import FacilitatorSupportChat from '../components/facilitator/FacilitatorSupportChat';
import FacilitatorEventCard from '../components/events/FacilitatorEventCard';
import TemplateAnalytics from '../components/facilitator/TemplateAnalytics';
import { useAuth } from '../components/hooks/useAuth';
import { useEventData } from '../components/hooks/useEventData';
import { 
  filterUpcomingEvents, 
  filterTodayEvents, 
  filterTomorrowEvents, 
  filterThisWeekEvents,
  getParticipationStats,
  getActivityForEvent
} from '../components/utils/eventUtils';
import { 
  Calendar, 
  Users, 
  TrendingUp, 
  Activity,
  MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';

export default function FacilitatorDashboard() {
  const queryClient = useQueryClient();
  const { user, loading: userLoading } = useAuth(true);
  const { events, activities, participations, isLoading } = useEventData();
  const [showSupport, setShowSupport] = useState(false);

  const sendReminderMutation = useMutation({
    mutationFn: async (eventId) => {
      await base44.functions.invoke('sendTeamsNotification', {
        eventId,
        notificationType: 'reminder'
      });
    },
    onSuccess: () => {
      toast.success('Reminder sent to all participants!');
    }
  });

  const sendRecapMutation = useMutation({
    mutationFn: async (eventId) => {
      await base44.functions.invoke('sendTeamsNotification', {
        eventId,
        notificationType: 'recap'
      });
    },
    onSuccess: () => {
      toast.success('Recap sent!');
    }
  });

  const downloadCalendarMutation = useMutation({
    mutationFn: async (eventId) => {
      const response = await base44.functions.invoke('generateCalendarFile', { eventId });
      return response.data;
    },
    onSuccess: (data) => {
      const blob = new Blob([data], { type: 'text/calendar' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'event.ics';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      toast.success('Calendar file downloaded!');
    }
  });

  // Filter events
  const upcomingEvents = filterUpcomingEvents(events).slice(0, 10);
  const todayEvents = filterTodayEvents(upcomingEvents);
  const tomorrowEvents = filterTomorrowEvents(upcomingEvents);
  const thisWeekEvents = filterThisWeekEvents(upcomingEvents);

  if (userLoading || isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Facilitator Dashboard</h1>
          <p className="text-slate-600">Manage and monitor your team events</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => setShowSupport(!showSupport)}
            variant="outline"
            className="gap-2"
          >
            <MessageSquare className="h-4 w-4" />
            Support Chat
          </Button>
          <Link to={createPageUrl('Calendar')}>
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Event
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="h-8 w-8 opacity-80" />
            <Badge className="bg-white/20 text-white border-0">Today</Badge>
          </div>
          <div className="text-3xl font-bold mb-1">{todayEvents.length}</div>
          <div className="text-sm opacity-90">Events today</div>
        </Card>

        <Card className="p-6 border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="h-8 w-8 opacity-80" />
            <Badge className="bg-white/20 text-white border-0">Tomorrow</Badge>
          </div>
          <div className="text-3xl font-bold mb-1">{tomorrowEvents.length}</div>
          <div className="text-sm opacity-90">Events tomorrow</div>
        </Card>

        <Card className="p-6 border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
          <div className="flex items-center justify-between mb-2">
            <Users className="h-8 w-8 opacity-80" />
            <Badge className="bg-white/20 text-white border-0">Week</Badge>
          </div>
          <div className="text-3xl font-bold mb-1">{thisWeekEvents.length}</div>
          <div className="text-sm opacity-90">This week</div>
        </Card>

        <Card className="p-6 border-0 shadow-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <div className="flex items-center justify-between mb-2">
            <Activity className="h-8 w-8 opacity-80" />
            <Badge className="bg-white/20 text-white border-0">Total</Badge>
          </div>
          <div className="text-3xl font-bold mb-1">{upcomingEvents.length}</div>
          <div className="text-sm opacity-90">Upcoming events</div>
        </Card>
      </div>

      {/* Event Sections */}
      {todayEvents.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Badge className="bg-red-600">TODAY</Badge>
            Today's Events
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {todayEvents.map(event => (
              <FacilitatorEventCard 
                key={event.id}
                event={event}
                activity={getActivityForEvent(event, activities)}
                participationStats={getParticipationStats(event.id, participations)}
                onSendReminder={(id) => sendReminderMutation.mutate(id)}
                onDownloadCalendar={(id) => downloadCalendarMutation.mutate(id)}
                isLoading={sendReminderMutation.isLoading || downloadCalendarMutation.isLoading}
              />
            ))}
          </div>
        </div>
      )}

      {tomorrowEvents.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Badge className="bg-purple-600">TOMORROW</Badge>
            Tomorrow's Events
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tomorrowEvents.map(event => (
              <FacilitatorEventCard 
                key={event.id}
                event={event}
                activity={getActivityForEvent(event, activities)}
                participationStats={getParticipationStats(event.id, participations)}
                onSendReminder={(id) => sendReminderMutation.mutate(id)}
                onDownloadCalendar={(id) => downloadCalendarMutation.mutate(id)}
                isLoading={sendReminderMutation.isLoading || downloadCalendarMutation.isLoading}
              />
            ))}
          </div>
        </div>
      )}

      {thisWeekEvents.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">This Week</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {thisWeekEvents.map(event => (
              <FacilitatorEventCard 
                key={event.id}
                event={event}
                activity={getActivityForEvent(event, activities)}
                participationStats={getParticipationStats(event.id, participations)}
                onSendReminder={(id) => sendReminderMutation.mutate(id)}
                onDownloadCalendar={(id) => downloadCalendarMutation.mutate(id)}
                isLoading={sendReminderMutation.isLoading || downloadCalendarMutation.isLoading}
              />
            ))}
          </div>
        </div>
      )}

      {upcomingEvents.length === 0 && (
        <Card className="p-12 text-center border-2 border-dashed">
          <Calendar className="h-16 w-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900 mb-2">No Upcoming Events</h3>
          <p className="text-slate-600 mb-6">Schedule your first event to get started</p>
          <Link to={createPageUrl('Calendar')}>
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              Schedule Event
            </Button>
          </Link>
        </Card>
      )}

      {/* Template Analytics */}
      <TemplateAnalytics />

      {/* Support Chat Sidebar */}
      {showSupport && (
        <FacilitatorSupportChat onClose={() => setShowSupport(false)} />
      )}
    </div>
  );
}