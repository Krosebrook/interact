import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { 
  CheckCircle2, 
  Users, 
  TrendingUp, 
  Sparkles,
  ChevronDown,
  ChevronUp,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AIEventSummary from '../facilitator/AIEventSummary';

export default function CompletedEventsList({ events, activities, participations }) {
  const [expanded, setExpanded] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const completedEvents = events
    ?.filter(e => e.status === 'completed')
    .sort((a, b) => new Date(b.scheduled_date) - new Date(a.scheduled_date)) || [];

  const displayEvents = expanded ? completedEvents : completedEvents.slice(0, 3);

  const getEventStats = (eventId) => {
    const eventParticipations = participations?.filter(p => p.event_id === eventId) || [];
    const attended = eventParticipations.filter(p => p.attended).length;
    const total = eventParticipations.length;
    const engagementScores = eventParticipations.filter(p => p.engagement_score).map(p => p.engagement_score);
    const avgEngagement = engagementScores.length > 0
      ? (engagementScores.reduce((a, b) => a + b, 0) / engagementScores.length).toFixed(1)
      : null;

    return { attended, total, avgEngagement };
  };

  if (completedEvents.length === 0) return null;

  return (
    <div data-b44-sync="true" data-feature="dashboard" data-component="completedeventslist" className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg text-slate-900 flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          Recently Completed
        </h3>
        {completedEvents.length > 3 && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <>Show Less <ChevronUp className="h-4 w-4 ml-1" /></>
            ) : (
              <>Show All ({completedEvents.length}) <ChevronDown className="h-4 w-4 ml-1" /></>
            )}
          </Button>
        )}
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {displayEvents.map((event, i) => {
            const stats = getEventStats(event.id);
            const activity = activities?.find(a => a.id === event.activity_id);
            
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {format(new Date(event.scheduled_date), 'MMM d')}
                        </Badge>
                        {activity?.type && (
                          <Badge className="bg-slate-100 text-slate-700 text-xs">
                            {activity.type}
                          </Badge>
                        )}
                      </div>
                      <h4 className="font-medium text-slate-900 truncate">{event.title}</h4>
                      <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          {stats.attended}/{stats.total} attended
                        </span>
                        {stats.avgEngagement && (
                          <span className="flex items-center gap-1">
                            <TrendingUp className="h-3.5 w-3.5" />
                            {stats.avgEngagement}/10 engagement
                          </span>
                        )}
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedEvent(event)}
                      className="gap-1"
                    >
                      <Sparkles className="h-4 w-4" />
                      AI Summary
                    </Button>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {selectedEvent && (
        <AIEventSummary 
          event={selectedEvent} 
          onClose={() => setSelectedEvent(null)} 
        />
      )}
    </div>
  );
}