import React, { useState } from 'react';
import { useUserData } from '../components/hooks/useUserData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, TrendingUp, Sparkles } from 'lucide-react';
import ComprehensiveProfileView from '../components/profile/ComprehensiveProfileView';
import AIDevelopmentPlan from '../components/profile/AIDevelopmentPlan';

export default function ComprehensiveProfile() {
  const { user } = useUserData();
  const [viewingUser] = useState(user?.email);

  if (!user) {
    return <div className="text-center py-8 text-slate-500">Please log in to view profile</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <User className="w-8 h-8 text-purple-600" />
          Employee Profile
        </h1>
        <p className="text-slate-600 mt-1">Comprehensive view of your professional journey</p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">
            <User className="w-4 h-4 mr-2" />
            Profile Overview
          </TabsTrigger>
          <TabsTrigger value="development">
            <Sparkles className="w-4 h-4 mr-2" />
            AI Development Plan
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <ComprehensiveProfileView userEmail={viewingUser} />
        </TabsContent>

        <TabsContent value="development" className="space-y-6">
          <AIDevelopmentPlan userEmail={viewingUser} />
        </TabsContent>
      </Tabs>
    </div>
  );
}