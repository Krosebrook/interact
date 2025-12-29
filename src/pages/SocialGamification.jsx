import React from 'react';
import { useUserData } from '../components/hooks/useUserData';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Heart, Trophy } from 'lucide-react';
import BuddyMatchingSystem from '../components/social/BuddyMatchingSystem';
import EnhancedRecognitionForm from '../components/social/EnhancedRecognitionForm';
import TeamChallengeManager from '../components/teams/TeamChallengeManager';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function SocialGamification() {
  const { user, loading } = useUserData(true);

  const { data: userPoints } = useQuery({
    queryKey: ['user-points', user?.email],
    queryFn: async () => {
      const points = await base44.entities.UserPoints.filter({ user_email: user?.email });
      return points[0];
    },
    enabled: !!user?.email
  });

  if (loading) {
    return <LoadingSpinner className="min-h-[60vh]" message="Loading..." />;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-int-navy">Social Gamification</h1>
        <p className="text-slate-600 mt-1">Connect, compete, and grow together</p>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="buddies">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="buddies" className="gap-2">
            <Users className="h-4 w-4" />
            Buddy System
          </TabsTrigger>
          <TabsTrigger value="recognition" className="gap-2">
            <Heart className="h-4 w-4" />
            Recognition
          </TabsTrigger>
          <TabsTrigger value="challenges" className="gap-2">
            <Trophy className="h-4 w-4" />
            Team Challenges
          </TabsTrigger>
        </TabsList>

        <TabsContent value="buddies" className="mt-6">
          <BuddyMatchingSystem userEmail={user?.email} />
        </TabsContent>

        <TabsContent value="recognition" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <EnhancedRecognitionForm currentUser={user} />
            <div>
              {/* Recent recognitions feed could go here */}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="challenges" className="mt-6">
          <TeamChallengeManager 
            userEmail={user?.email}
            userTeamId={userPoints?.team_id}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}