import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Target, TrendingUp, CheckCircle, X, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import LoadingSpinner from '../common/LoadingSpinner';

export default function PersonalizedGoalsSuggestions({ userEmail }) {
  const queryClient = useQueryClient();
  const [dismissed, setDismissed] = useState([]);
  
  const { data: suggestedGoals = [], isLoading, refetch } = useQuery({
    queryKey: ['suggestedGoals', userEmail],
    queryFn: async () => {
      const goals = await base44.entities.PersonalChallenge.filter({
        user_email: userEmail,
        status: 'suggested',
        ai_generated: true
      });
      return goals.filter(g => !dismissed.includes(g.id));
    },
    enabled: !!userEmail
  });
  
  const generateGoalsMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('generatePersonalizedGoals', {
        userEmail
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['suggestedGoals']);
      toast.success('AI generated personalized goals for you!');
    }
  });
  
  const acceptGoalMutation = useMutation({
    mutationFn: async (goalId) => {
      return base44.entities.PersonalChallenge.update(goalId, {
        status: 'active',
        accepted_at: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['suggestedGoals']);
      queryClient.invalidateQueries(['personalChallenges']);
      toast.success('Goal activated! Good luck! 🎯');
    }
  });
  
  const dismissGoal = (goalId) => {
    setDismissed(prev => [...prev, goalId]);
    toast.info('Goal dismissed');
  };
  
  const difficultyColors = {
    easy: 'bg-green-100 text-green-700',
    medium: 'bg-yellow-100 text-yellow-700',
    hard: 'bg-red-100 text-red-700'
  };
  
  const categoryIcons = {
    social: '🤝',
    wellness: '💪',
    learning: '📚',
    contribution: '🎁',
    engagement: '⚡'
  };
  
  if (isLoading) return <LoadingSpinner />;
  
  return (
    <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              AI-Recommended Goals
            </CardTitle>
            <CardDescription>
              Personalized challenges based on your activity and progress
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => generateGoalsMutation.mutate()}
            disabled={generateGoalsMutation.isPending}
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            {generateGoalsMutation.isPending ? 'Generating...' : 'Refresh'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {suggestedGoals.length === 0 ? (
          <div className="text-center py-8">
            <Target className="h-12 w-12 mx-auto mb-3 text-slate-300" />
            <p className="text-slate-600 mb-4">No personalized goals yet</p>
            <Button
              onClick={() => generateGoalsMutation.mutate()}
              disabled={generateGoalsMutation.isPending}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Generate My Goals
            </Button>
          </div>
        ) : (
          suggestedGoals.map(goal => (
            <div
              key={goal.id}
              className="bg-white rounded-lg p-4 border-2 border-purple-100 hover:border-purple-300 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-2">
                  <span className="text-2xl">{categoryIcons[goal.goal_type] || '🎯'}</span>
                  <div>
                    <h4 className="font-semibold text-sm">{goal.title}</h4>
                    <p className="text-xs text-slate-600 mt-1">{goal.description}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => dismissGoal(goal.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <Badge variant="outline" className="text-xs">
                  {goal.target_value} {goal.target_unit || 'actions'}
                </Badge>
                <Badge className={`text-xs ${difficultyColors[goal.difficulty]}`}>
                  {goal.difficulty}
                </Badge>
                <Badge className="text-xs bg-int-orange text-white">
                  +{goal.points_reward} points
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {Math.ceil((new Date(goal.end_date) - new Date(goal.start_date)) / (1000 * 60 * 60 * 24))} days
                </Badge>
              </div>
              
              <Button
                size="sm"
                onClick={() => acceptGoalMutation.mutate(goal.id)}
                disabled={acceptGoalMutation.isPending}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Accept Challenge
              </Button>
            </div>
          ))
        )}
        
        {generateGoalsMutation.data?.recommendation && (
          <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
            <p className="text-sm text-purple-900">
              <strong>AI Recommendation:</strong> {generateGoalsMutation.data.recommendation}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}