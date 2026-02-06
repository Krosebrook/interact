import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Minus, Sparkles, Info } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export default function DynamicDifficultyIndicator({ userEmail }) {
  const [analyzing, setAnalyzing] = useState(false);
  
  const { data: analysis, refetch } = useQuery({
    queryKey: ['difficultyAnalysis', userEmail],
    queryFn: async () => {
      const response = await base44.functions.invoke('dynamicDifficultyAdjuster', {
        userEmail
      });
      return response.data;
    },
    enabled: false  // Only fetch when user clicks analyze
  });
  
  const handleAnalyze = async () => {
    setAnalyzing(true);
    await refetch();
    setAnalyzing(false);
  };
  
  const difficultyLevels = ['beginner', 'intermediate', 'advanced', 'expert'];
  const currentIndex = difficultyLevels.indexOf(analysis?.current_difficulty || 'beginner');
  const progressPercentage = ((currentIndex + 1) / difficultyLevels.length) * 100;
  
  const difficultyColors = {
    beginner: 'bg-green-500',
    intermediate: 'bg-blue-500',
    advanced: 'bg-purple-500',
    expert: 'bg-red-500'
  };
  
  const adjustmentIcon = () => {
    if (!analysis?.adjustment) return <Minus className="h-4 w-4" />;
    if (analysis.adjustment > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (analysis.adjustment < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-slate-400" />;
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-int-orange" />
          Challenge Difficulty Level
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-slate-400 cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs max-w-xs">
                  AI analyzes your performance and suggests difficulty adjustments to keep you challenged but not overwhelmed
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!analysis ? (
          <div className="text-center py-6">
            <p className="text-sm text-slate-600 mb-4">
              Get AI-powered difficulty recommendations
            </p>
            <Button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {analyzing ? 'Analyzing...' : 'Analyze My Performance'}
            </Button>
          </div>
        ) : (
          <>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium capitalize">
                  {analysis.current_difficulty}
                </span>
                <Badge className={difficultyColors[analysis.current_difficulty]}>
                  Level {currentIndex + 1}/4
                </Badge>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500">Completion Rate</p>
                <p className="font-bold text-lg">
                  {Math.round((analysis.completionRate || 0) * 100)}%
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500">Recent Activity</p>
                <p className="font-bold text-lg">
                  {analysis.activityLevel?.recentChallenges || 0}
                </p>
              </div>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                {adjustmentIcon()}
                <p className="font-semibold text-sm">AI Recommendation</p>
              </div>
              <p className="text-sm text-slate-700">{analysis.reasoning}</p>
            </div>
            
            {analysis.suggested_modifications && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-700">Suggested Adjustments:</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-white rounded border">
                    <p className="text-slate-500">Goal Multiplier</p>
                    <p className="font-bold">×{analysis.suggested_modifications.goal_multiplier}</p>
                  </div>
                  <div className="p-2 bg-white rounded border">
                    <p className="text-slate-500">Bonus Points</p>
                    <p className="font-bold">×{analysis.suggested_modifications.bonus_points_multiplier}</p>
                  </div>
                </div>
              </div>
            )}
            
            {analysis.motivational_message && (
              <div className="p-3 bg-int-gold/10 rounded-lg">
                <p className="text-sm font-medium text-int-navy">
                  💫 {analysis.motivational_message}
                </p>
              </div>
            )}
            
            {analysis.next_level_requirements && (
              <div className="p-3 bg-slate-50 rounded-lg text-xs">
                <p className="font-semibold mb-1">Next Level Requirements:</p>
                <ul className="space-y-1 text-slate-600">
                  <li>• Complete {analysis.next_level_requirements.challenges_to_complete} more challenges</li>
                  <li>• Maintain {Math.round(analysis.next_level_requirements.target_completion_rate * 100)}% completion rate</li>
                </ul>
              </div>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleAnalyze}
              disabled={analyzing}
              className="w-full"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Re-analyze
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}