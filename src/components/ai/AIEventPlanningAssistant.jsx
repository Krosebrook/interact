import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Clock, Users, Calendar, MessageSquare, Lightbulb, ChevronRight, Copy } from 'lucide-react';
import { toast } from 'sonner';
import LoadingSpinner from '../common/LoadingSpinner';

export default function AIEventPlanningAssistant({ onApplySuggestions, teams = [] }) {
  const [eventGoal, setEventGoal] = useState('');
  const [teamId, setTeamId] = useState('');
  const [preferredFormat, setPreferredFormat] = useState('');
  const [suggestions, setSuggestions] = useState(null);

  const generateMutation = useMutation({
    mutationFn: async (data) => {
      const response = await base44.functions.invoke('aiEventPlanningAssistant', data);
      return response.data;
    },
    onSuccess: (data) => {
      if (data.success) {
        setSuggestions(data.suggestions);
        toast.success('AI suggestions generated!');
      }
    },
    onError: () => {
      toast.error('Failed to generate suggestions');
    }
  });

  const handleGenerate = () => {
    if (!eventGoal.trim()) {
      toast.error('Please describe your event goal');
      return;
    }

    generateMutation.mutate({
      event_goal: eventGoal,
      team_id: teamId || null,
      preferred_format: preferredFormat || null
    });
  };

  const handleApply = () => {
    if (!suggestions) return;
    
    const bestActivity = suggestions.recommended_activities[0];
    const bestTime = suggestions.optimal_times[0];
    
    onApplySuggestions({
      activity_id: bestActivity?.activity_id,
      duration_minutes: suggestions.recommended_duration,
      event_format: suggestions.recommended_format,
      custom_instructions: suggestions.event_description,
      suggested_time: bestTime,
      invitation_message: suggestions.invitation_message
    });
    
    toast.success('Suggestions applied to event form');
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <Card className="border-2 border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-600" />
          AI Event Planning Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Input Section */}
        {!suggestions && (
          <>
            <div className="space-y-2">
              <Label>What's the goal of this event?</Label>
              <Textarea
                placeholder="e.g., Team bonding for remote developers, Quarterly planning session, Wellness challenge kickoff..."
                value={eventGoal}
                onChange={(e) => setEventGoal(e.target.value)}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Target Team (Optional)</Label>
                <Select value={teamId} onValueChange={setTeamId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Company-wide" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>All Teams</SelectItem>
                    {teams.map(team => (
                      <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Format Preference</Label>
                <Select value={preferredFormat} onValueChange={setPreferredFormat}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>Any</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="offline">In-Person</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button 
              onClick={handleGenerate} 
              disabled={generateMutation.isPending}
              className="w-full bg-gradient-purple"
            >
              {generateMutation.isPending ? (
                <>
                  <LoadingSpinner size="small" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate AI Suggestions
                </>
              )}
            </Button>
          </>
        )}

        {/* Suggestions Display */}
        {suggestions && (
          <div className="space-y-4">
            {/* Recommended Activities */}
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4 text-purple-600" />
                Recommended Activities
              </h4>
              <div className="space-y-2">
                {suggestions.recommended_activities.slice(0, 3).map((activity, idx) => (
                  <div key={idx} className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-start justify-between mb-1">
                      <span className="font-medium">{activity.activity_title}</span>
                      <Badge variant="outline">{activity.estimated_duration}min</Badge>
                    </div>
                    <p className="text-sm text-slate-600">{activity.reason}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Optimal Times */}
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4 text-emerald-600" />
                Optimal Times
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {suggestions.optimal_times.slice(0, 4).map((time, idx) => (
                  <div key={idx} className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                    <div className="font-medium text-sm">{time.day_of_week}</div>
                    <div className="text-xs text-slate-600 capitalize">{time.time_of_day} ({time.specific_hour}:00)</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Suggested Collaborators */}
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <Users className="h-4 w-4 text-amber-600" />
                Suggested Roles
              </h4>
              <div className="space-y-2">
                {suggestions.suggested_collaborators.map((collab, idx) => (
                  <div key={idx} className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <div className="font-medium text-sm capitalize">{collab.role_type}</div>
                    <p className="text-xs text-slate-600">{collab.reason}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {collab.skills_needed.map((skill, i) => (
                        <Badge key={i} variant="outline" className="text-xs">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Event Description */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-blue-600" />
                  Event Description
                </h4>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => copyToClipboard(suggestions.event_description)}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-sm whitespace-pre-wrap">
                {suggestions.event_description}
              </div>
            </div>

            {/* Invitation Message */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-indigo-600" />
                  Invitation Message
                </h4>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => copyToClipboard(suggestions.invitation_message)}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200 text-sm whitespace-pre-wrap">
                {suggestions.invitation_message}
              </div>
            </div>

            {/* Suggested Participants */}
            {suggestions.suggested_participants && suggestions.suggested_participants.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <Users className="h-4 w-4 text-teal-600" />
                  Suggested Participants
                </h4>
                <div className="space-y-2">
                  {suggestions.suggested_participants.slice(0, 5).map((participant, idx) => (
                    <div key={idx} className="p-2 bg-teal-50 rounded-lg border border-teal-200 text-sm">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="font-medium">{participant.display_name || participant.email}</span>
                          {participant.matched && <Badge variant="outline" className="ml-2 text-xs">Matched</Badge>}
                        </div>
                        <Badge variant="outline" className="text-xs capitalize">{participant.role_in_event}</Badge>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">{participant.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Success Tips */}
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-yellow-600" />
                Success Tips
              </h4>
              <ul className="space-y-1">
                {suggestions.success_tips.map((tip, idx) => (
                  <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                    <ChevronRight className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button onClick={handleApply} className="flex-1 bg-purple-600 hover:bg-purple-700">
                <Sparkles className="h-4 w-4 mr-2" />
                Apply to Event Form
              </Button>
              <Button variant="outline" onClick={() => setSuggestions(null)}>
                Start Over
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}