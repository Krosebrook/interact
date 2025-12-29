import React, { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, BookOpen, Award, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function ModuleViewer({ module, userEmail, onComplete }) {
  const [quizAnswers, setQuizAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const queryClient = useQueryClient();

  // Check if module already completed
  const { data: completion } = useQuery({
    queryKey: ['module-completion', module.id, userEmail],
    queryFn: async () => {
      const completions = await base44.entities.ModuleCompletion.filter({
        user_email: userEmail,
        module_id: module.id
      });
      return completions[0];
    },
    enabled: !!userEmail && !!module.id
  });

  const completeMutation = useMutation({
    mutationFn: async ({ score }) => {
      // Create or update module completion
      if (completion) {
        return await base44.entities.ModuleCompletion.update(completion.id, {
          status: 'completed',
          completed_date: new Date().toISOString(),
          quiz_score: score,
          quiz_attempts: (completion.quiz_attempts || 0) + 1,
          points_earned: module.points_reward
        });
      } else {
        return await base44.entities.ModuleCompletion.create({
          user_email: userEmail,
          module_id: module.id,
          learning_path_id: module.learning_path_id,
          status: 'completed',
          completed_date: new Date().toISOString(),
          quiz_score: score,
          quiz_attempts: 1,
          points_earned: module.points_reward
        });
      }
    },
    onSuccess: async () => {
      // Award points
      await base44.functions.invoke('recordPointsTransaction', {
        user_email: userEmail,
        amount: module.points_reward,
        transaction_type: 'activity_completion',
        reference_type: 'LearningModule',
        reference_id: module.id,
        description: `Completed: ${module.module_name}`
      });

      queryClient.invalidateQueries(['module-completion']);
      queryClient.invalidateQueries(['user-points']);
      toast.success(`Module completed! +${module.points_reward} points 🎉`);
      
      if (onComplete) onComplete();
    }
  });

  const handleQuizSubmit = () => {
    if (module.quiz_questions?.length === 0) {
      completeMutation.mutate({ score: 100 });
      return;
    }

    const correct = module.quiz_questions.filter((q, idx) => 
      quizAnswers[idx] === q.correct_answer
    ).length;

    const score = Math.round((correct / module.quiz_questions.length) * 100);
    setQuizScore(score);
    setShowResults(true);

    if (score >= (module.passing_score || 70)) {
      completeMutation.mutate({ score });
    } else {
      toast.error(`Score too low: ${score}%. Passing score is ${module.passing_score || 70}%`);
    }
  };

  const isCompleted = completion?.status === 'completed';

  return (
    <Card className={isCompleted ? 'border-2 border-emerald-200 bg-emerald-50' : ''}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {isCompleted && <CheckCircle className="h-5 w-5 text-emerald-600" />}
              <CardTitle>{module.module_name}</CardTitle>
            </div>
            <p className="text-sm text-slate-600">{module.description}</p>
          </div>
          <div className="text-right">
            <Badge variant="outline" className="capitalize">{module.module_type}</Badge>
            <div className="flex items-center gap-1 mt-2 text-xs text-slate-600">
              <Clock className="h-3 w-3" />
              {module.estimated_time_minutes}min
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Content Link */}
        {module.content_url && (
          <a
            href={module.content_url}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-3 rounded-lg bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-900">View Content</span>
              <BookOpen className="h-4 w-4 text-blue-600" />
            </div>
          </a>
        )}

        {/* Quiz */}
        {module.quiz_questions?.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-sm">Knowledge Check</h4>
              <Badge variant="outline">
                Passing: {module.passing_score || 70}%
              </Badge>
            </div>

            {module.quiz_questions.map((question, qIdx) => (
              <div key={qIdx} className="p-4 rounded-lg bg-slate-50 border">
                <p className="font-medium text-sm mb-3">
                  {qIdx + 1}. {question.question}
                </p>
                <div className="space-y-2">
                  {question.options.map((option, oIdx) => (
                    <button
                      key={oIdx}
                      onClick={() => !showResults && setQuizAnswers({ ...quizAnswers, [qIdx]: oIdx })}
                      disabled={showResults || isCompleted}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        showResults ? (
                          oIdx === question.correct_answer ? 'bg-emerald-100 border-emerald-500' :
                          quizAnswers[qIdx] === oIdx ? 'bg-red-100 border-red-500' :
                          'bg-white border-slate-200'
                        ) : (
                          quizAnswers[qIdx] === oIdx ? 'bg-blue-100 border-blue-500' :
                          'bg-white border-slate-200 hover:bg-slate-100'
                        )
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {showResults && oIdx === question.correct_answer && (
                          <CheckCircle className="h-4 w-4 text-emerald-600" />
                        )}
                        {showResults && quizAnswers[qIdx] === oIdx && oIdx !== question.correct_answer && (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span className="text-sm">{option}</span>
                      </div>
                    </button>
                  ))}
                </div>

                {showResults && question.explanation && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs font-medium text-blue-900 mb-1">Explanation:</p>
                    <p className="text-xs text-blue-800">{question.explanation}</p>
                  </div>
                )}
              </div>
            ))}

            {!isCompleted && (
              <Button
                onClick={handleQuizSubmit}
                disabled={
                  Object.keys(quizAnswers).length < module.quiz_questions.length ||
                  showResults ||
                  completeMutation.isPending
                }
                className="w-full"
              >
                {completeMutation.isPending ? 'Submitting...' : 'Submit Quiz'}
              </Button>
            )}

            {showResults && (
              <div className={`p-4 rounded-lg border-2 ${
                quizScore >= (module.passing_score || 70) ? 
                'bg-emerald-50 border-emerald-500' : 
                'bg-red-50 border-red-500'
              }`}>
                <div className="flex items-center justify-between">
                  <p className="font-semibold">Your Score: {quizScore}%</p>
                  {quizScore >= (module.passing_score || 70) ? (
                    <Badge className="bg-emerald-600">Passed!</Badge>
                  ) : (
                    <Badge className="bg-red-600">Try Again</Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Non-quiz modules - simple completion */}
        {(!module.quiz_questions || module.quiz_questions.length === 0) && !isCompleted && (
          <Button
            onClick={() => completeMutation.mutate({ score: 100 })}
            disabled={completeMutation.isPending}
            className="w-full"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            {completeMutation.isPending ? 'Marking Complete...' : 'Mark as Complete'}
          </Button>
        )}

        {/* Completion Badge */}
        {isCompleted && (
          <div className="bg-emerald-100 border border-emerald-300 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-emerald-600" />
              <div className="flex-1">
                <p className="font-semibold text-emerald-900">Module Completed!</p>
                <div className="flex items-center gap-2 mt-1">
                  <Award className="h-4 w-4 text-emerald-700" />
                  <span className="text-sm text-emerald-800">
                    +{module.points_reward} points earned
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}