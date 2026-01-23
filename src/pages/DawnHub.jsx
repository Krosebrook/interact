import { useState, useEffect } from 'react';
import { useUserData } from '../components/hooks/useUserData';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Trophy,
  Award,
  Users,
  Gift,
  TrendingUp,
  Sparkles,
  Flame,
  Star,
  CheckCircle2,
  Target
} from 'lucide-react';
import { motion } from 'framer-motion';
import WellnessCheckWidget from '../components/wellness/WellnessCheckWidget';

export default function DawnHub() {
  const { user, points } = useUserData(true);
  const [dailyQuest, setDailyQuest] = useState(null);

  // Fetch user profile for XP and level data
  const { data: userProfile } = useQuery({
    queryKey: ['userProfile', user?.email],
    queryFn: () => base44.entities.UserProfile.filter({ user_email: user.email }),
    enabled: !!user?.email,
  });

  // Calculate XP and Level
  const currentXP = points || 0;
  const currentLevel = Math.floor(currentXP / 2000) + 1;
  const xpForCurrentLevel = (currentLevel - 1) * 2000;
  const xpForNextLevel = currentLevel * 2000;
  const xpProgress = currentXP - xpForCurrentLevel;
  const xpNeeded = xpForNextLevel - xpForCurrentLevel;
  const progressPercent = (xpProgress / xpNeeded) * 100;

  // Fetch user badges
  const { data: badges } = useQuery({
    queryKey: ['badges', user?.email],
    queryFn: () => base44.entities.BadgeAward.filter({ user_email: user.email }),
    enabled: !!user?.email,
  });

  // Fetch global rank
  const { data: leaderboard } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: () => base44.entities.UserPoints.list('-points', 100),
  });

  const userRank = leaderboard?.findIndex(u => u.user_email === user?.email) + 1 || 0;
  const totalUsers = leaderboard?.length || 0;
  const rankPercentile = totalUsers > 0 ? Math.ceil((userRank / totalUsers) * 100) : 0;

  // Calculate streak
  const { data: participations } = useQuery({
    queryKey: ['participations', user?.email],
    queryFn: () => base44.entities.Participation.filter({ 
      user_email: user.email,
      attendance_status: 'attended'
    }),
    enabled: !!user?.email,
  });

  const calculateStreak = () => {
    if (!participations?.length) return 0;
    const sorted = participations
      .map(p => new Date(p.check_in_time))
      .sort((a, b) => b - a);
    
    let streak = 1;
    for (let i = 0; i < sorted.length - 1; i++) {
      const diff = Math.abs(sorted[i] - sorted[i + 1]) / (1000 * 60 * 60 * 24);
      if (diff <= 1) streak++;
      else break;
    }
    return streak;
  };

  const currentStreak = calculateStreak();

  // Recent activity
  const { data: recentRecognition } = useQuery({
    queryKey: ['recentRecognition', user?.email],
    queryFn: () => base44.entities.Recognition.filter({ recipient_email: user.email }),
    enabled: !!user?.email,
  });

  // Daily quest simulation
  useEffect(() => {
    setDailyQuest({
      title: 'Maintain your streak! Complete one more task to earn +500 XP',
      progress: currentStreak > 0 ? 75 : 0,
      target: 100,
      reward: 500
    });
  }, [currentStreak]);

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white p-3 sm:p-4 md:p-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-4 sm:mb-6 md:mb-8">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div>
            <p className="text-[#A0A8B8] text-xs sm:text-sm uppercase tracking-wider mb-1">
              Welcome back, {user?.full_name?.split(' ')[0]}
            </p>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-[#FFB86C] to-[#FF8A3D] bg-clip-text text-transparent">
              Ready for the day?
            </h1>
          </div>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
          {/* Total Points */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-[#1E2638] to-[#151B2B] rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-[#2A3447]"
          >
            <p className="text-[#A0A8B8] text-xs uppercase tracking-wider mb-2">Total Points</p>
            <div className="flex items-baseline gap-2 flex-wrap">
              <h2 className="text-3xl sm:text-4xl font-bold">{currentXP.toLocaleString()}</h2>
              <div className="flex items-center gap-1 text-emerald-400 text-sm">
                <TrendingUp className="h-4 w-4" />
                <span>+120 today</span>
              </div>
            </div>
          </motion.div>

          {/* Current Rank */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-[#1E2638] to-[#151B2B] rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-[#2A3447]"
          >
            <p className="text-[#A0A8B8] text-xs uppercase tracking-wider mb-2">Current Rank</p>
            <div className="flex items-baseline gap-2 flex-wrap">
              <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-[#FFD700] to-[#FFA500] bg-clip-text text-transparent">
                Top {rankPercentile}%
              </h2>
              <div className="flex items-center gap-1 text-amber-400 text-sm">
                <Star className="h-4 w-4 fill-current" />
                <span>Rising Star</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Level Progress Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-[#1E2638] to-[#151B2B] rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-[#2A3447] mb-4 sm:mb-6"
        >
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-[#FF8A3D] to-[#FFB86C] flex items-center justify-center flex-shrink-0">
                <Trophy className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
              </div>
              <div className="flex-1">
                <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 mb-2 text-xs">
                  RANKED ELITE
                </Badge>
                <h2 className="text-2xl sm:text-3xl font-bold">LVL {currentLevel}</h2>
                <p className="text-[#A0A8B8] text-sm">
                  {xpProgress.toLocaleString()} / {xpNeeded.toLocaleString()} XP to Level {currentLevel + 1}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-[#FF8A3D]">{Math.round(progressPercent)}%</p>
              <p className="text-xs text-[#A0A8B8]">Next Rank Progress</p>
            </div>
          </div>
          <div className="relative">
            <div className="h-3 bg-[#0B0F19] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-[#FF8A3D] to-[#FFB86C] rounded-full"
              />
            </div>
          </div>
        </motion.div>

        {/* Daily Quest */}
        {dailyQuest && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-[#2A1F1A] to-[#151B2B] rounded-2xl p-6 border border-[#3A2F2A] mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#FF8A3D]/20 flex items-center justify-center">
                  <Target className="h-5 w-5 text-[#FF8A3D]" />
                </div>
                <div>
                  <h3 className="font-bold">DAILY QUEST</h3>
                  <p className="text-xs text-[#A0A8B8]">{dailyQuest.progress}% Complete</p>
                </div>
              </div>
              <Badge className="bg-[#FF8A3D]/20 text-[#FF8A3D] border-[#FF8A3D]/30">
                {dailyQuest.progress}% Complete
              </Badge>
            </div>
            <div className="bg-[#FF8A3D]/10 rounded-xl p-4 mb-3">
              <div className="h-2 bg-[#0B0F19] rounded-full overflow-hidden mb-3">
                <div 
                  className="h-full bg-gradient-to-r from-[#FF8A3D] to-[#FFB86C]" 
                  style={{ width: `${dailyQuest.progress}%` }}
                />
              </div>
              <p className="text-sm">{dailyQuest.title}</p>
            </div>
          </motion.div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          {/* Awards */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-[#1E2638] rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-[#2A3447]"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-amber-500/20 flex items-center justify-center mb-2 sm:mb-3">
              <Award className="h-5 w-5 sm:h-6 sm:w-6 text-amber-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold mb-1">{badges?.length || 0}</p>
            <p className="text-xs text-[#A0A8B8]">Badges Earned</p>
          </motion.div>

          {/* Quests */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-[#1E2638] rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-[#2A3447]"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-blue-500/20 flex items-center justify-center mb-2 sm:mb-3">
              <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold mb-1">{participations?.length || 0}</p>
            <p className="text-xs text-[#A0A8B8]">Quests</p>
          </motion.div>

          {/* Social */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-[#1E2638] rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-[#2A3447]"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-purple-500/20 flex items-center justify-center mb-2 sm:mb-3">
              <Users className="h-5 w-5 sm:h-6 sm:w-6 text-purple-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold mb-1">{recentRecognition?.length || 0}</p>
            <p className="text-xs text-[#A0A8B8]">Social</p>
          </motion.div>

          {/* Streak */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 }}
            className="bg-[#1E2638] rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-[#2A3447]"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-orange-500/20 flex items-center justify-center mb-2 sm:mb-3">
              <Flame className="h-5 w-5 sm:h-6 sm:w-6 text-orange-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold mb-1">{currentStreak} Days</p>
            <p className="text-xs text-[#A0A8B8]">Current Streak</p>
          </motion.div>
        </div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-[#1E2638] rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-[#2A3447]"
        >
          <div className="flex items-center justify-between mb-4 gap-2">
            <h3 className="font-bold">Recent Activity</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-[#FF8A3D] hover:bg-[#FF8A3D]/10"
            >
              History
            </Button>
          </div>
          <div className="space-y-4">
            {recentRecognition?.slice(0, 3).map((recognition, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-5 w-5 text-purple-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-semibold">{recognition.recognizer_name}</span> recognized you
                  </p>
                  <p className="text-xs text-[#A0A8B8]">"{recognition.message}"</p>
                  <p className="text-xs text-[#A0A8B8] mt-1">
                    {new Date(recognition.created_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
            {(!recentRecognition || recentRecognition.length === 0) && (
              <p className="text-center text-[#A0A8B8] py-8">No recent activity</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}