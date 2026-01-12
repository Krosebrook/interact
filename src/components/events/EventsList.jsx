/**
 * EVENTS LIST COMPONENT
 * Reusable grid of event cards with loading and empty states
 */

import React from 'react';
import EventCalendarCard from './EventCalendarCard';
import EmptyState from '../common/EmptyState';
import { Calendar as CalendarIcon } from 'lucide-react';
import { getParticipationStats, getActivityForEvent } from '../utils/eventUtils';

export default function EventsList({
  title,
  events = [],
  activities = [],
  participations = [],
  isLoading = false,
  maxItems,
  userEmail,
  eventActions,
  onReschedule,
  emptyTitle = 'No events',
  emptyDescription,
  emptyActionLabel,
  onEmptyAction,
  showReminder = true,
  showRecap = true,
  showCancel = true
}) {
  // Loading skeleton
  if (isLoading) {
    return (
      <div data-b44-sync="true" data-feature="events" data-component="eventslist">
        {title && <h2 className="text-2xl font-bold text-slate-900 mb-4">{title}</h2>}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-slate-100 animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  // Limit items if specified
  const displayEvents = maxItems ? events.slice(0, maxItems) : events;

  // Empty state
  if (displayEvents.length === 0) {
    return (
      <div>
        {title && <h2 className="text-2xl font-bold text-slate-900 mb-4">{title}</h2>}
        <EmptyState
          icon={CalendarIcon}
          title={emptyTitle}
          description={emptyDescription}
          actionLabel={emptyActionLabel}
          onAction={onEmptyAction}
        />
      </div>
    );
  }

  return (
    <div>
      {title && <h2 className="text-2xl font-bold text-slate-900 mb-4">{title}</h2>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayEvents.map(event => {
          const activity = getActivityForEvent(event, activities);
          const stats = getParticipationStats(event.id, participations);
          
          return (
            <EventCalendarCard
              key={event.id}
              event={event}
              activity={activity}
              participantCount={stats.total}
              onView={() => {}}
              onCopyLink={eventActions?.handleCopyLink}
              onDownloadCalendar={eventActions?.handleDownloadCalendar}
              onSendReminder={showReminder ? eventActions?.handleSendReminder : undefined}
              onSendRecap={showRecap ? eventActions?.handleSendRecap : undefined}
              onCancel={showCancel ? eventActions?.handleCancelEvent : undefined}
              onDelete={eventActions?.onDelete}
              onReschedule={onReschedule}
              userEmail={userEmail}
            />
          );
        })}
      </div>
    </div>
  );
}