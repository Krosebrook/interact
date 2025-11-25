import React, { useState } from 'react';
import { useUserData } from '../components/hooks/useUserData';
import { useUserProfile } from '../components/hooks/useUserProfile';
import UserProfileCard from '../components/profile/UserProfileCard';
import ProfilePreferencesEditor from '../components/profile/ProfilePreferencesEditor';
import ContributionsShowcase from '../components/profile/ContributionsShowcase';
import LoadingSpinner from '../components/common/LoadingSpinner';
import PageHeader from '../components/common/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Settings, Trophy } from 'lucide-react';

export default function UserProfilePage() {
  const { user, loading: userLoading } = useUserData(true, false);
  const { profile, userPoints, refetchProfile } = useUserProfile(user?.email);
  const [editing, setEditing] = useState(false);

  if (userLoading || !user) {
    return <LoadingSpinner className="min-h-[60vh]" />;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <PageHeader 
        title="My Profile" 
        description="Manage your preferences and view your contributions" 
      />

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