import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Plus, X, Vote, Clock } from 'lucide-react';
import { format, addDays } from 'date-fns';

export default function TimeSlotPollCreator({ onSubmit, activities = [], isSubmitting }) {
  const [pollData, setPollData] = useState({
    event_title: '',
    activity_id: '',
    description: '',
    voting_deadline: format(addDays(new Date(), 3), "yyyy-MM-dd'T'HH:mm"),
    time_slots: []
  });
  
  const [newSlot, setNewSlot] = useState({
    datetime: '',
    duration_minutes: 30
  });

  const addTimeSlot = () => {
    if (!newSlot.datetime) return;
    
    const slot = {
      id: `slot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      datetime: newSlot.datetime,
      duration_minutes: newSlot.duration_minutes
    };
    
    setPollData(prev => ({
      ...prev,
      time_slots: [...prev.time_slots, slot]
    }));
    
    setNewSlot({ datetime: '', duration_minutes: 30 });
  };

  const removeTimeSlot = (slotId) => {
    setPollData(prev => ({
      ...prev,
      time_slots: prev.time_slots.filter(s => s.id !== slotId)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (pollData.time_slots.length < 2) {
      return;
    }
    onSubmit(pollData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg border border-purple-200" data-b44-sync="true" data-feature="events" data-component="timeslotpollcreator">
        <Vote className="h-5 w-5 text-purple-600" />
        <div>
          <p className="font-medium text-purple-900">Time Slot Voting</p>
          <p className="text-xs text-purple-700">Let participants vote on their preferred time</p>
        </div>
      </div>

      <div>
        <Label>Event Title</Label>
        <Input
          value={pollData.event_title}
          onChange={(e) => setPollData(prev => ({ ...prev, event_title: e.target.value }))}
          placeholder="e.g., Weekly Team Sync"
          required
        />
      </div>

      {activities.length > 0 && (
        <div>
          <Label>Link to Activity (optional)</Label>
          <select
            className="w-full p-2 border rounded-md"
            value={pollData.activity_id}
            onChange={(e) => setPollData(prev => ({ ...prev, activity_id: e.target.value }))}
          >
            <option value="">No activity linked</option>
            {activities.map(a => (
              <option key={a.id} value={a.id}>{a.title}</option>
            ))}
          </select>
        </div>
      )}

      <div>
        <Label>Description (optional)</Label>
        <Textarea
          value={pollData.description}
          onChange={(e) => setPollData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="What's this event about?"
          rows={2}
        />
      </div>

      <div>
        <Label>Voting Deadline</Label>
        <Input
          type="datetime-local"
          value={pollData.voting_deadline}
          onChange={(e) => setPollData(prev => ({ ...prev, voting_deadline: e.target.value }))}
          required
        />
      </div>

      {/* Time Slots Section */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Proposed Time Slots ({pollData.time_slots.length})
        </Label>
        
        {/* Existing Slots */}
        {pollData.time_slots.length > 0 && (
          <div className="space-y-2">
            {pollData.time_slots.map((slot, index) => (
              <Card key={slot.id} className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="bg-purple-50">
                    Option {index + 1}
                  </Badge>
                  <span className="font-medium">
                    {format(new Date(slot.datetime), 'EEE, MMM d, yyyy')}
                  </span>
                  <span className="text-slate-600">
                    {format(new Date(slot.datetime), 'h:mm a')}
                  </span>
                  <Badge variant="secondary">
                    <Clock className="h-3 w-3 mr-1" />
                    {slot.duration_minutes} min
                  </Badge>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeTimeSlot(slot.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </Card>
            ))}
          </div>
        )}

        {/* Add New Slot */}
        <Card className="p-4 border-dashed">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <Label className="text-xs">Date & Time</Label>
              <Input
                type="datetime-local"
                value={newSlot.datetime}
                onChange={(e) => setNewSlot(prev => ({ ...prev, datetime: e.target.value }))}
              />
            </div>
            <div>
              <Label className="text-xs">Duration</Label>
              <select
                className="w-full p-2 border rounded-md h-10"
                value={newSlot.duration_minutes}
                onChange={(e) => setNewSlot(prev => ({ ...prev, duration_minutes: parseInt(e.target.value) }))}
              >
                <option value={15}>15 min</option>
                <option value={30}>30 min</option>
                <option value={45}>45 min</option>
                <option value={60}>60 min</option>
                <option value={90}>90 min</option>
                <option value={120}>2 hours</option>
              </select>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addTimeSlot}
            disabled={!newSlot.datetime}
            className="mt-3"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Time Slot
          </Button>
        </Card>

        {pollData.time_slots.length < 2 && (
          <p className="text-xs text-amber-600">
            Add at least 2 time slots for participants to vote on
          </p>
        )}
      </div>

      <Button
        type="submit"
        disabled={pollData.time_slots.length < 2 || !pollData.event_title || isSubmitting}
        className="w-full bg-purple-600 hover:bg-purple-700"
      >
        <Vote className="h-4 w-4 mr-2" />
        {isSubmitting ? 'Creating Poll...' : 'Create Time Slot Poll'}
      </Button>
    </form>
  );
}