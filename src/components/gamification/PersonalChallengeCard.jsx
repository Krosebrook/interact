import React from 'react';
import { motion } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  Clock, 
  Zap, 
  CheckCircle2, 
  Trophy,
  Calendar,
  Flame,
  Users,
  MessageSquare,
  Award,
  Sparkles,
  Share2
} from 'lucide-react';
import { format, differenceInDays, differenceInHours } from 'date-fns';
import { toast } from 'sonner';

const CHALLENGE_TYPE_CONFIG = {
  daily: { icon: Calendar, color: 'bg-blue-100 text-blue-700', label: 'Daily' },
  weekly: { icon: Target, color: 'bg-purple-100 text-purple-700', label: 'Weekly' },
  milestone: { icon: Trophy, color: 'bg-amber-100 text-amber-700', label: 'Milestone' },
  streak: { icon: Flame, color: 'bg-orange-100 text-orange-700', label: 'Streak' },
  social: { icon: Users, color: 'bg-pink-100 text-pink-700', label: 'Social' },
  skill: { icon: Sparkles, color: 'bg-cyan-100 text-cyan-700', label: 'Skill' },
  exploration: { icon: Target, color: 'bg-emerald-100 text-emerald-700', label: 'Exploration' }
};

const METRIC_LABELS = {
  events_attended: 'events',
  feedback_submitted: 'feedback',
  recognitions_given: 'recognitions given',
  recognitions_received: 'recognitions received',
  streak_days: 'day streak',
  activities_completed: 'activities',
  team_events: 'team events',
  points_earned: 'points',
  badges_earned: 'badges',
  connections_made: 'connections'
};

export default function PersonalChallengeCard({ 
  challenge,
  onShare,
  onComplete
}) {
  const queryClient = useQueryClient();
  const typeConfig = CHALLENGE_TYPE_CONFIG[challenge.challenge_type] || CHALLENGE_TYPE_CONFIG.weekly;
  const TypeIcon = typeConfig.icon;
  
  const progress = Math.min(100, (challenge.current_progress / challenge.target_value) * 100);
  const endDate = challenge.end_date ? new Date(challenge.end_date) : null;
  const daysRemaining = endDate ? differenceInDays(endDate, new Date()) : null;
  const hoursRemaining = endDate ? differenceInHours(endDate, new Date()) % 24 : null;
  const isUrgent = daysRemaining !== null && daysRemaining <= 1;
  const isCompleted = challenge.status === 'completed' || progress >= 100;
  const metricLabel = METRIC_LABELS[challenge.target_metric] || challenge.target_metric;

  const completeMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.PersonalChallenge.update(challenge.id, {
        status: 'completed',
        completed_date: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['personal-challenges']);
      toast.success(`Challenge completed! +${challenge.points_reward} points`);
      onComplete?.(challenge);
    }
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
    >
      <Card className={`overflow-hidden border-2 transition-all ${
        isCompleted ? 'border-emerald-300 bg-emerald-50/30' :
        isUrgent ? 'border-red-300 bg-red-50/30' :
        'border-slate-200 hover:border-int-orange/50'
      }`}>
        <div className={`h-1 ${isCompleted ? 'bg-gradient-wellness' : isUrgent ? 'bg-red-400' : 'bg-gradient-orange'}`} />
        
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${typeConfig.color}`}>
                <TypeIcon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">{challenge.title}</h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge className={typeConfig.color} variant="outline">
                    {typeConfig.label}
                  </Badge>
                  {challenge.is_ai_generated && (
                    <Badge variant="outline" className="border-purple-300 text-purple-600 text-xs">
                      <Sparkles className="h-3 w-3 mr-1" />
                      AI
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-int-orange font-bold text-sm">
                <Zap className="h-4 w-4" />
                +{challenge.points_reward}
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-xs text-slate-600 mb-3">{challenge.description}</p>

          {/* Progress */}
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-600">
                {challenge.current_progress}/{challenge.target_value} {metricLabel}
              </span>
              <span className={`font-semibold ${isCompleted ? 'text-emerald-600' : 'text-int-navy'}`}>
                {Math.round(progress)}%
              </span>
            </div>
            <div className="relative">
              <Progress value={progress} className="h-2" />
              {isCompleted && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -right-1 -top-1"
                >
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 fill-emerald-100" />
                </motion.div>
              )}
            </div>
          </div>

          {/* Time remaining */}
          {daysRemaining !== null && !isCompleted && (
            <div className={`flex items-center gap-1 text-xs mb-3 ${isUrgent ? 'text-red-600 font-semibold' : 'text-slate-500'}`}>
              <Clock className="h-3 w-3" />
              {daysRemaining > 0 
                ? `${daysRemaining}d ${hoursRemaining}h left`
                : hoursRemaining > 0 
                  ? `${hoursRemaining}h left`
                  : 'Ending soon!'
              }
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            {isCompleted ? (
              <>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex-1 border-emerald-300 text-emerald-700"
                  disabled
                >
                  <Trophy className="h-4 w-4 mr-1" />
                  Completed!
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onShare?.(challenge)}
                  className="text-slate-600"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </>
            ) : progress >= 100 ? (
              <Button 
                size="sm"
                className="flex-1 bg-gradient-wellness text-white"
                onClick={() => completeMutation.mutate()}
                disabled={completeMutation.isPending}
              >
                <Award className="h-4 w-4 mr-1" />
                Claim Reward
              </Button>
            ) : (
              <div className="flex-1 text-center text-xs text-slate-500 py-2">
                Keep going! {challenge.target_value - challenge.current_progress} more to go
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}