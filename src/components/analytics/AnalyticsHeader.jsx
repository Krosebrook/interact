import React from 'react';
import StatsCard from '../dashboard/StatsCard';
import { TrendingUp, Users, Star, Calendar } from 'lucide-react';

export default function AnalyticsHeader({ metrics }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Analytics Dashboard</h1>
        <p className="text-slate-600">Track engagement, attendance, and skill development insights</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Events"
          value={metrics.totalEvents}
          subtitle="All time"
          icon={Calendar}
          color="indigo"
        />
        <StatsCard
          title="Avg Attendance"
          value={metrics.avgParticipation}
          subtitle="Per event"
          icon={Users}
          color="coral"
        />
        <StatsCard
          title="Engagement Score"
          value={metrics.avgEngagement}
          subtitle="Out of 10"
          icon={Star}
          color="mint"
        />
        <StatsCard
          title="Completion Rate"
          value={`${metrics.completionRate}%`}
          subtitle="Events completed"
          icon={TrendingUp}
          color="sky"
        />
      </div>
    </div>
  );
}