import React from 'react';
import { useUserData } from '../components/hooks/useUserData';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import GamificationCustomizer from '../components/profile/GamificationCustomizer';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { createPageUrl } from '../utils';
import { Link } from 'react-router-dom';

export default function ProfileCustomization() {
  const { user, profile: userProfile, loading } = useUserData(true);

  const { data: userPoints } = useQuery({
    queryKey: ['user-points', user?.email],
    queryFn: async () => {
      const points = await base44.entities.UserPoints.filter({ user_email: user?.email });
      return points[0] || null;
    },
    enabled: !!user?.email
  });

  if (loading) {
    return <LoadingSpinner className="min-h-[60vh]" message="Loading customization..." />;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to={createPageUrl('UserProfile')}>
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-int-navy">Customize Your Experience</h1>
          <p className="text-slate-600">Personalize your gamification journey with AI-powered suggestions</p>
        </div>
      </div>

      {/* Customizer */}
      <GamificationCustomizer
        userEmail={user?.email}
        profile={userProfile}
        userPoints={userPoints}
      />
    </div>
  );
}