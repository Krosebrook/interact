import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useUserData } from '../components/hooks/useUserData';
import { useSocialActions } from '../components/profile/hooks/useSocialActions';
import LoadingSpinner from '../components/common/LoadingSpinner';
import PublicProfileCard from '../components/profile/PublicProfileCard';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';

/**
 * Public profile page for viewing other users' profiles
 */
export default function PublicProfile() {
  const { user, loading: userLoading } = useUserData(true);
  const params = new URLSearchParams(window.location.search);
  const profileEmail = params.get('email');

  // Social actions hook
  const { 
    isFollowing, 
    isBlocked, 
    follow, 
    unfollow, 
    block,
    isLoading: socialLoading 
  } = useSocialActions(user?.email);

  // Fetch target user's profile
  const { data: profiles = [], isLoading: profileLoading } = useQuery({
    queryKey: ['public-profile', profileEmail],
    queryFn: () => base44.entities.UserProfile.filter({ user_email: profileEmail }),
    enabled: !!profileEmail
  });

  // Fetch target user's points/stats
  const { data: userPointsList = [] } = useQuery({
    queryKey: ['public-profile-points', profileEmail],
    queryFn: () => base44.entities.UserPoints.filter({ user_email: profileEmail }),
    enabled: !!profileEmail
  });

  const profile = profiles[0];
  const userPoints = userPointsList[0];
  const isOwnProfile = user?.email === profileEmail;

  if (userLoading || profileLoading) {
    return <LoadingSpinner className="min-h-[60vh]" message="Loading profile..." />;
  }

  if (!profileEmail) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-16 w-16 mx-auto mb-4 text-slate-300" />
        <h2 className="text-xl font-semibold text-slate-700 mb-2">No Profile Selected</h2>
        <p className="text-slate-500 mb-4">Please select a user from the leaderboard</p>
        <Link to={createPageUrl('Leaderboards')}>
          <Button className="bg-int-orange hover:bg-[#C46322]">
            View Leaderboards
          </Button>
        </Link>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-16 w-16 mx-auto mb-4 text-slate-300" />
        <h2 className="text-xl font-semibold text-slate-700 mb-2">Profile Not Found</h2>
        <p className="text-slate-500 mb-4">This user hasn't set up their profile yet</p>
        <Link to={createPageUrl('Leaderboards')}>
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Leaderboards
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
      {/* Back button */}
      <Link to={createPageUrl('Leaderboards')}>
        <Button variant="ghost" size="sm" className="text-slate-600">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Leaderboards
        </Button>
      </Link>

      {/* Profile card */}
      <PublicProfileCard
        profile={profile}
        userPoints={userPoints}
        isOwnProfile={isOwnProfile}
        isFollowing={isFollowing(profileEmail)}
        isBlocked={isBlocked(profileEmail)}
        onFollow={() => follow(profileEmail)}
        onUnfollow={() => unfollow(profileEmail)}
        onBlock={() => block(profileEmail)}
        isLoading={socialLoading}
      />
    </div>
  );
}