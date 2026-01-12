import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Calendar, Award, TrendingUp, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

/**
 * Animated streak flame with milestone tracking
 */
export default function StreakFlame({ 
  currentStreak = 0, 
  longestStreak = 0,
  lastActivityDate,
  compact = false 
}) {
  // Streak tiers
  const getStreakTier = (streak) => {
    if (streak >= 100) return { 
      tier: 'inferno', 
      emoji: '🌋', 
      color: 'from-red-500 via-orange-500 to-yellow-500',
      bg: 'bg-gradient-to-br from-red-50 to-orange-50',
      border: 'border-red-300',
      message: 'LEGENDARY STREAK!'
    };
    if (streak >= 30) return { 
      tier: 'blazing', 
      emoji: '🔥', 
      color: 'from-orange-500 via-amber-500 to-yellow-400',
      bg: 'bg-gradient-to-br from-orange-50 to-amber-50',
      border: 'border-orange-300',
      message: 'You\'re on fire!'
    };
    if (streak >= 14) return { 
      tier: 'hot', 
      emoji: '🔥', 
      color: 'from-amber-500 to-yellow-400',
      bg: 'bg-gradient-to-br from-amber-50 to-yellow-50',
      border: 'border-amber-300',
      message: 'Keep it burning!'
    };
    if (streak >= 7) return { 
      tier: 'warm', 
      emoji: '⚡', 
      color: 'from-yellow-400 to-orange-300',
      bg: 'bg-gradient-to-br from-yellow-50 to-orange-50',
      border: 'border-yellow-300',
      message: 'Building momentum!'
    };
    if (streak >= 3) return { 
      tier: 'starting', 
      emoji: '✨', 
      color: 'from-blue-400 to-cyan-400',
      bg: 'bg-gradient-to-br from-blue-50 to-cyan-50',
      border: 'border-blue-300',
      message: 'Getting started!'
    };
    return { 
      tier: 'cold', 
      emoji: '🌱', 
      color: 'from-slate-400 to-slate-500',
      bg: 'bg-slate-50',
      border: 'border-slate-200',
      message: 'Start your streak!'
    };
  };

  const tier = getStreakTier(currentStreak);
  
  // Calculate next milestone
  const milestones = [3, 7, 14, 30, 60, 100];
  const nextMilestone = milestones.find(m => m > currentStreak) || currentStreak + 30;
  const progressToMilestone = (currentStreak / nextMilestone) * 100;

  // Check if streak is at risk
  const isAtRisk = lastActivityDate && (
    new Date() - new Date(lastActivityDate) > 24 * 60 * 60 * 1000
  );

  if (compact) {
    return (
      <div data-b44-sync="true" data-feature="gamification" data-component="streakflame" className={`flex items-center gap-2 px-3 py-2 rounded-lg ${tier.bg} ${tier.border} border`}>
        <motion.span 
          className="text-xl"
          animate={currentStreak >= 7 ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
        >
          {tier.emoji}
        </motion.span>
        <div>
          <span className="font-bold text-lg">{currentStreak}</span>
          <span className="text-sm text-slate-600 ml-1">day streak</span>
        </div>
      </div>
    );
  }

  return (
    <Card className={`overflow-hidden border-2 ${tier.border} ${tier.bg}`}>
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <motion.div
              className={`p-3 rounded-xl bg-gradient-to-br ${tier.color} shadow-lg`}
              animate={currentStreak >= 7 ? { 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              } : {}}
              transition={{ duration: 1, repeat: Infinity, repeatDelay: 3 }}
            >
              <Flame className="h-6 w-6 text-white" />
            </motion.div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Participation Streak</h3>
              <p className="text-sm text-slate-600">{tier.message}</p>
            </div>
          </div>
          
          {isAtRisk && (
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="px-2 py-1 rounded-full bg-red-100 text-red-600 text-xs font-semibold"
            >
              ⚠️ At Risk!
            </motion.div>
          )}
        </div>

        {/* Main streak display */}
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="inline-flex flex-col items-center"
          >
            <motion.span 
              className="text-6xl mb-2"
              animate={currentStreak >= 14 ? { 
                y: [0, -10, 0],
              } : {}}
              transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 2 }}
            >
              {tier.emoji}
            </motion.span>
            <div className="flex items-baseline gap-2">
              <motion.span 
                className={`text-5xl font-bold bg-gradient-to-r ${tier.color} bg-clip-text text-transparent`}
                key={currentStreak}
                initial={{ scale: 1.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                {currentStreak}
              </motion.span>
              <span className="text-xl text-slate-600">
                {currentStreak === 1 ? 'day' : 'days'}
              </span>
            </div>
          </motion.div>
        </div>

        {/* Progress to next milestone */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-slate-600">Next milestone</span>
            <span className="font-semibold flex items-center gap-1">
              <Award className="h-4 w-4 text-int-orange" />
              {nextMilestone} days
            </span>
          </div>
          <div className="relative">
            <Progress value={progressToMilestone} className="h-3" />
            <motion.div
              className="absolute top-0 left-0 h-full rounded-full overflow-hidden"
              style={{ width: `${progressToMilestone}%` }}
            >
              <div className={`h-full bg-gradient-to-r ${tier.color} animate-shimmer`} />
            </motion.div>
          </div>
          <p className="text-xs text-slate-500 mt-1 text-right">
            {nextMilestone - currentStreak} more days to go
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-white/70 rounded-lg">
            <Flame className="h-5 w-5 mx-auto mb-1 text-int-orange" />
            <div className="font-bold text-slate-900">{currentStreak}</div>
            <div className="text-xs text-slate-500">Current</div>
          </div>
          <div className="text-center p-3 bg-white/70 rounded-lg">
            <Award className="h-5 w-5 mx-auto mb-1 text-purple-600" />
            <div className="font-bold text-slate-900">{longestStreak}</div>
            <div className="text-xs text-slate-500">Best</div>
          </div>
          <div className="text-center p-3 bg-white/70 rounded-lg">
            <Zap className="h-5 w-5 mx-auto mb-1 text-emerald-600" />
            <div className="font-bold text-slate-900">+{Math.min(currentStreak * 5, 500)}</div>
            <div className="text-xs text-slate-500">Bonus</div>
          </div>
        </div>

        {/* Streak milestone badges */}
        {currentStreak > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-200/50">
            <div className="flex justify-center gap-2">
              {milestones.slice(0, 5).map(m => (
                <motion.div
                  key={m}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    currentStreak >= m 
                      ? 'bg-gradient-orange text-white shadow-md' 
                      : 'bg-slate-200 text-slate-400'
                  }`}
                  animate={currentStreak >= m ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ delay: m * 0.1 }}
                >
                  {m}
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}