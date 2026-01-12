import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import LiveCoachingWidget from '../facilitator/LiveCoachingWidget';
import { 
  Clock, 
  Users, 
  ExternalLink,
  Bell,
  Download,
  Zap
} from 'lucide-react';
import { format } from 'date-fns';

export default function FacilitatorEventCard({ 
  event, 
  activity, 
  participationStats,
  onSendReminder,
  onDownloadCalendar,
  isLoading
}) {
  const [showCoaching, setShowCoaching] = useState(false);
  const eventDate = new Date(event.scheduled_date);
  const isLive = event.status === 'in_progress';

  return (
    <div className="space-y-4" data-b44-sync="true" data-feature="events" data-component="facilitatoreventcard">
      <Card className="p-4 border-0 shadow-md hover:shadow-lg transition-all">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-bold text-lg">{event.title}</h3>
              {isLive && (
                <Badge className="bg-red-600 animate-pulse">LIVE</Badge>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-600 mb-2">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {format(eventDate, 'h:mm a')}
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {participationStats.total} RSVPs
              </div>
            </div>
            <Badge variant="outline">{activity?.type}</Badge>
          </div>
        </div>

        {/* Engagement Metrics */}
        <div className="grid grid-cols-3 gap-2 mb-3 p-3 bg-slate-50 rounded-lg">
          <div className="text-center">
            <div className="text-xs text-slate-600">RSVPs</div>
            <div className="text-lg font-bold text-indigo-600">{participationStats.total}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-slate-600">Attended</div>
            <div className="text-lg font-bold text-emerald-600">{participationStats.attended}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-slate-600">Engagement</div>
            <div className="text-lg font-bold text-purple-600">
              {participationStats.avgEngagement > 0 ? participationStats.avgEngagement.toFixed(1) : '-'}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <Link to={`${createPageUrl('FacilitatorView')}?event=${event.id}`} className="flex-1">
              <Button variant="outline" size="sm" className="w-full">
                <ExternalLink className="h-3 w-3 mr-1" />
                Facilitate
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSendReminder(event.id)}
              disabled={isLoading}
            >
              <Bell className="h-3 w-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDownloadCalendar(event.id)}
              disabled={isLoading}
            >
              <Download className="h-3 w-3" />
            </Button>
          </div>
          <Button
            onClick={() => setShowCoaching(!showCoaching)}
            size="sm"
            variant="outline"
            className="w-full border-purple-300 text-purple-700 hover:bg-purple-50"
          >
            <Zap className="h-3 w-3 mr-2" />
            {showCoaching ? 'Hide' : 'Show'} AI Coach
          </Button>
        </div>
      </Card>

      {/* Live Coaching Widget */}
      {showCoaching && <LiveCoachingWidget eventId={event.id} />}
    </div>
  );
}