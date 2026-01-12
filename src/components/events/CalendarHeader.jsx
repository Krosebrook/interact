/**
 * CALENDAR HEADER
 * Header component for Calendar page with action buttons
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import PageHeader from '../common/PageHeader';
import { CalendarPlus, Layers, Vote, Plus } from 'lucide-react';

export default function CalendarHeader({
  onScheduleEvent,
  onCreatePoll,
  onCreateSeries,
  onBulkSchedule
}) {
  return (
    <PageHeader 
      title="Event Calendar" 
      description="Schedule and manage your team activities"
    >
      <div className="flex flex-wrap gap-2" data-b44-sync="true" data-feature="events" data-component="calendarheader">
        <Button
          variant="outline"
          onClick={onBulkSchedule}
        >
          <CalendarPlus className="h-4 w-4 mr-2" />
          Bulk Schedule
        </Button>
        <Button
          variant="outline"
          onClick={onCreateSeries}
        >
          <Layers className="h-4 w-4 mr-2" />
          Create Series
        </Button>
        <Button
          variant="outline"
          onClick={onCreatePoll}
        >
          <Vote className="h-4 w-4 mr-2" />
          Create Poll
        </Button>
        <Button
          onClick={onScheduleEvent}
          className="bg-int-orange hover:bg-int-orange/90 text-slate-900 font-semibold"
        >
          <Plus className="h-4 w-4 mr-2" />
          Schedule Event
        </Button>
      </div>
    </PageHeader>
  );
}