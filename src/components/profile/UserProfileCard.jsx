import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  User, 
  MapPin, 
  Building, 
  Star, 
  Trophy,
  Camera,
  Calendar,
  TrendingUp,
  Edit
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function UserProfileCard({ profile, userPoints, onEdit, compact = false }) {
  const engagementLevel = userPoints?.level || 1;
  const totalPoints = userPoints?.total_points || 0;

  if (compact) {
    return (
      <Card className="p-4 border-0 shadow-md">
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
              {engagementLevel}
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
            <p className="font-bold text-purple-600">{totalPoints}</p>
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
        <div className="h-24 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 relative">
          <div className="absolute inset-0 bg-black/10" />
          {onEdit && (
            <Button
              size="sm"
              variant="ghost"
              className="absolute top-2 right-2 text-white hover:bg-white/20"
              onClick={onEdit}
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          )}
        </div>

        {/* Profile Content */}
        <div className="px-6 pb-6">
          {/* Avatar */}
          <div className="relative -mt-12 mb-4">
            {profile?.avatar_url ? (
              <img 
                src={profile.avatar_url} 
                alt={profile.display_name}
                className="w-24 h-24 rounded-full border-4 border-white object-cover shadow-lg"
              />
            ) : (
              <div className="w-24 h-24 rounded-full border-4 border-white bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
                <User className="h-12 w-12 text-white" />
              </div>
            )}
            <div className="absolute bottom-0 right-0 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-sm font-bold border-2 border-white">
              {engagementLevel}
            </div>
          </div>

          {/* Name & Bio */}
          <h2 className="text-xl font-bold text-slate-900 mb-1">
            {profile?.display_name || 'New User'}
          </h2>
          {profile?.bio && (
            <p className="text-slate-600 text-sm mb-3">{profile.bio}</p>
          )}

          {/* Info */}
          <div className="flex flex-wrap gap-3 mb-4">
            {profile?.department && (
              <div className="flex items-center gap-1 text-sm text-slate-500">
                <Building className="h-4 w-4" />
                {profile.department}
              </div>
            )}
            {profile?.location && (
              <div className="flex items-center gap-1 text-sm text-slate-500">
                <MapPin className="h-4 w-4" />
                {profile.location}
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 rounded-xl mb-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{totalPoints}</p>
              <p className="text-xs text-slate-500">Points</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-indigo-600">
                {profile?.engagement_stats?.total_events_attended || 0}
              </p>
              <p className="text-xs text-slate-500">Events</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {userPoints?.badges_earned?.length || 0}
              </p>
              <p className="text-xs text-slate-500">Badges</p>
            </div>
          </div>

          {/* Interests */}
          {profile?.interests_tags?.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-slate-700 mb-2">Interests</p>
              <div className="flex flex-wrap gap-2">
                {profile.interests_tags.slice(0, 6).map((tag, idx) => (
                  <Badge key={idx} variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Preferred Activities */}
          {profile?.activity_preferences?.preferred_types?.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-semibold text-slate-700 mb-2">Favorite Activities</p>
              <div className="flex flex-wrap gap-2">
                {profile.activity_preferences.preferred_types.map((type, idx) => (
                  <Badge key={idx} className="bg-indigo-100 text-indigo-700">
                    {type}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}