import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Zap, 
  Award, 
  Gift, 
  Users, 
  User,
  Shield,
  TrendingUp,
  HelpCircle
} from 'lucide-react';
import { useUserData } from '../components/hooks/useUserData';
import LoadingSpinner from '../components/common/LoadingSpinner';
import PointsConfigPanel from '../components/settings/PointsConfigPanel';
import BadgeCriteriaManager from '../components/settings/BadgeCriteriaManager';
import RewardInventoryManager from '../components/settings/RewardInventoryManager';
import TeamStructureManager from '../components/settings/TeamStructureManager';
import UserGamificationPreferences from '../components/settings/UserGamificationPreferences';

export default function GamificationSettings() {
  const { user, loading: userLoading, isAdmin } = useUserData(true);
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState(isAdmin ? 'points' : 'preferences');

  const { data: activityPrefs = [] } = useQuery({
    queryKey: ['activity-preferences'],
    queryFn: () => base44.entities.ActivityPreference.list()
  });

  const savePointsConfig = useMutation({
    mutationFn: async (config) => {
      const existing = activityPrefs[0];
      if (existing) {
        return base44.entities.ActivityPreference.update(existing.id, {
          points_config: config
        });
      } else {
        return base44.entities.ActivityPreference.create({
          preference_key: 'default',
          points_config: config
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activity-preferences'] });
    }
  });

  if (userLoading) {
    return <LoadingSpinner className="min-h-[60vh]" message="Loading settings..." />;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="glass-panel-solid relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-600/5 via-transparent to-int-orange/5 pointer-events-none" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 shadow-lg">
              <Settings className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-int-navy font-display">
                <span className="text-highlight">Gamification Settings</span>
              </h1>
              <p className="text-slate-600">
                {isAdmin 
                  ? 'Configure points, badges, rewards, and team structures'
                  : 'Manage your gamification preferences'
                }
              </p>
            </div>
          </div>
          <Badge className={isAdmin ? 'bg-gradient-purple text-white' : 'bg-slate-100 text-slate-700'}>
            <Shield className="h-3 w-3 mr-1" />
            {isAdmin ? 'Admin' : 'User'}
          </Badge>
        </div>
      </div>

      {/* Quick Stats for Admins */}
      {isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-int-orange/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-int-orange/10">
                  <Zap className="h-5 w-5 text-int-orange" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-int-navy">10</p>
                  <p className="text-xs text-slate-500">Point Rules</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100">
                  <Award className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <QueryBadgeCount />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-emerald-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-100">
                  <Gift className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <QueryRewardCount />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-int-navy/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-int-navy/10">
                  <Users className="h-5 w-5 text-int-navy" />
                </div>
                <div>
                  <QueryTeamCount />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white border shadow-sm flex-wrap h-auto gap-1 p-1">
          {isAdmin && (
            <>
              <TabsTrigger value="points" className="data-[state=active]:bg-gradient-orange data-[state=active]:text-white">
                <Zap className="h-4 w-4 mr-2" />
                Points
              </TabsTrigger>
              <TabsTrigger value="badges" className="data-[state=active]:bg-gradient-purple data-[state=active]:text-white">
                <Award className="h-4 w-4 mr-2" />
                Badges
              </TabsTrigger>
              <TabsTrigger value="rewards" className="data-[state=active]:bg-gradient-wellness data-[state=active]:text-white">
                <Gift className="h-4 w-4 mr-2" />
                Rewards
              </TabsTrigger>
              <TabsTrigger value="teams" className="data-[state=active]:bg-gradient-navy data-[state=active]:text-white">
                <Users className="h-4 w-4 mr-2" />
                Teams
              </TabsTrigger>
            </>
          )}
          <TabsTrigger value="preferences" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white">
            <User className="h-4 w-4 mr-2" />
            My Preferences
          </TabsTrigger>
        </TabsList>

        {/* Points Config */}
        {isAdmin && (
          <TabsContent value="points" className="mt-6">
            <PointsConfigPanel 
              config={activityPrefs[0]?.points_config}
              onSave={(config) => savePointsConfig.mutate(config)}
            />
          </TabsContent>
        )}

        {/* Badge Management */}
        {isAdmin && (
          <TabsContent value="badges" className="mt-6">
            <BadgeCriteriaManager />
          </TabsContent>
        )}

        {/* Reward Inventory */}
        {isAdmin && (
          <TabsContent value="rewards" className="mt-6">
            <RewardInventoryManager />
          </TabsContent>
        )}

        {/* Team Structure */}
        {isAdmin && (
          <TabsContent value="teams" className="mt-6">
            <TeamStructureManager />
          </TabsContent>
        )}

        {/* User Preferences */}
        <TabsContent value="preferences" className="mt-6">
          <UserGamificationPreferences userEmail={user?.email} />
        </TabsContent>
      </Tabs>

      {/* Help Section */}
      <Card className="border-dashed border-2">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-blue-100">
              <HelpCircle className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-1">Need Help?</h3>
              <p className="text-sm text-slate-600 mb-3">
                {isAdmin 
                  ? 'Configure gamification settings to match your organization\'s engagement goals. Changes are applied immediately.'
                  : 'Customize how your achievements are displayed to others. Your privacy preferences are respected across the platform.'
                }
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  View Documentation
                </Button>
                <Button variant="outline" size="sm">
                  Contact Support
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper components for counts
function QueryBadgeCount() {
  const { data: badges = [] } = useQuery({
    queryKey: ['badges'],
    queryFn: () => base44.entities.Badge.list()
  });
  return (
    <>
      <p className="text-2xl font-bold text-purple-600">{badges.length}</p>
      <p className="text-xs text-slate-500">Badges</p>
    </>
  );
}

function QueryRewardCount() {
  const { data: rewards = [] } = useQuery({
    queryKey: ['rewards'],
    queryFn: () => base44.entities.Reward.list()
  });
  return (
    <>
      <p className="text-2xl font-bold text-emerald-600">{rewards.length}</p>
      <p className="text-xs text-slate-500">Rewards</p>
    </>
  );
}

function QueryTeamCount() {
  const { data: teams = [] } = useQuery({
    queryKey: ['teams'],
    queryFn: () => base44.entities.Team.list()
  });
  return (
    <>
      <p className="text-2xl font-bold text-int-navy">{teams.length}</p>
      <p className="text-xs text-slate-500">Teams</p>
    </>
  );
}