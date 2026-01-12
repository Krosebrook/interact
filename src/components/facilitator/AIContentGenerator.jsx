import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Sparkles, 
  FileText, 
  MessageCircle, 
  Mail,
  Copy,
  RefreshCw,
  Loader2,
  Wand2,
  Users,
  Target
} from 'lucide-react';
import { toast } from 'sonner';

export default function AIContentGenerator({ eventId, eventTitle, activityType }) {
  const [activeTab, setActiveTab] = useState('description');
  
  // Description generator state
  const [descConfig, setDescConfig] = useState({
    activity_type: activityType || '',
    target_audience: 'general',
    tone: 'professional',
    key_points: ''
  });
  const [generatedDescription, setGeneratedDescription] = useState('');

  // Icebreaker generator state
  const [iceConfig, setIceConfig] = useState({
    topic: eventTitle || '',
    participant_count: '10-20',
    energy_level: 'medium',
    format: 'virtual'
  });
  const [generatedIcebreakers, setGeneratedIcebreakers] = useState([]);

  // Follow-up generator state
  const [followUpConfig, setFollowUpConfig] = useState({
    engagement_level: 'high',
    include_feedback_request: true,
    include_resources: true,
    tone: 'warm'
  });
  const [generatedFollowUp, setGeneratedFollowUp] = useState('');

  const { data: activities = [] } = useQuery({
    queryKey: ['activities'],
    queryFn: () => base44.entities.Activity.list()
  });

  const { data: participations = [] } = useQuery({
    queryKey: ['participations', eventId],
    queryFn: () => base44.entities.Participation.filter({ event_id: eventId }),
    enabled: !!eventId
  });

  // Generate Description
  const generateDescriptionMutation = useMutation({
    mutationFn: async () => {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate an engaging event description for a team activity.

Activity Type: ${descConfig.activity_type}
Target Audience: ${descConfig.target_audience}
Tone: ${descConfig.tone}
${descConfig.key_points ? `Key Points to Include: ${descConfig.key_points}` : ''}

Create a compelling event description that:
1. Has an attention-grabbing opening
2. Clearly explains what participants will do
3. Highlights the benefits of attending
4. Includes a call to action
5. Is appropriate for the specified tone and audience

Keep it concise but engaging (150-250 words).`,
        response_json_schema: {
          type: "object",
          properties: {
            title_suggestion: { type: "string" },
            description: { type: "string" },
            key_highlights: { type: "array", items: { type: "string" } },
            suggested_duration: { type: "string" }
          }
        }
      });
      return result;
    },
    onSuccess: (data) => {
      setGeneratedDescription(data);
      toast.success('Description generated!');
    }
  });

  // Generate Icebreakers
  const generateIcebreakersMutation = useMutation({
    mutationFn: async () => {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate creative icebreaker questions and discussion prompts for a team event.

Event Topic: ${iceConfig.topic}
Participant Count: ${iceConfig.participant_count}
Energy Level: ${iceConfig.energy_level}
Format: ${iceConfig.format}

Create a variety of:
1. Quick icebreaker questions (can be answered in 1-2 sentences)
2. Deeper discussion prompts (for breakout rooms or small groups)
3. Fun polls or "would you rather" questions
4. Activity-specific questions related to the topic

Make them inclusive, professional, and engaging. Avoid questions that could be uncomfortable or too personal.`,
        response_json_schema: {
          type: "object",
          properties: {
            quick_icebreakers: { 
              type: "array", 
              items: { type: "string" }
            },
            discussion_prompts: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  prompt: { type: "string" },
                  follow_up_questions: { type: "array", items: { type: "string" } }
                }
              }
            },
            polls: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  question: { type: "string" },
                  options: { type: "array", items: { type: "string" } }
                }
              }
            },
            energizers: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });
      return result;
    },
    onSuccess: (data) => {
      setGeneratedIcebreakers(data);
      toast.success('Icebreakers generated!');
    }
  });

  // Generate Follow-up
  const generateFollowUpMutation = useMutation({
    mutationFn: async () => {
      const attendedCount = participations.filter(p => p.attended).length;
      const avgEngagement = participations.length > 0 
        ? participations.reduce((sum, p) => sum + (p.engagement_score || 0), 0) / participations.length
        : 0;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a personalized post-event follow-up message.

Event: ${eventTitle}
Participants who attended: ${attendedCount}
Average engagement score: ${avgEngagement.toFixed(1)}/10
Engagement level category: ${followUpConfig.engagement_level}
Tone: ${followUpConfig.tone}
Include feedback request: ${followUpConfig.include_feedback_request}
Include resources: ${followUpConfig.include_resources}

Create three versions of the follow-up message:
1. For highly engaged participants (attended and participated actively)
2. For regular participants (attended but less active)
3. For those who missed the event

Each message should:
- Thank them appropriately for their level of participation
- Reference specific aspects of the event
- Include next steps or calls to action
- Feel personal and genuine, not generic`,
        response_json_schema: {
          type: "object",
          properties: {
            high_engagement_message: {
              type: "object",
              properties: {
                subject: { type: "string" },
                body: { type: "string" },
                call_to_action: { type: "string" }
              }
            },
            regular_attendance_message: {
              type: "object",
              properties: {
                subject: { type: "string" },
                body: { type: "string" },
                call_to_action: { type: "string" }
              }
            },
            missed_event_message: {
              type: "object",
              properties: {
                subject: { type: "string" },
                body: { type: "string" },
                call_to_action: { type: "string" }
              }
            },
            suggested_resources: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });
      return result;
    },
    onSuccess: (data) => {
      setGeneratedFollowUp(data);
      toast.success('Follow-up messages generated!');
    }
  });

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  return (
    <Card className="border-0 shadow-lg" data-b44-sync="true" data-feature="facilitator" data-component="aicontentgenerator">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="h-5 w-5 text-purple-600" />
          AI Content Generator
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="description" className="text-xs">
              <FileText className="h-3.5 w-3.5 mr-1" />
              Description
            </TabsTrigger>
            <TabsTrigger value="icebreakers" className="text-xs">
              <MessageCircle className="h-3.5 w-3.5 mr-1" />
              Icebreakers
            </TabsTrigger>
            <TabsTrigger value="followup" className="text-xs">
              <Mail className="h-3.5 w-3.5 mr-1" />
              Follow-up
            </TabsTrigger>
          </TabsList>

          {/* Description Generator */}
          <TabsContent value="description" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Activity Type</Label>
                <Select
                  value={descConfig.activity_type}
                  onValueChange={(v) => setDescConfig(prev => ({ ...prev, activity_type: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="icebreaker">Icebreaker</SelectItem>
                    <SelectItem value="creative">Creative</SelectItem>
                    <SelectItem value="competitive">Competitive</SelectItem>
                    <SelectItem value="wellness">Wellness</SelectItem>
                    <SelectItem value="learning">Learning</SelectItem>
                    <SelectItem value="social">Social</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Target Audience</Label>
                <Select
                  value={descConfig.target_audience}
                  onValueChange={(v) => setDescConfig(prev => ({ ...prev, target_audience: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General Team</SelectItem>
                    <SelectItem value="new_hires">New Hires</SelectItem>
                    <SelectItem value="leadership">Leadership</SelectItem>
                    <SelectItem value="remote">Remote Workers</SelectItem>
                    <SelectItem value="cross_functional">Cross-functional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Tone</Label>
              <Select
                value={descConfig.tone}
                onValueChange={(v) => setDescConfig(prev => ({ ...prev, tone: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="casual">Casual & Fun</SelectItem>
                  <SelectItem value="energetic">Energetic & Exciting</SelectItem>
                  <SelectItem value="warm">Warm & Inviting</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Key Points to Include (optional)</Label>
              <Textarea
                value={descConfig.key_points}
                onChange={(e) => setDescConfig(prev => ({ ...prev, key_points: e.target.value }))}
                placeholder="Any specific details to mention..."
                rows={2}
              />
            </div>

            <Button
              onClick={() => generateDescriptionMutation.mutate()}
              disabled={generateDescriptionMutation.isLoading || !descConfig.activity_type}
              className="w-full"
            >
              {generateDescriptionMutation.isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              Generate Description
            </Button>

            {generatedDescription && (
              <div className="space-y-3 p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <Badge variant="outline">{generatedDescription.suggested_duration}</Badge>
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(generatedDescription.description)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <h4 className="font-bold">{generatedDescription.title_suggestion}</h4>
                <p className="text-sm whitespace-pre-wrap">{generatedDescription.description}</p>
                {generatedDescription.key_highlights?.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">KEY HIGHLIGHTS</p>
                    <div className="flex flex-wrap gap-1">
                      {generatedDescription.key_highlights.map((h, i) => (
                        <Badge key={i} variant="outline" className="text-xs">{h}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* Icebreakers Generator */}
          <TabsContent value="icebreakers" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Event Topic</Label>
                <Input
                  value={iceConfig.topic}
                  onChange={(e) => setIceConfig(prev => ({ ...prev, topic: e.target.value }))}
                  placeholder="e.g., Team collaboration"
                />
              </div>
              <div>
                <Label>Participant Count</Label>
                <Select
                  value={iceConfig.participant_count}
                  onValueChange={(v) => setIceConfig(prev => ({ ...prev, participant_count: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2-5">Small (2-5)</SelectItem>
                    <SelectItem value="5-10">Medium (5-10)</SelectItem>
                    <SelectItem value="10-20">Large (10-20)</SelectItem>
                    <SelectItem value="20+">Very Large (20+)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Energy Level</Label>
                <Select
                  value={iceConfig.energy_level}
                  onValueChange={(v) => setIceConfig(prev => ({ ...prev, energy_level: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low (Calm)</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High (Energetic)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Format</Label>
                <Select
                  value={iceConfig.format}
                  onValueChange={(v) => setIceConfig(prev => ({ ...prev, format: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="virtual">Virtual</SelectItem>
                    <SelectItem value="in-person">In-Person</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={() => generateIcebreakersMutation.mutate()}
              disabled={generateIcebreakersMutation.isLoading || !iceConfig.topic}
              className="w-full"
            >
              {generateIcebreakersMutation.isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              Generate Icebreakers
            </Button>

            {generatedIcebreakers.quick_icebreakers && (
              <div className="space-y-4">
                {/* Quick Icebreakers */}
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">Quick Icebreakers</h4>
                  <div className="space-y-2">
                    {generatedIcebreakers.quick_icebreakers?.map((q, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-white rounded">
                        <span className="text-sm">{q}</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(q)}>
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Discussion Prompts */}
                {generatedIcebreakers.discussion_prompts?.length > 0 && (
                  <div className="p-3 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-800 mb-2">Discussion Prompts</h4>
                    <div className="space-y-3">
                      {generatedIcebreakers.discussion_prompts.map((d, i) => (
                        <div key={i} className="p-2 bg-white rounded">
                          <p className="text-sm font-medium">{d.prompt}</p>
                          {d.follow_up_questions?.length > 0 && (
                            <ul className="mt-1 text-xs text-slate-500">
                              {d.follow_up_questions.map((f, j) => (
                                <li key={j}>• {f}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Polls */}
                {generatedIcebreakers.polls?.length > 0 && (
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <h4 className="font-medium text-purple-800 mb-2">Poll Questions</h4>
                    <div className="space-y-2">
                      {generatedIcebreakers.polls.map((p, i) => (
                        <div key={i} className="p-2 bg-white rounded">
                          <p className="text-sm font-medium">{p.question}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {p.options?.map((o, j) => (
                              <Badge key={j} variant="outline" className="text-xs">{o}</Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* Follow-up Generator */}
          <TabsContent value="followup" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Overall Engagement Level</Label>
                <Select
                  value={followUpConfig.engagement_level}
                  onValueChange={(v) => setFollowUpConfig(prev => ({ ...prev, engagement_level: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Tone</Label>
                <Select
                  value={followUpConfig.tone}
                  onValueChange={(v) => setFollowUpConfig(prev => ({ ...prev, tone: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="warm">Warm & Personal</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="energetic">Energetic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-600">
                <Users className="h-4 w-4 inline mr-1" />
                {participations.length} registered • {participations.filter(p => p.attended).length} attended
              </p>
            </div>

            <Button
              onClick={() => generateFollowUpMutation.mutate()}
              disabled={generateFollowUpMutation.isLoading}
              className="w-full"
            >
              {generateFollowUpMutation.isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              Generate Follow-up Messages
            </Button>

            {generatedFollowUp.high_engagement_message && (
              <div className="space-y-4">
                {/* High Engagement */}
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-green-800">For Highly Engaged</h4>
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(
                      `Subject: ${generatedFollowUp.high_engagement_message.subject}\n\n${generatedFollowUp.high_engagement_message.body}`
                    )}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs font-medium text-slate-500">Subject: {generatedFollowUp.high_engagement_message.subject}</p>
                  <p className="text-sm mt-1 whitespace-pre-wrap">{generatedFollowUp.high_engagement_message.body}</p>
                </div>

                {/* Regular */}
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-blue-800">For Regular Attendees</h4>
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(
                      `Subject: ${generatedFollowUp.regular_attendance_message.subject}\n\n${generatedFollowUp.regular_attendance_message.body}`
                    )}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs font-medium text-slate-500">Subject: {generatedFollowUp.regular_attendance_message.subject}</p>
                  <p className="text-sm mt-1 whitespace-pre-wrap">{generatedFollowUp.regular_attendance_message.body}</p>
                </div>

                {/* Missed */}
                <div className="p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-orange-800">For Those Who Missed</h4>
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(
                      `Subject: ${generatedFollowUp.missed_event_message.subject}\n\n${generatedFollowUp.missed_event_message.body}`
                    )}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs font-medium text-slate-500">Subject: {generatedFollowUp.missed_event_message.subject}</p>
                  <p className="text-sm mt-1 whitespace-pre-wrap">{generatedFollowUp.missed_event_message.body}</p>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}