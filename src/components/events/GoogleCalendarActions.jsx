import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Calendar, Download, Upload, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export default function GoogleCalendarActions({ eventId, onImportComplete }) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  const handleSyncToGoogle = async () => {
    if (!eventId) return;

    setIsSyncing(true);
    try {
      const response = await base44.functions.invoke('syncToGoogleCalendar', {
        event_id: eventId,
        action: 'create',
      });

      if (response.data?.requiresAuth) {
        toast.error('Please connect Google Calendar first', {
          action: {
            label: 'Connect',
            onClick: () => {
              window.location.href = '/settings#integrations';
            },
          },
        });
        return;
      }

      if (response.data?.success) {
        toast.success('Event added to Google Calendar', {
          description: 'Calendar invite sent to all participants',
          action: response.data.calendar_link ? {
            label: 'View in Google',
            onClick: () => window.open(response.data.calendar_link, '_blank'),
          } : undefined,
        });
      }
    } catch (error) {
      console.error('Sync error:', error);
      toast.error('Failed to sync with Google Calendar');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleImportFromGoogle = async () => {
    setIsImporting(true);
    try {
      const response = await base44.functions.invoke('importFromGoogleCalendar', {
        start_date: new Date(dateRange.start).toISOString(),
        end_date: new Date(dateRange.end).toISOString(),
      });

      if (response.data?.requiresAuth) {
        toast.error('Please connect Google Calendar first');
        return;
      }

      if (response.data?.success) {
        const { imported, skipped, message } = response.data;
        toast.success(message, {
          description: `${imported} events imported, ${skipped} skipped`,
        });
        setImportDialogOpen(false);
        onImportComplete?.();
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import from Google Calendar');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="flex gap-2" data-b44-sync="true" data-feature="events" data-component="googlecalendaractions">
      {eventId && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleSyncToGoogle}
          disabled={isSyncing}
          className="gap-2"
        >
          {isSyncing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Syncing...
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              Add to Google Calendar
            </>
          )}
        </Button>
      )}

      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Upload className="h-4 w-4" />
            Import from Google
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import from Google Calendar</DialogTitle>
            <DialogDescription>
              Import your Google Calendar events into the platform. Select a date range to import.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              />
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
              <p className="font-medium mb-1">Note:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Only events with specific times will be imported</li>
                <li>All-day events will be skipped</li>
                <li>Already imported events will not be duplicated</li>
              </ul>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setImportDialogOpen(false)}
              disabled={isImporting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleImportFromGoogle}
              disabled={isImporting}
              className="gap-2"
            >
              {isImporting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Import Events
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}