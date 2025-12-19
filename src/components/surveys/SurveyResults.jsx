import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertTriangle, Lock, TrendingUp, Users } from 'lucide-react';

const CHART_COLORS = ['#D97230', '#14294D', '#8B5CF6', '#10B981', '#F59E0B', '#EC4899'];

/**
 * SurveyResults - Display aggregated survey results with anonymization
 * Only shows results if minimum threshold is met
 */
export default function SurveyResults({ survey }) {
  const { data: responses = [], isLoading } = useQuery({
    queryKey: ['survey-responses', survey.id],
    queryFn: () => base44.entities.SurveyResponse.filter({ survey_id: survey.id })
  });

  const meetsThreshold = responses.length >= (survey.anonymization_threshold || 5);

  const aggregatedData = useMemo(() => {
    if (!meetsThreshold) return [];

    return survey.questions.map(question => {
      const questionResponses = responses
        .map(r => r.responses.find(res => res.question_id === question.id))
        .filter(Boolean);

      if (question.question_type === 'rating' || question.question_type === 'scale') {
        const values = questionResponses.map(r => r.answer).filter(v => typeof v === 'number');
        const average = values.length > 0 ? values.reduce((sum, v) => sum + v, 0) / values.length : 0;
        
        // Distribution
        const distribution = {};
        values.forEach(v => {
          distribution[v] = (distribution[v] || 0) + 1;
        });

        return {
          question,
          type: 'numeric',
          average: average.toFixed(1),
          distribution: Object.entries(distribution).map(([value, count]) => ({
            name: value,
            value: count
          })).sort((a, b) => Number(a.name) - Number(b.name))
        };
      }

      if (question.question_type === 'multiple_choice' || question.question_type === 'yes_no') {
        const distribution = {};
        questionResponses.forEach(r => {
          const answer = r.answer?.toString() || 'No response';
          distribution[answer] = (distribution[answer] || 0) + 1;
        });

        return {
          question,
          type: 'categorical',
          distribution: Object.entries(distribution).map(([name, value]) => ({
            name: name === 'true' ? 'Yes' : name === 'false' ? 'No' : name,
            value
          }))
        };
      }

      if (question.question_type === 'text') {
        const textResponses = questionResponses.map(r => r.answer).filter(Boolean);
        return {
          question,
          type: 'text',
          responseCount: textResponses.length,
          // Don't show individual text responses for anonymity
          themes: [] // Could add AI sentiment/theme analysis here
        };
      }

      return null;
    }).filter(Boolean);
  }, [survey, responses, meetsThreshold]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-slate-500">Loading results...</div>
        </CardContent>
      </Card>
    );
  }

  if (!meetsThreshold) {
    return (
      <Alert className="border-amber-200 bg-amber-50">
        <Lock className="h-5 w-5 text-amber-600" />
        <AlertDescription className="text-amber-900">
          <strong>Results Hidden for Anonymity</strong>
          <br />
          Survey results will be visible once {survey.anonymization_threshold || 5} or more responses are received.
          Current responses: {responses.length}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Responses</p>
                <p className="text-2xl font-bold text-int-navy">{responses.length}</p>
              </div>
              <Users className="h-8 w-8 text-int-orange opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Completion Rate</p>
                <p className="text-2xl font-bold text-green-600">
                  {survey.completion_rate ? `${survey.completion_rate}%` : 'N/A'}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Status</p>
                <Badge className={survey.status === 'active' ? 'bg-green-600' : 'bg-slate-600'}>
                  {survey.status}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Question Results */}
      {aggregatedData.map((data, idx) => (
        <Card key={idx}>
          <CardHeader>
            <CardTitle className="text-lg">{data.question.question_text}</CardTitle>
          </CardHeader>
          <CardContent>
            {data.type === 'numeric' && (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-slate-600 mb-1">Average Rating</p>
                  <p className="text-4xl font-bold text-int-orange">{data.average}</p>
                  <p className="text-sm text-slate-500">out of {data.question.scale_max || 5}</p>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={data.distribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#D97230" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {data.type === 'categorical' && (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.distribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {data.distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}

            {data.type === 'text' && (
              <div className="text-center py-4">
                <p className="text-slate-600">
                  {data.responseCount} text responses received
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  Individual responses are kept confidential for anonymity
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}