import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProtectedRoute from '../components/common/ProtectedRoute';
import LoadingSpinner from '../components/common/LoadingSpinner';
import AnalyticsHeader from '../components/analytics/AnalyticsHeader';
import AnalyticsOverview from '../components/analytics/AnalyticsOverview';
import { useAnalyticsData } from '../components/analytics/useAnalyticsData';
import { useUserData } from '../components/hooks/useUserData.jsx';
import AttendanceMetrics from '../components/analytics/AttendanceMetrics';
import EngagementOverTime from '../components/analytics/EngagementOverTime';
import ActivityTypeAnalytics from '../components/analytics/ActivityTypeAnalytics';
import SkillDevelopmentCorrelation from '../components/analytics/SkillDevelopmentCorrelation';
import EngagementAnalytics from '../components/analytics/EngagementAnalytics';
import FacilitatorMetrics from '../components/analytics/FacilitatorMetrics';
import AIInsightsPanel from '../components/ai/AIInsightsPanel';
import FeedbackAnalyzer from '../components/analytics/FeedbackAnalyzer';
import { BarChart3, Target, GraduationCap, Sparkles, Award, Brain, MessageSquare, Users } from 'lucide-react';

function AnalyticsContent() {
  const { user } = useUserData(true, true, false, false);
  const {
    events,
    activities,
    participations,
    userProfiles,
    metrics,
    typeDistribution,
    monthlyData,
    activityParticipation,
    recentFeedback,
    isLoading
  } = useAnalyticsData();

  if (isLoading) {
    return <LoadingSpinner className="min-h-[60vh]" message="Loading analytics..." />;
  }

  return (
    <div className="space-y-8">
      <AnalyticsHeader metrics={metrics} />

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-4 lg:grid-cols-8 mb-6">
          <TabsTrigger value="overview" className="text-xs sm:text-sm">
            <BarChart3 className="h-4 w-4 mr-1 hidden sm:inline" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="engagement-detailed" className="text-xs sm:text-sm">
            <Sparkles className="h-4 w-4 mr-1 hidden sm:inline" />
            Engagement
          </TabsTrigger>
          <TabsTrigger value="feedback" className="text-xs sm:text-sm">
            <MessageSquare className="h-4 w-4 mr-1 hidden sm:inline" />
            Feedback AI
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

        <TabsContent value="overview">
          <AnalyticsOverview
            typeDistribution={typeDistribution}
            monthlyData={monthlyData}
            activityParticipation={activityParticipation}
            recentFeedback={recentFeedback}
          />
        </TabsContent>

        <TabsContent value="engagement-detailed">
          <EngagementAnalytics 
            events={events} 
            participations={participations}
            activities={activities}
          />
        </TabsContent>

        <TabsContent value="feedback">
          <FeedbackAnalyzer 
            events={events} 
            participations={participations}
          />
        </TabsContent>

        <TabsContent value="facilitators">
          <FacilitatorMetrics 
            events={events} 
            participations={participations}
          />
        </TabsContent>

        <TabsContent value="attendance">
          <AttendanceMetrics events={events} participations={participations} />
        </TabsContent>

        <TabsContent value="activities">
          <ActivityTypeAnalytics 
            activities={activities}
            events={events}
            participations={participations}
          />
        </TabsContent>

        <TabsContent value="skills">
          <SkillDevelopmentCorrelation 
            participations={participations}
            userProfiles={userProfiles}
            events={events}
            activities={activities}
          />
        </TabsContent>

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

export default function Analytics() {
  return (
    <ProtectedRoute requireAdmin>
      <AnalyticsContent />
    </ProtectedRoute>
  );
}