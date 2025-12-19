import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useUserData } from '../components/hooks/useUserData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import MilestoneCard from '../components/milestones/MilestoneCard';
import { Calendar, Cake, Trophy, Star } from 'lucide-react';
import { isAfter, isBefore, startOfDay, addDays } from 'date-fns';

/**
 * Milestones Page - Company-wide milestone celebrations
 */
export default function Milestones() {
  const { user, loading } = useUserData(true);

  const { data: milestones = [], isLoading } = useQuery({
    queryKey: ['milestones'],
    queryFn: async () => {
      const all = await base44.entities.Milestone.filter({
        visibility: 'public'
      }, '-milestone_date');
      return all;
    }
  });

  const today = startOfDay(new Date());
  const weekFromNow = addDays(today, 7);

  const upcomingMilestones = milestones.filter(m => {
    const date = startOfDay(new Date(m.milestone_date));
    return isAfter(date, today) && isBefore(date, weekFromNow);
  });

  const todayMilestones = milestones.filter(m => {
    const date = startOfDay(new Date(m.milestone_date));
    return date.getTime() === today.getTime();
  });

  const recentMilestones = milestones.filter(m => {
    const date = startOfDay(new Date(m.milestone_date));
    return isBefore(date, today) && isAfter(date, addDays(today, -30));
  });

  if (loading) {
    return <LoadingSpinner className="min-h-[60vh]" />;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="glass-panel-solid">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl shadow-lg">
            <Trophy className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-int-navy font-display">Milestone Celebrations</h1>
            <p className="text-slate-600">Celebrate your teammates' special moments</p>
          </div>
        </div>
      </div>

      {/* Today's Milestones */}
      {todayMilestones.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-int-navy mb-4 flex items-center gap-2">
            <Cake className="h-6 w-6 text-pink-500" />
            Celebrating Today 🎉
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {todayMilestones.map(milestone => (
              <MilestoneCard
                key={milestone.id}
                milestone={milestone}
                currentUserEmail={user?.email}
              />
            ))}
          </div>
        </div>
      )}

      {/* Tabs for Upcoming and Recent */}
      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming">
            Upcoming ({upcomingMilestones.length})
          </TabsTrigger>
          <TabsTrigger value="recent">
            Recent ({recentMilestones.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-6">
          {isLoading ? (
            <LoadingSpinner />
          ) : upcomingMilestones.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="No upcoming milestones"
              description="Check back soon for celebrations!"
              type="default"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingMilestones.map(milestone => (
                <MilestoneCard
                  key={milestone.id}
                  milestone={milestone}
                  currentUserEmail={user?.email}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="recent" className="mt-6">
          {isLoading ? (
            <LoadingSpinner />
          ) : recentMilestones.length === 0 ? (
            <EmptyState
              icon={Star}
              title="No recent milestones"
              description="Recent celebrations will appear here"
              type="default"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentMilestones.map(milestone => (
                <MilestoneCard
                  key={milestone.id}
                  milestone={milestone}
                  currentUserEmail={user?.email}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}