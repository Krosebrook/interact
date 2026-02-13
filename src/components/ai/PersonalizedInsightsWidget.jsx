import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  TrendingUp, 
  Target, 
  Award, 
  ChevronRight,
  RefreshCw,
  Brain,
  Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { toast } from 'sonner';
import LoadingSpinner from '../common/LoadingSpinner';

export default function PersonalizedInsightsWidget({ userEmail }) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: insights, isLoading, refetch } = useQuery({
    queryKey: ['ai-personalized-insights', userEmail],
    queryFn: async () => {
      const response = await base44.functions.invoke('personalizedRecommendations', { 
        userEmail 
      });
      return response.data;
    },
    staleTime: 300000, // 5 minutes
    refetchInterval: 600000 // 10 minutes
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    toast.success('Insights refreshed!');
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  if (isLoading) {
    return (
      <Card className="border-2 border-purple-200">
        <CardContent className="p-8 flex items-center justify-center">
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  if (!insights?.success) {
    return null;
  }

  const { recommendations } = insights;

  return (
    <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50/50 to-blue-50/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <Brain className="h-4 w-4 text-white" />
            </div>
            Your AI-Powered Insights
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="text-purple-600 hover:text-purple-700"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Engagement Insights */}
        {recommendations.insights?.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-slate-900 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
              Engagement Analysis
            </h4>
            <div className="space-y-2">
              {recommendations.insights.slice(0, 3).map((insight, idx) => (
                <div key={idx} className="p-3 bg-white rounded-lg border border-purple-200 flex items-start gap-2">
                  <Zap className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-slate-700">{insight}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommended Challenges */}
        {recommendations.challenges?.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                <Award className="h-4 w-4 text-amber-600" />
                Challenges for You
              </h4>
              <Link to={createPageUrl('Challenges')}>
                <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700">
                  See All <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
              </Link>
            </div>
            <div className="space-y-2">
              {recommendations.challenges.slice(0, 2).map((rec) => (
                <div key={rec.challenge?.id} className="p-3 bg-white rounded-lg border border-amber-200 hover:border-amber-400 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <h5 className="font-medium text-slate-900">{rec.challenge?.title}</h5>
                    <Badge variant="outline" className="text-xs">
                      {Math.round(rec.match_score * 100)}% match
                    </Badge>
                  </div>
                  <p className="text-xs text-amber-700 mb-2">{rec.reason}</p>
                  <Link to={createPageUrl('Challenges')}>
                    <Button size="sm" variant="outline" className="w-full border-amber-300 text-amber-700 hover:bg-amber-50">
                      Join Challenge
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Suggested Goals */}
        {recommendations.goals?.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-slate-900 flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-600" />
              Personalized Goals
            </h4>
            <div className="space-y-2">
              {recommendations.goals.slice(0, 3).map((goal, idx) => (
                <div key={idx} className="p-3 bg-white rounded-lg border border-blue-200">
                  <div className="flex items-start justify-between mb-1">
                    <h5 className="font-medium text-slate-900 text-sm">{goal.title}</h5>
                    <Badge variant="outline" className="text-xs capitalize">
                      {goal.category}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600 mb-2">{goal.reasoning}</p>
                  <div className="flex items-center gap-2 text-xs text-blue-700 font-medium">
                    <Target className="h-3 w-3" />
                    Target: {goal.target_value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="pt-2">
          <Link to={createPageUrl('Dashboard')}>
            <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
              <Sparkles className="h-4 w-4 mr-2" />
              Explore More Recommendations
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}