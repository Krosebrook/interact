import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Calendar, Check, X, Clock } from 'lucide-react';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function RSVPButton({ event, userEmail, userName, participation }) {
  const queryClient = useQueryClient();
  
  const rsvpMutation = useMutation({
    mutationFn: async (status) => {
      if (participation) {
        // Update existing participation
        await base44.entities.Participation.update(participation.id, { status });
      } else {
        // Create new participation
        await base44.entities.Participation.create({
          event_id: event.id,
          user_email: userEmail,
          user_name: userName,
          status,
          rsvp_date: new Date().toISOString()
        });
      }
      
      // Send calendar invite if going
      if (status === 'going') {
        try {
          await base44.functions.invoke('sendCalendarInvite', {
            eventId: event.id,
            recipientEmail: userEmail
          });
        } catch (error) {
          console.error('Calendar invite failed:', error);
        }
      }
    },
    onSuccess: (_, status) => {
      queryClient.invalidateQueries(['participations']);
      queryClient.invalidateQueries(['events']);
      
      const messages = {
        going: 'RSVP confirmed! Calendar invite sent to your email.',
        maybe: 'Marked as maybe. You can update your RSVP anytime.',
        not_going: 'RSVP declined.'
      };
      toast.success(messages[status]);
    },
    onError: () => {
      toast.error('Failed to update RSVP');
    }
  });
  
  const currentStatus = participation?.status;
  
  const statusConfig = {
    going: { icon: Check, label: 'Going', color: 'text-green-600 bg-green-50' },
    maybe: { icon: Clock, label: 'Maybe', color: 'text-yellow-600 bg-yellow-50' },
    not_going: { icon: X, label: 'Not Going', color: 'text-red-600 bg-red-50' },
  };
  
  const CurrentIcon = currentStatus ? statusConfig[currentStatus].icon : Calendar;
  const currentColor = currentStatus ? statusConfig[currentStatus].color : '';
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={currentStatus ? "outline" : "default"}
          size="sm"
          className={currentStatus ? currentColor : 'bg-int-orange hover:bg-int-orange-dark'}
          disabled={rsvpMutation.isPending}
        >
          <CurrentIcon className="h-4 w-4 mr-2" />
          {currentStatus ? statusConfig[currentStatus].label : 'RSVP'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => rsvpMutation.mutate('going')}>
          <Check className="h-4 w-4 mr-2 text-green-600" />
          Going
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => rsvpMutation.mutate('maybe')}>
          <Clock className="h-4 w-4 mr-2 text-yellow-600" />
          Maybe
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => rsvpMutation.mutate('not_going')}>
          <X className="h-4 w-4 mr-2 text-red-600" />
          Can't Go
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}