import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Trophy, Medal, Award } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';

export default function ChallengeLeaderboard({ challenges }) {
  const { data: allParticipations = [], isLoading } = useQuery({
    queryKey: ['all-challenge-participations'],
    queryFn: () => base44.entities.ChallengeParticipation.list('-points_earned', 100)
  });

  if (isLoading) return <LoadingSpinner message="Loading leaderboard..." />;

  // Aggregate points by user
  const userScores = allParticipations.reduce((acc, p) => {
    if (!acc[p.user_email]) {
      acc[p.user_email] = {
        email: p.user_email,
        totalPoints: 0,
        completedChallenges: 0
      };
    }
    acc[p.user_email].totalPoints += p.points_earned || 0;
    if (p.status === 'completed') {
      acc[p.user_email].completedChallenges++;
    }
    return acc;
  }, {});

  const leaderboard = Object.values(userScores)
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .slice(0, 10);

  const rankIcons = [Trophy, Medal, Award];
  const rankColors = ['text-amber-500', 'text-slate-400', 'text-amber-700'];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-int-orange" />
          Challenge Champions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {leaderboard.map((entry, idx) => {
            const RankIcon = rankIcons[idx] || Award;
            const rankColor = rankColors[idx] || 'text-slate-500';
            
            return (
              <div
                key={entry.email}
                className={`flex items-center gap-4 p-4 rounded-lg transition-all ${
                  idx < 3 ? 'bg-gradient-to-r from-int-orange/5 to-purple-500/5 border-2 border-int-orange/20' : 'bg-slate-50'
                }`}
              >
                <div className={`flex items-center justify-center w-8 ${rankColor}`}>
                  <RankIcon className="h-6 w-6" />
                </div>
                
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-int-navy text-white">
                    {entry.email.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <p className="font-medium text-slate-900">{entry.email}</p>
                  <p className="text-xs text-slate-600">
                    {entry.completedChallenges} challenges completed
                  </p>
                </div>

                <Badge className="bg-int-orange text-white">
                  {entry.totalPoints.toLocaleString()} pts
                </Badge>
              </div>
            );
          })}
        </div>

        {leaderboard.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <Trophy className="h-12 w-12 mx-auto mb-3 text-slate-300" />
            <p>No participants yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}