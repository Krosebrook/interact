/**
 * REFACTORED ACTIVITY HISTORY TIMELINE
 * Production-grade with apiClient, memoization, and performance
 */

import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/apiClient';
import { queryKeys } from '../lib/queryKeys';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Star,
  MessageSquare,
  CheckCircle2,
  Clock,
  Trophy
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format, formatDistanceToNow } from 'date-fns';

const TYPE_COLORS = {
  icebreaker: 'bg-blue-500',
  creative: 'bg-purple-500',
  competitive: 'bg-amber-500',
  wellness: 'bg-emerald-500',
  learning: 'bg-cyan-500',
  social: 'bg-pink-500'
};

export default function ActivityHistoryTimeline({ userEmail }) {
  // Optimized queries with caching
  const { data: participations = [], isLoading } = useQuery({
    queryKey: queryKeys.profile.participations(userEmail),
    queryFn: () => apiClient.list('Participation', { 
      filters: { participant_email: userEmail },
      sort: '-created_date',
      limit: 100 
    }),
    enabled: !!userEmail,
    staleTime: 30000
  });

  const { data: events = [] } = useQuery({
    queryKey: queryKeys.events.list({ limit: 100 }),
    queryFn: () => apiClient.list('Event', {
      sort: '-scheduled_date',
      limit: 100
    }),
    staleTime: 60000
  });

  const { data: activities = [] } = useQuery({
    queryKey: queryKeys.activities.all,
    queryFn: () => apiClient.list('Activity'),
    staleTime: 60000
  });

  // Memoized history computation
  const { history, stats } = useMemo(() => {
    const merged = participations
      .map(p => {
        const event = events.find(e => e.id === p.event_id);
        const activity = activities.find(a => a.id === event?.activity_id);
        return {
          ...p,
          event,
          activity,
          date: event?.scheduled_date || p.created_date
        };
      })
      .filter(h => h.event)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 20);

    const totalEvents = merged.length;
    const attendedEvents = merged.filter(h => h.attended).length;
    const feedbackGiven = merged.filter(h => h.feedback_submitted).length;
    const avgEngagement = merged.length > 0
      ? Math.round(merged.reduce((sum, h) => sum + (h.engagement_score || 0), 0) / merged.length * 10) / 10
      : 0;

    return {
      history: merged,
      stats: {
        totalEvents,
        attendedEvents,
        feedbackGiven,
        avgEngagement
      }
    };
  }, [participations, events, activities]);

  if (isLoading) {
    return (
      <Card className="border-0 shadow-lg" data-b44-sync="true" data-feature="profile" data-component="activityhistorytimeline">
        <CardContent className="py-12 text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-slate-200 rounded w-3/4 mx-auto" />
            <div className="h-4 bg-slate-200 rounded w-1/2 mx-auto" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={<Calendar className="h-5 w-5" />} value={stats.totalEvents} label="Total Events" color="blue" />
        <StatCard icon={<CheckCircle2 className="h-5 w-5" />} value={stats.attendedEvents} label="Attended" color="emerald" />
        <StatCard icon={<MessageSquare className="h-5 w-5" />} value={stats.feedbackGiven} label="Feedback Given" color="purple" />
        <StatCard icon={<Star className="h-5 w-5" />} value={stats.avgEngagement} label="Avg Engagement" color="amber" />
      </div>

      {/* Timeline */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-slate-600" />
            Activity Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600 font-medium">No activity history yet</p>
              <p className="text-sm text-slate-500">Join events to build your history</p>
            </div>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200" />

              <div className="space-y-4">
                {history.map((item, idx) => {
                  const typeColor = TYPE_COLORS[item.activity?.type] || 'bg-slate-500';
                  
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="relative pl-10"
                    >
                      {/* Timeline dot */}
                      <div className={`absolute left-2 top-2 w-5 h-5 rounded-full ${typeColor} border-4 border-white shadow`} />

                      <div className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-slate-800 truncate">
                              {item.event?.title || 'Event'}
                            </h4>
                            <p className="text-sm text-slate-500 mt-0.5">
                              {item.activity?.title}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                              <Badge variant="outline" className="text-xs">
                                {item.activity?.type}
                              </Badge>
                              {item.attended && (
                                <Badge className="bg-emerald-100 text-emerald-700 text-xs">
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Attended
                                </Badge>
                              )}
                              {item.engagement_score && (
                                <Badge variant="outline" className="text-xs">
                                  <Star className="h-3 w-3 mr-1 text-amber-500" />
                                  {item.engagement_score}/5
                                </Badge>
                              )}
                              {item.feedback_submitted && (
                                <Badge className="bg-purple-100 text-purple-700 text-xs">
                                  <MessageSquare className="h-3 w-3 mr-1" />
                                  Feedback
                                </Badge>
                              )}
                            </div>
                            {item.skills_gained?.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {item.skills_gained.slice(0, 3).map((skill, i) => (
                                  <Badge key={i} variant="outline" className="text-xs bg-blue-50 text-blue-700">
                                    +{skill}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="text-right text-sm text-slate-500 flex-shrink-0">
                            <p>{format(new Date(item.date), 'MMM d, yyyy')}</p>
                            <p className="text-xs">{formatDistanceToNow(new Date(item.date), { addSuffix: true })}</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ icon, value, label, color }) {
  const colors = {
    blue: 'from-blue-500 to-blue-600',
    emerald: 'from-emerald-500 to-emerald-600',
    purple: 'from-purple-500 to-purple-600',
    amber: 'from-amber-500 to-amber-600'
  };

  return (
    <Card className={`border-0 shadow-lg overflow-hidden`}>
      <div className={`h-1 bg-gradient-to-r ${colors[color]}`} />
      <CardContent className="pt-4">
        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${colors[color]} flex items-center justify-center text-white mb-2`}>
          {icon}
        </div>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
        <p className="text-sm text-slate-500">{label}</p>
      </CardContent>
    </Card>
  );
}