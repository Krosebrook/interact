import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, Trophy, Medal, Star } from 'lucide-react';

const ACHIEVEMENT_ICONS = {
  award: Award,
  certification: Medal,
  milestone: Trophy,
  project: Star
};

const ACHIEVEMENT_COLORS = {
  award: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  certification: 'bg-blue-100 text-blue-800 border-blue-300',
  milestone: 'bg-purple-100 text-purple-800 border-purple-300',
  project: 'bg-green-100 text-green-800 border-green-300'
};

export default function AchievementsShowcase({ achievements }) {
  if (!achievements?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-600" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600">No achievements added yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-600" />
          Achievements
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          {achievements.map((achievement, idx) => {
            const Icon = ACHIEVEMENT_ICONS[achievement.type] || Award;
            return (
              <div
                key={idx}
                className={`p-4 rounded-lg border-2 ${ACHIEVEMENT_COLORS[achievement.type] || 'bg-slate-100 text-slate-800 border-slate-300'}`}
              >
                <div className="flex items-start gap-3">
                  <Icon className="w-6 h-6 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h4 className="font-semibold">{achievement.title}</h4>
                    <p className="text-sm mt-1">{achievement.description}</p>
                    <p className="text-xs mt-2 opacity-75">
                      {new Date(achievement.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}