import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  Sparkles, 
  Calendar,
  Users,
  TrendingUp,
  Lightbulb,
  Target,
  Zap,
  Clock,
  MapPin,
  Star,
  RefreshCw,
  ChevronRight,
  Wand2,
  History,
  Settings
} from 'lucide-react';
import { useUserData } from '../components/hooks/useUserData';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { StatCard } from '../components/common/StatsGrid';
import AIEventSuggestionEngine from '../components/ai/AIEventSuggestionEngine';
import SmartSchedulingAssistant from '../components/ai/SmartSchedulingAssistant';
import TeamInsightsPanel from '../components/ai/TeamInsightsPanel';
import EventHistoryAnalyzer from '../components/ai/EventHistoryAnalyzer';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';

export default function AIEventPlanner() {
  const { user, loading: userLoading, isAdmin } = useUserData(true, true);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('suggestions');

  const { data: events = [] } = useQuery({
    queryKey: ['events'],
    queryFn: () => base44.entities.Event.list('-scheduled_date', 100)
  });

  const { data: participations = [] } = useQuery({
    queryKey: ['participations'],
    queryFn: () => base44.entities.Participation.list('-created_date', 500)
  });

  const { data: feedbackAnalyses = [] } = useQuery({
    queryKey: ['feedback-analyses'],
    queryFn: () => base44.entities.FeedbackAnalysis.list('-analysis_date', 20)
  });

  const { data: aiRecommendations = [] } = useQuery({
    queryKey: ['ai-recommendations'],
    queryFn: () => base44.entities.AIRecommendation.list('-created_date', 50)
  });

  // Calculate AI metrics
  const totalSuggestions = aiRecommendations.length;
  const acceptedSuggestions = aiRecommendations.filter(r => r.status === 'accepted').length;
  const acceptanceRate = totalSuggestions > 0 ? Math.round((acceptedSuggestions / totalSuggestions) * 100) : 0;
  const avgSentiment = feedbackAnalyses.length > 0 
    ? (feedbackAnalyses.reduce((sum, fa) => sum + (fa.overall_sentiment_score || 0), 0) / feedbackAnalyses.length).toFixed(2)
    : 'N/A';

  const handleEventCreated = (event) => {
    toast.success('Event scheduled successfully!');
    navigate(createPageUrl('Calendar'));
  };

  if (userLoading) {
    return <LoadingSpinner className="min-h-[60vh]" message="Loading AI planner..." />;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="glass-panel-solid relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-pink-500/10 pointer-events-none" />
        <div className="relative flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex items-center gap-4">
            <motion.div 
              className="p-4 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 shadow-xl"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <Brain className="h-8 w-8 text-white" />
            </motion.div>
            <div>
              <h1 className="text-3xl font-bold text-int-navy font-display">
                <span className="text-gradient-purple">AI Event Planner</span>
              </h1>
              <p className="text-slate-600">Smart recommendations powered by team insights</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-gradient-purple text-white px-4 py-2">
              <Sparkles className="h-4 w-4 mr-2" />
              AI-Powered
            </Badge>
          </div>
        </div>
      </div>

      {/* AI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="AI Suggestions" 
          value={totalSuggestions} 
          subtitle="Generated recommendations"
          icon={Lightbulb} 
          color="purple" 
          delay={0}
        />
        <StatCard 
          title="Acceptance Rate" 
          value={`${acceptanceRate}%`} 
          subtitle="Suggestions used"
          icon={Target} 
          color="green" 
          delay={0.1}
        />
        <StatCard 
          title="Events Analyzed" 
          value={feedbackAnalyses.length} 
          subtitle="Feedback processed"
          icon={TrendingUp} 
          color="orange" 
          delay={0.2}
        />
        <StatCard 
          title="Avg Sentiment" 
          value={avgSentiment} 
          subtitle="Feedback score"
          icon={Star} 
          color="competitive" 
          delay={0.3}
        />
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white border shadow-sm flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="suggestions" className="data-[state=active]:bg-gradient-purple data-[state=active]:text-white">
            <Sparkles className="h-4 w-4 mr-2" />
            Smart Suggestions
          </TabsTrigger>
          <TabsTrigger value="scheduling" className="data-[state=active]:bg-gradient-orange data-[state=active]:text-white">
            <Calendar className="h-4 w-4 mr-2" />
            Scheduling Assistant
          </TabsTrigger>
          <TabsTrigger value="insights" className="data-[state=active]:bg-gradient-navy data-[state=active]:text-white">
            <Users className="h-4 w-4 mr-2" />
            Team Insights
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-gradient-wellness data-[state=active]:text-white">
            <History className="h-4 w-4 mr-2" />
            Event History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="suggestions" className="mt-6">
          <AIEventSuggestionEngine onEventCreated={handleEventCreated} />
        </TabsContent>

        <TabsContent value="scheduling" className="mt-6">
          <SmartSchedulingAssistant onEventCreated={handleEventCreated} />
        </TabsContent>

        <TabsContent value="insights" className="mt-6">
          <TeamInsightsPanel />
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <EventHistoryAnalyzer />
        </TabsContent>
      </Tabs>
    </div>
  );
}