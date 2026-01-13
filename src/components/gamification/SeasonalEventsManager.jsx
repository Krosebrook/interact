import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Star, Trophy, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function SeasonalEventsManager({ userEmail }) {
  const queryClient = useQueryClient();

  const { data: events } = useQuery({
    queryKey: ['seasonal-events'],
    queryFn: () => base44.entities.SeasonalEvent.filter({ is_active: true })
  });

  const joinEventMutation = useMutation({
    mutationFn: async (eventId) => {
      const event = events.find(e => e.id === eventId);
      const participants = event.participants || [];
      
      if (!participants.includes(userEmail)) {
        await base44.entities.SeasonalEvent.update(eventId, {
          participants: [...participants, userEmail]
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['seasonal-events']);
      toast.success('Joined seasonal event!');
    }
  });

  const activeEvent = events?.find(e => {
    if (!e.start_date || !e.end_date) return false;
    const now = new Date();
    return new Date(e.start_date) <= now && new Date(e.end_date) >= now;
  });

  if (!activeEvent) return null;

  const isParticipating = activeEvent.participants?.includes(userEmail);
  const daysLeft = activeEvent.end_date ? Math.ceil((new Date(activeEvent.end_date) - new Date()) / (1000 * 60 * 60 * 24)) : 0;

  return (
    <Card data-b44-sync="true" data-feature="gamification" data-component="seasonaleventsmanager" className="border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-amber-600" />
            {activeEvent.theme}
          </CardTitle>
          <Badge className="bg-amber-600">
            <Calendar className="h-3 w-3 mr-1" />
            {daysLeft} days left
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-slate-700">{activeEvent.description}</p>
        
        <div className="p-3 bg-white rounded-lg border border-amber-200">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span className="font-medium text-amber-900">
              {activeEvent.bonus_multiplier}x Point Multiplier Active!
            </span>
          </div>
          <p className="text-sm text-slate-600">Earn bonus points on all activities during this event</p>
        </div>

        {activeEvent.challenges?.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-slate-900">Event Challenges:</h4>
            {activeEvent.challenges.slice(0, 3).map((challenge, idx) => (
              <div key={idx} className="p-2 bg-white rounded border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{challenge.name}</span>
                  <Badge variant="outline">{challenge.points} pts</Badge>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isParticipating && (
          <Button
            onClick={() => joinEventMutation.mutate(activeEvent.id)}
            className="w-full bg-amber-600 hover:bg-amber-700"
            disabled={joinEventMutation.isPending}
          >
            <Trophy className="h-4 w-4 mr-2" />
            Join Event
          </Button>
        )}
      </CardContent>
    </Card>
  );
}