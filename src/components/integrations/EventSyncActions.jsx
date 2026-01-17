import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MessageSquare, CheckCircle, Loader2, ExternalLink } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function EventSyncActions({ event, onSyncComplete }) {
  const [syncing, setSyncing] = useState(false);
  const [sendingSlack, setSendingSlack] = useState(false);

  const handleGoogleCalendarSync = async () => {
    setSyncing(true);
    try {
      const response = await base44.functions.invoke('syncEventToGoogleCalendar', {
        event_id: event.id
      });

      if (response.data?.success) {
        toast.success('Event synced to Google Calendar!');
        onSyncComplete?.();
      } else {
        throw new Error(response.data?.error || 'Sync failed');
      }
    } catch (error) {
      console.error('Google Calendar sync error:', error);
      toast.error('Failed to sync to Google Calendar. Make sure the integration is connected.');
    } finally {
      setSyncing(false);
    }
  };

  const handleSlackNotification = async () => {
    // Prompt for channel ID (in real app, would have a channel selector)
    const channelId = prompt('Enter Slack Channel ID (e.g., C01234567):');
    if (!channelId) return;

    setSendingSlack(true);
    try {
      const response = await base44.functions.invoke('sendSlackEventNotification', {
        event_id: event.id,
        channel_id: channelId,
        message_type: 'announcement'
      });

      if (response.data?.success) {
        toast.success('Event posted to Slack!');
      } else {
        throw new Error(response.data?.error || 'Failed to send');
      }
    } catch (error) {
      console.error('Slack notification error:', error);
      toast.error('Failed to send Slack notification. Make sure the integration is connected.');
    } finally {
      setSendingSlack(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Google Calendar Sync */}
      {event.google_calendar_id ? (
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Synced to Calendar
          </Badge>
          {event.google_calendar_link && (
            <Button
              variant="ghost"
              size="sm"
              asChild
            >
              <a href={event.google_calendar_link} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          )}
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={handleGoogleCalendarSync}
          disabled={syncing}
        >
          {syncing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Syncing...
            </>
          ) : (
            <>
              <Calendar className="h-4 w-4 mr-2" />
              Sync to Google Calendar
            </>
          )}
        </Button>
      )}

      {/* Slack Notification */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleSlackNotification}
        disabled={sendingSlack}
      >
        {sendingSlack ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <MessageSquare className="h-4 w-4 mr-2" />
            Post to Slack
          </>
        )}
      </Button>
    </div>
  );
}