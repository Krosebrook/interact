import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Play, Award, Clock, Zap, Trophy } from 'lucide-react';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

export default function MicroLearningModule({ module, userEmail, skillGap, onComplete }) {
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [progress, setProgress] = useState(0);
  const queryClient = useQueryClient();

  const completeMutation = useMutation({
    mutationFn: async () => {
      // Award points for completion
      await base44.functions.invoke('recordPointsTransaction', {
        user_email: userEmail,
        amount: module.points_reward,
        transaction_type: 'activity_completion',
        reference_type: 'MicroLearning',
        reference_id: module.id,
        description: `Completed micro-module: ${module.title}`
      });

      // Check existing badges to see if micro-learning badge should be awarded
      const userBadges = await base44.entities.BadgeAward.filter({ 
        user_email: userEmail 
      });
      const microLearningCompletions = userBadges.filter(
        b => b.reason?.includes('micro-learning') || b.reason?.includes('Quick Win')
      ).length + 1;

      // Award badge after 3, 5, 10 completions
      let badgeEarned = null;
      if ([3, 5, 10].includes(microLearningCompletions)) {
        const badges = await base44.entities.Badge.filter({ 
          badge_name: { $regex: 'Quick' } 
        });
        if (badges.length > 0) {
          await base44.entities.BadgeAward.create({
            user_email: userEmail,
            badge_id: badges[0].id,
            awarded_by: 'system',
            reason: `Completed ${microLearningCompletions} micro-learning modules`
          });
          badgeEarned = { 
            badge_name: badges[0].badge_name, 
            badge_description: badges[0].description 
          };
        }
      }

      return { badge_earned: badgeEarned };
    },
    onSuccess: (data) => {
      setCompleted(true);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
      
      toast.success(`+${module.points_reward} points earned! 🎉`, {
        description: module.title
      });

      if (data?.badge_earned?.badge_name) {
        setTimeout(() => {
          toast.success(`🏆 Badge Unlocked: ${data.badge_earned.badge_name}!`, {
            description: data.badge_earned.badge_description
          });
        }, 1000);
      }

      queryClient.invalidateQueries(['user-points']);
      queryClient.invalidateQueries(['user-badges']);
      
      if (onComplete) onComplete();
    },
    onError: (error) => {
      toast.error('Failed to complete module: ' + error.message);
    }
  });

  const handleStart = () => {
    setStarted(true);
    // Simulate progress for demo
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 10;
      setProgress(currentProgress);
      if (currentProgress >= 100) {
        clearInterval(interval);
      }
    }, 300);
  };

  const handleComplete = () => {
    completeMutation.mutate();
  };

  return (
    <Card className={`transition-all ${completed ? 'border-2 border-emerald-500 bg-emerald-50' : 'hover:shadow-lg'}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-amber-600" />
              <Badge variant="outline" className="text-xs bg-amber-50 text-amber-800 border-amber-300">
                Quick Win
              </Badge>
              <Badge variant="outline" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                {module.duration}
              </Badge>
            </div>
            <CardTitle className="text-base">{module.title}</CardTitle>
            <p className="text-xs text-slate-600 mt-1">{module.description}</p>
          </div>
          {!completed && (
            <div className="text-right ml-4">
              <div className="flex items-center gap-1 text-int-orange font-bold">
                <Award className="h-4 w-4" />
                +{module.points_reward}
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Content Type Badge */}
        <div className="flex items-center gap-2">
          <Badge className="text-xs bg-purple-100 text-purple-800">
            {module.type === 'video' ? '📹 Video' : 
             module.type === 'exercise' ? '✏️ Exercise' : 
             module.type === 'article' ? '📄 Article' : 
             '🎯 Interactive'}
          </Badge>
          <span className="text-xs text-slate-600">Targets: {skillGap}</span>
        </div>

        {/* Progress */}
        {started && !completed && (
          <div>
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-slate-600 mt-1">{progress}% complete</p>
          </div>
        )}

        {/* Actions */}
        {!started && !completed && (
          <Button
            onClick={handleStart}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            <Play className="h-4 w-4 mr-2" />
            Start Learning ({module.duration})
          </Button>
        )}

        {started && !completed && progress >= 100 && (
          <Button
            onClick={handleComplete}
            disabled={completeMutation.isPending}
            className="w-full bg-emerald-600 hover:bg-emerald-700"
          >
            {completeMutation.isPending ? 'Completing...' : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark Complete & Claim Points
              </>
            )}
          </Button>
        )}

        {completed && (
          <div className="bg-emerald-100 border border-emerald-300 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-2 text-emerald-900">
              <Trophy className="h-5 w-5" />
              <span className="font-semibold">Module Completed!</span>
            </div>
            <p className="text-xs text-emerald-800 mt-1">
              Keep building your skills!
            </p>
          </div>
        )}

        {/* Learning Outcome */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs font-medium text-blue-900 mb-1">You'll Learn:</p>
          <p className="text-xs text-blue-800">{module.learning_outcome}</p>
        </div>
      </CardContent>
    </Card>
  );
}