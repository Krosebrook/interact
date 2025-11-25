import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FacilitatorSupportChat from '../components/facilitator/FacilitatorSupportChat';
import FacilitatorEventCard from '../components/events/FacilitatorEventCard';
import TemplateAnalytics from '../components/facilitator/TemplateAnalytics';
import FacilitatorAgentChat from '../components/facilitator/FacilitatorAgentChat';
import ReactiveEventList from '../components/dashboard/ReactiveEventList';
import QuickActionsPanel from '../components/dashboard/QuickActionsPanel';
import LiveEventsBanner from '../components/dashboard/LiveEventsBanner';
import CompletedEventsList from '../components/dashboard/CompletedEventsList';
import ActivityGenerator from '../components/ai/ActivityGenerator';
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
  MessageSquare,
  Bot,
  LayoutDashboard,
  BarChart3
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function FacilitatorDashboard() {
  const queryClient = useQueryClient();
  const { user, loading: userLoading } = useAuth(true);
  const { events, activities, participations, isLoading } = useEventData();
  const [showSupport, setShowSupport] = useState(false);
  const [showAgentChat, setShowAgentChat] = useState(false);
  const [showActivityGenerator, setShowActivityGenerator] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

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

  const handleEventAction = (action, event) => {
    if (action === 'remind') {
      sendReminderMutation.mutate(event.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Facilitator Dashboard</h1>
          <p className="text-slate-600">Welcome back, {user?.full_name?.split(' ')[0] || 'Facilitator'}</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowAgentChat(!showAgentChat)}
            variant="outline"
            className="gap-2"
          >
            <Bot className="h-4 w-4" />
            AI Assistant
          </Button>
          <Link to={createPageUrl('Calendar')}>
            <Button className="bg-int-orange hover:bg-[#C46322]">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Event
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Live Events Banner */}
      <LiveEventsBanner events={events} participations={participations} />

      {/* Quick Actions */}
      <QuickActionsPanel 
        onOpenAgentChat={() => setShowAgentChat(true)}
        onOpenActivityGenerator={() => setShowActivityGenerator(true)}
      />

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="p-5 border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="h-6 w-6 opacity-80" />
              <Badge className="bg-white/20 text-white border-0 text-xs">Today</Badge>
            </div>
            <div className="text-3xl font-bold">{todayEvents.length}</div>
            <div className="text-sm opacity-80">Events today</div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className="p-5 border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="h-6 w-6 opacity-80" />
              <Badge className="bg-white/20 text-white border-0 text-xs">Tomorrow</Badge>
            </div>
            <div className="text-3xl font-bold">{tomorrowEvents.length}</div>
            <div className="text-sm opacity-80">Events tomorrow</div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="p-5 border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
            <div className="flex items-center justify-between mb-2">
              <Users className="h-6 w-6 opacity-80" />
              <Badge className="bg-white/20 text-white border-0 text-xs">Week</Badge>
            </div>
            <div className="text-3xl font-bold">{thisWeekEvents.length}</div>
            <div className="text-sm opacity-80">This week</div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card className="p-5 border-0 shadow-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <div className="flex items-center justify-between mb-2">
              <Activity className="h-6 w-6 opacity-80" />
              <Badge className="bg-white/20 text-white border-0 text-xs">Total</Badge>
            </div>
            <div className="text-3xl font-bold">{upcomingEvents.length}</div>
            <div className="text-sm opacity-80">Upcoming</div>
          </Card>
        </motion.div>
      </div>

      {/* Tabbed Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-slate-100">
          <TabsTrigger value="overview" className="gap-2">
            <LayoutDashboard className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upcoming Events */}
            <ReactiveEventList
              events={upcomingEvents}
              activities={activities}
              participations={participations}
              title="Upcoming Events"
              emptyMessage="No upcoming events scheduled"
              onEventAction={handleEventAction}
              maxItems={5}
            />

            {/* Completed Events with AI Summary */}
            <CompletedEventsList
              events={events}
              activities={activities}
              participations={participations}
            />
          </div>

          {upcomingEvents.length === 0 && (
            <Card className="p-12 text-center border-2 border-dashed">
              <Calendar className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">No Upcoming Events</h3>
              <p className="text-slate-600 mb-6">Schedule your first event to get started</p>
              <Link to={createPageUrl('Calendar')}>
                <Button className="bg-int-orange hover:bg-[#C46322]">
                  Schedule Event
                </Button>
              </Link>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analytics">
          <TemplateAnalytics />
        </TabsContent>
      </Tabs>

      {/* AI Agent Chat */}
      {showAgentChat && (
        <FacilitatorAgentChat onClose={() => setShowAgentChat(false)} />
      )}

      {/* Activity Generator */}
      <ActivityGenerator 
        open={showActivityGenerator}
        onClose={() => setShowActivityGenerator(false)}
      />

      {/* Support Chat Sidebar */}
      {showSupport && (
        <FacilitatorSupportChat onClose={() => setShowSupport(false)} />
      )}
    </div>
  );
}