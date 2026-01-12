import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Bell, Layout, Target, Award, TrendingUp, CheckCircle } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function AIPersonalizationSuggestions({ userEmail, profile, userPoints, onApplySuggestion }) {
  const { data: suggestions, isLoading } = useQuery({
    queryKey: ['personalization-suggestions', userEmail],
    queryFn: async () => {
      const response = await base44.functions.invoke('gamificationPersonalizationAI', {
        action: 'suggest_customizations',
        context: {}
      });
      return response.data.suggestions;
    },
    enabled: !!userEmail,
    staleTime: 5 * 60 * 1000
  });

  if (isLoading) {
    return <LoadingSpinner message="Analyzing your activity..." />;
  }

  if (!suggestions) return null;

  return (
    <div className="space-y-6" data-b44-sync="true" data-feature="profile" data-component="aipersonalizationsuggestions">
      {/* Personalized Message */}
      {suggestions.personalized_message && (
        <Card className="bg-gradient-to-br from-purple-600 to-pink-600 text-white border-0">
          <CardContent className="py-6">
            <p className="text-center font-medium">{suggestions.personalized_message}</p>
          </CardContent>
        </Card>
      )}

      {/* Notification Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-blue-600" />
            Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-600">{suggestions.notification_recommendations?.reasoning}</p>
          <Button
            onClick={() => {
              onApplySuggestion({ 
                notification_preferences: suggestions.notification_recommendations?.suggested_settings 
              });
              toast.success('Notification preferences applied!');
            }}
            className="w-full"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Apply Recommended Settings
          </Button>
        </CardContent>
      </Card>

      {/* Widget Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layout className="h-5 w-5 text-purple-600" />
            Dashboard Widgets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {suggestions.widget_recommendations?.map((widget, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border"
              >
                <Layout className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h5 className="font-semibold text-sm">{widget.widget_name}</h5>
                    <Badge variant="outline" className={
                      widget.priority === 'high' ? 'border-red-300 text-red-700' :
                      widget.priority === 'medium' ? 'border-yellow-300 text-yellow-700' :
                      'border-slate-300'
                    }>
                      {widget.priority}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600">{widget.reason}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Goal Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-emerald-600" />
            Recommended Goals
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-emerald-700">
                {suggestions.goal_recommendations?.weekly_points_target}
              </p>
              <p className="text-xs text-slate-600 mt-1">Weekly Points Target</p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-purple-700 capitalize">
                {suggestions.goal_recommendations?.tier_goal}
              </p>
              <p className="text-xs text-slate-600 mt-1">Target Tier</p>
            </div>
          </div>
          <p className="text-sm text-slate-600">{suggestions.goal_recommendations?.rationale}</p>
          <Button
            onClick={() => {
              onApplySuggestion({
                gamification_goals: {
                  weekly_points_target: suggestions.goal_recommendations?.weekly_points_target,
                  tier_goal: suggestions.goal_recommendations?.tier_goal,
                  timeline: suggestions.goal_recommendations?.timeline
                }
              });
              toast.success('Goals set!');
            }}
            variant="outline"
            className="w-full"
          >
            Set These Goals
          </Button>
        </CardContent>
      </Card>

      {/* Flair Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-600" />
            Profile Flair Options
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {suggestions.flair_recommendations?.slice(0, 4).map((flair, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg border ${
                  flair.is_unlocked ? 'bg-white border-emerald-200' : 'bg-slate-50 border-slate-200 opacity-60'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className={`h-4 w-4 ${flair.is_unlocked ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span className="text-sm font-semibold">{flair.name}</span>
                </div>
                <p className="text-xs text-slate-600 mb-2">{flair.unlock_criteria}</p>
                {flair.is_unlocked && (
                  <Badge className="bg-emerald-100 text-emerald-800 text-xs">Unlocked</Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Engagement Boosters */}
      {suggestions.engagement_boosters?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-int-orange" />
              Boost Your Engagement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {suggestions.engagement_boosters.map((booster, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-orange-50 border border-orange-200">
                  <TrendingUp className="h-5 w-5 text-int-orange mt-0.5 flex-shrink-0" />
                  <div>
                    <h5 className="font-semibold text-sm text-slate-900">{booster.feature}</h5>
                    <p className="text-xs text-slate-600 mt-1">{booster.description}</p>
                    <p className="text-xs text-int-orange font-medium mt-1">
                      💪 {booster.expected_impact}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}