import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  MapPin, 
  Building,
  Briefcase,
  Flame
} from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * Compact profile card for use in sidebars and smaller spaces.
 * For full profile header, use ProfileHeader component instead.
 */
export default function UserProfileCard({ profile, userPoints, compact = false }) {
  const level = userPoints?.level || 1;
  const totalPoints = userPoints?.total_points || 0;
  const streakDays = userPoints?.streak_days || 0;

  if (compact) {
    return (
      <Card className="p-4 border-0 shadow-md" data-b44-sync="true" data-feature="profile" data-component="userprofilecard">
        <div className="flex items-center gap-4">
          <div className="relative">
            {profile?.avatar_url ? (
              <img 
                src={profile.avatar_url} 
                alt={profile.display_name}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center text-xs font-bold">
              {level}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-900 truncate">
              {profile?.display_name || 'New User'}
            </h3>
            <p className="text-sm text-slate-500 truncate">
              {profile?.department || 'No department set'}
            </p>
          </div>
          <div className="text-right">
            <p className="font-bold text-purple-600">{totalPoints.toLocaleString()}</p>
            <p className="text-xs text-slate-500">points</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="overflow-hidden border-0 shadow-xl">
        {/* Header Banner */}
        <div className="h-20 bg-gradient-to-r from-int-navy via-purple-700 to-int-orange relative">
          <div className="absolute inset-0 bg-black/10" />
        </div>

        {/* Profile Content */}
        <div className="px-5 pb-5">
          {/* Avatar */}
          <div className="relative -mt-10 mb-3">
            <div className="w-20 h-20 rounded-full p-0.5 bg-gradient-to-br from-yellow-400 to-int-orange">
              {profile?.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt={profile.display_name}
                  className="w-full h-full rounded-full border-3 border-white object-cover"
                />
              ) : (
                <div className="w-full h-full rounded-full border-3 border-white bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                  <User className="h-10 w-10 text-white" />
                </div>
              )}
            </div>
            <div className="absolute bottom-0 right-0 w-7 h-7 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center text-xs font-bold text-white border-2 border-white shadow">
              {level}
            </div>
          </div>

          {/* Name & Info */}
          <h2 className="text-lg font-bold text-slate-900 mb-0.5">
            {profile?.display_name || 'New User'}
          </h2>
          
          {profile?.job_title && (
            <p className="text-sm text-int-orange font-medium flex items-center gap-1 mb-1">
              <Briefcase className="h-3.5 w-3.5" />
              {profile.job_title}
            </p>
          )}

          {profile?.bio && (
            <p className="text-slate-600 text-sm mb-3 line-clamp-2">{profile.bio}</p>
          )}

          {/* Location & Dept */}
          <div className="flex flex-wrap gap-2 mb-4 text-xs">
            {profile?.department && (
              <Badge variant="outline" className="gap-1">
                <Building className="h-3 w-3" />
                {profile.department}
              </Badge>
            )}
            {profile?.location && (
              <Badge variant="outline" className="gap-1">
                <MapPin className="h-3 w-3" />
                {profile.location}
              </Badge>
            )}
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-xl">
            <div className="text-center">
              <p className="text-lg font-bold text-purple-600">{totalPoints.toLocaleString()}</p>
              <p className="text-xs text-slate-500">Points</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-blue-600">
                {userPoints?.events_attended || 0}
              </p>
              <p className="text-xs text-slate-500">Events</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-amber-600">
                {userPoints?.badges_earned?.length || 0}
              </p>
              <p className="text-xs text-slate-500">Badges</p>
            </div>
          </div>

          {/* Streak */}
          {streakDays > 0 && (
            <div className="mt-3 flex items-center justify-center gap-2 p-2 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg">
              <Flame className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium text-orange-700">{streakDays} day streak!</span>
            </div>
          )}

          {/* Interests */}
          {profile?.interests_tags?.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Interests</p>
              <div className="flex flex-wrap gap-1.5">
                {profile.interests_tags.slice(0, 5).map((tag, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                    {tag}
                  </Badge>
                ))}
                {profile.interests_tags.length > 5 && (
                  <Badge variant="outline" className="text-xs">
                    +{profile.interests_tags.length - 5}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}