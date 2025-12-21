import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Sparkles, 
  TrendingUp, 
  MessageSquare, 
  Target,
  CheckCircle,
  Loader2,
  Copy,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

export default function TeamLeaderAIAssistant({ team }) {
  const [activeTab, setActiveTab] = useState('insights');
  const [customContext, setCustomContext] = useState('');
  const [result, setResult] = useState(null);

  const aiMutation = useMutation({
    mutationFn: async ({ action, context }) => {
      const response = await base44.functions.invoke('teamLeaderAIAssistant', {
        action,
        team_id: team.id,
        context: context ? { context } : undefined
      });
      return response.data;
    },
    onSuccess: (data) => {
      setResult(data);
    },
    onError: (error) => {
      toast.error('AI assistant error: ' + error.message);
    }
  });

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-600" />
          AI Team Assistant
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="insights" className="gap-1 text-xs">
              <TrendingUp className="h-3 w-3" />
              Insights
            </TabsTrigger>
            <TabsTrigger value="recognition" className="gap-1 text-xs">
              <MessageSquare className="h-3 w-3" />
              Recognition
            </TabsTrigger>
            <TabsTrigger value="challenges" className="gap-1 text-xs">
              <Target className="h-3 w-3" />
              Challenges
            </TabsTrigger>
            <TabsTrigger value="approvals" className="gap-1 text-xs">
              <CheckCircle className="h-3 w-3" />
              Approvals
            </TabsTrigger>
          </TabsList>

          <TabsContent value="insights" className="space-y-4">
            <div className="text-center py-6">
              <TrendingUp className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Team Performance Analysis</h3>
              <p className="text-sm text-slate-600 mb-4">
                Get AI-powered insights into your team's engagement and performance
              </p>
              <Button
                onClick={() => aiMutation.mutate({ action: 'analyze_performance' })}
                disabled={aiMutation.isPending}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {aiMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Analyze Team
                  </>
                )}
              </Button>
            </div>

            {result?.action === 'analyze_performance' && (
              <PerformanceInsights data={result.data} />
            )}
          </TabsContent>

          <TabsContent value="recognition" className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Context (Optional)
              </label>
              <Textarea
                value={customContext}
                onChange={(e) => setCustomContext(e.target.value)}
                placeholder="e.g., 'Team completed a major project ahead of schedule'"
                rows={2}
                className="mb-3"
              />
              <div className="flex gap-2">
                <Button
                  onClick={() => aiMutation.mutate({ 
                    action: 'suggest_recognition', 
                    context: customContext 
                  })}
                  disabled={aiMutation.isPending}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {aiMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-2" />
                  )}
                  Generate Ideas
                </Button>
                {customContext && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCustomContext('')}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {result?.action === 'suggest_recognition' && (
              <RecognitionSuggestions 
                suggestions={result.data.suggestions} 
                onCopy={copyToClipboard}
              />
            )}
          </TabsContent>

          <TabsContent value="challenges" className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Challenge Focus (Optional)
              </label>
              <Textarea
                value={customContext}
                onChange={(e) => setCustomContext(e.target.value)}
                placeholder="e.g., 'Boost team collaboration' or 'Increase event participation'"
                rows={2}
                className="mb-3"
              />
              <Button
                onClick={() => aiMutation.mutate({ 
                  action: 'suggest_challenge', 
                  context: customContext 
                })}
                disabled={aiMutation.isPending}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
              >
                {aiMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Target className="h-4 w-4 mr-2" />
                )}
                Generate Challenge Ideas
              </Button>
            </div>

            {result?.action === 'suggest_challenge' && (
              <ChallengeSuggestions challenges={result.data.challenges} />
            )}
          </TabsContent>

          <TabsContent value="approvals" className="space-y-4">
            <div className="text-center py-6">
              <CheckCircle className="h-12 w-12 text-emerald-600 mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Draft Approval Responses</h3>
              <p className="text-sm text-slate-600 mb-4">
                Use this in the Approvals tab to draft responses for pending recognitions
              </p>
              <Badge variant="outline">Available in Approvals Queue</Badge>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function PerformanceInsights({ data }) {
  const getHealthColor = (score) => {
    if (score >= 8) return 'text-emerald-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-4 bg-white rounded-lg p-4 border">
      <div className="text-center pb-4 border-b">
        <div className="text-4xl font-bold mb-1">
          <span className={getHealthColor(data.health_score)}>{data.health_score}/10</span>
        </div>
        <p className="text-sm text-slate-600">Team Health Score</p>
      </div>

      <div>
        <p className="text-sm text-slate-700 leading-relaxed">{data.summary}</p>
      </div>

      <div>
        <h4 className="font-semibold text-emerald-700 mb-2 flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          Strengths
        </h4>
        <ul className="space-y-1">
          {data.strengths.map((strength, idx) => (
            <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
              <span className="text-emerald-600">✓</span>
              {strength}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h4 className="font-semibold text-amber-700 mb-2 flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Areas for Improvement
        </h4>
        <ul className="space-y-1">
          {data.improvements.map((improvement, idx) => (
            <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
              <span className="text-amber-600">→</span>
              {improvement}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h4 className="font-semibold text-purple-700 mb-2 flex items-center gap-2">
          <Target className="h-4 w-4" />
          Recommendations
        </h4>
        <ul className="space-y-1">
          {data.recommendations.map((rec, idx) => (
            <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
              <span className="text-purple-600">{idx + 1}.</span>
              {rec}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function RecognitionSuggestions({ suggestions, onCopy }) {
  return (
    <div className="space-y-3">
      {suggestions.map((suggestion, idx) => (
        <div key={idx} className="bg-white rounded-lg p-4 border">
          <div className="flex items-start justify-between mb-2">
            <h4 className="font-semibold">{suggestion.title}</h4>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onCopy(suggestion.message)}
              className="h-8 w-8"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-slate-700 mb-2">{suggestion.message}</p>
          <Badge variant="outline" className="text-xs">
            {suggestion.category?.replace('_', ' ')}
          </Badge>
        </div>
      ))}
    </div>
  );
}

function ChallengeSuggestions({ challenges }) {
  return (
    <div className="space-y-3">
      {challenges.map((challenge, idx) => (
        <div key={idx} className="bg-white rounded-lg p-4 border">
          <h4 className="font-semibold mb-2">{challenge.title}</h4>
          <p className="text-sm text-slate-700 mb-3">{challenge.description}</p>
          <div className="grid grid-cols-2 gap-2 text-xs mb-3">
            <div>
              <span className="text-slate-600">Goal:</span>
              <span className="ml-1 font-medium">{challenge.goal}</span>
            </div>
            <div>
              <span className="text-slate-600">Duration:</span>
              <span className="ml-1 font-medium">{challenge.duration}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {challenge.challenge_type?.replace('_', ' ')}
            </Badge>
            <span className="text-xs text-slate-600">
              Impact: {challenge.expected_impact}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}