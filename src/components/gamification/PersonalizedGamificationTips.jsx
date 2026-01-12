import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, TrendingUp, Target, Zap } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';
import { motion } from 'framer-motion';

export default function PersonalizedGamificationTips({ 
  userEmail, 
  currentPoints, 
  currentTier,
  badgesCount,
  activeChallengesCount 
}) {
  const { data: tips, isLoading, error } = useQuery({
    queryKey: ['gamification-tips', userEmail, currentPoints, currentTier],
    queryFn: async () => {
      if (!userEmail) {
        throw new Error('User email required');
      }
      
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an AI gamification coach providing personalized tips to help an employee earn more points and advance tiers.

User Stats:
- Current Points: ${currentPoints || 0}
- Current Tier: ${currentTier || 'bronze'}
- Badges Earned: ${badgesCount || 0}
- Active Challenges: ${activeChallengesCount || 0}

Based on their current status, provide 3-4 actionable tips:
1. Quick wins (5-15 min actions worth points)
2. Strategic moves (activities for tier advancement)
3. Social engagement opportunities
4. Challenge participation suggestions

Make tips specific, encouraging, and achievable within the next 3-7 days.`,
        response_json_schema: {
          type: "object",
          properties: {
            tips: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  category: { type: "string", enum: ["quick_win", "strategic", "social", "challenge"] },
                  title: { type: "string" },
                  description: { type: "string" },
                  potential_points: { type: "number" },
                  time_required: { type: "string" },
                  difficulty: { type: "string", enum: ["easy", "medium", "hard"] }
                }
              }
            },
            next_tier_advice: { type: "string" },
            motivational_message: { type: "string" }
          }
        }
      });
      return response;
    },
    enabled: !!userEmail,
    staleTime: 60 * 60 * 1000 // 1 hour
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <LoadingSpinner message="Generating personalized tips..." size="small" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-6 text-center text-slate-500">
          <p className="text-sm">Unable to load personalized tips</p>
        </CardContent>
      </Card>
    );
  }

  if (!tips?.tips || tips.tips.length === 0) return null;

  const categoryIcons = {
    quick_win: Zap,
    strategic: Target,
    social: Sparkles,
    challenge: TrendingUp
  };

  const categoryColors = {
    quick_win: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    strategic: 'bg-purple-100 text-purple-800 border-purple-200',
    social: 'bg-pink-100 text-pink-800 border-pink-200',
    challenge: 'bg-blue-100 text-blue-800 border-blue-200'
  };

  return (
    <Card data-b44-sync="true" data-feature="gamification" data-component="personalizedgamificationtips" className="border-2 border-purple-200 bg-gradient-to-br from-purple-50/30 to-pink-50/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-base">AI Tips to Level Up</p>
            <p className="text-xs font-normal text-slate-500">Personalized for you</p>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Motivational Message */}
        {tips.motivational_message && (
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg p-4">
            <p className="text-sm font-medium text-center">{tips.motivational_message}</p>
          </div>
        )}

        {/* Next Tier Advice */}
        {tips.next_tier_advice && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-800">
              <strong>Path to Next Tier:</strong> {tips.next_tier_advice}
            </p>
          </div>
        )}

        {/* Tips */}
        <div className="space-y-3">
          {tips.tips.map((tip, idx) => {
            const Icon = categoryIcons[tip.category];
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-lg p-4 border border-slate-200 hover:border-purple-300 transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                    {Icon && <Icon className="h-4 w-4 text-purple-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h5 className="font-semibold text-sm text-slate-900">{tip.title}</h5>
                      <Badge className="bg-emerald-100 text-emerald-800 flex-shrink-0">
                        +{tip.potential_points} pts
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-600 mb-2">{tip.description}</p>
                    <div className="flex gap-2">
                      <Badge variant="outline" className={`text-xs ${categoryColors[tip.category]}`}>
                        {tip.category.replace('_', ' ')}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {tip.time_required}
                      </Badge>
                      <Badge variant="outline" className="text-xs capitalize">
                        {tip.difficulty}
                      </Badge>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}