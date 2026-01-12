import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Award, Zap, Trophy, TrendingUp, Filter } from 'lucide-react';
import LoadingSpinner from '../../common/LoadingSpinner';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../../utils';

export default function UserProgressOverview() {
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState('all');
  const [sortBy, setSortBy] = useState('points');

  // Fetch all user points
  const { data: allUserPoints, isLoading: loadingPoints } = useQuery({
    queryKey: ['all-user-points'],
    queryFn: () => base44.entities.UserPoints.list('-total_points')
  });

  // Fetch all users
  const { data: allUsers, isLoading: loadingUsers } = useQuery({
    queryKey: ['all-users-admin'],
    queryFn: () => base44.entities.User.list()
  });

  // Fetch badge awards
  const { data: badgeAwards, isLoading: loadingBadges } = useQuery({
    queryKey: ['all-badge-awards'],
    queryFn: () => base44.entities.BadgeAward.list('-awarded_date')
  });

  // Fetch learning progress
  const { data: learningProgress, isLoading: loadingLearning } = useQuery({
    queryKey: ['all-learning-progress'],
    queryFn: () => base44.entities.LearningPathProgress.list()
  });

  // Combine data with safe null checks - must be called before any early returns
  const userData = React.useMemo(() => {
    if (!allUsers) return [];
    
    return allUsers.map(user => {
      const points = allUserPoints?.find(p => p.user_email === user.email);
      const badges = badgeAwards?.filter(b => b.user_email === user.email) || [];
      const learning = learningProgress?.filter(l => l.user_email === user.email) || [];
      const activePaths = learning.filter(l => l.status === 'in_progress').length;
      const completedPaths = learning.filter(l => l.status === 'completed').length;

      return {
        ...user,
        points: points?.total_points || 0,
        tier: points?.tier || 'bronze',
        current_streak: points?.current_streak || 0,
        badge_count: badges.length,
        active_paths: activePaths,
        completed_paths: completedPaths,
        team_id: points?.team_id
      };
    });
  }, [allUsers, allUserPoints, badgeAwards, learningProgress]);

  // Check loading state after all hooks are called
  if (loadingPoints || loadingUsers || loadingBadges || loadingLearning) {
    return <LoadingSpinner />;
  }

  // Filter and sort
  let filteredData = userData.filter(user => {
    const matchesSearch = user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTier = tierFilter === 'all' || user.tier === tierFilter;
    return matchesSearch && matchesTier;
  });

  if (sortBy === 'points') {
    filteredData.sort((a, b) => b.points - a.points);
  } else if (sortBy === 'badges') {
    filteredData.sort((a, b) => b.badge_count - a.badge_count);
  } else if (sortBy === 'learning') {
    filteredData.sort((a, b) => (b.active_paths + b.completed_paths) - (a.active_paths + a.completed_paths));
  }

  const tierColors = {
    bronze: 'bg-amber-100 text-amber-800 border-amber-300',
    silver: 'bg-slate-100 text-slate-800 border-slate-300',
    gold: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    platinum: 'bg-purple-100 text-purple-800 border-purple-300'
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={tierFilter} onValueChange={setTierFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Filter by Tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tiers</SelectItem>
                <SelectItem value="bronze">Bronze</SelectItem>
                <SelectItem value="silver">Silver</SelectItem>
                <SelectItem value="gold">Gold</SelectItem>
                <SelectItem value="platinum">Platinum</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="points">Points</SelectItem>
                <SelectItem value="badges">Badges</SelectItem>
                <SelectItem value="learning">Learning Activity</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* User List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>User Progress ({filteredData.length} users)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredData.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                No users found matching your filters
              </div>
            ) : (
              filteredData.map(user => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-slate-900">{user.full_name}</h4>
                      <Badge className={`text-xs capitalize ${tierColors[user.tier]}`}>
                        {user.tier}
                      </Badge>
                      {user.user_type && (
                        <Badge variant="outline" className="text-xs">
                          {user.user_type}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 mb-2">{user.email}</p>
                    
                    <div className="flex flex-wrap gap-4 text-xs text-slate-600">
                      <div className="flex items-center gap-1">
                        <Zap className="h-3 w-3 text-amber-600" />
                        <span className="font-medium">{user.points.toLocaleString()}</span> points
                      </div>
                      <div className="flex items-center gap-1">
                        <Award className="h-3 w-3 text-purple-600" />
                        <span className="font-medium">{user.badge_count}</span> badges
                      </div>
                      <div className="flex items-center gap-1">
                        <Trophy className="h-3 w-3 text-emerald-600" />
                        <span className="font-medium">{user.current_streak}</span> day streak
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3 text-blue-600" />
                        <span className="font-medium">{user.active_paths}</span> active paths
                      </div>
                    </div>
                  </div>

                  <Link to={createPageUrl('UserProfile') + `?email=${user.email}`}>
                    <Button variant="outline" size="sm">
                      View Profile
                    </Button>
                  </Link>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}