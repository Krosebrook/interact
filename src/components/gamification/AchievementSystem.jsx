import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Star, Award, Lock } from 'lucide-react';

export default function AchievementSystem({ userEmail }) {
  const { data: badges } = useQuery({
    queryKey: ['user-badge-awards', userEmail],
    queryFn: () => base44.entities.BadgeAward.filter({ user_email: userEmail })
  });

  const { data: learningProgress } = useQuery({
    queryKey: ['learning-progress-achievements', userEmail],
    queryFn: () => base44.entities.LearningPathProgress.filter({ user_email: userEmail })
  });

  const { data: allBadges } = useQuery({
    queryKey: ['all-badges'],
    queryFn: () => base44.entities.Badge.list()
  });

  const earnedBadgeIds = new Set(badges?.map(b => b.badge_id) || []);
  const achievements = (allBadges || []).map(badge => ({
    ...badge,
    earned: earnedBadgeIds.has(badge.id),
    earnedDate: badges?.find(b => b.badge_id === badge.id)?.awarded_date
  }));

  const completedPaths = learningProgress?.filter(p => p.status === 'completed').length || 0;
  const totalPaths = (learningProgress?.length || 0) || 1; // Prevent division by zero

  return (
    <Card data-b44-sync="true" data-feature="gamification" data-component="achievementsystem">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-600" />
          Achievements & Badges
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Learning Path Progress */}
        <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-blue-900">Learning Mastery</h4>
            <Badge className="bg-blue-600">
              {completedPaths}/{totalPaths}
            </Badge>
          </div>
          <Progress value={(completedPaths / totalPaths) * 100 || 0} className="h-2 mb-2" />
          <p className="text-sm text-blue-700">
            Complete learning paths to unlock exclusive achievement badges
          </p>
        </div>

        {/* Badge Grid */}
        <div className="grid grid-cols-3 gap-4">
          {achievements.length > 0 ? achievements.map((achievement) => {
            const Icon = achievement.earned ? Award : Lock;
            return (
              <div
                key={achievement.id}
                className={`p-4 rounded-lg border-2 transition-all ${
                  achievement.earned
                    ? 'border-amber-400 bg-gradient-to-br from-amber-50 to-yellow-50'
                    : 'border-slate-200 bg-slate-50 opacity-60'
                }`}
              >
                <div className="flex flex-col items-center text-center">
                  <div className={`p-3 rounded-full mb-2 ${
                    achievement.earned ? 'bg-amber-100' : 'bg-slate-200'
                  }`}>
                    <Icon className={`h-6 w-6 ${
                      achievement.earned ? 'text-amber-600' : 'text-slate-400'
                    }`} />
                  </div>
                  <h5 className="font-medium text-sm mb-1">{achievement.badge_name}</h5>
                  <p className="text-xs text-slate-600 mb-2">{achievement.description}</p>
                  {achievement.earned && (
                    <Badge variant="outline" className="text-xs">
                      {achievement.points_value} pts
                    </Badge>
                  )}
                  {!achievement.earned && (
                    <Badge variant="secondary" className="text-xs">
                      Locked
                    </Badge>
                  )}
                </div>
              </div>
            );
          }) : <p className="text-sm text-slate-500 col-span-3 text-center py-8">No badges earned yet. Complete learning paths to unlock achievements!</p>}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
            <div className="flex items-center gap-2 mb-1">
              <Star className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-900">Badges Earned</span>
            </div>
            <div className="text-2xl font-bold text-purple-700">
              {badges?.length || 0}
            </div>
          </div>
          
          <div className="p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-900">Completion Rate</span>
            </div>
            <div className="text-2xl font-bold text-green-700">
              {totalPaths > 0 ? Math.round((completedPaths / totalPaths) * 100) : 0}%
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}