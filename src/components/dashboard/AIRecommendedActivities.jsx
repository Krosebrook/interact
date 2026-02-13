import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, Clock, Users, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import AIActivityCard from './AIActivityCard';

export default function AIRecommendedActivities({ userEmail }) {
  const { data: recommendations, isLoading } = useQuery({
    queryKey: ['ai-personalized-recommendations', userEmail],
    queryFn: async () => {
      try {
        const response = await base44.functions.invoke('personalizedRecommendations', { 
          userEmail 
        });
        return response.data;
      } catch (error) {
        console.error('AI recommendations error:', error);
        // Fallback to basic activities
        const allActivities = await base44.entities.Activity.list('-popularity_score', 10);
        return {
          success: true,
          recommendations: {
            events: [],
            challenges: [],
            goals: [],
            insights: []
          },
          fallbackActivities: allActivities.slice(0, 3)
        };
      }
    },
    staleTime: 300000, // 5 minutes
    refetchInterval: 600000 // 10 minutes
  });

  const activities = recommendations?.fallbackActivities || [];

  const { data: events = [] } = useQuery({
    queryKey: ['upcoming-events-featured'],
    queryFn: () => base44.entities.Event.filter({ status: 'scheduled' }).then(e => 
      e.sort((a, b) => new Date(a.scheduled_date) - new Date(b.scheduled_date)).slice(0, 3)
    )
  });

  const categoryIcons = {
    icebreaker: '🎯',
    creative: '🎨',
    competitive: '🏆',
    wellness: '🧘',
    learning: '📚',
    social: '🎉'
  };

  const categoryColors = {
    icebreaker: 'bg-blue-100 text-blue-800 border-blue-200',
    creative: 'bg-purple-100 text-purple-800 border-purple-200',
    competitive: 'bg-orange-100 text-orange-800 border-orange-200',
    wellness: 'bg-green-100 text-green-800 border-green-200',
    learning: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    social: 'bg-pink-100 text-pink-800 border-pink-200'
  };

  if (isLoading) return null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          AI Recommended for You
        </h3>
        <Link to={createPageUrl('Activities')}>
          <Button variant="ghost" size="sm" className="text-int-orange hover:text-int-orange-dark font-bold">
            See All
          </Button>
        </Link>
      </div>

      {/* AI Insights Banner */}
      {recommendations?.recommendations?.insights?.length > 0 && (
        <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-200 rounded-xl p-4 mb-4">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-slate-900 mb-1">AI Insight</h4>
              <p className="text-sm text-slate-700">{recommendations.recommendations.insights[0]}</p>
            </div>
          </div>
        </div>
      )}

      {/* Horizontal Scroll Container */}
      <div className="flex overflow-x-auto no-scrollbar gap-4 pb-4 -mx-4 px-4 snap-x">
        {/* AI Recommended Events */}
        {recommendations?.recommendations?.events?.slice(0, 2).map((rec) => (
          <div key={rec.event?.id} className="flex-none w-72 snap-center group">
            <Card className="h-full glass-card hover:shadow-xl transition-all duration-300 border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
              <div className="relative h-36 w-full bg-slate-100 overflow-hidden rounded-t-xl">
                <div className="w-full h-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                  <div className="text-center text-white p-4">
                    <Sparkles className="h-10 w-10 mx-auto mb-2" />
                    <div className="text-sm font-bold">AI Match: {Math.round(rec.match_score * 100)}%</div>
                  </div>
                </div>
                <div className="absolute top-3 left-3">
                  <Badge className="bg-purple-600 text-white border-purple-400 border font-semibold">
                    🎯 Recommended
                  </Badge>
                </div>
              </div>
              <CardContent className="p-4">
                <h4 className="font-bold text-slate-900 mb-2 line-clamp-2">{rec.event?.title}</h4>
                <p className="text-xs text-purple-700 mb-3 line-clamp-2 font-medium">
                  {rec.reason}
                </p>
                <p className="text-sm text-slate-600 mb-3">
                  {new Date(rec.event?.scheduled_date).toLocaleDateString()}
                </p>
                <Link to={createPageUrl('Calendar')}>
                  <Button size="sm" className="w-full bg-purple-600 hover:bg-purple-700">
                    View Event
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        ))}

        {/* Fallback Activities */}
        {activities.map((activity) => (
          <div key={activity.id} className="flex-none w-72 snap-center">
            <AIActivityCard 
              activity={activity}
              points={activity.points_awarded || 10}
              onJoin={() => {}}
            />
          </div>
        ))}

        {/* Featured Events */}
        {events.slice(0, 2).map((event) => (
          <div key={event.id} className="flex-none w-72 snap-center group">
            <Card className="h-full glass-card hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-int-navy/5 to-int-orange/5">
              <div className="relative h-36 w-full bg-slate-100 overflow-hidden rounded-t-xl">
                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <div className="text-center text-white p-4">
                    <div className="text-4xl mb-2">📅</div>
                    <div className="text-sm font-bold">
                      {new Date(event.scheduled_date).toLocaleDateString(undefined, { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                  </div>
                </div>
                <div className="absolute top-3 left-3">
                  <Badge className="bg-purple-100 text-purple-800 border-purple-200 border font-semibold">
                    📆 Event
                  </Badge>
                </div>
              </div>
              <CardContent className="p-4">
                <h4 className="font-bold text-slate-900 mb-2 line-clamp-2">{event.title}</h4>
                <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                  {new Date(event.scheduled_date).toLocaleTimeString(undefined, { 
                    hour: 'numeric', 
                    minute: '2-digit' 
                  })}
                </p>
                <Link to={createPageUrl('Calendar')}>
                  <Button size="sm" className="w-full bg-purple-600 hover:bg-purple-700">
                    View Details
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}