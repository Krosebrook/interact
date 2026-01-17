import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, BookOpen, Calendar, Activity, ArrowRight, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import LoadingSpinner from '../common/LoadingSpinner';

export default function ContentRecommendationWidget({ userEmail }) {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['content-recommendations', userEmail],
    queryFn: async () => {
      const response = await base44.functions.invoke('aiContentRecommender', {
        user_email: userEmail
      });
      return response.data;
    },
    enabled: !!userEmail,
    staleTime: 1000 * 60 * 30 // 30 minutes
  });

  if (isLoading) {
    return <LoadingSpinner message="Personalizing your recommendations..." />;
  }

  if (!data?.recommendations) {
    return null;
  }

  const { learning, events, activities, message } = data.recommendations;
  const allRecommendations = [
    ...learning.map(r => ({ ...r, type: 'learning' })),
    ...events.map(r => ({ ...r, type: 'event' })),
    ...activities.map(r => ({ ...r, type: 'activity' }))
  ].sort((a, b) => b.relevance_score - a.relevance_score).slice(0, 6);

  const typeConfig = {
    learning: { icon: BookOpen, color: 'text-purple-600', bgColor: 'bg-purple-50', borderColor: 'border-purple-200' },
    event: { icon: Calendar, color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
    activity: { icon: Activity, color: 'text-emerald-600', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200' }
  };

  return (
    <Card className="border-2 border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-600" />
          Personalized for You
        </CardTitle>
        {message && (
          <p className="text-sm text-slate-600 mt-2">{message}</p>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {allRecommendations.map((rec, idx) => {
            const config = typeConfig[rec.type];
            const Icon = config.icon;
            
            return (
              <div key={idx} className={`p-4 rounded-lg border ${config.borderColor} ${config.bgColor}`}>
                <div className="flex items-start gap-3">
                  <Icon className={`h-5 w-5 ${config.color} flex-shrink-0 mt-0.5`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-sm text-slate-900 line-clamp-1">
                        {rec.title || rec.event_title || rec.activity_title}
                      </h4>
                      <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                        <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                        <span className="text-xs font-bold text-slate-700">{rec.relevance_score}</span>
                      </div>
                    </div>
                    
                    <p className="text-xs text-slate-600 line-clamp-2 mb-2">
                      {rec.description || rec.why_attend || rec.benefit}
                    </p>
                    
                    <div className="flex items-center justify-between mt-2">
                      <Badge variant="outline" className="text-xs capitalize">
                        {rec.match_reason || rec.alignment || 'Recommended'}
                      </Badge>
                      {rec.matched && (
                        <Button size="sm" variant="ghost" className="h-6 text-xs">
                          View <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-4 flex gap-2">
          <Link to={createPageUrl('LearningDashboard')} className="flex-1">
            <Button variant="outline" className="w-full" size="sm">
              <BookOpen className="h-4 w-4 mr-2" />
              Browse Learning
            </Button>
          </Link>
          <Link to={createPageUrl('Calendar')} className="flex-1">
            <Button variant="outline" className="w-full" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              View Events
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}