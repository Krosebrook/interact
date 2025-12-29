/**
 * REFACTORED USER PROFILE PAGE
 * Production-grade central hub with RBAC, optimistic updates, and comprehensive settings
 */

import React, { Suspense } from 'react';
import { useUserData } from '../components/hooks/useUserData.jsx';
import { useUserProfile } from '../components/hooks/useUserProfile';
import { usePermissions } from '../components/hooks/usePermissions';
import ErrorBoundary from '../components/common/ErrorBoundary';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Settings, Trophy, Calendar, History, Heart, Target, Bell, Shield, Sparkles, Accessibility, Sliders } from 'lucide-react';

// Lazy load heavy components
const ProfileHeader = React.lazy(() => import('../components/profile/ProfileHeader'));
const GamificationCustomizer = React.lazy(() => import('../components/profile/GamificationCustomizer'));
const ContributionsShowcase = React.lazy(() => import('../components/profile/ContributionsShowcase'));
const ProfileBadgesShowcase = React.lazy(() => import('../components/profile/ProfileBadgesShowcase'));
const SkillsDevelopmentTracker = React.lazy(() => import('../components/profile/SkillsDevelopmentTracker'));
const ActivityHistoryTimeline = React.lazy(() => import('../components/profile/ActivityHistoryTimeline'));
const ProfileEventsDashboard = React.lazy(() => import('../components/profile/ProfileEventsDashboard'));
const SkillsInterestsManager = React.lazy(() => import('../components/profile/SkillsInterestsManager'));
const NotificationSettings = React.lazy(() => import('../components/profile/NotificationSettings'));
const PrivacySettings = React.lazy(() => import('../components/profile/PrivacySettings'));
const PersonalizationSettings = React.lazy(() => import('../components/profile/PersonalizationSettings'));
const AccessibilitySettings = React.lazy(() => import('../components/profile/AccessibilitySettings'));

export default function UserProfilePage() {
  const { user, loading: userLoading } = useUserData(true, false);
  const { profile, userPoints, refetchProfile, isLoading: profileLoading } = useUserProfile(user?.email);
  const { canViewSensitiveData } = usePermissions();

  if (userLoading || !user) {
    return <LoadingSpinner className="min-h-[60vh]" message="Loading profile..." />;
  }

  return (
    <ErrorBoundary>
      <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
        {/* Profile Header with Avatar, Bio, Level, Stats */}
        <Suspense fallback={<LoadingSpinner size="large" />}>
          <ProfileHeader 
            user={user}
            profile={profile} 
            userPoints={userPoints}
            onUpdate={refetchProfile}
            isLoading={profileLoading}
          />
        </Suspense>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 mb-6 h-auto gap-1 p-1">
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
          <TabsTrigger value="customize" className="flex items-center gap-2 py-2.5">
            <Sliders className="h-4 w-4" />
            <span className="hidden sm:inline">Customize</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2 py-2.5">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Settings</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview - Contributions & Recognition */}
        <TabsContent value="overview">
          <Suspense fallback={<LoadingSpinner size="small" />}>
            <ContributionsShowcase userEmail={user.email} />
          </Suspense>
        </TabsContent>

        {/* Badges & Achievements */}
        <TabsContent value="badges">
          <Suspense fallback={<LoadingSpinner size="small" />}>
            <ProfileBadgesShowcase userEmail={user.email} />
          </Suspense>
        </TabsContent>

        {/* Skills Development */}
        <TabsContent value="skills">
          <Suspense fallback={<LoadingSpinner size="small" />}>
            <SkillsDevelopmentTracker 
              userEmail={user.email} 
              profile={profile}
            />
          </Suspense>
        </TabsContent>

        {/* Activity History Timeline */}
        <TabsContent value="history">
          <Suspense fallback={<LoadingSpinner size="small" />}>
            <ActivityHistoryTimeline userEmail={user.email} />
          </Suspense>
        </TabsContent>

        {/* Upcoming Events Dashboard */}
        <TabsContent value="events">
          <Suspense fallback={<LoadingSpinner size="small" />}>
            <ProfileEventsDashboard userEmail={user.email} />
          </Suspense>
        </TabsContent>

        {/* Skills & Interests Manager */}
        <TabsContent value="interests">
          <Suspense fallback={<LoadingSpinner size="small" />}>
            <SkillsInterestsManager 
              profile={profile} 
              onUpdate={refetchProfile}
            />
          </Suspense>
        </TabsContent>

        {/* Gamification Customization */}
        <TabsContent value="customize">
          <Suspense fallback={<LoadingSpinner size="small" />}>
            <GamificationCustomizer
              userEmail={user?.email}
              profile={profile}
              userPoints={userPoints}
            />
          </Suspense>
        </TabsContent>

        {/* Settings & Preferences */}
        <TabsContent value="settings">
          <Tabs defaultValue="notifications" className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-6">
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="privacy" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Privacy
              </TabsTrigger>
              <TabsTrigger value="personalization" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Personalization
              </TabsTrigger>
              <TabsTrigger value="accessibility" className="flex items-center gap-2">
                <Accessibility className="h-4 w-4" />
                Accessibility
              </TabsTrigger>
            </TabsList>

            <TabsContent value="notifications">
              <Suspense fallback={<LoadingSpinner size="small" />}>
                <NotificationSettings 
                  profile={profile}
                  onSave={refetchProfile}
                />
              </Suspense>
            </TabsContent>

            <TabsContent value="privacy">
              <Suspense fallback={<LoadingSpinner size="small" />}>
                <PrivacySettings
                  profile={profile}
                  onSave={refetchProfile}
                  canViewSensitiveData={canViewSensitiveData}
                />
              </Suspense>
            </TabsContent>

            <TabsContent value="personalization">
              <Suspense fallback={<LoadingSpinner size="small" />}>
                <PersonalizationSettings
                  profile={profile}
                  onSave={refetchProfile}
                />
              </Suspense>
            </TabsContent>

            <TabsContent value="accessibility">
              <Suspense fallback={<LoadingSpinner size="small" />}>
                <AccessibilitySettings
                  profile={profile}
                  onSave={refetchProfile}
                />
              </Suspense>
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
      </div>
    </ErrorBoundary>
  );
}