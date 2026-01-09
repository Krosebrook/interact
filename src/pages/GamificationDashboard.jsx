import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import AIGamificationEngine from '../components/gamification/AIGamificationEngine';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { 
  Trophy, 
  TrendingUp, 
  Award, 
  Zap,
  Users,
  Calendar,
  Filter,
  Target,
  Settings,
  Flame,
  Gift,
  Star,
  Crown,
  Medal
} from 'lucide-react';
import { format, subDays, subMonths, isAfter, isBefore } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserData } from '../components/hooks/useUserData';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { StatCard } from '../components/common/StatsGrid';
import XPProgressRing from '../components/gamification/XPProgressRing';
import AnimatedPointsCounter from '../components/gamification/AnimatedPointsCounter';
import StreakFlame from '../components/gamification/StreakFlame';
import BadgeCard from '../components/gamification/BadgeCard';
import LeaderboardRow from '../components/gamification/LeaderboardRow';
import DashboardCustomizer from '../components/dashboard/DashboardCustomizer';
import GamificationAnalyticsDashboard from '../components/gamification/GamificationAnalyticsDashboard';
import ChallengeCard from '../components/gamification/ChallengeCard';
import RewardCard from '../components/gamification/RewardCard';
import PersonalChallengesSection from '../components/gamification/PersonalChallengesSection';
import AchievementTiersSection from '../components/gamification/AchievementTiersSection';
import SocialFeedSection from '../components/gamification/SocialFeedSection';
import PersonalizedRecommendationsEngine from '../components/gamification/PersonalizedRecommendationsEngine';
import TailoredLeaderboardFormats from '../components/gamification/TailoredLeaderboardFormats';
import PersonalizedGamificationTips from '../components/gamification/PersonalizedGamificationTips';
import SeasonalEventsManager from '../components/gamification/SeasonalEventsManager';
import TeamTournamentBracket from '../components/gamification/TeamTournamentBracket';
import AchievementSystem from '../components/gamification/AchievementSystem';
import BuddySystemManager from '../components/social/BuddySystemManager';
import RedemptionHistory from '../components/gamification/RedemptionHistory';
import RewardsRedemptionSection from '../components/gamification/RewardsRedemptionSection';
import TierStatusDisplay from '../components/gamification/TierStatusDisplay';

const CHART_COLORS = ['#D97230', '#14294D', '#8B5CF6', '#10B981', '#F59E0B', '#EC4899'];

export default function GamificationDashboard() {
  const { user, loading: userLoading, isAdmin } = useUserData(true, true);
  const [dateRange, setDateRange] = useState('30days');
  const [userSegment, setUserSegment] = useState('all');
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedUser, setSelectedUser] = useState(null);

  // Initialize selectedUser when user loads
  React.useEffect(() => {
    if (user?.email && !selectedUser) {
      setSelectedUser(user.email);
    }
  }, [user, selectedUser]);

  const { data: userPoints = [], isLoading: pointsLoading } = useQuery({
    queryKey: ['user-points'],
    queryFn: () => base44.entities.UserPoints.list('-total_points', 100)
  });

  const { data: badges = [] } = useQuery({
    queryKey: ['badges'],
    queryFn: () => base44.entities.Badge.list()
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users-basic'],
    queryFn: async () => {
      // Only fetch minimal user data needed for leaderboards (no PII)
      const allUsers = await base44.entities.User.list();
      return allUsers.map(u => ({
        email: u.email,
        full_name: u.full_name,
        role: u.role
      }));
    }
  });

  const { data: teams = [] } = useQuery({
    queryKey: ['teams'],
    queryFn: () => base44.entities.Team.list('-total_points', 20)
  });

  const { data: participations = [] } = useQuery({
    queryKey: ['participations'],
    queryFn: () => base44.entities.Participation.list('-created_date', 500)
  });

  // Current user's points
  const currentUserPoints = userPoints.find(up => up.user_email === user?.email) || {
    total_points: 0,
    level: 1,
    experience_points: 0,
    streak_days: 0,
    longest_streak: 0,
    badges_earned: [],
    events_attended: 0
  };

  // Calculate metrics
  const totalUsers = userPoints.length;
  const totalPoints = userPoints.reduce((sum, up) => sum + up.total_points, 0);
  const avgPointsPerUser = totalUsers > 0 ? Math.round(totalPoints / totalUsers) : 0;
  const totalBadgesEarned = userPoints.reduce((sum, up) => sum + (up.badges_earned?.length || 0), 0);
  const activeStreaks = userPoints.filter(up => up.streak_days > 0).length;

  // Leaderboard data
  const leaderboardData = useMemo(() => {
    return userPoints.slice(0, 15).map((up, index) => {
      const userData = users.find(u => u.email === up.user_email);
      return {
        rank: index + 1,
        name: userData?.full_name || up.user_email?.split('@')[0] || 'Unknown',
        email: up.user_email,
        points: up.total_points || 0,
        level: up.level || 1,
        badges: up.badges_earned?.length || 0,
        streak: up.streak_days || 0,
        isCurrentUser: up.user_email === user?.email
      };
    });
  }, [userPoints, users, user?.email]);

  // Badge distribution by rarity
  const badgeDistribution = useMemo(() => {
    const distribution = { common: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0 };
    userPoints.forEach(up => {
      up.badges_earned?.forEach(badgeId => {
        const badge = badges.find(b => b.id === badgeId);
        if (badge) {
          distribution[badge.rarity || 'common']++;
        }
      });
    });
    return Object.entries(distribution)
      .filter(([_, v]) => v > 0)
      .map(([name, value]) => ({ name, value }));
  }, [userPoints, badges]);

  // Level distribution
  const levelDistribution = useMemo(() => {
    const dist = {};
    userPoints.forEach(up => {
      const level = up.level || 1;
      dist[level] = (dist[level] || 0) + 1;
    });
    return Object.entries(dist)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([level, count]) => ({ level: `Lv.${level}`, count }));
  }, [userPoints]);

  // Points over time (last 7 days mock data)
  const pointsTrend = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => ({
      date: format(subDays(new Date(), 6 - i), 'EEE'),
      points: Math.floor(Math.random() * 500) + 100
    }));
  }, []);

  // User earned badges
  const userBadges = useMemo(() => {
    return badges.filter(b => currentUserPoints.badges_earned?.includes(b.id));
  }, [badges, currentUserPoints.badges_earned]);

  const lockedBadges = useMemo(() => {
    return badges.filter(b => 
      !currentUserPoints.badges_earned?.includes(b.id) && 
      !b.is_hidden
    ).slice(0, 8);
  }, [badges, currentUserPoints.badges_earned]);

  // Fetch user's team
  const { data: userTeam } = useQuery({
    queryKey: ['user-team', user?.email],
    queryFn: async () => {
      if (!currentUserPoints.team_id) return null;
      const teams = await base44.entities.Team.filter({ id: currentUserPoints.team_id });
      return teams[0] || null;
    },
    enabled: !!user?.email && !!currentUserPoints.team_id
  });

  if (userLoading || pointsLoading) {
    return <LoadingSpinner className="min-h-[60vh]" message="Loading gamification data..." />;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* AI Engine (Admin Only) */}
      {isAdmin && (
        <AIGamificationEngine team={userTeam} selectedUser={selectedUser} />
      )}
      
      {/* Header */}
      <div className="glass-panel-solid relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-int-orange/5 pointer-events-none" />
        <div className="relative flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex items-center gap-6">
            <XPProgressRing 
              level={currentUserPoints.level || 1}
              currentXP={currentUserPoints.experience_points || 0}
              xpToNextLevel={(currentUserPoints.level || 1) * 100}
              size="default"
              showLabel={false}
            />
            <div>
              <h1 className="text-3xl font-bold text-int-navy font-display">
                <span className="text-highlight">Gamification Hub</span>
              </h1>
              <p className="text-slate-600">Track progress, earn badges, climb the leaderboard</p>
              <div className="flex items-center gap-4 mt-2">
                <Badge className="bg-gradient-orange text-white">
                  <Zap className="h-3 w-3 mr-1" />
                  {currentUserPoints.total_points?.toLocaleString() || 0} pts
                </Badge>
                <Badge variant="outline" className="border-purple-300 text-purple-700">
                  <Award className="h-3 w-3 mr-1" />
                  {currentUserPoints.badges_earned?.length || 0} badges
                </Badge>
                {currentUserPoints.streak_days > 0 && (
                  <Badge className="bg-gradient-competitive text-white">
                    <Flame className="h-3 w-3 mr-1" />
                    {currentUserPoints.streak_days} day streak
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <Button 
            onClick={() => setShowCustomizer(true)}
            variant="outline"
            className="border-int-navy/20 text-int-navy hover:bg-int-navy/5"
          >
            <Settings className="h-4 w-4 mr-2" />
            Customize
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Points Pool" 
          value={totalPoints.toLocaleString()} 
          subtitle="Across all users"
          icon={Zap} 
          color="orange" 
          delay={0}
        />
        <StatCard 
          title="Active Users" 
          value={totalUsers} 
          subtitle={`${activeStreaks} with active streaks`}
          icon={Users} 
          color="navy" 
          delay={0.1}
        />
        <StatCard 
          title="Avg Points" 
          value={avgPointsPerUser.toLocaleString()} 
          subtitle="Per user"
          icon={TrendingUp} 
          color="purple" 
          delay={0.2}
        />
        <StatCard 
          title="Badges Earned" 
          value={totalBadgesEarned} 
          subtitle={`${badges.length} available`}
          icon={Award} 
          color="competitive" 
          delay={0.3}
        />
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white border shadow-sm">
          <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-orange data-[state=active]:text-white">
            <Trophy className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="data-[state=active]:bg-gradient-navy data-[state=active]:text-white">
            <Crown className="h-4 w-4 mr-2" />
            Leaderboard
          </TabsTrigger>
          <TabsTrigger value="badges" className="data-[state=active]:bg-gradient-purple data-[state=active]:text-white">
            <Award className="h-4 w-4 mr-2" />
            Badges
          </TabsTrigger>
          <TabsTrigger value="challenges" className="data-[state=active]:bg-gradient-competitive data-[state=active]:text-white">
            <Target className="h-4 w-4 mr-2" />
            Challenges
          </TabsTrigger>
          <TabsTrigger value="tiers" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-white">
            <Crown className="h-4 w-4 mr-2" />
            Tiers
          </TabsTrigger>
          <TabsTrigger value="social" className="data-[state=active]:bg-gradient-social data-[state=active]:text-white">
            <Users className="h-4 w-4 mr-2" />
            Social
          </TabsTrigger>
          <TabsTrigger value="rewards" className="data-[state=active]:bg-gradient-wellness data-[state=active]:text-white">
            <Gift className="h-4 w-4 mr-2" />
            Rewards
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white">
            <TrendingUp className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* AI Tips */}
          <PersonalizedGamificationTips
            userEmail={user?.email}
            currentPoints={currentUserPoints.total_points}
            currentTier={currentUserPoints.tier}
            badgesCount={currentUserPoints.badges_earned?.length || 0}
            activeChallengesCount={0}
          />

          {/* Tier Status Display */}
          <TierStatusDisplay 
            currentPoints={currentUserPoints.total_points || 0}
            currentTier={currentUserPoints.tier || 'bronze'}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Your Stats */}
            <Card className="lg:col-span-1 border-2 border-int-orange/20">
              <CardHeader className="bg-gradient-to-r from-int-orange/10 to-transparent">
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-int-orange" />
                  Your Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center mb-6">
                  <XPProgressRing 
                    level={currentUserPoints.level || 1}
                    currentXP={currentUserPoints.experience_points || 0}
                    xpToNextLevel={(currentUserPoints.level || 1) * 100}
                    size="large"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <div className="text-2xl font-bold text-int-navy">{currentUserPoints.events_attended || 0}</div>
                    <div className="text-xs text-slate-500">Events</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <div className="text-2xl font-bold text-int-orange">{currentUserPoints.badges_earned?.length || 0}</div>
                    <div className="text-xs text-slate-500">Badges</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Streak Card */}
            <div className="lg:col-span-1">
              <StreakFlame 
                currentStreak={currentUserPoints.streak_days || 0}
                longestStreak={currentUserPoints.longest_streak || 0}
                lastActivityDate={currentUserPoints.last_activity_date}
              />
            </div>

            {/* Top 5 Leaderboard */}
            <Card className="lg:col-span-1 border-2 border-int-navy/20">
              <CardHeader className="bg-gradient-to-r from-int-navy to-blue-800 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-amber-400" />
                  Top Performers
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-2">
                {leaderboardData.slice(0, 5).map((entry, idx) => (
                  <LeaderboardRow 
                    key={entry.email}
                    rank={entry.rank}
                    name={entry.name}
                    email={entry.email}
                    points={entry.points}
                    level={entry.level}
                    badges={entry.badges}
                    streak={entry.streak}
                    isCurrentUser={entry.isCurrentUser}
                    delay={idx * 0.05}
                  />
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Recent Badges */}
          {userBadges.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-purple-600" />
                  Your Badges ({userBadges.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {userBadges.slice(0, 6).map(badge => (
                    <BadgeCard 
                      key={badge.id}
                      badge={badge}
                      isEarned={true}
                      size="small"
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Leaderboard Tab */}
        <TabsContent value="leaderboard" className="mt-6 space-y-6">
          {/* Tailored Leaderboards */}
          <TailoredLeaderboardFormats 
            userPoints={userPoints.map((up, idx) => ({
              ...up,
              user_name: users.find(u => u.email === up.user_email)?.full_name || up.user_email?.split('@')[0]
            }))}
            currentUserEmail={user?.email}
          />

          {/* Global Leaderboard */}
          <Card className="border-2 border-int-navy/20">
            <CardHeader className="bg-gradient-to-r from-int-navy via-blue-800 to-int-navy text-white">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-6 w-6 text-amber-400" />
                  Global Leaderboard
                </CardTitle>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 text-white">
                    <Users className="h-4 w-4 mr-1" />
                    Individual
                  </Button>
                  <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/10">
                    Teams
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-3">
              <AnimatePresence>
                {leaderboardData.map((entry, idx) => (
                  <LeaderboardRow 
                    key={entry.email}
                    rank={entry.rank}
                    name={entry.name}
                    email={entry.email}
                    points={entry.points}
                    level={entry.level}
                    badges={entry.badges}
                    streak={entry.streak}
                    isCurrentUser={entry.isCurrentUser}
                    delay={idx * 0.03}
                  />
                ))}
              </AnimatePresence>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Badges Tab */}
        <TabsContent value="badges" className="mt-6 space-y-6">
          {/* Personalized Recommendations */}
          <PersonalizedRecommendationsEngine 
            userEmail={user?.email}
            userPoints={currentUserPoints}
          />

          {/* Earned Badges */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                Earned Badges ({userBadges.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {userBadges.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {userBadges.map(badge => (
                    <BadgeCard 
                      key={badge.id}
                      badge={badge}
                      isEarned={true}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <Award className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>No badges earned yet. Keep participating!</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Locked Badges */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-600">
                <Award className="h-5 w-5" />
                Available to Earn ({lockedBadges.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {lockedBadges.map(badge => (
                  <BadgeCard 
                    key={badge.id}
                    badge={badge}
                    isEarned={false}
                    showProgress={true}
                    progress={{
                      current: currentUserPoints.events_attended || 0,
                      target: badge.award_criteria?.threshold || 10,
                      percentage: Math.min(100, ((currentUserPoints.events_attended || 0) / (badge.award_criteria?.threshold || 10)) * 100)
                    }}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Challenges Tab */}
        <TabsContent value="challenges" className="mt-6">
          <div className="space-y-8">
            {/* Personal Challenges */}
            <PersonalChallengesSection userEmail={user?.email} />
            
            {/* Team Challenges */}
            <ChallengesSection userEmail={user?.email} />
          </div>
        </TabsContent>

        {/* Tiers Tab */}
        <TabsContent value="tiers" className="mt-6">
          <AchievementTiersSection 
            userEmail={user?.email} 
            userPoints={currentUserPoints}
          />
        </TabsContent>

        {/* Social Tab */}
        <TabsContent value="social" className="mt-6">
          <SocialFeedSection userEmail={user?.email} limit={20} />
        </TabsContent>

        {/* Rewards Tab */}
        <TabsContent value="rewards" className="mt-6 space-y-6">
          <RewardsRedemptionSection 
            userEmail={user?.email}
            userPoints={currentUserPoints.total_points}
          />
          
          <RedemptionHistory userEmail={user?.email} />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="mt-6">
          <GamificationAnalyticsDashboard />
        </TabsContent>
      </Tabs>

      <DashboardCustomizer 
        userEmail={user?.email}
        open={showCustomizer}
        onOpenChange={setShowCustomizer}
      />
    </div>
  );
}

// Challenges Section Component
function ChallengesSection({ userEmail }) {
  const { data: challenges = [] } = useQuery({
    queryKey: ['team-challenges'],
    queryFn: () => base44.entities.TeamChallenge.list('-created_date')
  });

  const { data: memberships = [] } = useQuery({
    queryKey: ['team-memberships', userEmail],
    queryFn: () => base44.entities.TeamMembership.filter({ user_email: userEmail }),
    enabled: !!userEmail
  });

  const userTeamId = memberships[0]?.team_id;
  const activeChallenges = challenges.filter(c => c.status === 'active');
  const completedChallenges = challenges.filter(c => c.status === 'completed');

  return (
    <div className="space-y-6">
      {/* Active Challenges */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-int-orange" />
            Active Challenges ({activeChallenges.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeChallenges.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeChallenges.map(challenge => (
                <ChallengeCard 
                  key={challenge.id}
                  challenge={challenge}
                  userTeamId={userTeamId}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <Target className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No active challenges right now</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Completed Challenges */}
      {completedChallenges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-600">
              <Trophy className="h-5 w-5" />
              Past Challenges ({completedChallenges.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {completedChallenges.slice(0, 4).map(challenge => (
                <ChallengeCard 
                  key={challenge.id}
                  challenge={challenge}
                  userTeamId={userTeamId}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Rewards Section Component
function RewardsSection({ userPoints }) {
  const { data: rewards = [] } = useQuery({
    queryKey: ['rewards'],
    queryFn: () => base44.entities.Reward.list('-created_date')
  });

  const availableRewards = rewards.filter(r => r.is_available);
  const affordableRewards = availableRewards.filter(r => r.points_cost <= (userPoints?.available_points || 0));

  return (
    <div className="space-y-6">
      {/* Points Balance */}
      <Card className="bg-gradient-to-br from-int-orange/10 to-amber-50 border-int-orange/30">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Available Points</p>
              <p className="text-4xl font-bold text-int-orange">
                {(userPoints?.available_points || 0).toLocaleString()}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-gradient-orange shadow-lg">
              <Gift className="h-8 w-8 text-white" />
            </div>
          </div>
          {affordableRewards.length > 0 && (
            <p className="mt-3 text-sm text-emerald-600">
              ✨ You can afford {affordableRewards.length} reward{affordableRewards.length > 1 ? 's' : ''}!
            </p>
          )}
        </CardContent>
      </Card>

      {/* Available Rewards */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-emerald-600" />
            Available Rewards
          </CardTitle>
        </CardHeader>
        <CardContent>
          {availableRewards.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableRewards.map(reward => (
                <RewardCard 
                  key={reward.id}
                  reward={reward}
                  userPoints={userPoints?.available_points || 0}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <Gift className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No rewards available at the moment</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}