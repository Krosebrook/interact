import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Sparkles, 
  Users, 
  Calendar, 
  Clock, 
  MapPin, 
  Target,
  TrendingUp,
  Zap,
  RefreshCw,
  ChevronRight,
  Check,
  Star,
  Brain,
  Lightbulb,
  Filter
} from 'lucide-react';
import { format, addDays } from 'date-fns';
import LoadingSpinner from '../common/LoadingSpinner';

// Activity type configurations
const ACTIVITY_TYPES = {
  icebreaker: { emoji: '🧊', color: 'bg-gradient-icebreaker', label: 'Icebreaker' },
  creative: { emoji: '🎨', color: 'bg-gradient-creative', label: 'Creative' },
  competitive: { emoji: '🏆', color: 'bg-gradient-competitive', label: 'Competitive' },
  wellness: { emoji: '🧘', color: 'bg-gradient-wellness', label: 'Wellness' },
  learning: { emoji: '📚', color: 'bg-gradient-learning', label: 'Learning' },
  social: { emoji: '🎉', color: 'bg-gradient-social', label: 'Social' }
};

// Suggestion trigger types
const TRIGGER_TYPES = {
  weekly_digest: { icon: Calendar, label: 'Weekly Digest', description: 'Regular weekly recommendations' },
  goal_completion: { icon: Target, label: 'Goal Achieved', description: 'Celebrate team milestones' },
  low_engagement: { icon: TrendingUp, label: 'Boost Engagement', description: 'Re-engage inactive members' },
  new_members: { icon: Users, label: 'Onboarding', description: 'Welcome new team members' },
  seasonal: { icon: Star, label: 'Seasonal', description: 'Holiday and seasonal events' }
};

export default function AIEventSuggestionEngine({ teamId, onEventCreated }) {
  const queryClient = useQueryClient();
  const [constraints, setConstraints] = useState({
    duration: 'any',
    activityType: 'any',
    teamSize: 'any',
    timePreference: 'any'
  });
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [eventDetails, setEventDetails] = useState({});
  const [activeTab, setActiveTab] = useState('suggestions');

  // Fetch user data
  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  // Fetch team data
  const { data: teams = [] } = useQuery({
    queryKey: ['teams'],
    queryFn: () => base44.entities.Team.list()
  });

  // Fetch activities
  const { data: activities = [] } = useQuery({
    queryKey: ['activities'],
    queryFn: () => base44.entities.Activity.list('-popularity_score', 50)
  });

  // Fetch user profiles for interest matching
  const { data: userProfiles = [] } = useQuery({
    queryKey: ['user-profiles'],
    queryFn: () => base44.entities.UserProfile.list()
  });

  // Fetch recent participations for pattern analysis
  const { data: participations = [] } = useQuery({
    queryKey: ['participations-recent'],
    queryFn: () => base44.entities.Participation.list('-created_date', 100)
  });

  // Generate AI suggestions
  const generateSuggestionsMutation = useMutation({
    mutationFn: async (params) => {
      const { triggerType, teamContext } = params;
      
      // Build context for AI
      const context = {
        team: teamContext || teams[0],
        recentActivities: participations.slice(0, 20).map(p => p.event_id),
        userInterests: userProfiles.map(up => up.interests || []).flat(),
        constraints,
        triggerType
      };

      // Call LLM for smart suggestions
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert team engagement specialist. Generate 4 personalized event suggestions based on:
        
Team Context:
- Team size: ${context.team?.member_count || 'Unknown'} members
- Recent activity types: ${context.recentActivities.join(', ') || 'None'}
- Team interests: ${context.userInterests.slice(0, 10).join(', ') || 'General'}

Trigger: ${triggerType || 'weekly_digest'}

Constraints:
- Duration preference: ${constraints.duration}
- Activity type: ${constraints.activityType}
- Time preference: ${constraints.timePreference}

Available activity types: icebreaker, creative, competitive, wellness, learning, social

For each suggestion, provide:
1. A compelling title
2. Activity type
3. Brief description (2 sentences)
4. Recommended duration
5. Ideal team size
6. Why this is recommended (personalization reason)
7. Engagement score prediction (1-100)`,
        response_json_schema: {
          type: 'object',
          properties: {
            suggestions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  activity_type: { type: 'string' },
                  description: { type: 'string' },
                  duration: { type: 'string' },
                  ideal_team_size: { type: 'string' },
                  recommendation_reason: { type: 'string' },
                  engagement_score: { type: 'number' },
                  suggested_date: { type: 'string' }
                }
              }
            }
          }
        }
      });

      return response.suggestions || [];
    }
  });

  // Create event from suggestion
  const createEventMutation = useMutation({
    mutationFn: async (eventData) => {
      // First create or find matching activity
      let activityId = eventData.activity_id;
      
      if (!activityId) {
        // Create a new activity based on suggestion
        const newActivity = await base44.entities.Activity.create({
          title: eventData.title,
          description: eventData.description,
          type: eventData.activity_type,
          duration: eventData.duration,
          is_template: false
        });
        activityId = newActivity.id;
      }

      // Create the event with proper datetime format
      const event = await base44.entities.Event.create({
        activity_id: activityId,
        title: eventData.title,
        scheduled_date: eventData.scheduled_date ? new Date(eventData.scheduled_date).toISOString() : new Date(addDays(new Date(), 7)).toISOString(),
        duration_minutes: parseInt(eventData.duration) || 30,
        status: 'scheduled',
        max_participants: parseInt(eventData.max_participants) || 20,
        custom_instructions: eventData.custom_instructions || '',
        event_format: eventData.event_format || 'online'
      });

      return event;
    },
    onSuccess: (event) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      setShowCreateDialog(false);
      setSelectedSuggestion(null);
      onEventCreated?.(event);
    }
  });

  // Filter suggestions based on constraints
  const filteredSuggestions = useMemo(() => {
    if (!generateSuggestionsMutation.data) return [];
    
    return generateSuggestionsMutation.data.filter(suggestion => {
      if (constraints.activityType !== 'any' && suggestion.activity_type !== constraints.activityType) {
        return false;
      }
      return true;
    });
  }, [generateSuggestionsMutation.data, constraints]);

  const handleSelectSuggestion = (suggestion) => {
    setSelectedSuggestion(suggestion);
    setEventDetails({
      title: suggestion.title,
      description: suggestion.description,
      activity_type: suggestion.activity_type,
      duration: suggestion.duration,
      scheduled_date: format(addDays(new Date(), 7), "yyyy-MM-dd'T'HH:mm"),
      max_participants: 20,
      event_format: 'online',
      custom_instructions: ''
    });
    setShowCreateDialog(true);
  };

  const handleCreateEvent = () => {
    createEventMutation.mutate(eventDetails);
  };

  return (
    <div data-b44-sync="true" data-feature="ai" data-component="aieventsuggestionengine" className="space-y-6">
      {/* Header */}
      <Card className="glass-panel-solid border-2 border-purple-200 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-int-orange/5 pointer-events-none" />
        <CardHeader className="relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-purple shadow-lg">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-int-navy">
                  AI Event Suggestions
                </CardTitle>
                <p className="text-sm text-slate-600">
                  Smart recommendations based on team dynamics and interests
                </p>
              </div>
            </div>
            <Button
              onClick={() => generateSuggestionsMutation.mutate({ triggerType: 'weekly_digest' })}
              disabled={generateSuggestionsMutation.isPending}
              className="bg-gradient-purple hover:opacity-90 text-white shadow-lg press-effect"
            >
              {generateSuggestionsMutation.isPending ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              Generate Ideas
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white border shadow-sm">
          <TabsTrigger value="suggestions" className="data-[state=active]:bg-gradient-purple data-[state=active]:text-white">
            <Lightbulb className="h-4 w-4 mr-2" />
            Suggestions
          </TabsTrigger>
          <TabsTrigger value="triggers" className="data-[state=active]:bg-gradient-orange data-[state=active]:text-white">
            <Zap className="h-4 w-4 mr-2" />
            Triggers
          </TabsTrigger>
          <TabsTrigger value="constraints" className="data-[state=active]:bg-gradient-navy data-[state=active]:text-white">
            <Filter className="h-4 w-4 mr-2" />
            Constraints
          </TabsTrigger>
        </TabsList>

        {/* Suggestions Tab */}
        <TabsContent value="suggestions" className="mt-6">
          {generateSuggestionsMutation.isPending ? (
            <div className="flex flex-col items-center justify-center py-16">
              <LoadingSpinner size="large" type="purple" />
              <p className="mt-4 text-slate-600 animate-pulse">
                AI is analyzing team dynamics and generating suggestions...
              </p>
            </div>
          ) : filteredSuggestions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AnimatePresence>
                {filteredSuggestions.map((suggestion, index) => {
                  const typeConfig = ACTIVITY_TYPES[suggestion.activity_type] || ACTIVITY_TYPES.social;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card 
                        className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-purple-300 group"
                        onClick={() => handleSelectSuggestion(suggestion)}
                      >
                        <CardContent className="p-5">
                          {/* Header */}
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className={`p-2.5 rounded-xl ${typeConfig.color} shadow-sm`}>
                                <span className="text-xl">{typeConfig.emoji}</span>
                              </div>
                              <div>
                                <h3 className="font-bold text-slate-900 group-hover:text-purple-700 transition-colors">
                                  {suggestion.title}
                                </h3>
                                <Badge className="mt-1" variant="outline">
                                  {typeConfig.label}
                                </Badge>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-1 text-sm font-semibold text-emerald-600">
                                <TrendingUp className="h-4 w-4" />
                                {suggestion.engagement_score}%
                              </div>
                              <span className="text-xs text-slate-500">predicted</span>
                            </div>
                          </div>

                          {/* Description */}
                          <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                            {suggestion.description}
                          </p>

                          {/* Meta */}
                          <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {suggestion.duration}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {suggestion.ideal_team_size}
                            </span>
                          </div>

                          {/* Recommendation reason */}
                          <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                            <div className="flex items-start gap-2">
                              <Sparkles className="h-4 w-4 text-purple-600 mt-0.5" />
                              <p className="text-xs text-purple-700">
                                {suggestion.recommendation_reason}
                              </p>
                            </div>
                          </div>

                          {/* Action */}
                          <div className="mt-4 flex justify-end">
                            <Button 
                              size="sm" 
                              className="bg-gradient-purple hover:opacity-90 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              Schedule Event
                              <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          ) : (
            <Card className="border-dashed border-2">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="p-4 rounded-full bg-purple-100 mb-4">
                  <Sparkles className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  Ready to Generate Suggestions
                </h3>
                <p className="text-sm text-slate-500 text-center max-w-md mb-4">
                  Click "Generate Ideas" to get AI-powered event recommendations tailored to your team
                </p>
                <Button
                  onClick={() => generateSuggestionsMutation.mutate({ triggerType: 'weekly_digest' })}
                  className="bg-gradient-purple hover:opacity-90 text-white"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Ideas
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Triggers Tab */}
        <TabsContent value="triggers" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(TRIGGER_TYPES).map(([key, config]) => {
              const Icon = config.icon;
              return (
                <Card 
                  key={key}
                  className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-int-orange"
                  onClick={() => generateSuggestionsMutation.mutate({ triggerType: key })}
                >
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2.5 rounded-xl bg-gradient-orange shadow-sm">
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="font-semibold text-slate-900">{config.label}</h3>
                    </div>
                    <p className="text-sm text-slate-600">{config.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Constraints Tab */}
        <TabsContent value="constraints" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-int-navy" />
                Filter Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label>Duration</Label>
                <Select 
                  value={constraints.duration} 
                  onValueChange={(v) => setConstraints(c => ({ ...c, duration: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any Duration</SelectItem>
                    <SelectItem value="5-15min">5-15 minutes</SelectItem>
                    <SelectItem value="15-30min">15-30 minutes</SelectItem>
                    <SelectItem value="30+min">30+ minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Activity Type</Label>
                <Select 
                  value={constraints.activityType} 
                  onValueChange={(v) => setConstraints(c => ({ ...c, activityType: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any Type</SelectItem>
                    {Object.entries(ACTIVITY_TYPES).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        {config.emoji} {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Team Size</Label>
                <Select 
                  value={constraints.teamSize} 
                  onValueChange={(v) => setConstraints(c => ({ ...c, teamSize: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any Size</SelectItem>
                    <SelectItem value="small">Small (2-5)</SelectItem>
                    <SelectItem value="medium">Medium (6-15)</SelectItem>
                    <SelectItem value="large">Large (16+)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Time Preference</Label>
                <Select 
                  value={constraints.timePreference} 
                  onValueChange={(v) => setConstraints(c => ({ ...c, timePreference: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any Time</SelectItem>
                    <SelectItem value="morning">Morning</SelectItem>
                    <SelectItem value="afternoon">Afternoon</SelectItem>
                    <SelectItem value="evening">Evening</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Event Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-int-orange" />
              Schedule Event
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label>Event Title</Label>
              <Input
                value={eventDetails.title || ''}
                onChange={(e) => setEventDetails(d => ({ ...d, title: e.target.value }))}
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={eventDetails.description || ''}
                onChange={(e) => setEventDetails(d => ({ ...d, description: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Date & Time</Label>
                <Input
                  type="datetime-local"
                  value={eventDetails.scheduled_date || ''}
                  onChange={(e) => setEventDetails(d => ({ ...d, scheduled_date: e.target.value }))}
                />
              </div>
              <div>
                <Label>Duration (minutes)</Label>
                <Input
                  type="number"
                  value={eventDetails.duration || 30}
                  onChange={(e) => setEventDetails(d => ({ ...d, duration: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Max Participants</Label>
                <Input
                  type="number"
                  value={eventDetails.max_participants || 20}
                  onChange={(e) => setEventDetails(d => ({ ...d, max_participants: e.target.value }))}
                />
              </div>
              <div>
                <Label>Format</Label>
                <Select 
                  value={eventDetails.event_format || 'online'} 
                  onValueChange={(v) => setEventDetails(d => ({ ...d, event_format: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="offline">In-Person</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Additional Instructions (Optional)</Label>
              <Textarea
                value={eventDetails.custom_instructions || ''}
                onChange={(e) => setEventDetails(d => ({ ...d, custom_instructions: e.target.value }))}
                placeholder="Any special instructions for participants..."
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateEvent}
              disabled={createEventMutation.isPending}
              className="bg-gradient-orange hover:opacity-90 text-white"
            >
              {createEventMutation.isPending ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              Create Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}