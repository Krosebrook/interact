import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, Award, Gift, TrendingUp, Lightbulb } from 'lucide-react';
import { toast } from 'sonner';

export default function AIBadgeRewardSuggestions() {
  const [suggestions, setSuggestions] = useState(null);

  const generateMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('aiGamificationSuggestions', {});
      return response.data;
    },
    onSuccess: (data) => {
      if (data.success) {
        setSuggestions(data.suggestions);
        toast.success('AI suggestions generated!');
      }
    },
    onError: () => toast.error('Failed to generate suggestions')
  });

  const RARITY_COLORS = {
    common: 'bg-slate-100 text-slate-700',
    uncommon: 'bg-green-100 text-green-700',
    rare: 'bg-blue-100 text-blue-700',
    legendary: 'bg-purple-100 text-purple-700'
  };

  return (
    <Card className="border-2 border-int-orange/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-int-orange to-pink-500 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          AI Gamification Suggestions
        </CardTitle>
        <p className="text-sm text-slate-600">Get data-driven badge and reward ideas</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={() => generateMutation.mutate()}
          disabled={generateMutation.isPending}
          className="w-full bg-gradient-to-r from-int-orange to-pink-500 hover:opacity-90"
        >
          {generateMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Analyzing Engagement...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate AI Suggestions
            </>
          )}
        </Button>

        <AnimatePresence>
          {suggestions && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Tabs defaultValue="badges" className="mt-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="badges">
                    <Award className="h-4 w-4 mr-2" />
                    Badges ({suggestions.badge_suggestions?.length || 0})
                  </TabsTrigger>
                  <TabsTrigger value="rewards">
                    <Gift className="h-4 w-4 mr-2" />
                    Rewards ({suggestions.reward_suggestions?.length || 0})
                  </TabsTrigger>
                  <TabsTrigger value="insights">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Insights
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="badges" className="space-y-3 mt-4">
                  {suggestions.badge_suggestions?.map((badge, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <Card className="hover:shadow-md transition-all">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex items-center gap-2">
                              <Award className="h-5 w-5 text-int-orange" />
                              <h4 className="font-bold text-slate-900">{badge.badge_name}</h4>
                            </div>
                            <Badge className={RARITY_COLORS[badge.rarity]}>
                              {badge.rarity}
                            </Badge>
                          </div>

                          <p className="text-sm text-slate-600 mb-3">{badge.description}</p>

                          <div className="grid grid-cols-2 gap-2 mb-3">
                            <div className="bg-blue-50 rounded p-2 border border-blue-200">
                              <p className="text-xs text-blue-600 font-semibold">Type</p>
                              <p className="text-xs text-blue-900">{badge.badge_type}</p>
                            </div>
                            <div className="bg-green-50 rounded p-2 border border-green-200">
                              <p className="text-xs text-green-600 font-semibold">Points</p>
                              <p className="text-xs text-green-900">{badge.points_value}</p>
                            </div>
                          </div>

                          <div className="bg-slate-50 rounded-lg p-3 border mb-2">
                            <p className="text-xs font-semibold text-slate-700 mb-1">Criteria:</p>
                            <p className="text-xs text-slate-600">{badge.criteria}</p>
                          </div>

                          <div className="flex items-start gap-2 text-xs text-purple-700 bg-purple-50 p-2 rounded">
                            <Lightbulb className="h-3 w-3 flex-shrink-0 mt-0.5" />
                            <span>{badge.rationale}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </TabsContent>

                <TabsContent value="rewards" className="space-y-3 mt-4">
                  {suggestions.reward_suggestions?.map((reward, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <Card className="hover:shadow-md transition-all">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex items-center gap-2">
                              <Gift className="h-5 w-5 text-int-orange" />
                              <h4 className="font-bold text-slate-900">{reward.reward_name}</h4>
                            </div>
                            <Badge variant="outline">{reward.category}</Badge>
                          </div>

                          <p className="text-sm text-slate-600 mb-3">{reward.description}</p>

                          <div className="grid grid-cols-3 gap-2 mb-3">
                            <div className="bg-orange-50 rounded p-2 border border-orange-200">
                              <p className="text-xs text-orange-600 font-semibold">Points</p>
                              <p className="text-xs text-orange-900">{reward.points_cost}</p>
                            </div>
                            {reward.tier_requirement && reward.tier_requirement !== 'null' && (
                              <div className="bg-purple-50 rounded p-2 border border-purple-200">
                                <p className="text-xs text-purple-600 font-semibold">Tier</p>
                                <p className="text-xs text-purple-900">{reward.tier_requirement}</p>
                              </div>
                            )}
                            <div className="bg-blue-50 rounded p-2 border border-blue-200">
                              <p className="text-xs text-blue-600 font-semibold">Appeal</p>
                              <p className="text-xs text-blue-900">{reward.popularity_prediction}</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-2 text-xs text-purple-700 bg-purple-50 p-2 rounded">
                            <Lightbulb className="h-3 w-3 flex-shrink-0 mt-0.5" />
                            <span>{reward.rationale}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </TabsContent>

                <TabsContent value="insights" className="mt-4">
                  <div className="space-y-4">
                    <Card className="bg-red-50 border-red-200">
                      <CardContent className="p-4">
                        <h4 className="font-bold text-red-900 mb-2">Engagement Gaps</h4>
                        <ul className="space-y-1">
                          {suggestions.insights?.engagement_gaps?.map((gap, idx) => (
                            <li key={idx} className="text-sm text-red-800">• {gap}</li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    <Card className="bg-green-50 border-green-200">
                      <CardContent className="p-4">
                        <h4 className="font-bold text-green-900 mb-2">Untapped Motivators</h4>
                        <ul className="space-y-1">
                          {suggestions.insights?.untapped_motivators?.map((motivator, idx) => (
                            <li key={idx} className="text-sm text-green-800">• {motivator}</li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    <Card className="bg-blue-50 border-blue-200">
                      <CardContent className="p-4">
                        <h4 className="font-bold text-blue-900 mb-2">Recommended Priority</h4>
                        <p className="text-sm text-blue-800">{suggestions.insights?.recommended_priority}</p>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}