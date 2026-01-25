import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useUserData } from '../components/hooks/useUserData';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sparkles, TrendingUp, Bell } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import LoadingSpinner from '../components/common/LoadingSpinner';

const SUNRISE_BG = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800';

export default function HorizonHub() {
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
      return points[0] || { total_points: 0, xp: 0, level: 1 };
    },
    enabled: !!user?.email
  });

  const { data: recentActivity = [] } = useQuery({
    queryKey: ['recent-recognitions', user?.email],
    queryFn: () => base44.entities.Recognition.filter({ 
      recipient_email: user?.email,
      status: 'approved'
    }, '-created_date', 3),
    enabled: !!user?.email
  });

  if (loading) return <LoadingSpinner />;

  const currentXP = userPoints?.xp || 0;
  const level = userPoints?.level || 1;
  const xpForNextLevel = level * 2000;
  const energyLevel = Math.min(Math.round((currentXP / xpForNextLevel) * 100), 100);

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Background Image */}
      <div className="fixed inset-0 z-0">
        <img src={SUNRISE_BG} alt="Sunrise landscape" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-slate-950/20 to-slate-950/80"></div>
      </div>

      {/* Header */}
      <header className="relative z-50 flex items-center justify-between p-6 pt-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-500/20 backdrop-blur-md border border-orange-500/50 rounded-full flex items-center justify-center">
            <span className="text-orange-500 font-extrabold text-xs italic">INTI</span>
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-white">Horizon Hub</h1>
            <p className="text-[10px] text-amber-400 uppercase tracking-[0.2em] font-bold">Insights Dashboard</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button size="icon" variant="outline" className="rounded-full bg-slate-900/40 backdrop-blur-md border-white/10 text-white">
            <Bell className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Energy Gauge */}
      <main className="relative z-10 flex flex-col items-center justify-center px-6 py-12">
        <div className="relative flex items-center justify-center">
          <div className="absolute w-64 h-64 bg-orange-500/20 blur-3xl rounded-full"></div>
          <div className="relative w-64 h-64 rounded-full p-1.5 bg-gradient-to-br from-orange-500/50 to-transparent shadow-2xl shadow-orange-500/30">
            <div className="w-full h-full rounded-full bg-slate-950/60 backdrop-blur-md flex flex-col items-center justify-center text-center p-8 border border-white/10">
              <span className="text-amber-400 text-xs font-bold tracking-widest uppercase mb-1">Energy Level</span>
              <div className="flex items-baseline gap-1">
                <span className="text-6xl font-black text-white">{energyLevel}</span>
                <span className="text-2xl font-bold text-orange-500">%</span>
              </div>
              <div className="mt-4 px-4 py-1 rounded-full bg-orange-500/20 border border-orange-500/30">
                <p className="text-[10px] font-bold text-orange-500 uppercase tracking-wider flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Level {level}
                </p>
              </div>
            </div>
          </div>
          <div className="absolute -top-4 -right-2 bg-slate-900/40 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 border border-white/10">
            <Sparkles className="h-3 w-3 text-amber-400" />
            <span className="text-[10px] font-bold text-white">{xpForNextLevel - currentXP} XP to Next</span>
          </div>
        </div>

        <div className="mt-8 text-center">
          <h2 className="text-xl font-bold text-white">Good morning, {user?.full_name?.split(' ')[0]}</h2>
          <p className="text-slate-300 text-sm">Your focus is peaking today.</p>
        </div>
      </main>

      {/* Live Insights */}
      <section className="relative z-20 px-6 pb-24 max-w-md mx-auto w-full">
        <div className="flex items-center justify-between mb-3 px-2">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-300">Live Insights</h3>
          <button className="text-[10px] font-bold text-orange-500 uppercase tracking-wider">Expand</button>
        </div>
        <div className="space-y-3">
          {recentActivity.map(rec => (
            <Card key={rec.id} className="bg-slate-900/40 backdrop-blur-md border-white/10">
              <CardContent className="p-4 flex items-center gap-4">
                <Avatar className="h-12 w-12 border-2 border-orange-500/50">
                  <AvatarFallback className="bg-gradient-to-br from-orange-500 to-amber-600 text-white">
                    {rec.sender_name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">
                    <span className="font-bold text-amber-400">{rec.sender_name}</span> recognized <span className="font-bold">You</span>
                  </p>
                  <p className="text-slate-400 text-xs italic truncate">"{rec.message}"</p>
                </div>
                <span className="text-[10px] text-slate-500">{formatDistanceToNow(new Date(rec.created_date), { addSuffix: true })}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}