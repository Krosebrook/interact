import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Calendar, Trophy, Target, Lightbulb, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import LoadingSpinner from '../common/LoadingSpinner';
import { toast } from 'sonner';

export default function PersonalizedRecommendations({ userEmail }) {
  const [refreshing, setRefreshing] = useState(false);
  
  const { data: recommendations, isLoading, refetch } = useQuery({
    queryKey: ['recommendations', userEmail],
    queryFn: async () => {
      const response = await base44.functions.invoke('personalizedRecommendations', { userEmail });
      return response.data.recommendations;
    },
    enabled: !!userEmail,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
  
  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
    toast.success('Recommendations updated!');
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8">
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-int-orange" />
            Personalized For You
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? <LoadingSpinner size="small" /> : 'Refresh'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Recommended Events */}
        {recommendations?.events?.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-4 w-4 text-blue-600" />
              <h4 className="font-semibold">Events You'll Love</h4>
            </div>
            <div className="space-y-2">
              {recommendations.events.slice(0, 3).map((rec, i) => (
                <div key={i} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start justify-between mb-1">
                    <p className="font-medium text-sm">{rec.event?.title}</p>
                    <Badge className="bg-blue-600">
                      {Math.round(rec.match_score * 100)}% match
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600 mb-2">{rec.reason}</p>
                  <Link to={createPageUrl('Calendar')}>
                    <Button size="sm" variant="outline" className="w-full">
                      View Event
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Recommended Challenges */}
        {recommendations?.challenges?.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="h-4 w-4 text-int-orange" />
              <h4 className="font-semibold">Challenges For You</h4>
            </div>
            <div className="space-y-2">
              {recommendations.challenges.slice(0, 2).map((rec, i) => (
                <div key={i} className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-start justify-between mb-1">
                    <p className="font-medium text-sm">{rec.challenge?.title}</p>
                    <Badge className="bg-int-orange">
                      {Math.round(rec.match_score * 100)}% match
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600 mb-2">{rec.reason}</p>
                  <Link to={createPageUrl('TeamChallenges')}>
                    <Button size="sm" variant="outline" className="w-full">
                      Join Challenge
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Suggested Goals */}
        {recommendations?.goals?.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Target className="h-4 w-4 text-green-600" />
              <h4 className="font-semibold">Suggested Goals</h4>
            </div>
            <div className="space-y-2">
              {recommendations.goals.slice(0, 2).map((goal, i) => (
                <div key={i} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="font-medium text-sm mb-1">{goal.title}</p>
                  <p className="text-xs text-slate-600 mb-2">{goal.reasoning}</p>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="capitalize">{goal.category}</span>
                    <span>•</span>
                    <span>Target: {goal.target_value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Engagement Insights */}
        {recommendations?.insights?.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              <h4 className="font-semibold">Engagement Insights</h4>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <ul className="space-y-1">
                {recommendations.insights.slice(0, 3).map((insight, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-purple-900">
                    <Lightbulb className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    {insight}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}