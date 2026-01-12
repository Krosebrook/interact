import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  UserPlus, UserMinus, Shield, Calendar, Trophy, 
  Flame, Award, Lock, Globe 
} from 'lucide-react';
import moment from 'moment';

/**
 * Public profile card showing user stats and social actions
 */
export default function PublicProfileCard({
  profile,
  userPoints,
  isOwnProfile,
  isFollowing,
  isBlocked,
  onFollow,
  onUnfollow,
  onBlock,
  isLoading
}) {
  const isPrivate = profile?.visibility === 'private' && !isOwnProfile;

  if (isPrivate) {
    return (
      <Card className="glass-card-solid" data-b44-sync="true" data-feature="profile" data-component="publicprofilecard">
        <CardContent className="p-8 text-center">
          <Lock className="h-16 w-16 mx-auto mb-4 text-slate-300" />
          <h3 className="text-lg font-semibold text-slate-700 mb-2">Private Profile</h3>
          <p className="text-sm text-slate-500">
            This user has set their profile to private
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card-solid overflow-hidden">
      {/* Header with avatar */}
      <div className="bg-gradient-to-r from-int-navy to-blue-800 p-6 text-white">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="relative">
            {profile?.avatar_url ? (
              <img 
                src={profile.avatar_url}
                alt={profile.display_name}
                className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-int-orange flex items-center justify-center text-3xl font-bold border-4 border-white shadow-lg">
                {profile?.display_name?.charAt(0)?.toUpperCase() || '?'}
              </div>
            )}
            
            {/* Level badge */}
            <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-int-orange text-white font-bold flex items-center justify-center border-3 border-white shadow">
              {userPoints?.level || 1}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-2xl font-bold">{profile?.display_name || 'User'}</h2>
              {profile?.visibility === 'public' && (
                <Globe className="h-4 w-4 text-white/70" />
              )}
            </div>
            
            {profile?.bio && (
              <p className="text-white/80 text-sm mb-2">{profile.bio}</p>
            )}
            
            <div className="flex items-center gap-2 text-sm text-white/70">
              <Calendar className="h-4 w-4" />
              Joined {moment(profile?.created_date).format('MMMM YYYY')}
            </div>
          </div>

          {/* Actions */}
          {!isOwnProfile && (
            <div className="flex gap-2">
              {isFollowing ? (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={onUnfollow}
                  disabled={isLoading}
                >
                  <UserMinus className="h-4 w-4 mr-1" />
                  Unfollow
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={onFollow}
                  disabled={isLoading || isBlocked}
                  className="bg-int-orange hover:bg-[#C46322]"
                >
                  <UserPlus className="h-4 w-4 mr-1" />
                  Follow
                </Button>
              )}
              {!isBlocked && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onBlock}
                  disabled={isLoading}
                  className="text-white/70 hover:text-white hover:bg-white/20"
                >
                  <Shield className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Stats grid */}
      <CardContent className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatBox
            icon={<Trophy className="h-5 w-5 text-amber-500" />}
            label="Points"
            value={userPoints?.total_points?.toLocaleString() || 0}
          />
          <StatBox
            icon={<Calendar className="h-5 w-5 text-blue-500" />}
            label="Events"
            value={userPoints?.events_attended || 0}
          />
          <StatBox
            icon={<Award className="h-5 w-5 text-purple-500" />}
            label="Badges"
            value={userPoints?.badges_earned?.length || 0}
          />
          <StatBox
            icon={<Flame className="h-5 w-5 text-orange-500" />}
            label="Streak"
            value={`${userPoints?.streak_days || 0} days`}
          />
        </div>

        {/* Badges showcase */}
        {userPoints?.badges_earned?.length > 0 && (
          <div className="mt-6 pt-4 border-t">
            <h4 className="text-sm font-medium text-slate-600 mb-3">Recent Badges</h4>
            <div className="flex flex-wrap gap-2">
              {/* This would show actual badge icons */}
              {userPoints.badges_earned.slice(0, 5).map((badgeId, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  🎖️ Badge {idx + 1}
                </Badge>
              ))}
              {userPoints.badges_earned.length > 5 && (
                <Badge variant="secondary" className="text-xs">
                  +{userPoints.badges_earned.length - 5} more
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function StatBox({ icon, label, value }) {
  return (
    <div className="text-center p-3 bg-slate-50 rounded-xl">
      <div className="flex justify-center mb-2">{icon}</div>
      <div className="text-xl font-bold text-int-navy">{value}</div>
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  );
}