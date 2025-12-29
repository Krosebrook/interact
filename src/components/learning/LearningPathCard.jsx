import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Clock, Target, Award, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../../utils';

export default function LearningPathCard({ path, userEmail, isEnrolled, progress }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const enrollMutation = useMutation({
    mutationFn: async () => {
      return await base44.entities.LearningPathProgress.create({
        user_email: userEmail,
        learning_path_id: path.id,
        status: 'in_progress',
        started_date: new Date().toISOString(),
        progress_percentage: 0
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['my-learning-progress']);
      toast.success('Enrolled! Let\'s start learning 🎓');
      navigate(createPageUrl(`LearningPath?id=${path.id}`));
    }
  });

  const difficultyColors = {
    beginner: 'bg-green-100 text-green-800',
    intermediate: 'bg-yellow-100 text-yellow-800',
    advanced: 'bg-orange-100 text-orange-800',
    expert: 'bg-red-100 text-red-800'
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h4 className="font-bold text-lg text-int-navy mb-1">{path.title}</h4>
            <p className="text-sm text-slate-600 line-clamp-2">{path.description}</p>
          </div>
          {isEnrolled && progress && (
            <Badge className="bg-emerald-100 text-emerald-800 ml-3">
              {Math.round(progress.progress_percentage || 0)}%
            </Badge>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <Badge className={difficultyColors[path.difficulty_level]}>
            {path.difficulty_level}
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Target className="h-3 w-3" />
            {path.target_skill}
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {path.estimated_duration}
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Award className="h-3 w-3" />
            {path.points_reward} pts
          </Badge>
        </div>

        {path.learning_outcomes?.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <p className="text-xs font-semibold text-blue-900 mb-1">You'll Learn:</p>
            <ul className="text-xs text-blue-800 space-y-0.5">
              {path.learning_outcomes.slice(0, 3).map((outcome, i) => (
                <li key={i}>✓ {outcome}</li>
              ))}
            </ul>
          </div>
        )}

        {isEnrolled ? (
          <Button
            onClick={() => navigate(createPageUrl(`LearningPath?id=${path.id}`))}
            className="w-full"
            variant="outline"
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Continue Learning
          </Button>
        ) : (
          <Button
            onClick={() => enrollMutation.mutate()}
            disabled={enrollMutation.isPending}
            className="w-full"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            {enrollMutation.isPending ? 'Enrolling...' : 'Enroll Now'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}