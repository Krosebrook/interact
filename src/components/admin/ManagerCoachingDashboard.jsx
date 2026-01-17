import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, TrendingUp, CheckCircle, AlertTriangle, Zap } from 'lucide-react';

export default function ManagerCoachingDashboard() {
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const { data: coachingInsights, isLoading } = useQuery({
    queryKey: ['coachingInsights'],
    queryFn: async () => {
      const result = await base44.asServiceRole.entities.CoachingInsight.list();
      return result;
    }
  });

  const { data: teamMembers } = useQuery({
    queryKey: ['teamMembers'],
    queryFn: () => base44.asServiceRole.entities.UserProfile.list()
  });

  const generateCoachingInsightsMutation = useMutation({
    mutationFn: async (userEmail) => {
      const response = await base44.functions.invoke('aiManagerCoachingInsights', {
        target_user_email: userEmail,
        manager_email: 'manager@company.com' // Would be current user
      });
      return response.data;
    }
  });

  const riskLevelColor = {
    none: 'bg-green-100 text-green-800',
    low: 'bg-blue-100 text-blue-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800'
  };

  const getRiskIcon = (level) => {
    switch (level) {
      case 'high': return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'medium': return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'low': return <TrendingUp className="w-5 h-5 text-blue-600" />;
      default: return <CheckCircle className="w-5 h-5 text-green-600" />;
    }
  };

  const selectedInsights = selectedEmployee
    ? coachingInsights?.filter(ci => ci.user_email === selectedEmployee)
    : [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Manager Coaching Dashboard</h1>
        <Button onClick={() => generateCoachingInsightsMutation.mutate(selectedEmployee)}>
          <Zap className="w-4 h-4 mr-2" />
          Generate Insights
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="by-employee">By Employee</TabsTrigger>
          <TabsTrigger value="high-risk">High Risk</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">High Risk Employees</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {coachingInsights?.filter(ci => ci.disengagement_risk_level === 'high').length || 0}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Coaching Points Generated</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {coachingInsights?.filter(ci => ci.insight_type === 'coaching_point').length || 0}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Development Plans Created</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {coachingInsights?.filter(ci => ci.insight_type === 'development_plan').length || 0}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="by-employee">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Team Members</CardTitle>
                  <CardDescription>Select an employee to view insights</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 max-h-96 overflow-y-auto">
                  {teamMembers?.map(member => (
                    <button
                      key={member.user_email}
                      onClick={() => setSelectedEmployee(member.user_email)}
                      className={`w-full text-left p-2 rounded transition-colors ${
                        selectedEmployee === member.user_email
                          ? 'bg-int-orange text-white'
                          : 'hover:bg-slate-100'
                      }`}
                    >
                      <p className="font-medium">{member.display_name}</p>
                      <p className="text-xs text-slate-600">{member.job_title}</p>
                    </button>
                  ))}
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2 space-y-4">
              {selectedInsights.map(insight => (
                <Card key={insight.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{insight.title}</CardTitle>
                        <CardDescription>{insight.insight_type.replace(/_/g, ' ')}</CardDescription>
                      </div>
                      {insight.disengagement_risk_level && (
                        <Badge className={riskLevelColor[insight.disengagement_risk_level]}>
                          {getRiskIcon(insight.disengagement_risk_level)}
                          <span className="ml-1">{insight.disengagement_risk_level} risk</span>
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-slate-700">{insight.description}</p>

                    {insight.performance_metrics && (
                      <div className="bg-slate-50 p-3 rounded text-sm space-y-1">
                        <p>Challenge Completion: <span className="font-medium">{insight.performance_metrics.challenge_completion_rate?.toFixed(1)}%</span></p>
                        <p>Event Attendance: <span className="font-medium">{insight.performance_metrics.event_attendance_rate?.toFixed(1)}%</span></p>
                        <p>Skill Progress: <span className="font-medium">{insight.performance_metrics.skill_progress_percentage?.toFixed(1)}%</span></p>
                      </div>
                    )}

                    {insight.recommended_coaching_points?.length > 0 && (
                      <div>
                        <h4 className="font-medium text-sm mb-2">Coaching Points:</h4>
                        <ul className="space-y-2">
                          {insight.recommended_coaching_points.map((point, idx) => (
                            <li key={idx} className="text-sm border-l-2 border-int-orange pl-3">
                              <p className="font-medium">{point.point}</p>
                              <p className="text-slate-600 text-xs">{point.suggested_action}</p>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {insight.personalized_development_plan && (
                      <div>
                        <h4 className="font-medium text-sm mb-2">Development Plan:</h4>
                        <div className="text-sm space-y-1">
                          <p><strong>Timeline:</strong> {insight.personalized_development_plan.timeline}</p>
                          <p><strong>Goals:</strong> {insight.personalized_development_plan.goals?.join(', ')}</p>
                        </div>
                      </div>
                    )}

                    <Button className="w-full mt-2" variant="outline">
                      Schedule Follow-up
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="high-risk">
          <div className="space-y-4">
            {coachingInsights
              ?.filter(ci => ['medium', 'high'].includes(ci.disengagement_risk_level))
              .map(insight => (
                <Card key={insight.id} className="border-red-200">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{insight.user_email}</CardTitle>
                        <CardDescription>Disengagement Alert</CardDescription>
                      </div>
                      <Badge className={riskLevelColor[insight.disengagement_risk_level]}>
                        {insight.disengagement_risk_level} RISK
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <h4 className="font-medium text-sm mb-2">Key Indicators:</h4>
                      <ul className="text-sm space-y-1">
                        {insight.disengagement_indicators?.map((ind, idx) => (
                          <li key={idx} className="flex items-start">
                            <span className="text-red-600 mr-2">•</span>
                            {ind}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <Button className="w-full" variant="default">
                      Initiate Support Plan
                    </Button>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}