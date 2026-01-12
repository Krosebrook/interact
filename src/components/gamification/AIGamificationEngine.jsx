import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  TrendingUp, 
  Award, 
  Target, 
  Loader2,
  Copy,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';

export default function AIGamificationEngine({ team, selectedUser }) {
  const [activeTab, setActiveTab] = useState('difficulty');
  const [results, setResults] = useState({});

  // Difficulty Adjustment
  const adjustDifficultyMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('gamificationAI', {
        action: 'adjust_challenge_difficulty',
        context: { team_id: team?.id }
      });
      return response.data;
    },
    onSuccess: (data) => {
      setResults(prev => ({ ...prev, difficulty: data }));
      toast.success('Challenge difficulty analyzed');
    },
    onError: () => toast.error('Failed to analyze difficulty')
  });

  // Badge Suggestions
  const suggestBadgesMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('gamificationAI', {
        action: 'suggest_personal_badges',
        context: { user_email: selectedUser }
      });
      return response.data;
    },
    onSuccess: (data) => {
      setResults(prev => ({ ...prev, badges: data }));
      toast.success('Badge suggestions generated');
    },
    onError: () => toast.error('Failed to generate badge suggestions')
  });

  // Challenge Recommendations
  const recommendChallengesMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('gamificationAI', {
        action: 'recommend_team_challenges',
        context: { team_id: team?.id }
      });
      return response.data;
    },
    onSuccess: (data) => {
      setResults(prev => ({ ...prev, challenges: data }));
      toast.success('Challenge recommendations ready');
    },
    onError: () => toast.error('Failed to recommend challenges')
  });

  return (
    <Card data-b44-sync="true" data-feature="gamification" data-component="aigamificationengine">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-600" />
          AI Gamification Engine
        </CardTitle>
        <CardDescription>
          Dynamic adjustments and personalized recommendations powered by AI
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="difficulty" className="gap-1">
              <TrendingUp className="h-4 w-4" />
              Difficulty
            </TabsTrigger>
            <TabsTrigger value="badges" className="gap-1">
              <Award className="h-4 w-4" />
              Badges
            </TabsTrigger>
            <TabsTrigger value="challenges" className="gap-1">
              <Target className="h-4 w-4" />
              Challenges
            </TabsTrigger>
          </TabsList>

          {/* Difficulty Adjustment */}
          <TabsContent value="difficulty">
            <div className="space-y-4">
              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="font-semibold text-sm mb-2">Dynamic Challenge Adjustment</h4>
                <p className="text-sm text-slate-600 mb-4">
                  AI analyzes team performance and suggests optimal difficulty and reward levels
                </p>
                <Button 
                  onClick={() => adjustDifficultyMutation.mutate()}
                  disabled={adjustDifficultyMutation.isPending || !team}
                  className="w-full"
                >
                  {adjustDifficultyMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Analyze Team Performance
                    </>
                  )}
                </Button>
              </div>

              {results.difficulty && (
                <div className="space-y-4">
                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-xs text-slate-600">Team Size</p>
                      <p className="text-xl font-bold text-blue-600">
                        {results.difficulty.metrics.team_size}
                      </p>
                    </div>
                    <div className="bg-emerald-50 rounded-lg p-3">
                      <p className="text-xs text-slate-600">Avg Points</p>
                      <p className="text-xl font-bold text-emerald-600">
                        {results.difficulty.metrics.avg_points}
                      </p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3">
                      <p className="text-xs text-slate-600">Engagement</p>
                      <p className="text-xl font-bold text-purple-600">
                        {results.difficulty.metrics.engagement_rate}%
                      </p>
                    </div>
                    <div className="bg-amber-50 rounded-lg p-3">
                      <p className="text-xs text-slate-600">Completion</p>
                      <p className="text-xl font-bold text-amber-600">
                        {results.difficulty.metrics.completion_rate}%
                      </p>
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
                    <h5 className="font-semibold text-sm mb-3 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-purple-600" />
                      AI Recommendations
                    </h5>
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-700">Difficulty Level:</span>
                        <Badge className="bg-purple-600 capitalize">
                          {results.difficulty.adjustment.difficulty}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-700">Point Multiplier:</span>
                        <Badge variant="outline">{results.difficulty.adjustment.point_multiplier}x</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-700">Duration:</span>
                        <Badge variant="outline">
                          {results.difficulty.adjustment.duration_weeks} weeks
                        </Badge>
                      </div>
                    </div>
                    <div className="bg-white rounded p-3 text-sm text-slate-700">
                      <p className="font-medium mb-1">Reasoning:</p>
                      <p>{results.difficulty.adjustment.reasoning}</p>
                    </div>
                    {results.difficulty.adjustment.recommendations?.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs font-medium text-slate-600 mb-1">Action Items:</p>
                        <ul className="space-y-1">
                          {results.difficulty.adjustment.recommendations.map((rec, idx) => (
                            <li key={idx} className="text-xs text-slate-600 flex items-start gap-1">
                              <span className="text-purple-600">•</span>
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Badge Suggestions */}
          <TabsContent value="badges">
            <div className="space-y-4">
              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="font-semibold text-sm mb-2">Personalized Badge Design</h4>
                <p className="text-sm text-slate-600 mb-4">
                  AI creates custom badge criteria tailored to individual employee patterns
                </p>
                <Button 
                  onClick={() => suggestBadgesMutation.mutate()}
                  disabled={suggestBadgesMutation.isPending || !selectedUser}
                  className="w-full"
                >
                  {suggestBadgesMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Award className="h-4 w-4 mr-2" />
                      Generate Badge Ideas
                    </>
                  )}
                </Button>
              </div>

              {results.badges && (
                <div className="space-y-3">
                  {results.badges.badges.map((badge, idx) => (
                    <BadgeSuggestionCard key={idx} badge={badge} />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Challenge Recommendations */}
          <TabsContent value="challenges">
            <div className="space-y-4">
              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="font-semibold text-sm mb-2">Proactive Challenge Recommendations</h4>
                <p className="text-sm text-slate-600 mb-4">
                  AI identifies team gaps and suggests targeted challenges to improve specific areas
                </p>
                <Button 
                  onClick={() => recommendChallengesMutation.mutate()}
                  disabled={recommendChallengesMutation.isPending || !team}
                  className="w-full"
                >
                  {recommendChallengesMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Target className="h-4 w-4 mr-2" />
                      Get Challenge Recommendations
                    </>
                  )}
                </Button>
              </div>

              {results.challenges && (
                <div className="space-y-4">
                  {results.challenges.priority_areas && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <p className="text-xs font-semibold text-amber-800 mb-2">Priority Areas:</p>
                      <div className="flex flex-wrap gap-1">
                        {results.challenges.priority_areas.map((area, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {area}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {results.challenges.recommendations.map((rec, idx) => (
                    <ChallengeRecommendationCard key={idx} recommendation={rec} />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function BadgeSuggestionCard({ badge }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(badge, null, 2));
    setCopied(true);
    toast.success('Badge copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const difficultyColors = {
    bronze: 'bg-amber-100 text-amber-800',
    silver: 'bg-slate-200 text-slate-800',
    gold: 'bg-yellow-100 text-yellow-800',
    platinum: 'bg-purple-100 text-purple-800'
  };

  return (
    <div className="bg-white border rounded-lg p-4">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h5 className="font-semibold text-slate-900">{badge.name}</h5>
          <p className="text-xs text-slate-600 mt-0.5">{badge.icon_suggestion}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={difficultyColors[badge.difficulty]}>{badge.difficulty}</Badge>
          <Button
            size="icon"
            variant="ghost"
            onClick={copyToClipboard}
            className="h-7 w-7"
          >
            {copied ? <CheckCircle className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
          </Button>
        </div>
      </div>
      <p className="text-sm text-slate-700 mb-2">{badge.description}</p>
      <div className="bg-slate-50 rounded p-2 mb-2">
        <p className="text-xs font-medium text-slate-600 mb-1">Criteria:</p>
        <p className="text-xs text-slate-700">{badge.criteria}</p>
      </div>
      <div className="bg-blue-50 border border-blue-200 rounded p-2">
        <p className="text-xs text-blue-800">
          <strong>Why personalized:</strong> {badge.personalization_reason}
        </p>
      </div>
    </div>
  );
}

function ChallengeRecommendationCard({ recommendation }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(recommendation, null, 2));
    setCopied(true);
    toast.success('Challenge copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white border rounded-lg p-4">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h5 className="font-semibold text-slate-900">{recommendation.name}</h5>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="text-xs">{recommendation.type}</Badge>
            <Badge variant="outline" className="text-xs">{recommendation.duration}</Badge>
          </div>
        </div>
        <Button
          size="icon"
          variant="ghost"
          onClick={copyToClipboard}
          className="h-7 w-7"
        >
          {copied ? <CheckCircle className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
        </Button>
      </div>
      <p className="text-sm text-slate-700 mb-2">{recommendation.goal}</p>
      <div className="space-y-2 text-xs">
        <div className="bg-slate-50 rounded p-2">
          <p className="font-medium text-slate-600 mb-1">Success Criteria:</p>
          <ul className="space-y-0.5">
            {recommendation.success_criteria.map((criteria, idx) => (
              <li key={idx} className="text-slate-700">• {criteria}</li>
            ))}
          </ul>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded p-2">
          <p className="font-medium text-emerald-800 mb-1">Expected Impact:</p>
          <p className="text-emerald-700">{recommendation.expected_impact}</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded p-2">
          <p className="font-medium text-amber-800 mb-1">Addresses:</p>
          <p className="text-amber-700">{recommendation.addresses_weakness}</p>
        </div>
      </div>
    </div>
  );
}