import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Award, TrendingUp } from 'lucide-react';
import Leaderboard from '../components/gamification/Leaderboard';
import BadgeDisplay from '../components/gamification/BadgeDisplay';
import PointsTracker from '../components/gamification/PointsTracker';

export default function Gamification() {
  const [user, setUser] = useState(null);

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

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Engagement Hub</h1>
        <p className="text-slate-600">Track your progress, earn badges, and compete with your team</p>
      </div>

      {/* User Points Tracker */}
      <PointsTracker userEmail={user.email} />

      {/* Tabs */}
      <Tabs defaultValue="leaderboard" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="leaderboard">
            <Trophy className="h-4 w-4 mr-2" />
            Leaderboard
          </TabsTrigger>
          <TabsTrigger value="badges">
            <Award className="h-4 w-4 mr-2" />
            Badges
          </TabsTrigger>
        </TabsList>

        <TabsContent value="leaderboard" className="mt-6">
          <Leaderboard />
        </TabsContent>

        <TabsContent value="badges" className="mt-6">
          <BadgeDisplay userEmail={user.email} />
        </TabsContent>
      </Tabs>
    </div>
  );
}