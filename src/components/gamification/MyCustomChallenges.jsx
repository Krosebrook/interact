/**
 * My Custom Challenges
 * View and manage user-created challenges
 */

import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Plus, Target, Calendar, TrendingUp, Users } from 'lucide-react';
import CustomChallengeCreator from './CustomChallengeCreator';
import LoadingSpinner from '../common/LoadingSpinner';
import { motion } from 'framer-motion';

export default function MyCustomChallenges({ userEmail }) {
  const [showCreator, setShowCreator] = useState(false);

  const { data: challenges, isLoading } = useQuery({
    queryKey: ['personal-challenges', userEmail],
    queryFn: () =>
      base44.entities.PersonalChallenge.filter({
        $or: [
          { created_by: userEmail },
          { participants: userEmail }
        ]
      }),
    enabled: !!userEmail
  });

  const activeChallenges = challenges?.filter(c => c.status === 'active') || [];
  const completedChallenges = challenges?.filter(c => c.status === 'completed') || [];

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">My Custom Challenges</h2>
          <p className="text-sm text-slate-600">Create personal goals and track your progress</p>
        </div>
        <Button onClick={() => setShowCreator(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Challenge
        </Button>
      </div>

      {/* Active Challenges */}
      {activeChallenges.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-slate-900">Active Challenges</h3>
          <div className="grid gap-4">
            {activeChallenges.map((challenge) => (
              <ChallengeCard key={challenge.id} challenge={challenge} />
            ))}
          </div>
        </div>
      )}

      {/* Completed Challenges */}
      {completedChallenges.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-slate-900">Completed Challenges</h3>
          <div className="grid gap-4">
            {completedChallenges.map((challenge) => (
              <ChallengeCard key={challenge.id} challenge={challenge} completed />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {activeChallenges.length === 0 && completedChallenges.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="pt-12 pb-12 text-center">
            <Target className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="font-semibold text-slate-900 mb-2">No Custom Challenges Yet</h3>
            <p className="text-sm text-slate-600 mb-4">
              Create your own challenges to track personal goals
            </p>
            <Button onClick={() => setShowCreator(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Your First Challenge
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Creator Dialog */}
      <CustomChallengeCreator
        open={showCreator}
        onClose={() => setShowCreator(false)}
        userEmail={userEmail}
      />
    </div>
  );
}

function ChallengeCard({ challenge, completed }) {
  const progress = Math.min(
    (challenge.target_metric.current_value / challenge.target_metric.target_value) * 100,
    100
  );

  const daysRemaining = Math.ceil(
    (new Date(challenge.end_date) - new Date()) / (1000 * 60 * 60 * 24)
  );

  const difficultyColors = {
    easy: 'bg-green-100 text-green-700',
    medium: 'bg-yellow-100 text-yellow-700',
    hard: 'bg-orange-100 text-orange-700',
    extreme: 'bg-red-100 text-red-700'
  };

  return (
    <motion.div whileHover={{ y: -2 }}>
      <Card className={completed ? 'border-green-200 bg-green-50/30' : ''}>
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-bold text-slate-900 text-lg">{challenge.challenge_name}</h3>
                <p className="text-sm text-slate-600 mt-1">{challenge.description}</p>
              </div>
              <Badge className={difficultyColors[challenge.difficulty]}>
                {challenge.difficulty}
              </Badge>
            </div>

            {/* Progress */}
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="font-medium text-slate-700">Progress</span>
                <span className="text-slate-600">
                  {challenge.target_metric.current_value} / {challenge.target_metric.target_value}
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Metadata */}
            <div className="flex items-center gap-4 text-sm text-slate-600">
              {!completed && daysRemaining > 0 && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {daysRemaining} days left
                </div>
              )}
              {challenge.is_public && (
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {challenge.participants?.length || 0} joined
                </div>
              )}
              {completed && (
                <Badge className="bg-green-100 text-green-700">
                  ✓ Completed
                </Badge>
              )}
            </div>

            {/* Self Reward */}
            {challenge.self_reward && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-sm font-medium text-amber-900">
                  🎁 Reward: {challenge.self_reward}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}