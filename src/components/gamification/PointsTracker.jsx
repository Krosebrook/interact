import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Star, Calendar, MessageSquare, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PointsTracker({ userEmail, compact = false }) {
  const { data: userPointsRecords = [], isLoading } = useQuery({
    queryKey: ['user-points', userEmail],
    queryFn: () => base44.entities.UserPoints.filter({ user_email: userEmail }),
    enabled: !!userEmail
  });

  const userPoints = userPointsRecords[0];

  if (isLoading) {
    return (
      <Card data-b44-sync="true" data-feature="gamification" data-component="pointstracker" className="p-4 animate-pulse">
        <div className="h-20 bg-slate-200 rounded"></div>
      </Card>
    );
  }

  if (!userPoints) {
    return null;
  }

  const pointsToNextLevel = ((userPoints.level || 1) * 100) - (userPoints.total_points || 0);
  const progressToNextLevel = ((userPoints.total_points || 0) % 100);

  if (compact) {
    return (
      <Card className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="h-4 w-4 text-indigo-600" />
              <span className="text-sm font-semibold text-slate-700">Level {userPoints.level || 1}</span>
            </div>
            <p className="text-2xl font-bold text-indigo-600">{userPoints.total_points || 0}</p>
            <p className="text-xs text-slate-600">total points</p>
          </div>
          <div className="text-right">
            <Badge variant="outline" className="mb-2">
              <Star className="h-3 w-3 mr-1" />
              {userPoints.badges_earned?.length || 0} badges
            </Badge>
            {userPoints.streak_days > 0 && (
              <div className="text-sm text-orange-600 font-semibold">
                🔥 {userPoints.streak_days} day streak
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="p-6 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border-2 border-indigo-200">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Trophy className="h-6 w-6 text-indigo-600" />
                Level {userPoints.level || 1}
              </h3>
              <p className="text-slate-600">Keep going to reach Level {(userPoints.level || 1) + 1}!</p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-indigo-600">
                {userPoints.total_points || 0}
              </div>
              <div className="text-sm text-slate-600">total points</div>
            </div>
          </div>

          {/* Progress to Next Level */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-600">Progress to Level {(userPoints.level || 1) + 1}</span>
              <span className="text-slate-900 font-semibold">{pointsToNextLevel} points to go</span>
            </div>
            <Progress value={progressToNextLevel} className="h-3" />
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-3 text-center">
              <Calendar className="h-5 w-5 text-indigo-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-slate-900">{userPoints.events_attended || 0}</div>
              <div className="text-xs text-slate-600">Events</div>
            </div>
            <div className="bg-white rounded-lg p-3 text-center">
              <TrendingUp className="h-5 w-5 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-slate-900">{userPoints.activities_completed || 0}</div>
              <div className="text-xs text-slate-600">Activities</div>
            </div>
            <div className="bg-white rounded-lg p-3 text-center">
              <MessageSquare className="h-5 w-5 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-slate-900">{userPoints.feedback_submitted || 0}</div>
              <div className="text-xs text-slate-600">Feedback</div>
            </div>
            <div className="bg-white rounded-lg p-3 text-center">
              <Star className="h-5 w-5 text-yellow-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-slate-900">{userPoints.badges_earned?.length || 0}</div>
              <div className="text-xs text-slate-600">Badges</div>
            </div>
          </div>

          {/* Streak */}
          {userPoints.streak_days > 0 && (
            <div className="bg-gradient-to-r from-orange-100 to-red-100 rounded-lg p-4 text-center">
              <div className="text-3xl mb-2">🔥</div>
              <div className="text-2xl font-bold text-orange-700">{userPoints.streak_days} Day Streak!</div>
              <p className="text-sm text-orange-600">Keep participating to maintain your streak</p>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}