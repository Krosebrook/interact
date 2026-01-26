import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useUserData } from '@/components/hooks/useUserData';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { AlertTriangle, TrendingUp, Users, Brain, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function PredictiveAnalytics() {
  const { user, loading: userLoading, isAdmin } = useUserData();
  const [selectedUser, setSelectedUser] = useState(null);
  const queryClient = useQueryClient();
  
  const { data: insights = [], isLoading } = useQuery({
    queryKey: ['predictiveInsights'],
    queryFn: () => base44.entities.PredictiveInsight.filter({}),
    enabled: isAdmin
  });
  
  const { data: allUsers = [] } = useQuery({
    queryKey: ['allProfiles'],
    queryFn: () => base44.entities.UserProfile.filter({}),
    enabled: isAdmin
  });
  
  const predictChurnMutation = useMutation({
    mutationFn: async (userEmail) => {
      const response = await base44.functions.invoke('predictChurnRisk', {
        userEmail,
        lookbackDays: 30
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['predictiveInsights']);
      toast.success('Churn analysis complete!');
    }
  });
  
  if (userLoading || isLoading) return <LoadingSpinner />;
  
  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600">Admin access required</p>
      </div>
    );
  }
  
  const churnInsights = insights.filter(i => i.insight_type === 'churn_risk');
  const highRisk = churnInsights.filter(i => i.risk_score >= 70);
  const mediumRisk = churnInsights.filter(i => i.risk_score >= 40 && i.risk_score < 70);
  const lowRisk = churnInsights.filter(i => i.risk_score < 40);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-int-navy">Predictive Analytics</h1>
          <p className="text-slate-600">AI-powered insights for employee engagement</p>
        </div>
        <Button
          onClick={() => {
            allUsers.forEach(profile => {
              predictChurnMutation.mutate(profile.user_email);
            });
          }}
          disabled={predictChurnMutation.isLoading}
          className="bg-int-orange hover:bg-int-orange-dark"
        >
          <Brain className="h-4 w-4 mr-2" />
          Analyze All Users
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-red-200 bg-red-50/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">High Risk</CardTitle>
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">{highRisk.length}</p>
            <p className="text-sm text-slate-600">Employees need immediate attention</p>
          </CardContent>
        </Card>
        
        <Card className="border-yellow-200 bg-yellow-50/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Medium Risk</CardTitle>
              <AlertCircle className="h-5 w-5 text-yellow-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-600">{mediumRisk.length}</p>
            <p className="text-sm text-slate-600">Monitor closely</p>
          </CardContent>
        </Card>
        
        <Card className="border-green-200 bg-green-50/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Low Risk</CardTitle>
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{lowRisk.length}</p>
            <p className="text-sm text-slate-600">Engaged employees</p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="high-risk">
        <TabsList>
          <TabsTrigger value="high-risk">High Risk ({highRisk.length})</TabsTrigger>
          <TabsTrigger value="medium-risk">Medium Risk ({mediumRisk.length})</TabsTrigger>
          <TabsTrigger value="all">All Insights ({insights.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="high-risk" className="space-y-4">
          {highRisk.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                <p className="text-slate-600">No high-risk employees detected</p>
              </CardContent>
            </Card>
          ) : (
            highRisk.map(insight => (
              <Card key={insight.id} className="border-l-4 border-l-red-500">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{insight.user_email}</CardTitle>
                      <CardDescription>
                        Risk Score: {insight.risk_score}/100 (Confidence: {Math.round(insight.confidence * 100)}%)
                      </CardDescription>
                    </div>
                    <Badge variant="destructive">High Risk</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {insight.key_indicators?.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold mb-2">Key Indicators:</p>
                      <ul className="space-y-1">
                        {insight.key_indicators.map((indicator, i) => (
                          <li key={i} className="text-sm flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${
                              indicator.severity === 'high' ? 'bg-red-500' :
                              indicator.severity === 'medium' ? 'bg-yellow-500' :
                              'bg-blue-500'
                            }`} />
                            {indicator.indicator}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {insight.recommendations?.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold mb-2">Recommended Actions:</p>
                      <ul className="space-y-2">
                        {insight.recommendations.map((rec, i) => (
                          <li key={i} className="text-sm bg-blue-50 p-2 rounded">
                            <span className="font-medium">{rec.action}</span>
                            <Badge variant="outline" className="ml-2 text-xs">{rec.priority}</Badge>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm">
                      View Profile
                    </Button>
                    <Button variant="outline" size="sm">
                      Send Intervention
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
        
        <TabsContent value="medium-risk" className="space-y-4">
          {mediumRisk.map(insight => (
            <Card key={insight.id} className="border-l-4 border-l-yellow-500">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{insight.user_email}</CardTitle>
                  <Badge className="bg-yellow-500">Medium Risk</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">Risk Score: {insight.risk_score}/100</p>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
        
        <TabsContent value="all" className="space-y-4">
          {insights.map(insight => (
            <Card key={insight.id}>
              <CardHeader>
                <CardTitle className="text-base">{insight.user_email || insight.team_id || 'General'}</CardTitle>
                <CardDescription>
                  {insight.insight_type.replace(/_/g, ' ')} - Generated {format(new Date(insight.generated_at), 'MMM d, yyyy')}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}