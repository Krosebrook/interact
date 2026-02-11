import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Target, Calendar, TrendingUp } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

export default function MyChallenges({ participations, challenges }) {
  const activeChallenges = participations
    .filter(p => p.status === 'active')
    .map(p => ({
      ...p,
      challenge: challenges.find(c => c.id === p.challenge_id)
    }))
    .filter(p => p.challenge);

  const completedChallenges = participations
    .filter(p => p.status === 'completed')
    .map(p => ({
      ...p,
      challenge: challenges.find(c => c.id === p.challenge_id)
    }))
    .filter(p => p.challenge);

  return (
    <div className="space-y-6">
      {/* Active Challenges */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Active Challenges</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {activeChallenges.map(({ challenge, progress, progress_percentage }) => {
            const daysLeft = differenceInDays(new Date(challenge.end_date), new Date());
            
            return (
              <Card key={challenge.id} className="border-2 border-int-orange/50">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-int-orange" />
                      {challenge.title}
                    </span>
                    <Badge>{challenge.difficulty}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-600">Progress</span>
                      <span className="font-bold">{progress_percentage || 0}%</span>
                    </div>
                    <Progress value={progress_percentage || 0} className="h-2" />
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-slate-600">
                      <Calendar className="h-3 w-3" />
                      {daysLeft > 0 ? `${daysLeft} days left` : 'Ending soon'}
                    </div>
                    <Badge className="bg-int-orange text-white">
                      +{challenge.points_reward} pts
                    </Badge>
                  </div>

                  <div className="p-2 bg-slate-50 rounded text-xs text-slate-700">
                    Current: {progress || 0} / {challenge.target_metric?.target_value}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {activeChallenges.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Target className="h-12 w-12 mx-auto mb-3 text-slate-300" />
              <p className="text-slate-600">You haven't joined any challenges yet</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Completed Challenges */}
      {completedChallenges.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Completed Challenges</h3>
          <div className="space-y-3">
            {completedChallenges.map(({ challenge, points_earned, completed_date }) => (
              <Card key={challenge.id} className="bg-green-50 border-green-200">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Trophy className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium">{challenge.title}</p>
                        <p className="text-xs text-slate-600">
                          Completed {format(new Date(completed_date), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-green-600 text-white">
                      +{points_earned} pts earned
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}