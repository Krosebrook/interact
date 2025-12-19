import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useUserData } from '../components/hooks/useUserData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import SurveyForm from '../components/surveys/SurveyForm';
import SurveyResults from '../components/surveys/SurveyResults';
import { FileText, Plus, BarChart3, Users, Lock } from 'lucide-react';
import { format } from 'date-fns';

/**
 * Surveys Page - Participant view of active surveys
 * Admins access survey management via Settings
 */
export default function Surveys() {
  const { user, loading } = useUserData(true);
  const [activeSurvey, setActiveSurvey] = useState(null);

  const { data: surveys = [], isLoading } = useQuery({
    queryKey: ['surveys-active'],
    queryFn: async () => {
      const all = await base44.entities.Survey.filter({ status: 'active' });
      return all.filter(s => {
        const now = new Date();
        const start = s.start_date ? new Date(s.start_date) : null;
        const end = s.end_date ? new Date(s.end_date) : null;
        
        if (start && now < start) return false;
        if (end && now > end) return false;
        
        return true;
      });
    }
  });

  const { data: myResponses = [] } = useQuery({
    queryKey: ['my-survey-responses', user?.email],
    queryFn: () => base44.entities.SurveyResponse.filter({
      respondent_email: user?.email
    }),
    enabled: !!user?.email
  });

  const completedSurveyIds = new Set(myResponses.map(r => r.survey_id));
  const availableSurveys = surveys.filter(s => !completedSurveyIds.has(s.id));
  const completedSurveys = surveys.filter(s => completedSurveyIds.has(s.id));

  if (loading) {
    return <LoadingSpinner className="min-h-[60vh]" />;
  }

  if (activeSurvey) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => setActiveSurvey(null)}
          >
            ← Back to Surveys
          </Button>
        </div>
        <SurveyForm
          survey={activeSurvey}
          userEmail={user?.email}
          onComplete={() => setActiveSurvey(null)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="glass-panel-solid">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
            <FileText className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-int-navy font-display">Pulse Surveys</h1>
            <p className="text-slate-600">Share your feedback anonymously</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Available Surveys</p>
              <p className="text-2xl font-bold text-int-navy">{availableSurveys.length}</p>
            </div>
            <FileText className="h-8 w-8 text-blue-500 opacity-20" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">{completedSurveys.length}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-green-600 opacity-20" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Anonymity</p>
              <Badge className="bg-purple-100 text-purple-700 mt-1">
                <Lock className="h-3 w-3 mr-1" />
                Protected
              </Badge>
            </div>
            <Lock className="h-8 w-8 text-purple-500 opacity-20" />
          </CardContent>
        </Card>
      </div>

      {/* Survey Lists */}
      <Tabs defaultValue="available">
        <TabsList>
          <TabsTrigger value="available">
            Available ({availableSurveys.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedSurveys.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="mt-6">
          {isLoading ? (
            <LoadingSpinner />
          ) : availableSurveys.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No surveys available"
              description="Check back soon for new pulse surveys from your team."
              type="default"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableSurveys.map(survey => (
                <Card key={survey.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{survey.title}</CardTitle>
                        <p className="text-sm text-slate-600 mt-1">{survey.description}</p>
                      </div>
                      {survey.is_anonymous && (
                        <Badge variant="outline" className="border-purple-200 text-purple-700">
                          <Lock className="h-3 w-3 mr-1" />
                          Anonymous
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Users className="h-4 w-4" />
                        {survey.response_count || 0} responses
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <FileText className="h-4 w-4" />
                        {survey.questions?.length || 0} questions
                      </div>
                      {survey.end_date && (
                        <p className="text-xs text-slate-500">
                          Closes: {format(new Date(survey.end_date), 'MMM d, yyyy')}
                        </p>
                      )}
                      <Button
                        onClick={() => setActiveSurvey(survey)}
                        className="w-full bg-int-orange hover:bg-int-orange/90"
                      >
                        Take Survey
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          {completedSurveys.length === 0 ? (
            <EmptyState
              icon={BarChart3}
              title="No completed surveys"
              description="Complete a survey to see it here."
              type="default"
              compact
            />
          ) : (
            <div className="space-y-4">
              {completedSurveys.map(survey => (
                <Card key={survey.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{survey.title}</CardTitle>
                      <Badge className="bg-green-100 text-green-700">
                        Completed
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <SurveyResults survey={survey} />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}