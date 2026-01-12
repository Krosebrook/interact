import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Flame, Award, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StreakTracker({ streakDays = 0, eventsThisMonth = 0 }) {
  const getStreakStatus = () => {
    if (streakDays >= 30) return { level: 'legendary', color: 'text-purple-600', bg: 'bg-purple-50', emoji: '🏆' };
    if (streakDays >= 7) return { level: 'fire', color: 'text-orange-600', bg: 'bg-orange-50', emoji: '🔥' };
    if (streakDays >= 3) return { level: 'hot', color: 'text-yellow-600', bg: 'bg-yellow-50', emoji: '⚡' };
    return { level: 'starting', color: 'text-slate-600', bg: 'bg-slate-50', emoji: '🌱' };
  };

  const status = getStreakStatus();

  const nextMilestone = streakDays < 3 ? 3 : streakDays < 7 ? 7 : streakDays < 30 ? 30 : null;

  return (
    <Card data-b44-sync="true" data-feature="gamification" data-component="streaktracker" className="border-2 overflow-hidden">
      <CardHeader className={`${status.bg} pb-3`}>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Flame className={`h-5 w-5 ${status.color}`} />
          Participation Streak
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="text-6xl mb-2"
          >
            {status.emoji}
          </motion.div>
          <div className="text-4xl font-bold text-slate-900 mb-1">
            {streakDays}
            <span className="text-xl text-slate-600 ml-2">
              {streakDays === 1 ? 'day' : 'days'}
            </span>
          </div>
          <p className="text-sm text-slate-600">Current streak</p>
        </div>

        {nextMilestone && (
          <div className="bg-slate-50 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">Next milestone</span>
              <Award className="h-4 w-4 text-int-orange" />
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-slate-200 rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(streakDays / nextMilestone) * 100}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="bg-int-orange h-full"
                />
              </div>
              <span className="text-sm font-medium text-slate-700">
                {nextMilestone - streakDays} more
              </span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-int-navy">{eventsThisMonth}</div>
            <p className="text-xs text-slate-600 mt-1">This month</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-2xl font-bold text-green-600">+{Math.min(streakDays * 10, 300)}</span>
            </div>
            <p className="text-xs text-slate-600 mt-1">Bonus points</p>
          </div>
        </div>

        {streakDays > 0 && (
          <div className="mt-4 text-center text-xs text-slate-500">
            Keep participating to maintain your streak! 💪
          </div>
        )}
      </CardContent>
    </Card>
  );
}