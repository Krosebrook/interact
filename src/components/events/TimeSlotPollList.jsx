import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import TimeSlotVoter from './TimeSlotVoter';
import { Card } from '@/components/ui/card';
import { Vote, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function TimeSlotPollList({ userEmail, userName, isAdmin, onEventCreated }) {
  const queryClient = useQueryClient();

  const { data: polls = [], isLoading } = useQuery({
    queryKey: ['time-slot-polls'],
    queryFn: () => base44.entities.TimeSlotPoll.filter({ status: 'open' })
  });

  const voteMutation = useMutation({
    mutationFn: async ({ pollId, slotIds }) => {
      const poll = polls.find(p => p.id === pollId);
      const existingVotes = poll.votes?.filter(v => v.user_email !== userEmail) || [];
      const newVote = { user_email: userEmail, user_name: userName, slot_ids: slotIds };
      
      return base44.entities.TimeSlotPoll.update(pollId, {
        votes: [...existingVotes, newVote]
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['time-slot-polls']);
      toast.success('Vote submitted!');
    }
  });

  const scheduleMutation = useMutation({
    mutationFn: async ({ poll, slotId }) => {
      const winningSlot = poll.time_slots.find(s => s.id === slotId);
      
      // Create the event
      const event = await base44.entities.Event.create({
        activity_id: poll.activity_id || '',
        title: poll.event_title,
        scheduled_date: winningSlot.datetime,
        duration_minutes: winningSlot.duration_minutes,
        status: 'scheduled',
        magic_link: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        custom_instructions: poll.description
      });

      // Update poll status
      await base44.entities.TimeSlotPoll.update(poll.id, {
        status: 'scheduled',
        selected_slot_id: slotId,
        created_event_id: event.id
      });

      // Notify voters
      for (const voter of poll.votes || []) {
        await base44.entities.Notification.create({
          user_email: voter.user_email,
          type: 'event_reminder',
          title: '📅 Event Scheduled!',
          message: `"${poll.event_title}" has been scheduled for ${new Date(winningSlot.datetime).toLocaleString()}`,
          event_id: event.id
        });
      }

      return event;
    },
    onSuccess: (event) => {
      queryClient.invalidateQueries(['time-slot-polls']);
      queryClient.invalidateQueries(['events']);
      toast.success('Event scheduled from poll!');
      if (onEventCreated) onEventCreated(event);
    }
  });

  if (isLoading) {
    return (
      <Card className="p-8 flex items-center justify-center" data-b44-sync="true" data-feature="events" data-component="timeslotpolllist">
        <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
      </Card>
    );
  }

  if (polls.length === 0) {
    return (
      <Card className="p-8 text-center border-dashed">
        <Vote className="h-10 w-10 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-600">No active time slot polls</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {polls.map(poll => (
        <TimeSlotVoter
          key={poll.id}
          poll={poll}
          userEmail={userEmail}
          isAdmin={isAdmin}
          isVoting={voteMutation.isLoading}
          onVote={(pollId, slotIds) => voteMutation.mutate({ pollId, slotIds })}
          onSchedule={(poll, slotId) => scheduleMutation.mutate({ poll, slotId })}
        />
      ))}
    </div>
  );
}