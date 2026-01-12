import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar, Clock, AlertTriangle, Send } from 'lucide-react';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';

export default function EventRescheduleDialog({ 
  open, 
  onOpenChange, 
  event,
  onRescheduleComplete 
}) {
  const queryClient = useQueryClient();
  const [newDate, setNewDate] = useState(
    event?.scheduled_date ? format(parseISO(event.scheduled_date), "yyyy-MM-dd'T'HH:mm") : ''
  );
  const [newDuration, setNewDuration] = useState(event?.duration_minutes || 60);
  const [reason, setReason] = useState('');
  const [notifyParticipants, setNotifyParticipants] = useState(true);
  const [updateRecurringSeries, setUpdateRecurringSeries] = useState(false);

  const rescheduleMutation = useMutation({
    mutationFn: async () => {
      const user = await base44.auth.me();
      
      // Build reschedule history entry
      const historyEntry = {
        old_date: event.scheduled_date,
        new_date: newDate,
        reason: reason,
        changed_by: user.email,
        changed_at: new Date().toISOString()
      };

      // Update event
      const updateData = {
        scheduled_date: newDate,
        duration_minutes: newDuration,
        original_date: event.original_date || event.scheduled_date,
        reschedule_reason: reason,
        reschedule_history: [...(event.reschedule_history || []), historyEntry],
        status: 'scheduled'
      };

      await base44.entities.Event.update(event.id, updateData);

      // If recurring and user wants to update series
      if (event.is_recurring && updateRecurringSeries && event.recurring_series_id) {
        const seriesEvents = await base44.entities.Event.filter({
          recurring_series_id: event.recurring_series_id
        });
        
        // Calculate time difference
        const oldDate = parseISO(event.scheduled_date);
        const newDateParsed = parseISO(newDate);
        const diffMs = newDateParsed.getTime() - oldDate.getTime();

        // Update future events in series
        for (const seriesEvent of seriesEvents) {
          if (seriesEvent.id !== event.id) {
            const eventDate = parseISO(seriesEvent.scheduled_date);
            if (eventDate > oldDate) {
              const adjustedDate = new Date(eventDate.getTime() + diffMs);
              await base44.entities.Event.update(seriesEvent.id, {
                scheduled_date: adjustedDate.toISOString(),
                duration_minutes: newDuration
              });
            }
          }
        }
      }

      // Send notifications if requested
      if (notifyParticipants) {
        try {
          await base44.functions.invoke('sendTeamsNotification', {
            eventId: event.id,
            notificationType: 'reschedule',
            customMessage: reason
          });
        } catch (error) {
          console.error('Failed to send notifications:', error);
        }
      }

      return { event, newDate };
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['events']);
      toast.success('Event rescheduled successfully!');
      onOpenChange(false);
      onRescheduleComplete?.();
    },
    onError: (error) => {
      toast.error(`Failed to reschedule: ${error.message}`);
    }
  });

  if (!event) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange} data-b44-sync="true" data-feature="events" data-component="eventrescheduledialog">
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-int-orange" />
            Reschedule Event
          </DialogTitle>
          <DialogDescription>
            Change the date, time, or duration for "{event.title}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Schedule */}
          <div className="p-3 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-600">Current Schedule</p>
            <p className="font-medium">
              {format(parseISO(event.scheduled_date), 'EEEE, MMMM d, yyyy')} at{' '}
              {format(parseISO(event.scheduled_date), 'h:mm a')}
            </p>
            <p className="text-sm text-slate-500">Duration: {event.duration_minutes} minutes</p>
          </div>

          {/* New Date/Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>New Date & Time</Label>
              <Input
                type="datetime-local"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
              />
            </div>
            <div>
              <Label>Duration (minutes)</Label>
              <Input
                type="number"
                value={newDuration}
                onChange={(e) => setNewDuration(parseInt(e.target.value))}
                min={5}
                step={5}
              />
            </div>
          </div>

          {/* Reason */}
          <div>
            <Label>Reason for Rescheduling</Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Conflict with another meeting, facilitator unavailable..."
              rows={2}
            />
          </div>

          {/* Options */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Checkbox
                id="notify"
                checked={notifyParticipants}
                onCheckedChange={setNotifyParticipants}
              />
              <Label htmlFor="notify" className="cursor-pointer flex items-center gap-2">
                <Send className="h-4 w-4" />
                Notify registered participants
              </Label>
            </div>

            {event.is_recurring && (
              <div className="flex items-center gap-2">
                <Checkbox
                  id="update-series"
                  checked={updateRecurringSeries}
                  onCheckedChange={setUpdateRecurringSeries}
                />
                <Label htmlFor="update-series" className="cursor-pointer flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  Apply to all future events in series
                </Label>
              </div>
            )}
          </div>

          {/* Reschedule History */}
          {event.reschedule_history?.length > 0 && (
            <div className="border-t pt-4">
              <Label className="text-sm text-slate-600 mb-2 block">Previous Changes</Label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {event.reschedule_history.map((history, idx) => (
                  <div key={idx} className="text-xs text-slate-500 p-2 bg-slate-50 rounded">
                    <p>
                      Changed from {format(parseISO(history.old_date), 'MMM d, h:mm a')} to{' '}
                      {format(parseISO(history.new_date), 'MMM d, h:mm a')}
                    </p>
                    {history.reason && <p className="italic">Reason: {history.reason}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={() => rescheduleMutation.mutate()}
              disabled={!newDate || rescheduleMutation.isLoading}
              className="flex-1 bg-int-orange hover:bg-[#C46322] text-white"
            >
              {rescheduleMutation.isLoading ? 'Rescheduling...' : 'Reschedule Event'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}