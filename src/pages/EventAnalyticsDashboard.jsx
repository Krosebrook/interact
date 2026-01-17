import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useUserData } from '../components/hooks/useUserData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Calendar,
  ThumbsUp,
  Brain,
  Target,
  Activity,
  Sparkles,
  MessageSquare
} from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import AttendanceChart from '../components/analytics/AttendanceChart';
import ActivityTypeDistribution from '../components/analytics/ActivityTypeDistribution';
import FeedbackSentimentAnalysis from '../components/analytics/FeedbackSentimentAnalysis';
import AISuggestionImpact from '../components/analytics/AISuggestionImpact';
import EngagementTrendChart from '../components/analytics/EngagementTrendChart';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

export default function EventAnalyticsDashboard() {
  const { user, loading } = useUserData(true, true);
  const [timeRange, setTimeRange] = useState('3months');

  // Fetch events
  const { data: events = [], isLoading: eventsLoading } = useQuery({
    queryKey: ['events-analytics'],
    queryFn: () => base44.entities.Event.list('-created_date', 500)
  });

  // Fetch participations
  const { data: participations = [], isLoading: participationsLoading } = useQuery({
    queryKey: ['participations-analytics'],
    queryFn: () => base44.entities.Participation.list('-created_date', 1000)
  });

  // Fetch activities
  const { data: activities = [] } = useQuery({
    queryKey: ['activities-analytics'],
    queryFn: () => base44.entities.Activity.list()
  });

  // Fetch AI recommendations (from AIRecommendation entity if exists, otherwise mock)
  const { data: aiRecommendations = [] } = useQuery({
    queryKey: ['ai-recommendations'],
    queryFn: async () => {
      try {
        return await base44.entities.AIRecommendation.list('-created_date', 200);
      } catch {
        return [];
      }
    }
  });

  // Calculate key metrics
  const metrics = useMemo(() => {
    if (!events.length || !participations.length) return null;

    const completedEvents = events.filter(e => e.status === 'completed');
    const totalAttendance = participations.filter(p => p.attendance_status === 'attended').length;
    const avgAttendanceRate = completedEvents.length > 0
      ? (totalAttendance / completedEvents.length).toFixed(1)
      : 0;

    // Engagement score (based on attendance + feedback)
    const participationsWithFeedback = participations.filter(p => p.feedback_rating);
    const avgFeedbackRating = participationsWithFeedback.length > 0
      ? (participationsWithFeedback.reduce((sum, p) => sum + (p.feedback_rating || 0), 0) / participationsWithFeedback.length).toFixed(1)
      : 0;

    // Popular activity types
    const activityTypeCounts = {};
    completedEvents.forEach(event => {
      const activity = activities.find(a => a.id === event.activity_id);
      if (activity?.type) {
        activityTypeCounts[activity.type] = (activityTypeCounts[activity.type] || 0) + 1;
      }
    });

    const mostPopularType = Object.entries(activityTypeCounts).sort((a, b) => b[1] - a[1])[0];

    // AI suggestion acceptance
    const aiAcceptedCount = aiRecommendations.filter(r => r.status === 'accepted').length;
    const aiAcceptanceRate = aiRecommendations.length > 0
      ? ((aiAcceptedCount / aiRecommendations.length) * 100).toFixed(1)
      : 0;

    return {
      totalEvents: completedEvents.length,
      totalAttendance,
      avgAttendanceRate,
      avgFeedbackRating,
      mostPopularType: mostPopularType?.[0] || 'N/A',
      aiAcceptanceRate,
      feedbackCount: participationsWithFeedback.length
    };
  }, [events, participations, activities, aiRecommendations]);

  if (loading || eventsLoading || participationsLoading) {
    return <LoadingSpinner className="min-h-screen" />;
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <Target className="h-12 w-12 mx-auto mb-4 text-slate-400" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Admin Access Required</h3>
            <p className="text-sm text-slate-600">
              This analytics dashboard is only accessible to administrators.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel-solid border-2 border-purple-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-purple shadow-lg">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-int-navy">Event Analytics Dashboard</h1>
              <p className="text-sm text-slate-600">
                Comprehensive insights into event performance and engagement
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="hover:shadow-lg transition-all border-2 hover:border-purple-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                <Badge variant="outline" className="text-xs">Total</Badge>
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-1">
                {metrics.totalEvents}
              </div>
              <p className="text-sm text-slate-600">Completed Events</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all border-2 hover:border-emerald-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Users className="h-5 w-5 text-emerald-600" />
                <Badge variant="outline" className="text-xs">Avg</Badge>
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-1">
                {metrics.avgAttendanceRate}
              </div>
              <p className="text-sm text-slate-600">Avg Attendance/Event</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all border-2 hover:border-amber-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <ThumbsUp className="h-5 w-5 text-amber-600" />
                <Badge variant="outline" className="text-xs">Rating</Badge>
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-1">
                {metrics.avgFeedbackRating}/5
              </div>
              <p className="text-sm text-slate-600">Avg Feedback Score</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all border-2 hover:border-int-orange/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Brain className="h-5 w-5 text-int-orange" />
                <Badge variant="outline" className="text-xs">AI</Badge>
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-1">
                {metrics.aiAcceptanceRate}%
              </div>
              <p className="text-sm text-slate-600">AI Suggestion Acceptance</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Analytics Tabs */}
      <Tabs defaultValue="attendance" className="space-y-6">
        <TabsList className="bg-white border shadow-sm">
          <TabsTrigger value="attendance">
            <TrendingUp className="h-4 w-4 mr-2" />
            Attendance
          </TabsTrigger>
          <TabsTrigger value="activity-types">
            <Activity className="h-4 w-4 mr-2" />
            Activity Types
          </TabsTrigger>
          <TabsTrigger value="feedback">
            <MessageSquare className="h-4 w-4 mr-2" />
            Feedback
          </TabsTrigger>
          <TabsTrigger value="ai-impact">
            <Sparkles className="h-4 w-4 mr-2" />
            AI Impact
          </TabsTrigger>
          <TabsTrigger value="engagement">
            <Target className="h-4 w-4 mr-2" />
            Engagement
          </TabsTrigger>
        </TabsList>

        {/* Attendance Tab */}
        <TabsContent value="attendance" className="space-y-4">
          <AttendanceChart 
            events={events}
            participations={participations}
          />
        </TabsContent>

        {/* Activity Types Tab */}
        <TabsContent value="activity-types" className="space-y-4">
          <ActivityTypeDistribution
            events={events}
            activities={activities}
            participations={participations}
          />
        </TabsContent>

        {/* Feedback Tab */}
        <TabsContent value="feedback" className="space-y-4">
          <FeedbackSentimentAnalysis
            participations={participations}
            events={events}
          />
        </TabsContent>

        {/* AI Impact Tab */}
        <TabsContent value="ai-impact" className="space-y-4">
          <AISuggestionImpact
            aiRecommendations={aiRecommendations}
            events={events}
          />
        </TabsContent>

        {/* Engagement Tab */}
        <TabsContent value="engagement" className="space-y-4">
          <EngagementTrendChart
            events={events}
            participations={participations}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}