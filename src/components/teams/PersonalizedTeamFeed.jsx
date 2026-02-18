import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, Users, TrendingUp, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PersonalizedTeamFeed({ teamId, userEmail }) {
  const { data: recommendations, isLoading } = useQuery({
    queryKey: ['team-personalized-content', teamId, userEmail],
    queryFn: async () => {
      const response = await base44.functions.invoke('generatePersonalizedContent', {});
      return response.data;
    },
    enabled: !!teamId && !!userEmail,
    select: (data) => {
      // Filter recommendations relevant to team activities
      const teamRecs = data?.recommendations?.team_opportunities || [];
      const priorityRecs = data?.recommendations?.priority_recommendations?.filter(
        r => r.type === 'team_event' || r.type === 'team_challenge'
      ) || [];
      return { teamRecs, priorityRecs };
    }
  });

  if (isLoading || !recommendations) {
    return null;
  }

  const { teamRecs, priorityRecs } = recommendations;

  if (teamRecs.length === 0 && priorityRecs.length === 0) {
    return null;
  }

  return (
    <Card className="border-2 border-int-orange/30 bg-gradient-to-br from-orange-50 to-purple-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-int-orange to-purple-500 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          Suggested for Your Team
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {priorityRecs.map((rec, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="p-3 bg-white rounded-lg border hover:border-int-orange/50 transition-all"
          >
            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-int-orange mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-sm text-slate-900">{rec.title}</h4>
                <p className="text-xs text-slate-600 mt-1">{rec.reason}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className="bg-int-orange text-white text-xs">
                    {rec.relevance_score}% match
                  </Badge>
                  {rec.tags?.map((tag, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {teamRecs.map((opp, idx) => (
          <div key={idx} className="p-3 bg-white rounded-lg border border-green-200">
            <div className="flex items-start gap-3">
              <TrendingUp className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-bold text-sm text-slate-900 mb-1">{opp.title}</h4>
                <p className="text-xs text-slate-600 mb-2">{opp.reason}</p>
                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-xs">
                  {opp.call_to_action}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}