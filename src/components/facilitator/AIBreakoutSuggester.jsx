import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Sparkles, 
  Shuffle,
  Target,
  Brain,
  Loader2,
  Copy,
  RefreshCw,
  UserPlus,
  Lightbulb
} from 'lucide-react';
import { toast } from 'sonner';

export default function AIBreakoutSuggester({ eventId, eventTitle }) {
  const [roomCount, setRoomCount] = useState(3);
  const [topic, setTopic] = useState('');
  const [suggestions, setSuggestions] = useState(null);
  const [groupingStrategy, setGroupingStrategy] = useState('skills'); // skills, interests, mixed, random

  const { data: participations = [] } = useQuery({
    queryKey: ['participations', eventId],
    queryFn: () => base44.entities.Participation.filter({ event_id: eventId }),
    enabled: !!eventId
  });

  const { data: userProfiles = [] } = useQuery({
    queryKey: ['user-profiles'],
    queryFn: () => base44.entities.UserProfile.list(),
    enabled: participations.length > 0
  });

  const activeParticipants = participations.filter(p => p.rsvp_status === 'yes' || p.attended);

  const generateBreakoutsMutation = useMutation({
    mutationFn: async () => {
      // Get rich profile data for participants
      const participantData = activeParticipants.map(p => {
        const profile = userProfiles.find(up => up.user_email === p.participant_email);
        return {
          name: p.participant_name,
          email: p.participant_email,
          department: profile?.department || 'Unknown',
          job_title: profile?.job_title || '',
          skills: profile?.skill_interests || [],
          skill_levels: profile?.skill_levels || [],
          interests: profile?.interests_tags || [],
          expertise_areas: profile?.expertise_areas || [],
          learning_goals: profile?.learning_goals || [],
          preferred_learning_styles: profile?.preferred_learning_styles || [],
          personality: profile?.personality_traits || {},
          events_attended: profile?.engagement_stats?.total_events_attended || 0,
          avg_engagement: profile?.engagement_stats?.average_engagement_score || 0,
          previous_events: (profile?.previous_event_attendance || []).slice(0, 5).map(e => e.event_type)
        };
      });

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Create intelligent breakout room assignments for an event using rich participant profile data.

Event: "${eventTitle}"
${topic ? `Discussion Topic: "${topic}"` : ''}
Number of rooms requested: ${roomCount}
Grouping strategy: ${groupingStrategy}

Detailed Participant Profiles (${participantData.length}):
${participantData.map((p, i) => `${i + 1}. ${p.name} (${p.department}${p.job_title ? `, ${p.job_title}` : ''})
   - Skill Levels: ${p.skill_levels.map(s => `${s.skill}:${s.level}`).join(', ') || 'Not specified'}
   - Expertise (can teach): ${p.expertise_areas.join(', ') || 'None listed'}
   - Learning Goals (wants to learn): ${p.learning_goals.join(', ') || 'None listed'}
   - Interests: ${p.interests.join(', ') || 'Not specified'}
   - Learning Styles: ${p.preferred_learning_styles.join(', ') || 'Not specified'}
   - Personality: ${p.personality.introvert_extrovert || 'unknown'} / ${p.personality.collaboration_style || 'unknown'}
   - Experience: ${p.events_attended} events, avg engagement ${p.avg_engagement.toFixed(1)}/10
   - Recent event types: ${p.previous_events.join(', ') || 'None'}`).join('\n\n')}

Strategy explanation:
- skills: Group by complementary skill levels - pair experts with learners in their areas of interest
- interests: Group by shared interests and learning goals for engaging peer discussions
- mixed: Diverse groups mixing introverts/extroverts, leaders/supporters, different departments
- random: Random assignment for networking, but balance personality types

IMPORTANT: Use the rich profile data to:
1. Match mentors (expertise_areas) with mentees (learning_goals) when using skills strategy
2. Consider personality traits - ensure each room has a mix of collaboration styles
3. Account for learning styles when suggesting discussion formats
4. Consider engagement history - pair high-engagement with lower-engagement participants

Create ${roomCount} breakout rooms with:
1. Room names/themes that match the grouping
2. Participant assignments with specific reasoning based on their profiles
3. Suggested discussion prompts tailored to the room's composition
4. Facilitator tips based on the personality mix and learning styles in each room
5. Potential mentor-mentee pairings within each room`,
        response_json_schema: {
          type: "object",
          properties: {
            rooms: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  room_name: { type: "string" },
                  theme: { type: "string" },
                  participants: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        email: { type: "string" },
                        role_suggestion: { type: "string" }
                      }
                    }
                  },
                  discussion_prompts: {
                    type: "array",
                    items: { type: "string" }
                  },
                  facilitator_tip: { type: "string" },
                  expected_dynamic: { type: "string" }
                }
              }
            },
            grouping_rationale: { type: "string" },
            success_tips: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      return result;
    },
    onSuccess: (data) => {
      setSuggestions(data);
      toast.success('Breakout rooms generated!');
    }
  });

  const copyRoomAssignments = () => {
    if (!suggestions) return;
    
    const text = suggestions.rooms.map(room => 
      `${room.room_name}\n${room.participants.map(p => `  • ${p.name}`).join('\n')}`
    ).join('\n\n');

    navigator.clipboard.writeText(text);
    toast.success('Room assignments copied!');
  };

  const strategies = [
    { value: 'skills', label: 'By Skills', icon: Target, description: 'Complementary expertise' },
    { value: 'interests', label: 'By Interests', icon: Lightbulb, description: 'Shared passions' },
    { value: 'mixed', label: 'Diverse Mix', icon: Shuffle, description: 'Cross-functional' },
    { value: 'random', label: 'Random', icon: Users, description: 'Networking focus' }
  ];

  return (
    <Card className="border-0 shadow-lg" data-b44-sync="true" data-feature="facilitator" data-component="aibreakoutsuggester">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-indigo-600" />
            AI Breakout Room Suggester
          </CardTitle>
          {suggestions && (
            <Button variant="outline" size="sm" onClick={copyRoomAssignments}>
              <Copy className="h-4 w-4 mr-1" /> Copy Assignments
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Configuration */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Number of Rooms</Label>
            <Input
              type="number"
              min={2}
              max={Math.ceil(activeParticipants.length / 2)}
              value={roomCount}
              onChange={(e) => setRoomCount(parseInt(e.target.value) || 2)}
            />
            <p className="text-xs text-slate-500 mt-1">
              ~{Math.ceil(activeParticipants.length / roomCount)} people per room
            </p>
          </div>
          <div>
            <Label>Discussion Topic (optional)</Label>
            <Input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Innovation challenges"
            />
          </div>
        </div>

        {/* Strategy Selection */}
        <div>
          <Label className="mb-2 block">Grouping Strategy</Label>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            {strategies.map(strategy => {
              const Icon = strategy.icon;
              return (
                <button
                  key={strategy.value}
                  onClick={() => setGroupingStrategy(strategy.value)}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    groupingStrategy === strategy.value
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <Icon className={`h-5 w-5 mb-1 ${
                    groupingStrategy === strategy.value ? 'text-indigo-600' : 'text-slate-400'
                  }`} />
                  <p className="font-medium text-sm">{strategy.label}</p>
                  <p className="text-xs text-slate-500">{strategy.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Participant Count */}
        <div className="p-3 bg-slate-50 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-slate-500" />
            <span className="font-medium">{activeParticipants.length} active participants</span>
          </div>
          <Button
            onClick={() => generateBreakoutsMutation.mutate()}
            disabled={generateBreakoutsMutation.isLoading || activeParticipants.length < 2}
          >
            {generateBreakoutsMutation.isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : suggestions ? (
              <RefreshCw className="h-4 w-4 mr-2" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            {suggestions ? 'Regenerate' : 'Generate Rooms'}
          </Button>
        </div>

        {/* Generated Rooms */}
        {suggestions && (
          <div className="space-y-4">
            {/* Rationale */}
            <div className="p-3 bg-indigo-50 rounded-lg">
              <p className="text-sm text-indigo-800">
                <strong>Grouping Rationale:</strong> {suggestions.grouping_rationale}
              </p>
            </div>

            {/* Rooms */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {suggestions.rooms.map((room, i) => (
                <Card key={i} className="p-4 border">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-bold text-lg">{room.room_name}</h4>
                      <p className="text-sm text-slate-500">{room.theme}</p>
                    </div>
                    <Badge variant="outline">{room.participants.length} people</Badge>
                  </div>

                  {/* Participants */}
                  <div className="mb-3">
                    <p className="text-xs font-medium text-slate-500 mb-2">PARTICIPANTS</p>
                    <div className="space-y-1">
                      {room.participants.map((p, j) => (
                        <div key={j} className="flex items-center justify-between text-sm p-2 bg-slate-50 rounded">
                          <span>{p.name}</span>
                          {p.role_suggestion && (
                            <Badge variant="outline" className="text-xs">{p.role_suggestion}</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Discussion Prompts */}
                  {room.discussion_prompts?.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-medium text-slate-500 mb-1">DISCUSSION PROMPTS</p>
                      <ul className="text-sm text-slate-600 space-y-1">
                        {room.discussion_prompts.map((prompt, k) => (
                          <li key={k} className="flex items-start gap-1">
                            <span className="text-indigo-500">•</span> {prompt}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Facilitator Tip */}
                  {room.facilitator_tip && (
                    <div className="p-2 bg-yellow-50 rounded text-xs">
                      <strong className="text-yellow-800">Tip:</strong>{' '}
                      <span className="text-yellow-700">{room.facilitator_tip}</span>
                    </div>
                  )}
                </Card>
              ))}
            </div>

            {/* Success Tips */}
            {suggestions.success_tips?.length > 0 && (
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" /> Tips for Success
                </h4>
                <ul className="space-y-1">
                  {suggestions.success_tips.map((tip, i) => (
                    <li key={i} className="text-sm text-green-700 flex items-start gap-2">
                      <span>•</span> {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {!suggestions && !generateBreakoutsMutation.isLoading && activeParticipants.length >= 2 && (
          <div className="text-center py-8 text-slate-500">
            <Users className="h-12 w-12 mx-auto mb-3 text-slate-300" />
            <p>Configure your breakout room settings and click Generate</p>
            <p className="text-sm">AI will suggest optimal groupings based on participant profiles</p>
          </div>
        )}

        {activeParticipants.length < 2 && (
          <div className="text-center py-8 text-slate-500">
            <UserPlus className="h-12 w-12 mx-auto mb-3 text-slate-300" />
            <p>Need at least 2 participants to create breakout rooms</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}