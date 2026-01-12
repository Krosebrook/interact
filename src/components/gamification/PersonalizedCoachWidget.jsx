import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  TrendingUp, 
  Award, 
  Gift,
  Target,
  Zap,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function PersonalizedCoachWidget({ userEmail, compact = false }) {
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: recommendations, isLoading, refetch } = useQuery({
    queryKey: ['personalized-recommendations', userEmail],
    queryFn: async () => {
      const response = await base44.functions.invoke('generatePersonalizedRecommendations');
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!userEmail
  });

  const handleRefresh = async () => {
    setIsGenerating(true);
    try {
      await refetch();
      toast.success('Fresh recommendations generated! 🎯');
    } catch (error) {
      toast.error('Failed to refresh recommendations');
    } finally {
      setIsGenerating(false);
    }
  };

  const getActionIcon = (actionType) => {
    switch (actionType) {
      case 'earn_points': return <Zap data-b44-sync="true" data-feature="gamification" data-component="personalizedcoachwidget" className="h-4 w-4" />;
      case 'earn_badge': return <Award className="h-4 w-4" />;
      case 'redeem_reward': return <Gift className="h-4 w-4" />;
      case 'level_up': return <TrendingUp className="h-4 w-4" />;
      case 'attend_event': return <Target className="h-4 w-4" />;
      case 'maintain_streak': return <Zap className="h-4 w-4" />;
      default: return <Sparkles className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-600" />
            Your Personal Coach
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-slate-100 animate-pulse rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!recommendations?.success) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-600" />
            Your Personal Coach
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-slate-600 mb-4">Unable to load recommendations</p>
            <Button onClick={handleRefresh} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const topRecommendations = compact 
    ? recommendations.recommendations.slice(0, 3) 
    : recommendations.recommendations;

  return (
    <Card className="bg-gradient-to-br from-orange-50 to-slate-50 border-int-orange">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-int-orange" />
            Your Personal Coach
          </CardTitle>
          <Button 
            onClick={handleRefresh} 
            disabled={isGenerating}
            variant="ghost" 
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        {recommendations.motivational_message && (
          <p className="text-sm text-slate-700 mt-2 font-medium">
            {recommendations.motivational_message}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Next Milestone */}
        {recommendations.next_milestone && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-white rounded-lg border-2 border-int-orange shadow-sm"
          >
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-int-navy flex items-center justify-center flex-shrink-0">
                <Target className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-slate-900 mb-1">Next Milestone</h4>
                <p className="text-sm text-slate-700 mb-2">
                  {recommendations.next_milestone.description}
                </p>
                <div className="flex gap-2 text-xs">
                  <Badge variant="outline">
                    {recommendations.next_milestone.points_needed} points needed
                  </Badge>
                  <Badge variant="outline">
                    {recommendations.next_milestone.estimated_time}
                  </Badge>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Recommendations */}
        {topRecommendations.map((rec, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 bg-white rounded-lg border border-slate-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-3">
              <div className="text-2xl">{rec.emoji}</div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="font-semibold text-slate-900">{rec.title}</h4>
                  <Badge className={getPriorityColor(rec.priority)}>
                    {rec.priority}
                  </Badge>
                </div>
                <p className="text-sm text-slate-700 mb-3">{rec.description}</p>
                <div className="flex gap-2 flex-wrap text-xs">
                  <Badge variant="outline" className="flex items-center gap-1">
                    {getActionIcon(rec.action_type)}
                    {rec.action_type.replace('_', ' ')}
                  </Badge>
                  {rec.points_impact > 0 && (
                    <Badge variant="outline">
                      +{rec.points_impact} points
                    </Badge>
                  )}
                  {rec.estimated_effort && (
                    <Badge variant="outline">
                      {rec.estimated_effort}
                    </Badge>
                  )}
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-slate-400 flex-shrink-0" />
            </div>
          </motion.div>
        ))}

        {compact && recommendations.recommendations.length > 3 && (
          <Button variant="outline" className="w-full" size="sm">
            View All Recommendations
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}