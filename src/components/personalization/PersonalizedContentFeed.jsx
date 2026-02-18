import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { motion } from 'framer-motion';
import {
  Sparkles,
  TrendingUp,
  Calendar,
  Trophy,
  BookOpen,
  Users,
  ArrowRight,
  Zap,
  Target,
  Lightbulb
} from 'lucide-react';

const ICON_MAP = {
  event: Calendar,
  challenge: Trophy,
  learning: BookOpen,
  activity: Zap,
  team_event: Users,
  team_challenge: Users
};

const TYPE_COLORS = {
  event: 'bg-blue-100 text-blue-700 border-blue-200',
  challenge: 'bg-orange-100 text-orange-700 border-orange-200',
  learning: 'bg-purple-100 text-purple-700 border-purple-200',
  activity: 'bg-green-100 text-green-700 border-green-200'
};

export default function PersonalizedContentFeed({ userEmail, compact = false }) {
  const { data, isLoading } = useQuery({
    queryKey: ['personalized-content', userEmail],
    queryFn: async () => {
      const response = await base44.functions.invoke('generatePersonalizedContent', {});
      return response.data;
    },
    enabled: !!userEmail,
    staleTime: 600000 // 10 minutes
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-slate-200 rounded w-3/4" />
            <div className="h-4 bg-slate-200 rounded w-full" />
            <div className="h-4 bg-slate-200 rounded w-5/6" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const recommendations = data?.recommendations;
  if (!recommendations) return null;

  if (compact) {
    return (
      <Card className="border-2 border-int-orange/30 bg-gradient-to-br from-orange-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-int-orange" />
            Just for You
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recommendations.priority_recommendations?.slice(0, 3).map((rec, idx) => {
            const Icon = ICON_MAP[rec.type] || Sparkles;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-start gap-3 p-3 bg-white rounded-lg border hover:border-int-orange/50 transition-all"
              >
                <Icon className="h-5 w-5 text-int-orange mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm text-slate-900">{rec.title}</h4>
                  <p className="text-xs text-slate-600 mt-1">{rec.reason}</p>
                  <Badge className="mt-2 text-xs bg-int-orange text-white">
                    {rec.relevance_score}% match
                  </Badge>
                </div>
              </motion.div>
            );
          })}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Priority Recommendations */}
      {recommendations.priority_recommendations?.length > 0 && (
        <Card className="border-2 border-int-orange/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-int-orange to-purple-500 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              Top Picks for You
            </CardTitle>
            <p className="text-sm text-slate-600">Personalized based on your interests and engagement</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {recommendations.priority_recommendations.map((rec, idx) => {
              const Icon = ICON_MAP[rec.type] || Sparkles;
              const colorClass = TYPE_COLORS[rec.type] || 'bg-slate-100 text-slate-700';
              
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="hover:shadow-lg transition-all border-2 hover:border-int-orange/50">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-xl bg-int-orange/10 flex items-center justify-center flex-shrink-0">
                          <Icon className="h-6 w-6 text-int-orange" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-bold text-lg text-slate-900">{rec.title}</h3>
                            <Badge className={`${colorClass} border text-xs`}>
                              {rec.type}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-600 mb-3">{rec.reason}</p>
                          <div className="flex items-center gap-3">
                            <Badge className="bg-int-orange text-white">
                              {rec.relevance_score}% match
                            </Badge>
                            {rec.tags?.map((tag, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <ArrowRight className="h-5 w-5 text-slate-400 flex-shrink-0" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Engagement Nudges */}
      {recommendations.engagement_nudges?.length > 0 && (
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Zap className="h-5 w-5 text-blue-600" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recommendations.engagement_nudges.map((nudge, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-blue-200">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Target className="h-4 w-4 text-blue-600" />
                </div>
                <p className="text-sm text-slate-700 flex-1">{nudge.message}</p>
                {nudge.urgency === 'high' && (
                  <Badge className="bg-red-500 text-white text-xs">Urgent</Badge>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Discovery Suggestions */}
      {recommendations.discovery_suggestions?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              Explore New Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-3">
              {recommendations.discovery_suggestions.map((suggestion, idx) => {
                const Icon = ICON_MAP[suggestion.type] || Sparkles;
                return (
                  <Card key={idx} className="border hover:border-purple-300 transition-all">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Icon className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sm text-slate-900 mb-1">{suggestion.title}</h4>
                          <p className="text-xs text-slate-600 mb-2">{suggestion.reason}</p>
                          <div className="flex flex-wrap gap-1">
                            {suggestion.tags?.map((tag, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Team Opportunities */}
      {recommendations.team_opportunities?.length > 0 && (
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-900">
              <Users className="h-5 w-5 text-green-600" />
              Team Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recommendations.team_opportunities.map((opp, idx) => (
              <div key={idx} className="p-4 bg-white rounded-lg border border-green-200">
                <h4 className="font-bold text-slate-900 mb-1">{opp.title}</h4>
                <p className="text-sm text-slate-600 mb-2">{opp.reason}</p>
                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                  {opp.call_to_action}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Learning Opportunities */}
      {recommendations.learning_opportunities?.length > 0 && (
        <Card className="border-2 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              Grow Your Skills
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recommendations.learning_opportunities.map((learn, idx) => (
              <div key={idx} className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h4 className="font-bold text-purple-900 mb-1">{learn.skill}</h4>
                <p className="text-sm text-purple-700 mb-2">{learn.reason}</p>
                <div className="flex flex-wrap gap-2">
                  {learn.related_content?.map((content, i) => (
                    <Badge key={i} className="bg-purple-500 text-white text-xs">
                      {content}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}