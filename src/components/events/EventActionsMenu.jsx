import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Copy, Download, Send, BarChart3, Trash2, FileText } from 'lucide-react';
import EventReportViewer from './EventReportViewer';

export default function EventActionsMenu({ 
  event, 
  onCopyLink, 
  onDownloadCalendar,
  onSendReminder,
  onSendRecap,
  onCancel 
}) {
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
              <div className="flex items-center">
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
              onClick={() => onCancel(event)}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Cancel Event
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}