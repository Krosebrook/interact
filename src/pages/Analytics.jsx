import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StatsCard from '../components/dashboard/StatsCard';
import AttendanceMetrics from '../components/analytics/AttendanceMetrics';
import EngagementOverTime from '../components/analytics/EngagementOverTime';
import ActivityTypeAnalytics from '../components/analytics/ActivityTypeAnalytics';
import SkillDevelopmentCorrelation from '../components/analytics/SkillDevelopmentCorrelation';
import EngagementAnalytics from '../components/analytics/EngagementAnalytics';
import FacilitatorMetrics from '../components/analytics/FacilitatorMetrics';
import AIInsightsPanel from '../components/ai/AIInsightsPanel';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { TrendingUp, Users, Star, Calendar, BarChart3, Target, GraduationCap, Sparkles, Award, Brain } from 'lucide-react';

const COLORS = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];

export default function Analytics() {
  const [user, setUser] = useState(null);

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
    queryFn: () => base44.entities.Event.list()
  });

  const { data: activities = [] } = useQuery({
    queryKey: ['activities'],
    queryFn: () => base44.entities.Activity.list()
  });

  const { data: participations = [] } = useQuery({
    queryKey: ['participations'],
    queryFn: () => base44.entities.Participation.list()
  });

  const { data: userProfiles = [] } = useQuery({
    queryKey: ['user-profiles'],
    queryFn: () => base44.entities.UserProfile.list()
  });

  // Calculate metrics
  const totalEvents = events.length;
  const completedEvents = events.filter(e => e.status === 'completed').length;
  const totalParticipations = participations.filter(p => p.attended).length;
  const avgParticipation = completedEvents > 0 
    ? Math.round(totalParticipations / completedEvents) 
    : 0;

  // Engagement score
  const engagementScores = participations.filter(p => p.engagement_score);
  const avgEngagement = engagementScores.length > 0
    ? (engagementScores.reduce((sum, p) => sum + (p.engagement_score || 0), 0) / engagementScores.length).toFixed(1)
    : 0;

  // Activity type distribution
  const typeDistribution = activities.reduce((acc, activity) => {
    acc[activity.type] = (acc[activity.type] || 0) + 1;
    return acc;
  }, {});

  const typeData = Object.entries(typeDistribution).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value
  }));

  // Monthly event trend
  const monthlyData = events.reduce((acc, event) => {
    const month = new Date(event.scheduled_date).toLocaleDateString('en', { month: 'short' });
    const existing = acc.find(item => item.month === month);
    if (existing) {
      existing.events += 1;
    } else {
      acc.push({ month, events: 1 });
    }
    return acc;
  }, []);

  // Top activities by participation
  const activityParticipation = activities.map(activity => {
    const activityEvents = events.filter(e => e.activity_id === activity.id);
    const participantCount = activityEvents.reduce((sum, event) => {
      return sum + participations.filter(p => p.event_id === event.id && p.attended).length;
    }, 0);
    return {
      name: activity.title.substring(0, 20),
      participants: participantCount,
      events: activityEvents.length
    };
  }).filter(a => a.participants > 0).sort((a, b) => b.participants - a.participants).slice(0, 5);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Analytics Dashboard</h1>
        <p className="text-slate-600">Track engagement, attendance, and skill development insights</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Events"
          value={totalEvents}
          subtitle="All time"
          icon={Calendar}
          color="indigo"
        />
        <StatsCard
          title="Avg Attendance"
          value={avgParticipation}
          subtitle="Per event"
          icon={Users}
          color="coral"
        />
        <StatsCard
          title="Engagement Score"
          value={avgEngagement}
          subtitle="Out of 10"
          icon={Star}
          color="mint"
        />
        <StatsCard
          title="Completion Rate"
          value={`${totalEvents > 0 ? Math.round((completedEvents / totalEvents) * 100) : 0}%`}
          subtitle="Events completed"
          icon={TrendingUp}
          color="sky"
        />
      </div>

      {/* Tabbed Analytics Sections */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-4 lg:grid-cols-7 mb-6">
          <TabsTrigger value="overview" className="text-xs sm:text-sm">
            <BarChart3 className="h-4 w-4 mr-1 hidden sm:inline" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="engagement-detailed" className="text-xs sm:text-sm">
            <Sparkles className="h-4 w-4 mr-1 hidden sm:inline" />
            Engagement
          </TabsTrigger>
          <TabsTrigger value="facilitators" className="text-xs sm:text-sm">
            <Award className="h-4 w-4 mr-1 hidden sm:inline" />
            Facilitators
          </TabsTrigger>
          <TabsTrigger value="attendance" className="text-xs sm:text-sm">
            <Users className="h-4 w-4 mr-1 hidden sm:inline" />
            Attendance
          </TabsTrigger>
          <TabsTrigger value="activities" className="text-xs sm:text-sm">
            <Target className="h-4 w-4 mr-1 hidden sm:inline" />
            Activities
          </TabsTrigger>
          <TabsTrigger value="skills" className="text-xs sm:text-sm">
            <GraduationCap className="h-4 w-4 mr-1 hidden sm:inline" />
            Skills
          </TabsTrigger>
          <TabsTrigger value="ai-insights" className="text-xs sm:text-sm">
            <Brain className="h-4 w-4 mr-1 hidden sm:inline" />
            AI Insights
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="space-y-6">
            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Activity Types */}
              <Card className="p-6 shadow-md border-0">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Activity Types Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={typeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {typeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>

              {/* Monthly Trend */}
              <Card className="p-6 shadow-md border-0">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Monthly Event Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="events" 
                      stroke="#6366f1" 
                      strokeWidth={2}
                      name="Events"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </div>

            {/* Top Activities */}
            <Card className="p-6 shadow-md border-0">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Top Activities by Participation</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={activityParticipation}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="participants" fill="#6366f1" name="Participants" />
                  <Bar dataKey="events" fill="#ec4899" name="Events Held" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Participation Details */}
            <Card className="p-6 shadow-md border-0">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Recent Participation Feedback</h3>
              <div className="space-y-4">
                {participations
                  .filter(p => p.feedback)
                  .slice(0, 5)
                  .map(p => {
                    const event = events.find(e => e.id === p.event_id);
                    return (
                      <div key={p.id} className="border-l-4 border-indigo-500 pl-4 py-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-slate-900">{p.participant_name}</span>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < (p.engagement_score || 0) 
                                    ? 'fill-yellow-400 text-yellow-400' 
                                    : 'text-slate-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-slate-600 mb-1">{p.feedback}</p>
                        <p className="text-xs text-slate-400">{event?.title}</p>
                      </div>
                    );
                  })}
                {participations.filter(p => p.feedback).length === 0 && (
                  <p className="text-slate-500 text-center py-4">No feedback yet</p>
                )}
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Detailed Engagement Tab */}
        <TabsContent value="engagement-detailed">
          <EngagementAnalytics 
            events={events} 
            participations={participations}
            activities={activities}
          />
        </TabsContent>

        {/* Facilitator Metrics Tab */}
        <TabsContent value="facilitators">
          <FacilitatorMetrics 
            events={events} 
            participations={participations}
          />
        </TabsContent>

        {/* Attendance Tab */}
        <TabsContent value="attendance">
          <AttendanceMetrics events={events} participations={participations} />
        </TabsContent>

        {/* Activities Tab */}
        <TabsContent value="activities">
          <ActivityTypeAnalytics 
            activities={activities}
            events={events}
            participations={participations}
          />
        </TabsContent>

        {/* Skills Tab */}
        <TabsContent value="skills">
          <SkillDevelopmentCorrelation 
            participations={participations}
            userProfiles={userProfiles}
            events={events}
            activities={activities}
          />
        </TabsContent>

        {/* AI Insights Tab */}
        <TabsContent value="ai-insights">
          <AIInsightsPanel 
            events={events}
            participations={participations}
            activities={activities}
            userEmail={user?.email}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}