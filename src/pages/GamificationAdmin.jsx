import React, { useState } from 'react';
import { useUserData } from '../components/hooks/useUserData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Shield, Users, Award, TrendingUp, Settings, Zap, BookOpen, Sparkles } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import UserProgressOverview from '../components/admin/gamification/UserProgressOverview';
import ManualAwardsPanel from '../components/admin/gamification/ManualAwardsPanel';
import GamificationRulesConfig from '../components/admin/gamification/GamificationRulesConfig';
import EngagementAnalytics from '../components/admin/gamification/EngagementAnalytics';
import SkillDevelopmentTrends from '../components/admin/gamification/SkillDevelopmentTrends';
import ContentIntegrationManager from '../components/admin/gamification/ContentIntegrationManager';
import AIContentGenerator from '../components/admin/gamification/AIContentGenerator';
import AIRuleOptimizer from '../components/admin/gamification/AIRuleOptimizer';
import { useGamificationStats } from '../components/admin/gamification/QuickStatsLoader';

export default function GamificationAdmin() {
  const { user, loading } = useUserData(true, true); // Require auth and admin
  const [activeTab, setActiveTab] = useState('overview');
  const stats = useGamificationStats();

  if (loading) {
    return <LoadingSpinner className="min-h-[60vh]" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="h-12 w-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
            <Shield className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-int-navy">Gamification & Learning Admin</h1>
            <p className="text-slate-600">Manage engagement, awards, and learning content</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Active Users</p>
                <p className="text-2xl font-bold text-int-navy">{stats.activeUsers}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Points Awarded</p>
                <p className="text-2xl font-bold text-int-navy">{stats.totalPoints.toLocaleString()}</p>
              </div>
              <Zap className="h-8 w-8 text-amber-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Badges Earned</p>
                <p className="text-2xl font-bold text-int-navy">{stats.totalBadges}</p>
              </div>
              <Award className="h-8 w-8 text-purple-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Learning Paths Active</p>
                <p className="text-2xl font-bold text-int-navy">{stats.activeLearningPaths}</p>
              </div>
              <BookOpen className="h-8 w-8 text-emerald-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-8">
          <TabsTrigger value="overview" className="gap-2">
            <Users className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="awards" className="gap-2">
            <Award className="h-4 w-4" />
            Awards
          </TabsTrigger>
          <TabsTrigger value="rules" className="gap-2">
            <Settings className="h-4 w-4" />
            Rules
          </TabsTrigger>
          <TabsTrigger value="ai-optimizer" className="gap-2">
            <Sparkles className="h-4 w-4" />
            AI Rules
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="skills" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Skills
          </TabsTrigger>
          <TabsTrigger value="ai-content" className="gap-2">
            <Sparkles className="h-4 w-4" />
            AI Content
          </TabsTrigger>
          <TabsTrigger value="integrations" className="gap-2">
            <Zap className="h-4 w-4" />
            External
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <UserProgressOverview />
        </TabsContent>

        <TabsContent value="awards" className="mt-6">
          <ManualAwardsPanel />
        </TabsContent>

        <TabsContent value="rules" className="mt-6">
          <GamificationRulesConfig />
        </TabsContent>

        <TabsContent value="ai-optimizer" className="mt-6">
          <AIRuleOptimizer />
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <EngagementAnalytics />
        </TabsContent>

        <TabsContent value="skills" className="mt-6">
          <SkillDevelopmentTrends />
        </TabsContent>

        <TabsContent value="ai-content" className="mt-6">
          <AIContentGenerator />
        </TabsContent>

        <TabsContent value="integrations" className="mt-6">
          <ContentIntegrationManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}