import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Target, Lightbulb, Calendar } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';
import { motion } from 'framer-motion';

export default function SkillProgressAnalyzer({ 
  userEmail, 
  completedTasks, 
  skillInterests,
  daysSinceStart 
}) {
  const { data: analysis, isLoading } = useQuery({
    queryKey: ['skill-progress', userEmail, completedTasks?.length],
    queryFn: async () => {
      const response = await base44.functions.invoke('newEmployeeOnboardingAI', {
        action: 'skill_progress_analysis',
        context: {
          completed_tasks: completedTasks || [],
          skill_interests: skillInterests || [],
          days_since_start: daysSinceStart || 0
        }
      });
      return response.data;
    },
    enabled: !!userEmail && completedTasks?.length > 0,
    staleTime: 30 * 60 * 1000
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12">
          <LoadingSpinner message="Analyzing your skill development..." />
        </CardContent>
      </Card>
    );
  }

  if (!analysis?.analysis) return null;

  const progressData = analysis.analysis;

  return (
    <Card className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50/50 to-teal-50/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center">
            <TrendingUp className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-base">Your Skill Development</p>
            <p className="text-xs font-normal text-slate-500">AI-powered progress tracking</p>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Developing Skills */}
        <div>
          <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-600" />
            Skills You're Building
          </h4>
          <div className="space-y-3">
            {progressData.developing_skills?.map((skill, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-lg p-3 border border-emerald-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm text-slate-900">{skill.skill}</span>
                  <Badge className="bg-emerald-100 text-emerald-800 capitalize">
                    {skill.current_level}
                  </Badge>
                </div>
                <p className="text-xs text-slate-600 mb-2">
                  <strong>Evidence:</strong> {skill.evidence}
                </p>
                <Progress 
                  value={
                    skill.current_level === 'beginner' ? 25 :
                    skill.current_level === 'intermediate' ? 50 :
                    skill.current_level === 'advanced' ? 75 : 100
                  } 
                  className="h-2"
                />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Skill Gaps */}
        {progressData.skill_gaps?.length > 0 && (
          <div>
            <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Target className="h-4 w-4 text-amber-600" />
              Areas to Focus Next
            </h4>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <ul className="space-y-1">
                {progressData.skill_gaps.map((gap, idx) => (
                  <li key={idx} className="text-sm text-amber-900">• {gap}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Recommended Activities */}
        {progressData.recommended_activities?.length > 0 && (
          <div>
            <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-blue-600" />
              Recommended Activities
            </h4>
            <div className="space-y-2">
              {progressData.recommended_activities.map((activity, idx) => (
                <div key={idx} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-start justify-between mb-1">
                    <p className="font-medium text-sm text-blue-900">{activity.activity}</p>
                    <Badge variant="outline" className="text-xs">
                      {activity.time_to_complete}
                    </Badge>
                  </div>
                  <p className="text-xs text-blue-800">
                    <strong>Develops:</strong> {activity.target_skill}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Timeline & Strategy */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-4 w-4 text-purple-600" />
            <h4 className="font-semibold text-purple-900">Your Development Path</h4>
          </div>
          <p className="text-sm text-purple-800 mb-2">
            <strong>Timeline:</strong> {progressData.timeline_to_proficiency}
          </p>
          <p className="text-sm text-purple-800">
            {progressData.development_strategy}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}