import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { Brain, TrendingUp, AlertCircle, CheckCircle, Target } from 'lucide-react';

export default function WellnessInsightsPanel() {
  const { data: insights, isLoading, refetch } = useQuery({
    queryKey: ['wellnessInsights'],
    queryFn: async () => {
      const response = await base44.functions.invoke('wellnessEngagementCorrelation', {
        lookbackDays: 30
      });
      return response.data;
    },
    staleTime: 10 * 60 * 1000  // 10 minutes
  });
  
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-12">
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }
  
  const { analysis, sampleSize } = insights || {};
  
  if (!analysis) return null;
  
  const getCorrelationColor = (strength) => {
    switch (strength) {
      case 'strong_positive': return 'text-green-600 bg-green-50';
      case 'moderate_positive': return 'text-blue-600 bg-blue-50';
      case 'weak': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-slate-600 bg-slate-50';
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-int-orange" />
              AI Wellness Insights
            </CardTitle>
            <CardDescription>
              Analysis based on {sampleSize} employees over last 30 days
            </CardDescription>
          </div>
          <Badge className={getCorrelationColor(analysis.correlation_strength)}>
            {analysis.correlation_strength?.replace(/_/g, ' ')}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 bg-slate-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-int-orange" />
            <p className="font-semibold">Correlation Score</p>
          </div>
          <p className="text-3xl font-bold text-int-orange">
            {Math.round(analysis.correlation_score * 100)}%
          </p>
          <p className="text-sm text-slate-600 mt-1">
            Wellness activity correlates with engagement
          </p>
        </div>
        
        {analysis.key_insights?.length > 0 && (
          <div>
            <p className="font-semibold mb-3 flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-int-gold" />
              Key Insights
            </p>
            <ul className="space-y-2">
              {analysis.key_insights.map((insight, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {analysis.patterns?.length > 0 && (
          <div>
            <p className="font-semibold mb-3">Observed Patterns</p>
            <div className="space-y-2">
              {analysis.patterns.map((pattern, i) => (
                <div key={i} className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-900">{pattern.pattern}</p>
                  <p className="text-xs text-blue-700 mt-1">Impact: {pattern.impact}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {analysis.recommendations?.length > 0 && (
          <div>
            <p className="font-semibold mb-3 flex items-center gap-2">
              <Target className="h-4 w-4 text-int-orange" />
              HR Recommendations
            </p>
            <div className="space-y-2">
              {analysis.recommendations.map((rec, i) => (
                <div key={i} className="p-3 bg-int-orange/5 rounded-lg border border-int-orange/20">
                  <div className="flex items-start justify-between mb-1">
                    <p className="text-sm font-medium">{rec.action}</p>
                    <Badge variant="outline" className="text-xs">
                      {rec.priority}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600">{rec.expected_outcome}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {analysis.suggested_challenge_goals && (
          <div className="pt-4 border-t">
            <p className="font-semibold mb-3">Recommended Challenge Goals</p>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {analysis.suggested_challenge_goals.steps_daily?.toLocaleString()}
                </p>
                <p className="text-xs text-slate-500">Steps/day</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {analysis.suggested_challenge_goals.meditation_minutes}
                </p>
                <p className="text-xs text-slate-500">Meditation min</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-cyan-600">
                  {analysis.suggested_challenge_goals.hydration_glasses}
                </p>
                <p className="text-xs text-slate-500">Glasses/day</p>
              </div>
            </div>
          </div>
        )}
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="w-full"
        >
          Refresh Insights
        </Button>
      </CardContent>
    </Card>
  );
}