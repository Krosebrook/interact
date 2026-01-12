import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Bell, Layout, Target, Sparkles, Settings } from 'lucide-react';
import NotificationCustomizer from './NotificationCustomizer';
import WidgetLayoutCustomizer from './WidgetLayoutCustomizer';
import GoalsCustomizer from './GoalsCustomizer';
import FlairCustomizer from './FlairCustomizer';
import AIPersonalizationSuggestions from './AIPersonalizationSuggestions';
import { toast } from 'sonner';

export default function GamificationCustomizer({ userEmail, profile, userPoints }) {
  const [activeTab, setActiveTab] = useState('ai');
  const queryClient = useQueryClient();

  const updateProfileMutation = useMutation({
    mutationFn: async (updates) => {
      await base44.auth.updateMe(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['user-profile']);
      toast.success('Preferences saved!');
    }
  });

  return (
    <div className="space-y-6" data-b44-sync="true" data-feature="profile" data-component="gamificationcustomizer">
      {/* Header */}
      <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-6 w-6 text-purple-600" />
                Gamification Customization
              </CardTitle>
              <p className="text-sm text-slate-600 mt-1">
                Personalize your experience, set goals, and customize your profile
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="ai" className="gap-2">
            <Sparkles className="h-4 w-4" />
            AI Suggestions
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="layout" className="gap-2">
            <Layout className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="goals" className="gap-2">
            <Target className="h-4 w-4" />
            Goals
          </TabsTrigger>
          <TabsTrigger value="flair" className="gap-2">
            <Sparkles className="h-4 w-4" />
            Flair
          </TabsTrigger>
        </TabsList>

        {/* AI Suggestions Tab */}
        <TabsContent value="ai" className="mt-6">
          <AIPersonalizationSuggestions
            userEmail={userEmail}
            profile={profile}
            userPoints={userPoints}
            onApplySuggestion={updateProfileMutation.mutate}
          />
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="mt-6">
          <NotificationCustomizer
            preferences={profile?.notification_preferences}
            onSave={(prefs) => updateProfileMutation.mutate({ notification_preferences: prefs })}
            isSaving={updateProfileMutation.isPending}
          />
        </TabsContent>

        {/* Dashboard Layout Tab */}
        <TabsContent value="layout" className="mt-6">
          <WidgetLayoutCustomizer
            currentLayout={profile?.dashboard_layout}
            onSave={(layout) => updateProfileMutation.mutate({ dashboard_layout: layout })}
            isSaving={updateProfileMutation.isPending}
          />
        </TabsContent>

        {/* Goals Tab */}
        <TabsContent value="goals" className="mt-6">
          <GoalsCustomizer
            userEmail={userEmail}
            currentGoals={profile?.gamification_goals}
            userPoints={userPoints}
            onSave={(goals) => updateProfileMutation.mutate({ gamification_goals: goals })}
            isSaving={updateProfileMutation.isPending}
          />
        </TabsContent>

        {/* Flair Tab */}
        <TabsContent value="flair" className="mt-6">
          <FlairCustomizer
            userEmail={userEmail}
            currentFlair={profile?.display_flair}
            userPoints={userPoints}
            onSave={(flair) => updateProfileMutation.mutate({ display_flair: flair })}
            isSaving={updateProfileMutation.isPending}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}