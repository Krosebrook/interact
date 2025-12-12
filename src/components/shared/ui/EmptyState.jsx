/**
 * EMPTY STATE COMPONENT
 * Reusable empty states for different contexts
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Inbox, 
  Calendar, 
  Users, 
  Trophy,
  FileText,
  Search,
  AlertCircle
} from 'lucide-react';

const ICONS = {
  inbox: Inbox,
  calendar: Calendar,
  users: Users,
  trophy: Trophy,
  file: FileText,
  search: Search,
  alert: AlertCircle
};

export default function EmptyState({
  icon = 'inbox',
  title = 'No items found',
  description,
  actionLabel,
  onAction,
  variant = 'card' // 'card' | 'inline'
}) {
  const Icon = ICONS[icon] || Inbox;

  const content = (
    <div className="text-center py-12">
      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
        <Icon className="h-8 w-8 text-slate-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-slate-600 mb-6 max-w-md mx-auto">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <Button onClick={onAction} className="bg-int-orange hover:bg-int-orange/90">
          {actionLabel}
        </Button>
      )}
    </div>
  );

  if (variant === 'inline') {
    return content;
  }

  return (
    <Card>
      <CardContent className="pt-6">
        {content}
      </CardContent>
    </Card>
  );
}

// Preset empty states
export function NoEventsState({ onCreateEvent }) {
  return (
    <EmptyState
      icon="calendar"
      title="No events scheduled"
      description="Get started by creating your first team event"
      actionLabel="Schedule Event"
      onAction={onCreateEvent}
    />
  );
}

export function NoActivitiesState({ onCreateActivity }) {
  return (
    <EmptyState
      icon="file"
      title="No activities found"
      description="Create custom activities or browse the template library"
      actionLabel="Create Activity"
      onAction={onCreateActivity}
    />
  );
}

export function NoTeamsState({ onCreateTeam }) {
  return (
    <EmptyState
      icon="users"
      title="No teams yet"
      description="Organize your employees into teams to get started"
      actionLabel="Create Team"
      onAction={onCreateTeam}
    />
  );
}

export function NoBadgesState() {
  return (
    <EmptyState
      icon="trophy"
      title="No badges earned yet"
      description="Participate in events and activities to earn your first badge"
      variant="inline"
    />
  );
}

export function NoSearchResultsState({ query }) {
  return (
    <EmptyState
      icon="search"
      title="No results found"
      description={`No results found for "${query}". Try adjusting your search.`}
      variant="inline"
    />
  );
}

export function ErrorState({ error, onRetry }) {
  return (
    <EmptyState
      icon="alert"
      title="Something went wrong"
      description={error || 'An unexpected error occurred. Please try again.'}
      actionLabel="Try Again"
      onAction={onRetry}
    />
  );
}