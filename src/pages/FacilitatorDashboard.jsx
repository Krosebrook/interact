import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProtectedRoute from '../components/common/ProtectedRoute';
import LoadingSpinner from '../components/common/LoadingSpinner';
import FacilitatorSupportChat from '../components/facilitator/FacilitatorSupportChat';
import TemplateAnalytics from '../components/facilitator/TemplateAnalytics';
import FacilitatorAgentChat from '../components/facilitator/FacilitatorAgentChat';
import ReactiveEventList from '../components/dashboard/ReactiveEventList';
import QuickActionsPanel from '../components/dashboard/QuickActionsPanel';
import LiveEventsBanner from '../components/dashboard/LiveEventsBanner';
import CompletedEventsList from '../components/dashboard/CompletedEventsList';
import ActivityGenerator from '../components/ai/ActivityGenerator';
import { useUserData } from '../components/hooks/useUserData.jsx';
import { useEventData } from '../components/hooks/useEventData';
import { useEventActions } from '../components/events/useEventActions';
import { 
  filterUpcomingEvents, 
  filterTodayEvents, 
  filterTomorrowEvents, 
  filterThisWeekEvents
} from '../components/utils/eventUtils';
import { 
  Calendar, 
  Users, 
  TrendingUp, 
  Activity,
  Bot,
  LayoutDashboard,
  BarChart3
} from 'lucide-react';
import { motion } from 'framer-motion';
import ErrorBoundary from '../components/common/ErrorBoundary';

function FacilitatorDashboardContent() {
  const { user, isRedirecting } = useUserData(true, false, true, false);
  const { events, activities, participations, isLoading, error } = useEventData();
  const eventActions = useEventActions();
  const [showSupport, setShowSupport] = useState(false);
  const [showAgentChat, setShowAgentChat] = useState(false);
  const [showActivityGenerator, setShowActivityGenerator] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Filter events
  const upcomingEvents = filterUpcomingEvents(events).slice(0, 10);
  const todayEvents = filterTodayEvents(upcomingEvents);
  const tomorrowEvents = filterTomorrowEvents(upcomingEvents);
  const thisWeekEvents = filterThisWeekEvents(upcomingEvents);

  if (isRedirecting || isLoading || !user) {
    return <LoadingSpinner className="min-h-[60vh]" message="Loading dashboard..." />;
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Card className="p-8 max-w-md text-center">
          <h3 className="text-lg font-semibold text-red-600 mb-2">Failed to Load Dashboard</h3>
          <p className="text-slate-600 mb-4">Please try refreshing the page.</p>
          <Button onClick={() => window.location.reload()}>Refresh</Button>
        </Card>
      </div>
    );
  }

  const handleEventAction = (action, event) => {
    if (action === 'remind') {
      eventActions.handleSendReminder(event);
    } else if (action === 'recap') {
      eventActions.handleSendRecap(event);
    } else if (action === 'cancel') {
      eventActions.handleCancelEvent(event);
    }
  };

  return (
    <ErrorBoundary fallbackMessage="Unable to load facilitator dashboard. Please refresh.">
      <div className="space-y-6">
        {/* Header */}
        <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">INTeract Facilitator Dashboard</h1>
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
    </ErrorBoundary>
  );
}

export default function FacilitatorDashboard() {
  return (
    <ProtectedRoute requireFacilitator>
      <FacilitatorDashboardContent />
    </ProtectedRoute>
  );
}