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
      {/* Profile Header with Avatar, Bio, Level, Stats */}
      <ProfileHeader 
        user={user}
        profile={profile} 
        userPoints={userPoints}
        onUpdate={refetchProfile}
      />

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-7 mb-6 h-auto gap-1 p-1">
          <TabsTrigger value="overview" className="flex items-center gap-2 py-2.5">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="badges" className="flex items-center gap-2 py-2.5">
            <Trophy className="h-4 w-4" />
            <span className="hidden sm:inline">Badges</span>
          </TabsTrigger>
          <TabsTrigger value="skills" className="flex items-center gap-2 py-2.5">
            <Target className="h-4 w-4" />
            <span className="hidden sm:inline">Skills</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2 py-2.5">
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">History</span>
          </TabsTrigger>
          <TabsTrigger value="events" className="flex items-center gap-2 py-2.5">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Events</span>
          </TabsTrigger>
          <TabsTrigger value="interests" className="flex items-center gap-2 py-2.5">
            <Heart className="h-4 w-4" />
            <span className="hidden sm:inline">Interests</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2 py-2.5">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Settings</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview - Contributions & Recognition */}
        <TabsContent value="overview">
          <ContributionsShowcase userEmail={user.email} />
        </TabsContent>

        {/* Badges & Achievements */}
        <TabsContent value="badges">
          <ProfileBadgesShowcase userEmail={user.email} />
        </TabsContent>

        {/* Skills Development */}
        <TabsContent value="skills">
          <SkillsDevelopmentTracker 
            userEmail={user.email} 
            profile={profile}
          />
        </TabsContent>

        {/* Activity History Timeline */}
        <TabsContent value="history">
          <ActivityHistoryTimeline userEmail={user.email} />
        </TabsContent>

        {/* Upcoming Events Dashboard */}
        <TabsContent value="events">
          <ProfileEventsDashboard userEmail={user.email} />
        </TabsContent>

        {/* Skills & Interests Manager */}
        <TabsContent value="interests">
          <SkillsInterestsManager 
            profile={profile} 
            onUpdate={refetchProfile}
          />
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