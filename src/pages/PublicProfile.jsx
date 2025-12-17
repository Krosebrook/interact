/**
 * PUBLIC PROFILE PAGE
 * View another user's profile (read-only)
 * Respects privacy settings
 */

import React from 'react';
import { useUserData } from '../components/hooks/useUserData.jsx';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useSearchParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  User,
  MapPin,
  Building,
  Briefcase,
  Award,
  TrendingUp,
  Calendar,
  Flame,
  Mail,
  ArrowLeft,
  Shield
} from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';

export default function PublicProfile() {
  const { user: currentUser } = useUserData(true);
  const [searchParams] = useSearchParams();
  const profileEmail = searchParams.get('email');

  // Fetch target user
  const { data: targetUsers = [], isLoading: userLoading } = useQuery({
    queryKey: ['user', profileEmail],
    queryFn: () => base44.entities.User.filter({ email: profileEmail }),
    enabled: !!profileEmail
  });

  // Fetch target profile
  const { data: profiles = [], isLoading: profileLoading } = useQuery({
    queryKey: ['profile', profileEmail],
    queryFn: () => base44.entities.UserProfile.filter({ user_email: profileEmail }),
    enabled: !!profileEmail
  });

  // Fetch target points
  const { data: pointsRecords = [], isLoading: pointsLoading } = useQuery({
    queryKey: ['points', profileEmail],
    queryFn: () => base44.entities.UserPoints.filter({ user_email: profileEmail }),
    enabled: !!profileEmail
  });

  if (userLoading || profileLoading || pointsLoading) {
    return <LoadingSpinner className="min-h-[60vh]" message="Loading profile..." />;
  }

  if (!profileEmail || targetUsers.length === 0) {
    return (
      <EmptyState
        icon={User}
        title="User not found"
        description="The requested profile does not exist"
        actionLabel="Back to Directory"
        onAction={() => window.history.back()}
      />
    );
  }

  const targetUser = targetUsers[0];
  const profile = profiles[0];
  const points = pointsRecords[0];

  // Check privacy settings
  const privacySettings = profile?.privacy_settings || {};
  const isOwnProfile = currentUser?.email === profileEmail;
  const isAdmin = currentUser?.role === 'admin';

  // Determine visibility
  const canViewFullProfile = isOwnProfile || isAdmin || privacySettings.profile_visibility === 'public';
  const canViewActivityHistory = isOwnProfile || isAdmin || privacySettings.show_activity_history !== false;
  const canViewBadges = isOwnProfile || isAdmin || privacySettings.show_badges !== false;
  const canViewPoints = isOwnProfile || isAdmin || privacySettings.show_points !== false;

  if (!canViewFullProfile && privacySettings.profile_visibility === 'private') {
    return (
      <EmptyState
        icon={Shield}
        title="Private Profile"
        description="This user has set their profile to private"
        actionLabel="Back"
        onAction={() => window.history.back()}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Back button */}
      <Button variant="ghost" onClick={() => window.history.back()}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      {/* Profile Header */}
      <Card className="border-0 shadow-xl overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-int-navy via-purple-700 to-int-orange relative">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />
        </div>

        <div className="px-6 pb-6">
          {/* Avatar */}
          <div className="relative -mt-16 mb-4 flex items-end gap-4">
            <div className="relative">
              <div className="w-28 h-28 rounded-full p-1 bg-gradient-to-br from-yellow-400 via-int-orange to-purple-600 shadow-xl">
                {profile?.avatar_url ? (
                  <img 
                    src={profile.avatar_url} 
                    alt={profile.display_name || targetUser.full_name}
                    className="w-full h-full rounded-full object-cover border-4 border-white"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center border-4 border-white">
                    <User className="h-12 w-12 text-white" />
                  </div>
                )}
              </div>
              {canViewPoints && points?.level && (
                <div className="absolute -bottom-1 -right-1 w-10 h-10 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center text-sm font-bold text-white border-3 border-white shadow-lg">
                  {points.level}
                </div>
              )}
            </div>

            {/* Name & Title */}
            <div className="flex-1 pb-2">
              <h1 className="text-2xl font-bold text-int-navy">
                {profile?.display_name || targetUser.full_name}
              </h1>
              <div className="flex flex-wrap items-center gap-3 mt-1">
                {profile?.job_title && (
                  <span className="flex items-center gap-1 text-sm text-slate-600">
                    <Briefcase className="h-4 w-4 text-int-orange" />
                    {profile.job_title}
                  </span>
                )}
                {profile?.department && (
                  <span className="flex items-center gap-1 text-sm text-slate-600">
                    <Building className="h-4 w-4" />
                    {profile.department}
                  </span>
                )}
                {profile?.location && (
                  <span className="flex items-center gap-1 text-sm text-slate-600">
                    <MapPin className="h-4 w-4" />
                    {profile.location}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Mail className="h-4 w-4 text-slate-400" />
                <span className="text-sm text-slate-600">{targetUser.email}</span>
              </div>
            </div>
          </div>

          {/* Bio */}
          {profile?.bio && (
            <p className="text-slate-600 text-sm mb-4 leading-relaxed">
              {profile.bio}
            </p>
          )}

          {/* Stats */}
          {canViewPoints && points && (
            <div className="grid grid-cols-4 gap-3 pt-4 border-t border-slate-200">
              <StatsBox
                icon={<TrendingUp className="h-5 w-5 text-purple-600" />}
                value={(points.total_points || 0).toLocaleString()}
                label="Points"
                gradient="from-purple-100 to-purple-50"
              />
              <StatsBox
                icon={<Calendar className="h-5 w-5 text-blue-600" />}
                value={points.events_attended || 0}
                label="Events"
                gradient="from-blue-100 to-blue-50"
              />
              <StatsBox
                icon={<Award className="h-5 w-5 text-amber-600" />}
                value={points.badges_earned?.length || 0}
                label="Badges"
                gradient="from-amber-100 to-amber-50"
              />
              <StatsBox
                icon={<Flame className="h-5 w-5 text-orange-600" />}
                value={points.streak_days || 0}
                label="Streak"
                gradient="from-orange-100 to-orange-50"
              />
            </div>
          )}
        </div>
      </Card>

      {/* Skills & Interests */}
      {profile?.skill_interests && profile.skill_interests.length > 0 && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-3">Skills & Interests</h2>
          <div className="flex flex-wrap gap-2">
            {profile.skill_interests.map((skill, idx) => (
              <Badge key={idx} className="bg-emerald-100 text-emerald-700">
                {skill}
              </Badge>
            ))}
            {profile.interests_tags?.map((interest, idx) => (
              <Badge key={`int-${idx}`} className="bg-pink-100 text-pink-700">
                {interest}
              </Badge>
            ))}
          </div>
        </Card>
      )}

      {/* Privacy Notice */}
      {!canViewFullProfile && (
        <Card className="p-4 bg-slate-50 border-slate-200">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Shield className="h-4 w-4" />
            <p>Some profile information is hidden based on privacy settings</p>
          </div>
        </Card>
      )}
    </div>
  );
}

function StatsBox({ icon, value, label, gradient }) {
  return (
    <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} text-center`}>
      <div className="flex justify-center mb-1">{icon}</div>
      <p className="text-xl font-bold text-slate-800">{value}</p>
      <p className="text-xs text-slate-700 font-medium">{label}</p>
    </div>
  );
}