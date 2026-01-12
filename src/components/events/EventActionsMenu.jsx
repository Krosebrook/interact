import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { MoreVertical, Copy, Download, Send, BarChart3, Trash2, FileText, AlertTriangle } from 'lucide-react';
import EventReportViewer from './EventReportViewer';
import { confirmDelete, showUndoToast } from '../common/UndoToast';
import { toast } from 'sonner';

export default function EventActionsMenu({ 
  event, 
  onCopyLink, 
  onDownloadCalendar,
  onSendReminder,
  onSendRecap,
  onCancel,
  onDelete 
}) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [originalStatus, setOriginalStatus] = useState(null);

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    setShowDeleteDialog(false);
    setOriginalStatus(event.status);
    
    // Call delete handler (soft delete - sets status to cancelled)
    await onDelete?.(event);
    
    // Show undo toast
    showUndoToast(
      'Event cancelled successfully',
      async () => {
        // Undo: restore original status
        await onCancel?.({ ...event, status: originalStatus });
        toast.success('Event restored');
      },
      5000
    );
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => onCopyLink(event)}>
          <Copy className="h-4 w-4 mr-2" />
          Copy Magic Link
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onDownloadCalendar(event)}>
          <Download className="h-4 w-4 mr-2" />
          Download .ics
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {event.status === 'scheduled' && (
          <DropdownMenuItem onClick={() => onSendReminder(event)}>
            <Send className="h-4 w-4 mr-2" />
            Send Teams Reminder
          </DropdownMenuItem>
        )}
        {event.status === 'completed' && (
          <>
            <DropdownMenuItem onClick={() => onSendRecap(event)}>
              <BarChart3 className="h-4 w-4 mr-2" />
              Send Teams Recap
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <div className="flex items-center" data-b44-sync="true" data-feature="events" data-component="eventactionsmenu">
                <FileText className="h-4 w-4 mr-2" />
                <EventReportViewer eventId={event.id} eventTitle={event.title} />
              </div>
            </DropdownMenuItem>
          </>
        )}
        {event.status === 'scheduled' && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleDeleteClick}
              className="text-red-600 focus:text-red-600 focus:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Cancel Event
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <DialogTitle>Cancel Event?</DialogTitle>
            </div>
            <DialogDescription className="text-base">
              Are you sure you want to cancel <strong>"{event.title}"</strong>?
              <br /><br />
              All participants will be notified, and the event will be marked as cancelled.
              You can undo this action within 5 seconds.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Keep Event
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Cancel Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DropdownMenu>
  );
}