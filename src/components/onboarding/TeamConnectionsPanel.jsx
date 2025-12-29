import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, MessageCircle, Sparkles, Star } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';
import { motion } from 'framer-motion';

export default function TeamConnectionsPanel({ 
  userEmail, 
  skillInterests, 
  personalityTraits,
  completedTasks 
}) {
  const { data: connections, isLoading } = useQuery({
    queryKey: ['team-connections', userEmail],
    queryFn: async () => {
      const response = await base44.functions.invoke('newEmployeeOnboardingAI', {
        action: 'team_connection_suggestions',
        context: {
          skill_interests: skillInterests || [],
          personality_traits: personalityTraits || {},
          completed_tasks: completedTasks || []
        }
      });
      return response.data;
    },
    enabled: !!userEmail,
    staleTime: 60 * 60 * 1000 // Refresh every hour
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12">
          <LoadingSpinner message="Finding your perfect team matches..." />
        </CardContent>
      </Card>
    );
  }

  if (!connections?.connections) return null;

  return (
    <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50/50 to-cyan-50/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center">
            <Users className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-base">Suggested Team Connections</p>
            <p className="text-xs font-normal text-slate-500">
              AI-matched based on your interests
            </p>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Networking Tip */}
        {connections.tip && (
          <div className="bg-blue-100 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-800 flex items-start gap-2">
              <Sparkles className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>{connections.tip}</span>
            </p>
          </div>
        )}

        {/* Connection Cards */}
        <div className="space-y-3">
          {connections.connections.map((connection, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <ConnectionCard connection={connection} />
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ConnectionCard({ connection }) {
  const initials = connection.name?.split(' ').map(n => n[0]).join('') || '?';
  
  return (
    <div className="bg-white rounded-lg p-4 border border-slate-200 hover:border-blue-300 transition-all hover:shadow-md">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold flex-shrink-0">
          {initials}
        </div>

        <div className="flex-1 min-w-0">
          {/* Name & Priority */}
          <div className="flex items-center justify-between mb-1">
            <h5 className="font-semibold text-slate-900">{connection.name || connection.email}</h5>
            {connection.priority === 'high' && (
              <Badge className="bg-red-100 text-red-800 border-red-200 flex items-center gap-1">
                <Star className="h-3 w-3" />
                High Priority
              </Badge>
            )}
          </div>

          <p className="text-xs text-slate-500 mb-2">{connection.email}</p>

          {/* Why Connect */}
          <p className="text-sm text-slate-700 mb-2 leading-relaxed">
            {connection.why_connect}
          </p>

          {/* Shared Interests */}
          {connection.shared_interests?.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {connection.shared_interests.map((interest, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {interest}
                </Badge>
              ))}
            </div>
          )}

          {/* Collaboration Potential */}
          <div className="bg-purple-50 border border-purple-200 rounded p-2 mb-3">
            <p className="text-xs text-purple-800">
              <strong>Collaboration idea:</strong> {connection.collaboration_potential}
            </p>
          </div>

          {/* Conversation Starter */}
          <div className="bg-slate-50 rounded p-2 mb-3">
            <p className="text-xs text-slate-600">
              <strong>Icebreaker:</strong> "{connection.conversation_starter}"
            </p>
          </div>

          <Button 
            size="sm" 
            className="w-full gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
          >
            <MessageCircle className="h-4 w-4" />
            Send Message
          </Button>
        </div>
      </div>
    </div>
  );
}