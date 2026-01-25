import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useUserData } from '../components/hooks/useUserData';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Flame, Sparkles, TrendingUp, Award, BarChart3, Gift } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function ParticipantHub() {
  const { user, loading } = useUserData();

  const { data: userProfile } = useQuery({
    queryKey: ['user-profile', user?.email],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.filter({ user_email: user?.email });
      return profiles[0] || null;
    },
    enabled: !!user?.email
  });

  const { data: userPoints } = useQuery({
    queryKey: ['user-points', user?.email],
    queryFn: async () => {
      const points = await base44.entities.UserPoints.filter({ user_email: user?.email });
      return points[0] || { total_points: 0, current_streak: 0, xp: 0, level: 1 };
    },
    enabled: !!user?.email
  });

  const { data: badges = [] } = useQuery({
    queryKey: ['user-badges', user?.email],
    queryFn: () => base44.entities.BadgeAward.filter({ user_email: user?.email })
  });

  const { data: recentRecognitions = [] } = useQuery({
    queryKey: ['recent-recognitions', user?.email],
    queryFn: () => base44.entities.Recognition.filter({ 
      recipient_email: user?.email,
      status: 'approved'
    }, '-created_date', 5),
    enabled: !!user?.email
  });

  if (loading) return <LoadingSpinner />;

  const currentXP = userPoints?.xp || 0;
  const level = userPoints?.level || 1;
  const xpForNextLevel = level * 2000;
  const xpProgress = (currentXP / xpForNextLevel) * 100;
  const xpNeeded = xpForNextLevel - currentXP;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950 pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md px-4 py-4 border-b border-blue-500/20">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/50">
              <span className="text-white font-extrabold text-xs italic">INTI</span>
            </div>
            <h2 className="text-lg font-extrabold">Participant Hub</h2>
          </div>
          <Link to={createPageUrl('UserProfile')}>
            <Avatar className="h-10 w-10 border-2 border-blue-500">
              <AvatarImage src={userProfile?.profile_picture_url} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-violet-600 text-white">
                {user?.email?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 pt-6 space-y-6">
        {/* Profile & Level Card */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-slate-900 to-blue-900/50 border-blue-500/20 shadow-xl shadow-blue-500/10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 blur-3xl rounded-full -mr-10 -mt-10"></div>
          <CardContent className="p-5 space-y-4 relative z-10">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-2 border-blue-500 p-0.5">
                  <Avatar className="w-full h-full">
                    <AvatarImage src={userProfile?.profile_picture_url} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-violet-600 text-white text-xl">
                      {user?.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="absolute -bottom-1 -right-1 bg-blue-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white">
                  LVL {level}
                </div>
              </div>
              <div className="flex flex-col flex-1">
                <h3 className="text-white text-xl font-bold">{user?.full_name}</h3>
                <p className="text-slate-400 text-sm">{userProfile?.role || 'Team Member'}</p>
              </div>
            </div>

            {/* XP Progress */}
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <p className="text-slate-300 text-xs font-semibold uppercase tracking-wider">Experience Points</p>
                <p className="text-white text-sm font-bold">{currentXP} <span className="text-slate-500">/ {xpForNextLevel} XP</span></p>
              </div>
              <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-600 to-violet-600 rounded-full shadow-lg shadow-blue-500/50"
                  style={{ width: `${xpProgress}%` }}
                ></div>
              </div>
              <p className="text-violet-400 text-xs font-bold flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> {xpNeeded} XP to Level {level + 1}
              </p>
            </div>

            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold">
              View Skill Tree & Rewards
            </Button>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <Sparkles className="h-5 w-5 text-blue-500" />
                <p className="text-green-400 text-xs font-bold">+120</p>
              </div>
              <div>
                <p className="text-white text-2xl font-extrabold">{userPoints?.total_points || 0}</p>
                <p className="text-slate-400 text-xs font-medium">Total Points</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <Award className="h-5 w-5 text-violet-500" />
                <p className="text-green-400 text-xs font-bold">+2</p>
              </div>
              <div>
                <p className="text-white text-2xl font-extrabold">{badges.length}</p>
                <p className="text-slate-400 text-xs font-medium">Badges Earned</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800 col-span-2">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">Current Streak</p>
                <Flame className="h-5 w-5 text-orange-500" />
              </div>
              <div className="flex items-baseline gap-3">
                <p className="text-white text-3xl font-extrabold">{userPoints?.current_streak || 0}</p>
                <p className="text-slate-400 text-sm">days</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Recognition */}
        <section>
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-white text-lg font-bold">Recent Recognition</h3>
            <Link to={createPageUrl('Recognition')} className="text-blue-400 text-xs font-bold">View All</Link>
          </div>
          <div className="space-y-3">
            {recentRecognitions.slice(0, 3).map(rec => (
              <Card key={rec.id} className="bg-slate-900/50 backdrop-blur-md border-slate-800">
                <CardContent className="p-4 flex items-start gap-3">
                  <Avatar className="h-10 w-10 border border-slate-700">
                    <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-600 text-white text-sm">
                      {rec.sender_name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">
                      <span className="font-bold text-amber-400">{rec.sender_name}</span> thanked you
                    </p>
                    <p className="text-slate-400 text-xs italic line-clamp-2">"{rec.message}"</p>
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      {formatDistanceToNow(new Date(rec.created_date), { addSuffix: true })}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-3">
          <Link to={createPageUrl('Calendar')}>
            <Button variant="outline" className="w-full flex flex-col gap-2 h-auto py-4 bg-slate-900 border-slate-800 hover:bg-slate-800">
              <BarChart3 className="h-6 w-6 text-blue-400" />
              <span className="text-xs font-bold text-slate-300">Events</span>
            </Button>
          </Link>
          <Link to={createPageUrl('Teams')}>
            <Button variant="outline" className="w-full flex flex-col gap-2 h-auto py-4 bg-slate-900 border-slate-800 hover:bg-slate-800">
              <TrendingUp className="h-6 w-6 text-violet-400" />
              <span className="text-xs font-bold text-slate-300">Teams</span>
            </Button>
          </Link>
          <Link to={createPageUrl('AvatarShopHub')}>
            <Button variant="outline" className="w-full flex flex-col gap-2 h-auto py-4 bg-slate-900 border-slate-800 hover:bg-slate-800">
              <Gift className="h-6 w-6 text-amber-400" />
              <span className="text-xs font-bold text-slate-300">Shop</span>
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}