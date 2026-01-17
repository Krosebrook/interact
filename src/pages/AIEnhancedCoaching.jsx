import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ManagerCoachingDashboard from '../components/admin/ManagerCoachingDashboard';
import FeedbackAnalyticsDashboard from '../components/admin/FeedbackAnalyticsDashboard';
import AIBadgeSuggestions from '../components/admin/AIBadgeSuggestions';

export default function AIEnhancedCoaching() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">AI-Enhanced Coaching & Analytics</h1>
        <p className="text-slate-600 mb-6">Advanced insights for managers, feedback analysis, and dynamic gamification</p>

        <Tabs defaultValue="coaching" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="coaching">Manager Coaching</TabsTrigger>
            <TabsTrigger value="feedback">Feedback Analytics</TabsTrigger>
            <TabsTrigger value="badges">Badge Suggestions</TabsTrigger>
          </TabsList>

          <TabsContent value="coaching">
            <ManagerCoachingDashboard />
          </TabsContent>

          <TabsContent value="feedback">
            <FeedbackAnalyticsDashboard />
          </TabsContent>

          <TabsContent value="badges">
            <AIBadgeSuggestions />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}