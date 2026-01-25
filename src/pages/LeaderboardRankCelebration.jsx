import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useUserData } from '../components/hooks/useUserData';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TrendingUp, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const MOUNTAIN_BG = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800';

export default function LeaderboardRankCelebration() {
  const { user } = useUserData();
  const [previousRank, setPreviousRank] = useState(null);

  const { data: userPoints } = useQuery({
    queryKey: ['user-points', user?.email],
    queryFn: async () => {
      const points = await base44.entities.UserPoints.filter({ user_email: user?.email });
      return points[0] || { total_points: 0 };
    },
    enabled: !!user?.email
  });

  const { data: leaderboardData = [] } = useQuery({
    queryKey: ['leaderboard-all'],
    queryFn: () => base44.entities.UserPoints.list('-total_points', 100)
  });

  const { data: userProfile } = useQuery({
    queryKey: ['user-profile', user?.email],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.filter({ user_email: user?.email });
      return profiles[0] || null;
    },
    enabled: !!user?.email
  });

  const currentRank = leaderboardData.findIndex(p => p.user_email === user?.email) + 1;

  useEffect(() => {
    const saved = localStorage.getItem('last-rank-' + user?.email);
    if (saved && !previousRank) {
      setPreviousRank(parseInt(saved));
    }
    if (currentRank > 0) {
      localStorage.setItem('last-rank-' + user?.email, currentRank.toString());
    }
  }, [currentRank, user?.email, previousRank]);

  const rankImprovement = previousRank && currentRank ? previousRank - currentRank : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-slate-900 text-white relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 z-0 opacity-30">
        <img src={MOUNTAIN_BG} alt="" className="w-full h-full object-cover" />
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center p-4 justify-between">
        <Link to={createPageUrl('Leaderboards')}>
          <Button size="icon" variant="ghost" className="rounded-full bg-white/10 text-white">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h2 className="text-lg font-bold">INTInc</h2>
        <div className="w-10" />
      </div>

      {/* Rank Display */}
      <div className="relative z-20 flex flex-col items-center justify-center px-6 pt-20 pb-12">
        <div className="relative">
          <div className="absolute inset-0 flex items-center justify-center -z-10">
            <div className="w-64 h-64 rounded-full bg-[#f2a60d]/20 blur-3xl"></div>
          </div>
          <h1 className="text-center flex flex-col items-center">
            {previousRank && (
              <span className="text-white/30 line-through text-3xl font-medium mb-2">
                #{previousRank}
              </span>
            )}
            <span className="text-[#f2a60d] text-7xl font-black drop-shadow-[0_0_15px_rgba(242,166,13,0.8)]">
              #{currentRank}
            </span>
          </h1>
        </div>
        {rankImprovement > 0 && (
          <p className="text-[#f2a60d] text-xl font-semibold mt-4">
            You've climbed {rankImprovement} spots!
          </p>
        )}
      </div>

      {/* Nearby Rankings */}
      <div className="relative z-10 flex flex-col items-center px-6 gap-4 pb-8">
        {/* Person above */}
        {leaderboardData[currentRank - 2] && (
          <div className="w-full max-w-sm bg-white/5 backdrop-blur-md border border-white/10 rounded-xl px-4 py-3 flex items-center justify-between opacity-40 blur-[1px]">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-gradient-to-br from-slate-600 to-slate-700 text-white">
                  {leaderboardData[currentRank - 2].user_email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-white font-medium">{leaderboardData[currentRank - 2].user_email}</p>
                <p className="text-white/60 text-sm">{leaderboardData[currentRank - 2].total_points} points</p>
              </div>
            </div>
            <p className="text-white/60">#{currentRank - 1}</p>
          </div>
        )}

        {/* Current User - Highlighted */}
        <div className="relative w-full max-w-sm">
          <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-1 bg-gradient-to-t from-transparent via-[#f2a60d]/50 to-[#f2a60d] h-24 blur-[2px]"></div>
          <div className="bg-zinc-950 border-2 border-[#f2a60d] rounded-full px-4 py-3 flex items-center justify-between shadow-lg shadow-[#f2a60d]/30">
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14 border-2 border-[#f2a60d]/50">
                <AvatarImage src={userProfile?.profile_picture_url} />
                <AvatarFallback className="bg-gradient-to-br from-[#f2a60d] to-orange-600 text-white text-lg">
                  {user?.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-white text-lg font-bold">
                  {user?.full_name} <span className="text-[#f2a60d] text-xs ml-1">(You)</span>
                </p>
                <p className="text-[#f2a60d] text-sm font-medium">{userPoints?.total_points || 0} points</p>
              </div>
            </div>
            <div className="bg-[#f2a60d]/20 rounded-full px-3 py-1 border border-[#f2a60d]/30">
              <p className="text-[#f2a60d] text-lg font-bold">#{currentRank}</p>
            </div>
          </div>
        </div>

        {/* Person below */}
        {leaderboardData[currentRank] && (
          <div className="w-full max-w-sm bg-white/5 backdrop-blur-md border border-white/10 rounded-xl px-4 py-3 flex items-center justify-between opacity-40 blur-[1px]">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-gradient-to-br from-slate-600 to-slate-700 text-white">
                  {leaderboardData[currentRank].user_email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-white font-medium">{leaderboardData[currentRank].user_email}</p>
                <p className="text-white/60 text-sm">{leaderboardData[currentRank].total_points} points</p>
              </div>
            </div>
            <p className="text-white/60">#{currentRank + 1}</p>
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="relative z-10 px-6 pb-8">
        <Button className="w-full bg-[#f2a60d] hover:bg-[#e29a0a] text-black font-bold py-6 rounded-full text-lg shadow-xl shadow-[#f2a60d]/30 flex items-center justify-center gap-2">
          Keep Climbing <TrendingUp className="h-5 w-5" />
        </Button>
        {leaderboardData[0] && currentRank > 1 && (
          <p className="text-center text-slate-400 text-sm mt-4">
            The summit is only {currentRank - 1} spots away
          </p>
        )}
      </div>
    </div>
  );
}