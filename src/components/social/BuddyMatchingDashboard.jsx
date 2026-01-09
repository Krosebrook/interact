import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users, Sparkles, CheckCircle, XCircle, Loader2, MessageCircle, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export default function BuddyMatchingDashboard({ userEmail }) {
  const [findingMatches, setFindingMatches] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const queryClient = useQueryClient();

  const { data: existingMatches = [] } = useQuery({
    queryKey: ['buddy-matches', userEmail],
    queryFn: async () => {
      return await base44.entities.BuddyMatch.filter({
        $or: [
          { user_email: userEmail },
          { buddy_email: userEmail }
        ]
      });
    }
  });

  const { data: potentialMatches, isLoading: loadingMatches } = useQuery({
    queryKey: ['potential-matches', userEmail],
    queryFn: async () => {
      const response = await base44.functions.invoke('aiBuddyMatcher', {
        action: 'find_matches',
        user_email: userEmail,
        match_type: 'peer_buddy'
      });
      return response.data.matches || [];
    },
    enabled: findingMatches
  });

  const createMatchMutation = useMutation({
    mutationFn: async (match) => {
      await base44.entities.BuddyMatch.create({
        user_email: userEmail,
        buddy_email: match.buddy_email,
        match_type: 'peer_buddy',
        status: 'pending',
        match_score: match.match_score,
        shared_interests: match.shared_interests,
        match_reasoning: match.reasoning
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['buddy-matches']);
      toast.success('Match request sent!');
      setFindingMatches(false);
    }
  });

  const acceptMatchMutation = useMutation({
    mutationFn: async (matchId) => {
      await base44.entities.BuddyMatch.update(matchId, {
        status: 'accepted'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['buddy-matches']);
      toast.success('Match accepted!');
    }
  });

  const declineMatchMutation = useMutation({
    mutationFn: async (matchId) => {
      await base44.entities.BuddyMatch.update(matchId, {
        status: 'declined'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['buddy-matches']);
      toast.success('Match declined');
    }
  });

  const activeMatches = existingMatches.filter(m => 
    m.status === 'accepted' || m.status === 'active'
  );
  const pendingMatches = existingMatches.filter(m => m.status === 'pending');

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-6 w-6 text-purple-600" />
            Buddy & Mentorship Program
          </CardTitle>
          <CardDescription>
            AI-powered matching to connect you with peers and mentors
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => setFindingMatches(true)}
            disabled={findingMatches || loadingMatches}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {loadingMatches ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Finding Matches...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Find My Matches
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Active Matches */}
      {activeMatches.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900">Your Buddies</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {activeMatches.map(match => {
              const buddyEmail = match.user_email === userEmail ? match.buddy_email : match.user_email;
              return (
                <Card key={match.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-purple-600 text-white">
                          {buddyEmail.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900">{buddyEmail}</h4>
                        <Badge className="bg-emerald-100 text-emerald-800 text-xs mt-1">
                          {match.match_type.replace('_', ' ')}
                        </Badge>
                        <div className="mt-2 flex gap-2">
                          <Button size="sm" variant="outline">
                            <MessageCircle className="h-4 w-4 mr-1" />
                            Message
                          </Button>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-sm text-slate-600">
                          <TrendingUp className="h-4 w-4" />
                          {match.match_score}%
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          {match.interactions_count || 0} interactions
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Pending Matches */}
      {pendingMatches.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900">Pending Requests</h3>
          {pendingMatches.map(match => {
            const isReceiver = match.buddy_email === userEmail;
            const otherEmail = isReceiver ? match.user_email : match.buddy_email;
            
            return (
              <Card key={match.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-slate-200 text-slate-600">
                          {otherEmail.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-slate-900">{otherEmail}</p>
                        <p className="text-sm text-slate-600">
                          {isReceiver ? 'wants to connect with you' : 'awaiting response'}
                        </p>
                      </div>
                    </div>
                    {isReceiver && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => acceptMatchMutation.mutate(match.id)}
                          className="bg-emerald-600 hover:bg-emerald-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => declineMatchMutation.mutate(match.id)}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Decline
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Potential Matches */}
      {findingMatches && potentialMatches && potentialMatches.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900">Suggested Matches</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {potentialMatches.map((match, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-gradient-to-br from-purple-600 to-pink-600 text-white">
                        {match.buddy_email.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-slate-900">
                          {match.candidate?.display_name || match.buddy_email}
                        </h4>
                        <Badge variant="outline" className="text-xs">
                          {match.match_score}% match
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{match.reasoning}</p>
                      {match.shared_interests && match.shared_interests.length > 0 && (
                        <div className="flex gap-1 flex-wrap mb-2">
                          {match.shared_interests.slice(0, 3).map((interest, i) => (
                            <Badge key={i} className="bg-purple-100 text-purple-800 text-xs">
                              {interest}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <Button
                        size="sm"
                        onClick={() => createMatchMutation.mutate(match)}
                        disabled={createMatchMutation.isPending}
                        className="mt-2"
                      >
                        <Users className="h-4 w-4 mr-1" />
                        Connect
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}