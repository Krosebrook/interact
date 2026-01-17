import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Mail, TrendingUp, Users, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function WeeklyDigestPreview() {
  const queryClient = useQueryClient();

  const { data: digest, isLoading } = useQuery({
    queryKey: ['weekly-digest'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const response = await base44.functions.invoke('weeklyDigestEngine', {
        action: 'generate_digest',
        userEmail: user.email
      });
      return response.data.digest;
    }
  });

  const trackMutation = useMutation({
    mutationFn: async (eventType) => {
      const user = await base44.auth.me();
      const today = new Date();
      const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
      const weekStartStr = weekStart.toISOString().split('T')[0];

      await base44.functions.invoke('weeklyDigestEngine', {
        action: 'track_digest_engagement',
        userEmail: user.email,
        weekStarting: weekStartStr,
        eventType
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['weekly-digest']);
    }
  });

  if (isLoading || !digest) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* HEADER */}
      <Card className="bg-gradient-to-r from-slate-900 to-slate-800 text-white border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Your Weekly Digest
          </CardTitle>
          <p className="text-sm text-slate-300 mt-1">{digest.greeting}</p>
        </CardHeader>
      </Card>

      {/* ENGAGEMENT SUMMARY */}
      <Card>
        <CardContent className="pt-6 grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900">
              {digest.engagement_summary.sessions}
            </p>
            <p className="text-xs text-slate-600">Sessions</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-int-orange">
              {digest.engagement_summary.meaningful_actions}
            </p>
            <p className="text-xs text-slate-600">Actions</p>
          </div>
          <div className="text-center">
            {digest.engagement_summary.trending_positive ? (
              <TrendingUp className="w-6 h-6 text-green-600 mx-auto" />
            ) : (
              <p className="text-sm text-slate-500">—</p>
            )}
            <p className="text-xs text-slate-600">Trending</p>
          </div>
        </CardContent>
      </Card>

      {/* DISCOVERY HIGHLIGHTS */}
      {digest.discovery_highlights?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              New Deals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {digest.discovery_highlights.map((deal, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-lg">
                <p className="font-medium text-slate-900">{deal.title}</p>
                <p className="text-xs text-slate-600 mt-1">{deal.relevance_reason}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* INSIGHT HIGHLIGHTS */}
      {digest.insight_highlights?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-600" />
              Portfolio Updates
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {digest.insight_highlights.map((insight, idx) => (
              <div key={idx} className="p-3 bg-amber-50 rounded-lg">
                <p className="font-medium text-slate-900">{insight.message}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* SOCIAL HIGHLIGHTS */}
      {digest.social_highlights?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-600" />
              Community Highlights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {digest.social_highlights.map((social, idx) => (
              <div key={idx} className="p-3 bg-purple-50 rounded-lg">
                <p className="font-medium text-slate-900">{social.expert_name}</p>
                <p className="text-xs text-slate-600 mt-1">{social.discussion_topic}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* STREAK BADGE */}
      {digest.streak_badge && (
        <div className="bg-gradient-to-r from-orange-100 to-red-100 border border-orange-300 rounded-lg p-4 text-center">
          <p className="font-semibold text-orange-900">{digest.streak_badge}</p>
          <p className="text-sm text-orange-700 mt-1">{digest.motivational_message}</p>
        </div>
      )}

      {/* CTA */}
      <Button className="w-full bg-int-orange hover:bg-int-orange/90">
        View Full Digest
      </Button>
    </motion.div>
  );
}