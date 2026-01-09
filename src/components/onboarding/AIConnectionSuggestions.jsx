import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Users, Sparkles, MessageCircle, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

export default function AIConnectionSuggestions({ user }) {
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const { data: suggestions, isLoading } = useQuery({
    queryKey: ['ai-connection-suggestions', user?.email],
    queryFn: async () => {
      setLoading(true);
      try {
        const response = await base44.integrations.Core.InvokeLLM({
          prompt: `As a new employee joining a remote-first company, suggest 3-5 teammates this person should connect with.

User Role: ${user.role === 'admin' ? 'admin' : user.user_type || 'participant'}
User Email: ${user.email}

Provide practical connection suggestions with reasons why they should connect.`,
          response_json_schema: {
            type: 'object',
            properties: {
              suggestions: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    role: { type: 'string' },
                    reason: { type: 'string' },
                    suggested_action: { type: 'string' }
                  }
                }
              }
            }
          }
        });
        return response.suggestions;
      } finally {
        setLoading(false);
      }
    },
    enabled: !!user?.email,
    staleTime: 3600000 // 1 hour
  });

  // Fetch actual users matching these roles
  const { data: allUsers } = useQuery({
    queryKey: ['all-users-for-connections'],
    queryFn: () => base44.entities.User.list('full_name', 100),
    enabled: !!suggestions
  });

  const createBuddyMatchMutation = useMutation({
    mutationFn: async (buddyEmail) => {
      await base44.entities.BuddyMatch.create({
        user_email: user.email,
        buddy_email: buddyEmail,
        match_type: 'peer_buddy',
        status: 'pending',
        match_score: 80
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['buddy-matches']);
      toast.success('Connection request sent!');
    },
    onError: (error) => toast.error('Failed to send request: ' + error.message)
  });

  return (
    <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-indigo-600" />
          Suggested Connections
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {loading && (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Sparkles className="h-4 w-4 animate-pulse" />
            Finding great connections for you...
          </div>
        )}

        {suggestions?.map((suggestion, idx) => {
          // Try to match with actual users
          const matchedUser = allUsers?.find(u => 
            u.role === suggestion.role || 
            u.user_type === suggestion.role.toLowerCase()
          );

          return (
            <div
              key={idx}
              className="p-4 bg-white rounded-lg border border-slate-200 hover:border-indigo-300 transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                  <Users className="h-5 w-5 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-slate-900">
                      {matchedUser?.full_name || `${suggestion.role} Team Member`}
                    </h4>
                    <Badge variant="outline" className="text-xs">
                      {suggestion.role}
                    </Badge>
                  </div>
                  
                  {matchedUser && (
                    <p className="text-sm text-slate-500 mb-2">{matchedUser.email}</p>
                  )}
                  
                  <p className="text-sm text-slate-600 mb-3">{suggestion.reason}</p>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded p-2 mb-3">
                    <p className="text-xs text-blue-900">
                      <strong>Suggested:</strong> {suggestion.suggested_action}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    {matchedUser && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => createBuddyMatchMutation.mutate(matchedUser.email)}
                          disabled={createBuddyMatchMutation.isPending}
                        >
                          <UserPlus className="h-3 w-3 mr-1" />
                          Connect
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.location.href = `/pages/Channels`}
                        >
                          <MessageCircle className="h-3 w-3 mr-1" />
                          Message
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {!isLoading && !suggestions?.length && (
          <div className="text-center py-8 text-slate-500">
            <Users className="h-12 w-12 text-slate-300 mx-auto mb-2" />
            <p className="text-sm">Connection suggestions will appear here</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}