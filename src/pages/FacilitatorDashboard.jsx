import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import FacilitatorSupportChat from '../components/facilitator/FacilitatorSupportChat';
import { 
  Calendar, 
  Users, 
  Clock, 
  TrendingUp, 
  Bell, 
  FileText, 
  Zap,
  Send,
  Download,
  ExternalLink,
  Activity,
  MessageSquare,
  CheckCircle
} from 'lucide-react';
import { format, isToday, isTomorrow, addDays } from 'date-fns';
import { toast } from 'sonner';

export default function FacilitatorDashboard() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [showSupport, setShowSupport] = useState(false);

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

  const { data: events = [] } = useQuery({
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
  const now = new Date();
  const upcomingEvents = events.filter(e => 
    e.status === 'scheduled' && new Date(e.scheduled_date) > now
  ).slice(0, 10);

  const todayEvents = upcomingEvents.filter(e => isToday(new Date(e.scheduled_date)));
  const tomorrowEvents = upcomingEvents.filter(e => isTomorrow(new Date(e.scheduled_date)));
  const thisWeekEvents = upcomingEvents.filter(e => {
    const eventDate = new Date(e.scheduled_date);
    return eventDate <= addDays(now, 7) && !isToday(eventDate) && !isTomorrow(eventDate);
  });

  const getParticipationData = (eventId) => {
    const participations = allParticipations.filter(p => p.event_id === eventId);
    const attended = participations.filter(p => p.attended).length;
    const avgEngagement = participations.filter(p => p.engagement_score).length > 0
      ? participations.reduce((sum, p) => sum + (p.engagement_score || 0), 0) / participations.filter(p => p.engagement_score).length
      : 0;
    
    return { total: participations.length, attended, avgEngagement };
  };

  const EventCard = ({ event, timeCategory }) => {
    const activity = activities.find(a => a.id === event.activity_id);
    const { total, attended, avgEngagement } = getParticipationData(event.id);
    const eventDate = new Date(event.scheduled_date);
    const isLive = event.status === 'in_progress';

    return (
      <Card className="p-4 border-0 shadow-md hover:shadow-lg transition-all">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-bold text-lg">{event.title}</h3>
              {isLive && (
                <Badge className="bg-red-600 animate-pulse">LIVE</Badge>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-600 mb-2">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {format(eventDate, 'h:mm a')}
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {total} RSVPs
              </div>
            </div>
            <Badge variant="outline">{activity?.type}</Badge>
          </div>
        </div>

        {/* Engagement Metrics */}
        <div className="grid grid-cols-3 gap-2 mb-3 p-3 bg-slate-50 rounded-lg">
          <div className="text-center">
            <div className="text-xs text-slate-600">RSVPs</div>
            <div className="text-lg font-bold text-indigo-600">{total}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-slate-600">Attended</div>
            <div className="text-lg font-bold text-emerald-600">{attended}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-slate-600">Engagement</div>
            <div className="text-lg font-bold text-purple-600">
              {avgEngagement > 0 ? avgEngagement.toFixed(1) : '-'}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2">
          <Link to={`${createPageUrl('FacilitatorView')}?event=${event.id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              <ExternalLink className="h-3 w-3 mr-1" />
              Facilitate
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={() => sendReminderMutation.mutate(event.id)}
            disabled={sendReminderMutation.isLoading}
          >
            <Bell className="h-3 w-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => downloadCalendarMutation.mutate(event.id)}
            disabled={downloadCalendarMutation.isLoading}
          >
            <Download className="h-3 w-3" />
          </Button>
        </div>
      </Card>
    );
  };

  if (!user) {
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
              <EventCard key={event.id} event={event} timeCategory="today" />
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
              <EventCard key={event.id} event={event} timeCategory="tomorrow" />
            ))}
          </div>
        </div>
      )}

      {thisWeekEvents.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">This Week</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {thisWeekEvents.map(event => (
              <EventCard key={event.id} event={event} timeCategory="week" />
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

      {/* Support Chat Sidebar */}
      {showSupport && (
        <FacilitatorSupportChat onClose={() => setShowSupport(false)} />
      )}
    </div>
  );
}