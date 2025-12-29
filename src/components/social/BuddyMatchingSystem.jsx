import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Heart, Brain, CheckCircle, X, MessageCircle, Target, TrendingUp } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function BuddyMatchingSystem({ userEmail }) {
  const [matchType, setMatchType] = useState('peer_buddy');
  const [selectedMatch, setSelectedMatch] = useState(null);
  const queryClient = useQueryClient();

  // Fetch AI-powered matches
  const { data: suggestedMatches, isLoading: loadingMatches } = useQuery({
    queryKey: ['buddy-matches', userEmail, matchType],
    queryFn: async () => {
      const response = await base44.functions.invoke('buddyMatchingAI', {
        action: 'find_matches',
        context: { match_type: matchType, limit: 5 }
      });
      return response.data.matches;
    },
    enabled: !!userEmail
  });

  // Fetch existing buddy relationships
  const { data: existingBuddies } = useQuery({
    queryKey: ['my-buddies', userEmail],
    queryFn: async () => {
      const matches = await base44.entities.BuddyMatch.filter({
        $or: [
          { user_email: userEmail },
          { buddy_email: userEmail }
        ]
      });
      return matches;
    },
    enabled: !!userEmail
  });

  // Send buddy request
  const requestMutation = useMutation({
    mutationFn: async ({ match }) => {
      return await base44.entities.BuddyMatch.create({
        user_email: userEmail,
        buddy_email: match.buddy_email,
        match_type: matchType,
        match_score: match.match_score,
        shared_interests: match.shared_interests,
        match_reasoning: match.match_reasoning,
        goals: match.suggested_goals,
        status: 'pending'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['my-buddies']);
      toast.success('Buddy request sent!');
      setSelectedMatch(null);
    }
  });

  // Accept/decline buddy request
  const respondMutation = useMutation({
    mutationFn: async ({ matchId, accept }) => {
      return await base44.entities.BuddyMatch.update(matchId, {
        status: accept ? 'accepted' : 'declined'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['my-buddies']);
      toast.success('Response sent!');
    }
  });

  const pendingRequests = existingBuddies?.filter(b => 
    b.status === 'pending' && b.buddy_email === userEmail
  ) || [];

  const activeBuddies = existingBuddies?.filter(b => 
    b.status === 'active' || b.status === 'accepted'
  ) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-6 w-6 text-purple-600" />
                Buddy & Mentorship System
              </CardTitle>
              <p className="text-sm text-slate-600 mt-1">
                Connect with colleagues for learning and growth
              </p>
            </div>
            <Brain className="h-12 w-12 text-purple-600 opacity-20" />
          </div>
        </CardHeader>
      </Card>

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Heart className="h-5 w-5 text-int-orange" />
              Pending Requests ({pendingRequests.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingRequests.map((request) => (
              <div key={request.id} className="p-4 rounded-lg bg-white border border-orange-200">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold">{request.user_email}</p>
                    <Badge className="mt-1 capitalize">{request.match_type.replace('_', ' ')}</Badge>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Score: {request.match_score}%
                  </Badge>
                </div>
                <p className="text-sm text-slate-600 mb-3">{request.match_reasoning}</p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => respondMutation.mutate({ matchId: request.id, accept: true })}
                    disabled={respondMutation.isPending}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => respondMutation.mutate({ matchId: request.id, accept: false })}
                    disabled={respondMutation.isPending}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Decline
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Main Tabs */}
      <Tabs defaultValue="find">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="find">Find Buddies</TabsTrigger>
          <TabsTrigger value="my-buddies">
            My Buddies ({activeBuddies.length})
          </TabsTrigger>
        </TabsList>

        {/* Find Buddies */}
        <TabsContent value="find" className="space-y-4">
          {/* Match Type Selection */}
          <Card>
            <CardContent className="py-4">
              <div className="flex gap-2">
                <Button
                  variant={matchType === 'peer_buddy' ? 'default' : 'outline'}
                  onClick={() => setMatchType('peer_buddy')}
                  size="sm"
                >
                  Peer Buddy
                </Button>
                <Button
                  variant={matchType === 'mentor' ? 'default' : 'outline'}
                  onClick={() => setMatchType('mentor')}
                  size="sm"
                >
                  Find Mentor
                </Button>
                <Button
                  variant={matchType === 'mentee' ? 'default' : 'outline'}
                  onClick={() => setMatchType('mentee')}
                  size="sm"
                >
                  Be a Mentor
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* AI Suggested Matches */}
          {loadingMatches ? (
            <LoadingSpinner message="Finding your perfect matches..." />
          ) : (
            <div className="grid gap-4">
              <AnimatePresence>
                {suggestedMatches?.map((match, idx) => (
                  <MatchCard
                    key={idx}
                    match={match}
                    matchType={matchType}
                    onRequest={() => requestMutation.mutate({ match })}
                    isRequesting={requestMutation.isPending}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </TabsContent>

        {/* My Buddies */}
        <TabsContent value="my-buddies">
          {activeBuddies.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Users className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                <p className="text-slate-600">No active buddy connections yet</p>
                <p className="text-sm text-slate-500 mt-1">Start by finding matches!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {activeBuddies.map((buddy) => (
                <ActiveBuddyCard key={buddy.id} buddy={buddy} userEmail={userEmail} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function MatchCard({ match, matchType, onRequest, isRequesting }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start gap-3">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                {match.buddy_email.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold">{match.buddy_email}</p>
                <Badge className="mt-1 capitalize">{matchType.replace('_', ' ')}</Badge>
              </div>
            </div>
            <div className="text-right">
              <Badge variant="outline" className="bg-emerald-50 border-emerald-300 text-emerald-700">
                {match.match_score}% Match
              </Badge>
            </div>
          </div>

          <p className="text-sm text-slate-600 mb-3">{match.match_reasoning}</p>

          {match.shared_interests?.length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-medium text-slate-700 mb-1">Shared Interests:</p>
              <div className="flex flex-wrap gap-1">
                {match.shared_interests.map((interest, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {match.suggested_goals?.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
              <p className="text-xs font-medium text-blue-900 mb-1">Suggested Goals:</p>
              <ul className="text-xs text-blue-800 space-y-0.5">
                {match.suggested_goals.map((goal, i) => (
                  <li key={i}>• {goal}</li>
                ))}
              </ul>
            </div>
          )}

          <Button
            onClick={onRequest}
            disabled={isRequesting}
            className="w-full"
          >
            <Heart className="h-4 w-4 mr-2" />
            Send Buddy Request
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function ActiveBuddyCard({ buddy, userEmail }) {
  const buddyEmail = buddy.user_email === userEmail ? buddy.buddy_email : buddy.user_email;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold">
              {buddyEmail.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold">{buddyEmail}</p>
              <Badge className="mt-1 capitalize">{buddy.match_type.replace('_', ' ')}</Badge>
              <p className="text-xs text-slate-500 mt-1">
                {buddy.interactions_count || 0} interactions
              </p>
            </div>
          </div>
          <Badge className="bg-emerald-100 text-emerald-800">
            Active
          </Badge>
        </div>

        {buddy.goals?.length > 0 && (
          <div className="bg-slate-50 rounded-lg p-3 mb-3">
            <p className="text-xs font-medium text-slate-700 mb-1 flex items-center gap-1">
              <Target className="h-3 w-3" />
              Goals:
            </p>
            <ul className="text-xs text-slate-600 space-y-0.5">
              {buddy.goals.map((goal, i) => (
                <li key={i}>• {goal}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="flex-1">
            <MessageCircle className="h-4 w-4 mr-1" />
            Message
          </Button>
          <Button size="sm" variant="outline">
            <TrendingUp className="h-4 w-4 mr-1" />
            Log Interaction
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}