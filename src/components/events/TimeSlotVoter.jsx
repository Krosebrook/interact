import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { format, isPast } from 'date-fns';
import { Vote, Clock, Users, CheckCircle2, Calendar, Crown } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TimeSlotVoter({ poll, userEmail, onVote, onSchedule, isAdmin, isVoting }) {
  const [selectedSlots, setSelectedSlots] = useState(() => {
    const existingVote = poll.votes?.find(v => v.user_email === userEmail);
    return existingVote?.slot_ids || [];
  });

  const toggleSlot = (slotId) => {
    setSelectedSlots(prev => 
      prev.includes(slotId) 
        ? prev.filter(id => id !== slotId)
        : [...prev, slotId]
    );
  };

  const handleVote = () => {
    onVote(poll.id, selectedSlots);
  };

  const getVoteCount = (slotId) => {
    return poll.votes?.filter(v => v.slot_ids?.includes(slotId)).length || 0;
  };

  const totalVoters = poll.votes?.length || 0;
  const maxVotes = Math.max(...poll.time_slots.map(s => getVoteCount(s.id)), 1);
  const isDeadlinePassed = poll.voting_deadline && isPast(new Date(poll.voting_deadline));
  const hasVoted = poll.votes?.some(v => v.user_email === userEmail);
  const winningSlotId = poll.time_slots.reduce((best, slot) => {
    const currentVotes = getVoteCount(slot.id);
    const bestVotes = getVoteCount(best?.id);
    return currentVotes > bestVotes ? slot : best;
  }, poll.time_slots[0])?.id;

  return (
    <Card className="overflow-hidden" data-b44-sync="true" data-feature="events" data-component="timeslotvoter">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Vote className="h-5 w-5 text-purple-600" />
              {poll.event_title}
            </CardTitle>
            <CardDescription className="mt-1">
              {poll.description || 'Vote for your preferred time'}
            </CardDescription>
          </div>
          <Badge 
            variant={poll.status === 'open' ? 'default' : poll.status === 'scheduled' ? 'secondary' : 'outline'}
            className={poll.status === 'open' ? 'bg-green-100 text-green-700' : ''}
          >
            {poll.status === 'open' ? 'Voting Open' : poll.status === 'scheduled' ? 'Scheduled' : 'Closed'}
          </Badge>
        </div>
        
        <div className="flex items-center gap-4 mt-3 text-sm text-slate-600">
          <span className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            {totalVoters} voter{totalVoters !== 1 ? 's' : ''}
          </span>
          {poll.voting_deadline && (
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Deadline: {format(new Date(poll.voting_deadline), 'MMM d, h:mm a')}
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-3">
        {poll.time_slots.map((slot, index) => {
          const voteCount = getVoteCount(slot.id);
          const percentage = totalVoters > 0 ? (voteCount / totalVoters) * 100 : 0;
          const isWinning = slot.id === winningSlotId && voteCount > 0;
          const isSelected = selectedSlots.includes(slot.id);

          return (
            <motion.div
              key={slot.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card 
                className={`p-4 cursor-pointer transition-all ${
                  isSelected ? 'ring-2 ring-purple-500 bg-purple-50' : 'hover:bg-slate-50'
                } ${isWinning ? 'border-green-300' : ''}`}
                onClick={() => poll.status === 'open' && !isDeadlinePassed && toggleSlot(slot.id)}
              >
                <div className="flex items-center gap-3">
                  {poll.status === 'open' && !isDeadlinePassed && (
                    <Checkbox 
                      checked={isSelected}
                      onCheckedChange={() => toggleSlot(slot.id)}
                    />
                  )}
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-slate-500" />
                      <span className="font-medium">
                        {format(new Date(slot.datetime), 'EEEE, MMMM d, yyyy')}
                      </span>
                      {isWinning && (
                        <Crown className="h-4 w-4 text-yellow-500" />
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-sm text-slate-600">
                      <span>{format(new Date(slot.datetime), 'h:mm a')}</span>
                      <Badge variant="outline" className="text-xs">
                        {slot.duration_minutes} min
                      </Badge>
                    </div>
                    
                    {/* Vote Progress */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                        <span>{voteCount} vote{voteCount !== 1 ? 's' : ''}</span>
                        <span>{percentage.toFixed(0)}%</span>
                      </div>
                      <Progress 
                        value={percentage} 
                        className={`h-2 ${isWinning ? '[&>div]:bg-green-500' : '[&>div]:bg-purple-500'}`}
                      />
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}

        {/* Action Buttons */}
        <div className="pt-4 space-y-3">
          {poll.status === 'open' && !isDeadlinePassed && (
            <Button
              onClick={handleVote}
              disabled={selectedSlots.length === 0 || isVoting}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {hasVoted ? (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Update Vote
                </>
              ) : (
                <>
                  <Vote className="h-4 w-4 mr-2" />
                  Submit Vote
                </>
              )}
            </Button>
          )}

          {isAdmin && poll.status === 'open' && totalVoters > 0 && (
            <Button
              variant="outline"
              onClick={() => onSchedule(poll, winningSlotId)}
              className="w-full"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Winning Time
            </Button>
          )}

          {poll.status === 'scheduled' && (
            <div className="flex items-center justify-center gap-2 p-3 bg-green-50 rounded-lg text-green-700">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-medium">Event has been scheduled!</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}