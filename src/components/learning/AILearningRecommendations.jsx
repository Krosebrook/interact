import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Target, TrendingUp, AlertCircle } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';
import LearningPathCard from './LearningPathCard';

export default function AILearningRecommendations({ userEmail, availablePaths }) {
  const { data: recommendations, isLoading } = useQuery({
    queryKey: ['learning-recommendations', userEmail],
    queryFn: async () => {
      const response = await base44.functions.invoke('learningPathAI', {
        action: 'suggest_paths',
        context: {}
      });
      return response.data;
    },
    enabled: !!userEmail,
    staleTime: 10 * 60 * 1000
  });

  if (isLoading) {
    return <LoadingSpinner message="Analyzing your profile..." />;
  }

  const priorityColors = {
    high: 'border-red-300 bg-red-50',
    medium: 'border-yellow-300 bg-yellow-50',
    low: 'border-blue-300 bg-blue-50'
  };

  return (
    <div className="space-y-6">
      {/* Skill Gap Analysis */}
      {recommendations?.skill_gap_analysis && (
        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-600" />
              Your Skill Development Plan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recommendations.skill_gap_analysis.identified_gaps?.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-purple-900 mb-2">Skill Gaps Identified:</p>
                <div className="flex flex-wrap gap-2">
                  {recommendations.skill_gap_analysis.identified_gaps.map((gap, i) => (
                    <Badge key={i} variant="outline" className="border-purple-400 text-purple-700">
                      {gap}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {recommendations.skill_gap_analysis.immediate_needs?.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-purple-900 mb-2">Immediate Priorities:</p>
                <ul className="text-sm text-purple-800 space-y-1">
                  {recommendations.skill_gap_analysis.immediate_needs.map((need, i) => (
                    <li key={i}>🎯 {need}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Personalized Recommendations */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-600" />
          AI-Powered Recommendations
        </h3>

        {recommendations?.recommendations?.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <AlertCircle className="h-12 w-12 mx-auto mb-3 text-slate-300" />
              <p className="text-slate-600">No recommendations available</p>
              <p className="text-sm text-slate-500 mt-1">Complete your profile to get personalized suggestions</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {recommendations?.recommendations?.map((rec, idx) => (
              <Card key={idx} className={`border-2 ${priorityColors[rec.priority]}`}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-bold text-lg">{rec.learning_path_title}</h4>
                        <Badge className={
                          rec.priority === 'high' ? 'bg-red-600' :
                          rec.priority === 'medium' ? 'bg-yellow-600' :
                          'bg-blue-600'
                        }>
                          {rec.priority} priority
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 mb-3">{rec.why_recommended}</p>
                    </div>
                    <Badge variant="outline" className="ml-3 bg-emerald-50 border-emerald-300 text-emerald-700">
                      {rec.relevance_score}% Match
                    </Badge>
                  </div>

                  {rec.expected_outcomes?.length > 0 && (
                    <div className="bg-white rounded-lg p-3 mb-3 border">
                      <p className="text-xs font-semibold text-slate-700 mb-1">Expected Outcomes:</p>
                      <ul className="text-xs text-slate-600 space-y-0.5">
                        {rec.expected_outcomes.map((outcome, i) => (
                          <li key={i}>✓ {outcome}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {rec.career_impact && (
                    <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-blue-900">Career Impact:</p>
                        <p className="text-xs text-blue-800">{rec.career_impact}</p>
                      </div>
                    </div>
                  )}

                  {rec.path && (
                    <div className="mt-4 pt-4 border-t">
                      <LearningPathCard
                        path={rec.path}
                        userEmail={userEmail}
                        isEnrolled={false}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}