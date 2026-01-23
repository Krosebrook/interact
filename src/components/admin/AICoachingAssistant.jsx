import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Brain, 
  TrendingUp, 
  AlertCircle, 
  Target, 
  Lightbulb, 
  MessageSquare,
  Award,
  CheckCircle,
  Search,
  Sparkles
} from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';
import { toast } from 'sonner';
import BurnoutInsightsPanel from '../wellness/BurnoutInsightsPanel';

const STATUS_COLORS = {
  thriving: 'bg-green-100 text-green-800 border-green-300',
  active: 'bg-blue-100 text-blue-800 border-blue-300',
  moderate: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  at_risk: 'bg-orange-100 text-orange-800 border-orange-300',
  disengaged: 'bg-red-100 text-red-800 border-red-300'
};

const PRIORITY_COLORS = {
  immediate: 'border-l-4 border-red-500 bg-red-50',
  high: 'border-l-4 border-orange-500 bg-orange-50',
  medium: 'border-l-4 border-yellow-500 bg-yellow-50',
  low: 'border-l-4 border-blue-500 bg-blue-50'
};

export default function AICoachingAssistant() {
  const [selectedUser, setSelectedUser] = useState('');
  const [focusArea, setFocusArea] = useState('');
  const queryClient = useQueryClient();

  const { data: users } = useQuery({
    queryKey: ['all-users'],
    queryFn: async () => {
      return await base44.entities.User.list();
    }
  });

  const coachingQuery = useQuery({
    queryKey: ['coaching-recommendations', selectedUser, focusArea],
    queryFn: async () => {
      const response = await base44.functions.invoke('aiCoachingRecommendations', {
        target_user_email: selectedUser,
        focus_area: focusArea
      });
      return response.data;
    },
    enabled: !!selectedUser
  });

  if (!selectedUser) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            AI Coaching Assistant
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Select Employee</label>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an employee..." />
                </SelectTrigger>
                <SelectContent>
                  {users?.map(user => (
                    <SelectItem key={user.email} value={user.email}>
                      {user.full_name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="text-center py-8 text-slate-500">
              <Brain className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Select an employee to generate personalized coaching recommendations</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (coachingQuery.isLoading) {
    return <LoadingSpinner message="Analyzing employee engagement..." />;
  }

  const coaching = coachingQuery.data?.coaching;
  const employeeData = coachingQuery.data?.employee_data;

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Employee</label>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {users?.map(user => (
                    <SelectItem key={user.email} value={user.email}>
                      {user.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Focus Area (Optional)</label>
              <Input 
                placeholder="e.g., 'team collaboration'"
                value={focusArea}
                onChange={(e) => setFocusArea(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={() => coachingQuery.refetch()}>
                <Sparkles className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Badge className={STATUS_COLORS[coaching?.engagement_status] || ''}>
                {coaching?.engagement_status}
              </Badge>
              <p className="text-sm text-slate-600 mt-2">Engagement Status</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-900">{coaching?.risk_score || 0}</div>
              <p className="text-sm text-slate-600">Risk Score</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{employeeData?.total_points || 0}</div>
              <p className="text-sm text-slate-600">Total Points</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Badge variant="outline" className="capitalize">{employeeData?.tier}</Badge>
              <p className="text-sm text-slate-600 mt-2">Current Tier</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Strengths & Growth Areas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {coaching?.strengths?.map((strength, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  {strength}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="h-5 w-5 text-amber-600" />
              Areas for Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {coaching?.areas_for_growth?.map((area, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  {area}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Interventions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            Recommended Interventions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {coaching?.interventions?.map((intervention, idx) => (
              <div key={idx} className={`p-4 rounded-lg ${PRIORITY_COLORS[intervention.priority]}`}>
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-slate-900">{intervention.action}</h4>
                  <Badge variant="outline" className="capitalize">{intervention.priority}</Badge>
                </div>
                <p className="text-sm text-slate-700 mb-2">{intervention.rationale}</p>
                <div className="text-xs text-slate-600 bg-white bg-opacity-50 p-2 rounded">
                  <strong>Expected Outcome:</strong> {intervention.expected_outcome}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommended Activities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-blue-600" />
            Recommended Activities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {coaching?.recommended_activities?.map((activity, idx) => (
              <div key={idx} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-slate-900 mb-2">{activity.activity_name}</h4>
                <p className="text-sm text-slate-700 mb-2">{activity.reason}</p>
                <p className="text-xs text-blue-800"><strong>Benefit:</strong> {activity.expected_benefit}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Skill Gaps */}
      {coaching?.skill_gaps?.length > 0 && (
        <Card className="border-2 border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              Identified Skill Gaps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {coaching.skill_gaps.map((gap, idx) => (
                <div key={idx} className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-slate-900">{gap.skill}</h4>
                    <Badge className={
                      gap.gap_severity === 'critical' ? 'bg-red-600' :
                      gap.gap_severity === 'moderate' ? 'bg-orange-500' :
                      'bg-yellow-500'
                    }>
                      {gap.gap_severity}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-700 mb-2"><strong>Impact:</strong> {gap.impact}</p>
                  <p className="text-xs text-slate-600 bg-white p-2 rounded">
                    <strong>Path:</strong> {gap.suggested_learning_path}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Skill Development */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-purple-600" />
            Skill Development Opportunities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {coaching?.skill_development_opportunities?.map((skill, idx) => (
              <div key={idx} className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-slate-900">{skill.skill}</h4>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="capitalize">{skill.current_level}</Badge>
                    <Badge className="bg-purple-600">→ {skill.target_level}</Badge>
                  </div>
                </div>
                <p className="text-sm text-slate-700 mb-2">{skill.suggested_path}</p>
                <p className="text-xs text-purple-700 mb-2">⏱️ {skill.estimated_time}</p>
                {skill.resource_objects?.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs font-medium text-purple-800 mb-1">Matched Resources:</p>
                    <div className="space-y-1">
                      {skill.resource_objects.map((resource, ridx) => (
                        <div key={ridx} className="text-xs bg-white p-2 rounded border border-purple-200">
                          <div className="font-medium">{resource.title}</div>
                          <div className="text-slate-600">{resource.description}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Burnout Risk Analysis */}
      <BurnoutInsightsPanel teamView={true} />

      {/* Quick Wins & Talking Points */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Quick Wins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {coaching?.quick_wins?.map((win, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  {win}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageSquare className="h-5 w-5 text-indigo-600" />
              Talking Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {coaching?.talking_points?.map((point, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <MessageSquare className="h-4 w-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                  {point}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}