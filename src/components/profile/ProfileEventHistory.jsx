import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  History, 
  Calendar, 
  Clock, 
  Star, 
  CheckCircle2,
  MessageSquare,
  Trophy,
  Filter,
  ChevronDown
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format, subMonths, isAfter } from 'date-fns';
import { motion } from 'framer-motion';
import EmptyState from '../common/EmptyState';

export default function ProfileEventHistory({ userEmail }) {
  const [timeFilter, setTimeFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const { data: participations = [] } = useQuery({
    queryKey: ['user-participations', userEmail],
    queryFn: () => base44.entities.Participation.filter({ participant_email: userEmail }),
    enabled: !!userEmail
  });

  const { data: events = [] } = useQuery({
    queryKey: ['events'],
    queryFn: () => base44.entities.Event.list('-scheduled_date', 200)
  });

  const { data: activities = [] } = useQuery({
    queryKey: ['activities'],
    queryFn: () => base44.entities.Activity.list()
  });

  // Get past events with participation data
  const now = new Date();
  const pastParticipations = participations.filter(p => {
    const event = events.find(e => e.id === p.event_id);
    if (!event) return false;
    return new Date(event.scheduled_date) < now || event.status === 'completed';
  });

  // Apply filters
  let filteredParticipations = [...pastParticipations];

  // Time filter
  if (timeFilter !== 'all') {
    const monthsAgo = timeFilter === '1m' ? 1 : timeFilter === '3m' ? 3 : timeFilter === '6m' ? 6 : 12;
    const cutoffDate = subMonths(now, monthsAgo);
    filteredParticipations = filteredParticipations.filter(p => {
      const event = events.find(e => e.id === p.event_id);
      return event && isAfter(new Date(event.scheduled_date), cutoffDate);
    });
  }

  // Type filter
  if (typeFilter !== 'all') {
    filteredParticipations = filteredParticipations.filter(p => {
      const event = events.find(e => e.id === p.event_id);
      const activity = activities.find(a => a.id === event?.activity_id);
      return activity?.type === typeFilter;
    });
  }

  // Sort by date (most recent first)
  filteredParticipations.sort((a, b) => {
    const eventA = events.find(e => e.id === a.event_id);
    const eventB = events.find(e => e.id === b.event_id);
    return new Date(eventB?.scheduled_date) - new Date(eventA?.scheduled_date);
  });

  // Stats
  const totalAttended = pastParticipations.filter(p => p.attended).length;
  const totalFeedback = pastParticipations.filter(p => p.engagement_score).length;
  const avgEngagement = pastParticipations.length > 0
    ? (pastParticipations.reduce((acc, p) => acc + (p.engagement_score || 0), 0) / pastParticipations.filter(p => p.engagement_score).length).toFixed(1)
    : 0;

  const activityTypes = [...new Set(activities.map(a => a.type))];

  const getEvent = (eventId) => events.find(e => e.id === eventId);
  const getActivity = (activityId) => activities.find(a => a.id === activityId);

  return (
    <Card className="border-0 shadow-lg" data-b44-sync="true" data-feature="profile" data-component="profileeventhistory">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-slate-600" />
            Event History
          </CardTitle>
          <div className="flex gap-2">
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="1m">Last Month</SelectItem>
                <SelectItem value="3m">Last 3 Months</SelectItem>
                <SelectItem value="6m">Last 6 Months</SelectItem>
                <SelectItem value="12m">Last Year</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {activityTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-3 bg-emerald-50 rounded-xl">
            <Trophy className="h-5 w-5 text-emerald-600 mx-auto mb-1" />
            <p className="text-2xl font-bold text-emerald-700">{totalAttended}</p>
            <p className="text-xs text-emerald-600">Events Attended</p>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-xl">
            <MessageSquare className="h-5 w-5 text-blue-600 mx-auto mb-1" />
            <p className="text-2xl font-bold text-blue-700">{totalFeedback}</p>
            <p className="text-xs text-blue-600">Feedback Given</p>
          </div>
          <div className="text-center p-3 bg-amber-50 rounded-xl">
            <Star className="h-5 w-5 text-amber-600 mx-auto mb-1" />
            <p className="text-2xl font-bold text-amber-700">{avgEngagement || '-'}</p>
            <p className="text-xs text-amber-600">Avg Rating</p>
          </div>
        </div>

        {/* History List */}
        {filteredParticipations.length === 0 ? (
          <EmptyState
            icon={History}
            title="No event history"
            description={timeFilter !== 'all' || typeFilter !== 'all' 
              ? "No events match your filters" 
              : "Your event history will appear here after attending events"}
          />
        ) : (
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {filteredParticipations.map((participation, idx) => {
              const event = getEvent(participation.event_id);
              const activity = getActivity(event?.activity_id);
              if (!event) return null;

              return (
                <motion.div
                  key={participation.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">{activity?.type}</Badge>
                        {participation.attended && (
                          <Badge className="bg-emerald-100 text-emerald-700 text-xs">
                            <CheckCircle2 className="h-3 w-3 mr-1" /> Attended
                          </Badge>
                        )}
                      </div>
                      <h4 className="font-semibold text-slate-900">{event.title}</h4>
                      <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {format(new Date(event.scheduled_date), 'MMM d, yyyy')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {format(new Date(event.scheduled_date), 'h:mm a')}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      {participation.engagement_score && (
                        <div className="flex items-center gap-1 justify-end mb-1">
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star 
                              key={star}
                              className={`h-4 w-4 ${
                                star <= participation.engagement_score 
                                  ? 'fill-amber-400 text-amber-400' 
                                  : 'text-slate-300'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                      {participation.feedback && (
                        <p className="text-xs text-slate-500 max-w-[150px] truncate">
                          "{participation.feedback}"
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}