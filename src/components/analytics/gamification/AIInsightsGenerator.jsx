import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { 
  Sparkles, Brain, TrendingUp, Award, Crown, MessageSquare, 
  Lightbulb, RefreshCw, Copy, Send, CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';

export default function AIInsightsGenerator({ 
  engagementData = {},
  badgeData = {},
  challengeData = {},
  leaderboardData = {},
  abTestResults = []
}) {
  const [insights, setInsights] = useState(null);
  const [strategies, setStrategies] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);

  const generateInsightsMutation = useMutation({
    mutationFn: async (type) => {
      let prompt = '';
      let context = {};

      if (type === 'engagement') {
        context = {
          totalUsers: leaderboardData.totalUsers || 0,
          activeUsers: leaderboardData.activeUsers || 0,
          avgPoints: leaderboardData.avgPoints || 0,
          weeklyChange: engagementData.weekChange || 0,
          correlation: engagementData.correlation || 0
        };
        prompt = `Analyze this employee engagement gamification data and provide 3-5 key insights with actionable recommendations:
        
Total Users: ${context.totalUsers}
Active Users (7d): ${context.activeUsers} (${((context.activeUsers/context.totalUsers)*100).toFixed(1)}%)
Average Points: ${context.avgPoints}
Week-over-Week Change: ${context.weeklyChange}%
Challenge-Engagement Correlation: ${(context.correlation * 100).toFixed(0)}%

Provide insights in JSON format: {"insights": [{"title": "...", "description": "...", "impact": "high/medium/low", "recommendation": "..."}]}`;
      } else if (type === 'badges') {
        context = {
          totalBadges: badgeData.totalBadges || 0,
          totalAwarded: badgeData.totalAwarded || 0,
          unlockRate: badgeData.unlockRate || 0,
          rarelyEarned: badgeData.rarelyEarned || 0
        };
        prompt = `Analyze badge distribution for an employee engagement platform:

Total Badge Types: ${context.totalBadges}
Total Badges Awarded: ${context.totalAwarded}
Badge Unlock Rate: ${context.unlockRate}%
Rarely Earned Badges: ${context.rarelyEarned}

Provide insights about badge effectiveness, which badges need adjustment, and recommendations in JSON: {"insights": [{"title": "...", "description": "...", "impact": "high/medium/low", "recommendation": "..."}]}`;
      } else if (type === 'leaderboard') {
        context = {
          totalUsers: leaderboardData.totalUsers || 0,
          champions: leaderboardData.segments?.champions || 0,
          atRisk: leaderboardData.atRiskUsers || 0,
          dormant: leaderboardData.dormantUsers || 0,
          healthScore: leaderboardData.healthScore || 0
        };
        prompt = `Analyze leaderboard dynamics for employee engagement:

Total Participants: ${context.totalUsers}
Champions (high engagement): ${context.champions}
At-Risk Users: ${context.atRisk}
Dormant Users (30d+): ${context.dormant}
Health Score: ${context.healthScore}%

Provide insights about user progression, churn risk, and re-engagement strategies in JSON: {"insights": [{"title": "...", "description": "...", "impact": "high/medium/low", "recommendation": "..."}]}`;
      }

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            insights: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  impact: { type: "string" },
                  recommendation: { type: "string" }
                }
              }
            }
          }
        }
      });
      return response;
    },
    onSuccess: (data) => {
      setInsights(data.insights);
      toast.success('AI insights generated');
    }
  });

  const generateStrategiesMutation = useMutation({
    mutationFn: async () => {
      const testSummary = abTestResults.map(t => ({
        name: t.test_name,
        status: t.status,
        winner: t.results?.winner,
        lift: t.results?.lift_percentage
      }));

      const prompt = `Based on these A/B test results and performance metrics, suggest gamification strategy improvements:

A/B Test Results: ${JSON.stringify(testSummary)}
Challenge Completion Rate: ${challengeData.overallCompletionRate || 0}%
Active Challenges: ${challengeData.activeChallenges || 0}
Abandoned Challenges: ${challengeData.abandonedChallenges || 0}

Provide 5 strategic recommendations in JSON: {"strategies": [{"title": "...", "description": "...", "priority": "high/medium/low", "expected_impact": "...", "implementation_steps": ["..."]}]}`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            strategies: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  priority: { type: "string" },
                  expected_impact: { type: "string" },
                  implementation_steps: { type: "array", items: { type: "string" } }
                }
              }
            }
          }
        }
      });
      return response;
    },
    onSuccess: (data) => {
      setStrategies(data.strategies);
      toast.success('Strategy recommendations generated');
    }
  });

  const generateNotificationsMutation = useMutation({
    mutationFn: async (users) => {
      const userSummaries = users.map(u => ({
        name: u.user_name || u.user_email?.split('@')[0],
        points: u.total_points || 0,
        rank: u.currentRank,
        streak: u.streak_days || 0,
        status: u.velocity || 'stable'
      }));

      const prompt = `Generate personalized, encouraging notification messages for these employees based on their gamification progress:

${JSON.stringify(userSummaries)}

Create motivational, friendly messages that:
- Acknowledge their achievements
- Encourage continued participation
- Suggest next goals
- Keep it under 160 characters

Return in JSON: {"notifications": [{"user_name": "...", "message": "...", "type": "encouragement/milestone/challenge/re-engagement"}]}`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            notifications: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  user_name: { type: "string" },
                  message: { type: "string" },
                  type: { type: "string" }
                }
              }
            }
          }
        }
      });
      return response;
    },
    onSuccess: (data) => {
      setNotifications(data.notifications);
      toast.success('Personalized notifications generated');
    }
  });

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-int-orange" />
          AI-Powered Insights & Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="insights" className="w-full">
          <TabsList className="grid grid-cols-3 w-full mb-4">
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Insights
            </TabsTrigger>
            <TabsTrigger value="strategies" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Strategies
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Notifications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="insights">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => generateInsightsMutation.mutate('engagement')}
                  disabled={generateInsightsMutation.isPending}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Engagement Insights
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => generateInsightsMutation.mutate('badges')}
                  disabled={generateInsightsMutation.isPending}
                >
                  <Award className="h-4 w-4 mr-2" />
                  Badge Insights
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => generateInsightsMutation.mutate('leaderboard')}
                  disabled={generateInsightsMutation.isPending}
                >
                  <Crown className="h-4 w-4 mr-2" />
                  Leaderboard Insights
                </Button>
              </div>

              {generateInsightsMutation.isPending && (
                <div className="flex items-center gap-2 text-slate-500 py-4">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Generating AI insights...
                </div>
              )}

              {insights && (
                <div className="space-y-3">
                  {insights.map((insight, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 rounded-lg border-l-4 border-int-orange">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-int-navy">{insight.title}</h4>
                          <p className="text-sm text-slate-600 mt-1">{insight.description}</p>
                          <p className="text-sm text-int-orange mt-2 font-medium">
                            💡 {insight.recommendation}
                          </p>
                        </div>
                        <Badge className={`
                          ${insight.impact === 'high' ? 'bg-red-100 text-red-700' : ''}
                          ${insight.impact === 'medium' ? 'bg-amber-100 text-amber-700' : ''}
                          ${insight.impact === 'low' ? 'bg-blue-100 text-blue-700' : ''}
                        `}>
                          {insight.impact} impact
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="strategies">
            <div className="space-y-4">
              <Button 
                onClick={() => generateStrategiesMutation.mutate()}
                disabled={generateStrategiesMutation.isPending}
                className="bg-int-orange hover:bg-int-orange/90"
              >
                <Brain className="h-4 w-4 mr-2" />
                {generateStrategiesMutation.isPending ? 'Analyzing...' : 'Generate Strategy Recommendations'}
              </Button>

              {strategies && (
                <div className="space-y-4">
                  {strategies.map((strategy, idx) => (
                    <div key={idx} className="p-4 bg-gradient-to-r from-int-navy/5 to-transparent rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-int-navy">{strategy.title}</h4>
                        <Badge variant={strategy.priority === 'high' ? 'destructive' : 'secondary'}>
                          {strategy.priority} priority
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 mb-3">{strategy.description}</p>
                      <div className="text-sm">
                        <span className="font-medium text-emerald-600">Expected Impact: </span>
                        {strategy.expected_impact}
                      </div>
                      {strategy.implementation_steps && (
                        <div className="mt-3">
                          <p className="text-xs font-medium text-slate-500 mb-1">Implementation Steps:</p>
                          <ol className="text-sm text-slate-600 list-decimal list-inside space-y-1">
                            {strategy.implementation_steps.map((step, i) => (
                              <li key={i}>{step}</li>
                            ))}
                          </ol>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="notifications">
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  Select users from the leaderboard to generate personalized notifications based on their progress and standing.
                </p>
              </div>

              <Button 
                onClick={() => generateNotificationsMutation.mutate(leaderboardData.topRisers || [])}
                disabled={generateNotificationsMutation.isPending || !leaderboardData.topRisers?.length}
                className="bg-int-orange hover:bg-int-orange/90"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                {generateNotificationsMutation.isPending ? 'Generating...' : 'Generate for Top Performers'}
              </Button>

              {notifications.length > 0 && (
                <div className="space-y-3">
                  {notifications.map((notif, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-lg flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{notif.user_name}</span>
                          <Badge variant="outline" className="text-xs">{notif.type}</Badge>
                        </div>
                        <p className="text-sm text-slate-600">{notif.message}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => copyToClipboard(notif.message)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-emerald-600">
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
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