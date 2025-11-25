import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import UserProfileCard from '../components/profile/UserProfileCard';
import ProfilePreferencesEditor from '../components/profile/ProfilePreferencesEditor';
import ContributionsShowcase from '../components/profile/ContributionsShowcase';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Settings, Trophy } from 'lucide-react';

export default function UserProfilePage() {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        base44.auth.redirectToLogin();
      }
    };
    loadUser();
  }, []);

  const { data: profile, refetch: refetchProfile } = useQuery({
    queryKey: ['user-profile', user?.email],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.filter({ user_email: user.email });
      return profiles[0] || { user_email: user.email };
    },
    enabled: !!user?.email
  });

  const { data: userPoints } = useQuery({
    queryKey: ['user-points', user?.email],
    queryFn: async () => {
      const points = await base44.entities.UserPoints.filter({ user_email: user.email });
      return points[0];
    },
    enabled: !!user?.email
  });

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Profile</h1>
          <p className="text-slate-600">Manage your preferences and view your contributions</p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Preferences
          </TabsTrigger>
          <TabsTrigger value="contributions" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Contributions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <UserProfileCard 
                profile={profile} 
                userPoints={userPoints}
                onEdit={() => setEditing(true)}
              />
            </div>
            <div className="lg:col-span-2">
              <ContributionsShowcase userEmail={user.email} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="preferences">
          <ProfilePreferencesEditor
            profile={{ ...profile, user_email: user.email }}
            onSave={() => {
              refetchProfile();
              setEditing(false);
            }}
            onCancel={() => setEditing(false)}
          />
        </TabsContent>

        <TabsContent value="contributions">
          <ContributionsShowcase userEmail={user.email} />
        </TabsContent>
      </Tabs>
    </div>
  );
}