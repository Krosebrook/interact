import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Zap, CheckCircle, Trophy } from 'lucide-react';
import { toast } from 'sonner';

export default function BuddySystemManager({ userEmail }) {
  const queryClient = useQueryClient();

  const { data: buddyMatches } = useQuery({
    queryKey: ['buddy-matches', userEmail],
    queryFn: () => base44.entities.BuddyMatch.filter({
      $or: [
        { user_email: userEmail },
        { buddy_email: userEmail }
      ]
    })
  });

  const { data: personalChallenges } = useQuery({
    queryKey: ['personal-challenges', userEmail],
    queryFn: () => base44.entities.PersonalChallenge.filter({
      user_email: userEmail,
      status: 'active'
    })
  });

  const completeBuddyChallengeMutation = useMutation({
    mutationFn: async (challengeId) => {
      // Complete challenge and award bonus points
      await base44.entities.PersonalChallenge.update(challengeId, {
        status: 'completed',
        completion_date: new Date().toISOString()
      });

      // Award bonus points for teamwork
      await base44.functions.invoke('recordPointsTransaction', {
        user_email: userEmail,
        amount: 30,
        transaction_type: 'challenge_completed',
        description: 'Buddy challenge completed - teamwork bonus!'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['personal-challenges']);
      queryClient.invalidateQueries(['user-points']);
      toast.success('Buddy challenge completed! +30 bonus points');
    }
  });

  const activeBuddy = buddyMatches?.find(m => m.status === 'active');
  const buddyChallenges = personalChallenges?.filter(c => c.buddy_challenge === true) || [];

  return (
    <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-indigo-600" />
          Buddy System
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activeBuddy ? (
          <>
            <div className="p-4 bg-white rounded-lg border border-indigo-200">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-medium text-slate-900">Your Buddy</h4>
                  <p className="text-sm text-slate-600">
                    {activeBuddy.user_email === userEmail 
                      ? activeBuddy.buddy_email 
                      : activeBuddy.user_email}
                  </p>
                </div>
                <Badge className="bg-indigo-600">
                  <Zap className="h-3 w-3 mr-1" />
                  1.5x Points
                </Badge>
              </div>
              <p className="text-sm text-slate-600">
                Collaborate on challenges to earn bonus points!
              </p>
            </div>

            {buddyChallenges.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-slate-900">Active Buddy Challenges:</h4>
                {buddyChallenges.map(challenge => (
                  <div key={challenge.id} className="p-3 bg-white rounded border border-slate-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h5 className="font-medium text-sm">{challenge.challenge_name}</h5>
                        <p className="text-xs text-slate-600 mt-1">{challenge.description}</p>
                        <Badge variant="outline" className="mt-2">
                          <Trophy className="h-3 w-3 mr-1" />
                          {challenge.target_points} pts + 30 bonus
                        </Badge>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => completeBuddyChallengeMutation.mutate(challenge.id)}
                        disabled={completeBuddyChallengeMutation.isPending}
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Complete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-6">
            <Users className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-600 mb-3">
              Get matched with a buddy to earn bonus points on collaborative challenges
            </p>
            <Button variant="outline" size="sm">
              Find a Buddy
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}