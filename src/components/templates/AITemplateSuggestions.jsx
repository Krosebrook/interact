import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Calendar, Users, BookOpen, CheckCircle, Lightbulb } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';

export default function AITemplateSuggestions({ template, onApplySeries }) {
  const suggestionsMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('aiTemplateSuggestions', {
        template_id: template.id,
        template_objective: template.description
      });
      return response.data;
    }
  });

  const suggestions = suggestionsMutation.data?.suggestions;

  return (
    <div className="space-y-4">
      {!suggestions ? (
        <Button
          onClick={() => suggestionsMutation.mutate()}
          disabled={suggestionsMutation.isPending}
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          {suggestionsMutation.isPending ? (
            <LoadingSpinner size="small" />
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Get AI Series Suggestions
            </>
          )}
        </Button>
      ) : (
        <>
          {/* Series Structure */}
          <Card className="border-2 border-purple-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                Suggested Series Structure
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {suggestions.series_structure.total_sessions}
                  </div>
                  <div className="text-xs text-slate-600">Sessions</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-sm font-bold text-purple-600 capitalize">
                    {suggestions.series_structure.recommended_cadence}
                  </div>
                  <div className="text-xs text-slate-600">Cadence</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {suggestions.series_structure.duration_weeks}
                  </div>
                  <div className="text-xs text-slate-600">Weeks</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Follow-up Events */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Follow-up Event Sequence</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {suggestions.follow_up_events?.map((event, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <Badge variant="outline" className="mb-2">Session {event.session_number}</Badge>
                        <h4 className="font-semibold text-slate-900">{event.title}</h4>
                      </div>
                      {event.activity_matched && (
                        <Badge className="bg-green-100 text-green-800">Matched</Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-700 mb-2">{event.objective}</p>
                    <div className="text-xs text-slate-600">
                      <strong>Timing:</strong> {event.timing}
                    </div>
                    {event.build_on && (
                      <div className="text-xs text-blue-700 mt-2 bg-blue-50 p-2 rounded">
                        <strong>Builds on:</strong> {event.build_on}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Resources & Collaborators */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-amber-600" />
                  Required Resources
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {suggestions.required_resources?.map((resource, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-lg text-sm">
                      <div className="font-medium capitalize">{resource.resource_type}</div>
                      <div className="text-xs text-slate-600 mt-1">{resource.description}</div>
                      <div className="text-xs text-slate-500 mt-1">📅 {resource.when_needed}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5 text-teal-600" />
                  Suggested Collaborators
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {suggestions.suggested_collaborators?.map((collab, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-lg text-sm">
                      <div className="font-medium capitalize">{collab.role}</div>
                      <div className="text-xs text-slate-600 mt-1">{collab.reason}</div>
                      <div className="flex gap-1 mt-2">
                        {collab.skills_needed?.map((skill, sidx) => (
                          <Badge key={sidx} variant="outline" className="text-xs">{skill}</Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Participant Journey */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-indigo-600" />
                Participant Journey
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-700">{suggestions.participant_journey}</p>
            </CardContent>
          </Card>

          {/* Success Indicators */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Success Indicators</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1">
                {suggestions.success_indicators?.map((indicator, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    {indicator}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}