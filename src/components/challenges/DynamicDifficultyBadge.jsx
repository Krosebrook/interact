import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Zap } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function DynamicDifficultyBadge({ challenge }) {
  if (!challenge.ai_suggestions) return null;

  const suggestions = challenge.ai_suggestions;
  const difficultyScore = suggestions.difficulty_score || 50;
  const previousPoints = suggestions.previous_points;
  const currentPoints = challenge.points_reward;

  // Determine difficulty level
  let difficultyLevel = 'Medium';
  let difficultyColor = 'bg-yellow-100 text-yellow-700';
  
  if (difficultyScore < 40) {
    difficultyLevel = 'Easy';
    difficultyColor = 'bg-green-100 text-green-700';
  } else if (difficultyScore > 70) {
    difficultyLevel = 'Hard';
    difficultyColor = 'bg-red-100 text-red-700';
  }

  const pointsChanged = previousPoints && currentPoints !== previousPoints;
  const pointsIncreased = currentPoints > previousPoints;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2">
            <Badge className={`${difficultyColor} flex items-center gap-1`}>
              <Zap className="h-3 w-3" />
              {difficultyLevel}
            </Badge>
            
            {pointsChanged && (
              <Badge variant="outline" className="flex items-center gap-1">
                {pointsIncreased ? (
                  <TrendingUp className="h-3 w-3 text-green-600" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-600" />
                )}
                AI Adjusted
              </Badge>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="space-y-2">
            <p className="font-semibold">AI Difficulty Analysis</p>
            <div className="text-xs space-y-1">
              <p>Difficulty Score: {difficultyScore}/100</p>
              {suggestions.completion_rate && (
                <p>Completion Rate: {suggestions.completion_rate}</p>
              )}
              {suggestions.avg_progress && (
                <p>Avg Progress: {suggestions.avg_progress}%</p>
              )}
              {pointsChanged && (
                <p className="text-purple-600 font-semibold">
                  Points: {previousPoints} → {currentPoints}
                </p>
              )}
              {suggestions.reason && (
                <p className="italic text-slate-600 mt-1">{suggestions.reason}</p>
              )}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}