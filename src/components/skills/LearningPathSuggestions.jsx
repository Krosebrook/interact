import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useUserData } from '../hooks/useUserData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Target, Clock, CheckCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';

export default function LearningPathSuggestions() {
  const { user } = useUserData();
  const [careerGoal, setCareerGoal] = useState('');
  const [showPath, setShowPath] = useState(false);

  const { data: path, isLoading, refetch } = useQuery({
    queryKey: ['learning-path', careerGoal],
    queryFn: async () => {
      const response = await base44.functions.invoke('suggestLearningPaths', {
        user_email: user.email,
        career_goal: careerGoal
      });
      return response.data;
    },
    enabled: false
  });

  const handleGenerate = () => {
    setShowPath(true);
    refetch();
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-600" />
            Personalized Learning Path
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter your career goal or target skills..."
              value={careerGoal}
              onChange={(e) => setCareerGoal(e.target.value)}
            />
            <Button onClick={handleGenerate} disabled={isLoading || !careerGoal}>
              {isLoading ? 'Generating...' : 'Generate Path'}
            </Button>
          </div>

          {showPath && path && (
            <div className="space-y-4 mt-6">
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-purple-900">Your Learning Journey</h3>
                  <div className="flex items-center gap-2 text-sm text-purple-700">
                    <Clock className="w-4 h-4" />
                    {path.total_duration_weeks} weeks
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-purple-700 font-medium">Current Skills:</p>
                    <p className="text-purple-900">{path.current_skills?.join(', ')}</p>
                  </div>
                  <div>
                    <p className="text-purple-700 font-medium">Skill Gaps:</p>
                    <p className="text-purple-900">{path.skill_gaps?.map(g => g.skill).join(', ')}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {path.learning_path?.map((step, idx) => (
                  <Card key={idx} className="border-2 border-purple-100">
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">
                            {step.step}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-semibold text-slate-900 mb-1">{step.skill}</h4>
                              <p className="text-sm text-slate-600">{step.goal}</p>
                            </div>
                            <Badge variant="outline">
                              <Clock className="w-3 h-3 mr-1" />
                              {step.estimated_weeks}w
                            </Badge>
                          </div>

                          {step.prerequisites?.length > 0 && (
                            <div className="text-xs text-slate-500 mb-2">
                              Prerequisites: {step.prerequisites.join(', ')}
                            </div>
                          )}

                          {step.matched_resources?.length > 0 && (
                            <div className="mt-3">
                              <p className="text-xs font-medium text-slate-700 mb-2">Learning Resources:</p>
                              <div className="space-y-1">
                                {step.matched_resources.map((resource, ridx) => (
                                  <Link
                                    key={ridx}
                                    to={`${createPageUrl('KnowledgeBase')}?article=${resource.id}`}
                                    className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700"
                                  >
                                    <BookOpen className="w-3 h-3" />
                                    {resource.title}
                                    <ArrowRight className="w-3 h-3" />
                                  </Link>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {path.milestones?.length > 0 && (
                <Card className="bg-green-50 border-green-200">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Milestones to Achieve
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {path.milestones.map((milestone, idx) => (
                        <div key={idx} className="flex items-center gap-3 text-sm">
                          <span className="font-medium text-green-700">Week {milestone.week}:</span>
                          <span className="text-green-900">{milestone.achievement}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}