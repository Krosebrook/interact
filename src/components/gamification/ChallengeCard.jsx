import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  Clock, 
  Users, 
  Zap, 
  CheckCircle2, 
  Trophy,
  Calendar,
  ArrowRight,
  Flame
} from 'lucide-react';
import { format, differenceInDays, differenceInHours } from 'date-fns';

const DIFFICULTY_CONFIG = {
  easy: { color: 'bg-emerald-100 text-emerald-700', label: 'Easy', points: '50-100' },
  medium: { color: 'bg-amber-100 text-amber-700', label: 'Medium', points: '100-250' },
  hard: { color: 'bg-red-100 text-red-700', label: 'Hard', points: '250-500' },
  epic: { color: 'bg-purple-100 text-purple-700', label: 'Epic', points: '500+' }
};

const STATUS_CONFIG = {
  active: { color: 'bg-gradient-wellness', icon: Target },
  completed: { color: 'bg-gradient-purple', icon: CheckCircle2 },
  expired: { color: 'bg-slate-400', icon: Clock },
  upcoming: { color: 'bg-gradient-icebreaker', icon: Calendar }
};

export default function ChallengeCard({ 
  challenge,
  userProgress = 0,
  isJoined = false,
  participantCount = 0,
  onJoin,
  onViewDetails
}) {
  const difficulty = DIFFICULTY_CONFIG[challenge.difficulty] || DIFFICULTY_CONFIG.medium;
  const status = STATUS_CONFIG[challenge.status] || STATUS_CONFIG.active;
  const StatusIcon = status.icon;

  const endDate = challenge.end_date ? new Date(challenge.end_date) : null;
  const daysRemaining = endDate ? differenceInDays(endDate, new Date()) : null;
  const hoursRemaining = endDate ? differenceInHours(endDate, new Date()) % 24 : null;

  const isUrgent = daysRemaining !== null && daysRemaining <= 2;
  const isCompleted = challenge.status === 'completed' || userProgress >= 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
    >
      <Card className={`overflow-hidden border-2 ${
        isCompleted ? 'border-emerald-300 bg-emerald-50/50' :
        isUrgent ? 'border-red-300' :
        'border-slate-200 hover:border-int-orange/50'
      }`}>
        {/* Status bar */}
        <div className={`h-1.5 ${status.color}`} />

        <CardContent className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${status.color} shadow-sm`}>
                <StatusIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">{challenge.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={difficulty.color}>{difficulty.label}</Badge>
                  {challenge.is_team_challenge && (
                    <Badge variant="outline" className="border-purple-300 text-purple-700">
                      <Users className="h-3 w-3 mr-1" />
                      Team
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Points reward */}
            <div className="text-right">
              <div className="flex items-center gap-1 text-int-orange font-bold">
                <Zap className="h-4 w-4" />
                {challenge.points_reward}
              </div>
              <span className="text-xs text-slate-500">points</span>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-slate-600 mb-4 line-clamp-2">
            {challenge.description}
          </p>

          {/* Progress */}
          {isJoined && (
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-1.5">
                <span className="text-slate-600">Your progress</span>
                <span className="font-semibold text-int-navy">{userProgress}%</span>
              </div>
              <div className="relative">
                <Progress value={userProgress} className="h-2.5" />
                {isCompleted && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -right-1 -top-1"
                  >
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 fill-emerald-100" />
                  </motion.div>
                )}
              </div>
            </div>
          )}

          {/* Stats row */}
          <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {participantCount} joined
            </span>
            {daysRemaining !== null && (
              <span className={`flex items-center gap-1 ${isUrgent ? 'text-red-600 font-semibold' : ''}`}>
                <Clock className="h-4 w-4" />
                {daysRemaining > 0 
                  ? `${daysRemaining}d ${hoursRemaining}h left`
                  : hoursRemaining > 0 
                    ? `${hoursRemaining}h left`
                    : 'Ending soon!'
                }
              </span>
            )}
            {challenge.streak_required && (
              <span className="flex items-center gap-1 text-orange-600">
                <Flame className="h-4 w-4" />
                {challenge.streak_required}+ streak
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {!isJoined && challenge.status === 'active' ? (
              <Button 
                onClick={() => onJoin?.(challenge)}
                className="flex-1 bg-gradient-orange hover:opacity-90 text-white shadow-md press-effect"
              >
                <Target className="h-4 w-4 mr-2" />
                Join Challenge
              </Button>
            ) : isCompleted ? (
              <Button 
                variant="outline" 
                className="flex-1 border-emerald-300 text-emerald-700"
                disabled
              >
                <Trophy className="h-4 w-4 mr-2" />
                Completed!
              </Button>
            ) : (
              <Button 
                variant="outline"
                onClick={() => onViewDetails?.(challenge)}
                className="flex-1"
              >
                View Details
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}