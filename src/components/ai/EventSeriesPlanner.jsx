import { useState } from 'react';
import { useMutation } from 'react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  Calendar, 
  Target, 
  CheckCircle, 
  Book,
  Clock,
  Users,
  TrendingUp,
  ChevronRight
} from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';
import { toast } from 'sonner';

export default function EventSeriesPlanner({ onApplySeries }) {
  const [objective, setObjective] = useState('');
  const [durationWeeks, setDurationWeeks] = useState('');
  const [sessionCount, setSessionCount] = useState('');

  const seriesMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('aiEventSeriesPlanner', {
        series_objective: objective,
        preferred_duration_weeks: durationWeeks ? parseInt(durationWeeks) : undefined,
        session_count_preference: sessionCount ? parseInt(sessionCount) : undefined
      });
      return response.data;
    }
  });

  const series = seriesMutation.data?.series;

  return (
    <div className="space-y-6">
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            AI Event Series Planner
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Series Objective</label>
            <Textarea
              placeholder="e.g., 'Build team leadership skills over 8 weeks'"
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Duration (weeks) - Optional</label>
              <Input
                type="number"
                placeholder="e.g., 8"
                value={durationWeeks}
                onChange={(e) => setDurationWeeks(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Session Count - Optional</label>
              <Input
                type="number"
                placeholder="e.g., 6"
                value={sessionCount}
                onChange={(e) => setSessionCount(e.target.value)}
              />
            </div>
          </div>
          <Button
            onClick={() => seriesMutation.mutate()}
            disabled={!objective || seriesMutation.isPending}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Generate Event Series
          </Button>
        </CardContent>
      </Card>

      {/* Loading State */}
      {seriesMutation.isPending && (
        <LoadingSpinner message="Designing your event series..." />
      )}

      {/* Series Results */}
      {series && (
        <div className="space-y-4">
          {/* Overview */}
          <Card className="border-2 border-purple-200 bg-purple-50">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">{series.series_name}</h2>
              <p className="text-slate-700 mb-4">{series.series_description}</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-white rounded-lg">
                  <Calendar className="h-5 w-5 mx-auto mb-1 text-purple-600" />
                  <div className="text-lg font-bold">{series.duration_weeks}</div>
                  <div className="text-xs text-slate-600">Weeks</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg">
                  <Users className="h-5 w-5 mx-auto mb-1 text-purple-600" />
                  <div className="text-lg font-bold">{series.total_sessions}</div>
                  <div className="text-xs text-slate-600">Sessions</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg">
                  <Clock className="h-5 w-5 mx-auto mb-1 text-purple-600" />
                  <div className="text-sm font-bold capitalize">{series.cadence}</div>
                  <div className="text-xs text-slate-600">Cadence</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg">
                  <TrendingUp className="h-5 w-5 mx-auto mb-1 text-purple-600" />
                  <div className="text-sm font-bold capitalize">{series.recommended_day}</div>
                  <div className="text-xs text-slate-600">Best Day</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Goals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Target className="h-5 w-5 text-blue-600" />
                Overarching Goals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {series.overarching_goals.map((goal, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    {goal}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Session Sequence */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Book className="h-5 w-5 text-green-600" />
                Session Sequence
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {series.session_sequence.map((session, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <Badge variant="outline" className="mb-2">Week {session.week_number}</Badge>
                        <h4 className="font-bold text-slate-900">{session.title}</h4>
                        <p className="text-sm text-slate-600 mt-1">{session.objective}</p>
                      </div>
                      <Badge className={session.activity_matched ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}>
                        {session.duration_minutes} min
                      </Badge>
                    </div>
                    <div className="text-xs text-slate-600 mb-2">
                      <strong>Activity:</strong> {session.suggested_activity}
                    </div>
                    {session.key_topics?.length > 0 && (
                      <div className="flex gap-1 flex-wrap mb-2">
                        {session.key_topics.map((topic, tidx) => (
                          <Badge key={tidx} variant="outline" className="text-xs">{topic}</Badge>
                        ))}
                      </div>
                    )}
                    {session.homework && (
                      <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                        <strong>Homework:</strong> {session.homework}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Success Metrics & Materials */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Success Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {series.success_metrics.map((metric, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <ChevronRight className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      {metric}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Materials Needed</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {series.materials_needed.map((material, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <ChevronRight className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                      {material}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Guidance */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Facilitator Guidance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-700">{series.facilitator_guidance}</p>
            </CardContent>
          </Card>

          {/* Apply Button */}
          <Button
            onClick={() => {
              onApplySeries?.(series);
              toast.success('Series plan applied! Create events from the sequence.');
            }}
            className="w-full bg-purple-600 hover:bg-purple-700"
            size="lg"
          >
            Apply Series Plan
          </Button>
        </div>
      )}
    </div>
  );
}