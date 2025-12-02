import React from 'react';
import { useUserData } from '../components/hooks/useUserData.jsx';
import { useUserProfile } from '../components/hooks/useUserProfile';
import ProfileHeader from '../components/profile/ProfileHeader';
import ProfilePreferencesEditor from '../components/profile/ProfilePreferencesEditor';
import ContributionsShowcase from '../components/profile/ContributionsShowcase';
import ProfileBadgesShowcase from '../components/profile/ProfileBadgesShowcase';
import ProfileEventsDashboard from '../components/profile/ProfileEventsDashboard';
import ActivityHistoryTimeline from '../components/profile/ActivityHistoryTimeline';
import SkillsInterestsManager from '../components/profile/SkillsInterestsManager';
import SkillsDevelopmentTracker from '../components/profile/SkillsDevelopmentTracker';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Settings, Trophy, Calendar, History, Heart, Target, Award } from 'lucide-react';

export default function UserProfilePage() {
  const { user, loading: userLoading } = useUserData(true, false);
  const { profile, userPoints, refetchProfile } = useUserProfile(user?.email);

  if (userLoading || !user) {
    return <LoadingSpinner className="min-h-[60vh]" />;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <PageHeader 
        title="My Profile" 
        description="View your achievements, manage events, and customize your preferences" 
      />

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 mb-6">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="badges" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            <span className="hidden sm:inline">Badges</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">History</span>
          </TabsTrigger>
          <TabsTrigger value="interests" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            <span className="hidden sm:inline">Interests</span>
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Settings</span>
          </TabsTrigger>
        </TabsList>

        {/* Dashboard - Upcoming & Bookmarked Events */}
        <TabsContent value="dashboard">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <UserProfileCard 
                profile={profile} 
                userPoints={userPoints}
              />
            </div>
            <div className="lg:col-span-2">
              <ProfileEventsDashboard userEmail={user.email} />
            </div>
          </div>
        </TabsContent>

        {/* Badges & Achievements */}
        <TabsContent value="badges">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <UserProfileCard 
                profile={profile} 
                userPoints={userPoints}
                compact={false}
              />
            </div>
            <div className="lg:col-span-2">
              <ProfileBadgesShowcase userEmail={user.email} />
            </div>
          </div>
        </TabsContent>

        {/* Event History */}
        <TabsContent value="history">
          <ProfileEventHistory userEmail={user.email} />
        </TabsContent>

        {/* Skills & Interests */}
        <TabsContent value="interests">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <UserProfileCard 
                profile={profile} 
                userPoints={userPoints}
              />
            </div>
            <div className="lg:col-span-2">
              <SkillsInterestsManager 
                profile={profile} 
                onUpdate={refetchProfile}
              />
            </div>
          </div>
        </TabsContent>

        {/* Profile Overview */}
        <TabsContent value="profile">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <UserProfileCard 
                profile={profile} 
                userPoints={userPoints}
              />
            </div>
            <div className="lg:col-span-2">
              <ContributionsShowcase userEmail={user.email} />
            </div>
          </div>
        </TabsContent>

        {/* Settings & Preferences */}
        <TabsContent value="settings">
          <ProfilePreferencesEditor
            profile={{ ...profile, user_email: user.email }}
            onSave={() => refetchProfile()}
            onCancel={() => {}}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}