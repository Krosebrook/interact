import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import DynamicDifficultyBadge from './DynamicDifficultyBadge';
import { Trophy, Target, Calendar, Users, Zap, BookOpen } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const DIFFICULTY_COLORS = {
  beginner: 'bg-green-100 text-green-800',
  intermediate: 'bg-yellow-100 text-yellow-800',
  advanced: 'bg-orange-100 text-orange-800',
  expert: 'bg-red-100 text-red-800'
};

const TYPE_ICONS = {
  skill: Target,
  activity: Zap,
  learning: BookOpen,
  wellness: '💪',
  social: Users,
  contribution: Trophy
};

export default function ChallengeCard({ challenge, isParticipating, userEmail, readOnly = false }) {
  const queryClient = useQueryClient();

  const joinChallengeMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.ChallengeParticipation.create({
        challenge_id: challenge.id,
        user_email: userEmail,
        joined_date: new Date().toISOString(),
        status: 'active'
      });
      
      await base44.entities.Challenge.update(challenge.id, {
        participation_count: (challenge.participation_count || 0) + 1
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['challenges']);
      queryClient.invalidateQueries(['my-participations']);
      toast.success('Joined challenge!');
    },
    onError: () => toast.error('Failed to join challenge')
  });

  const Icon = TYPE_ICONS[challenge.challenge_type] || Target;
  const isExpired = new Date(challenge.end_date) < new Date();

  return (
    <Card className={`border-2 ${isParticipating ? 'border-int-orange' : 'border-slate-200'}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="flex items-center gap-2">
            {typeof Icon === 'string' ? (
              <span className="text-2xl">{Icon}</span>
            ) : (
              <Icon className="h-5 w-5 text-int-orange" />
            )}
            {challenge.title}
          </CardTitle>
          <DynamicDifficultyBadge challenge={challenge} />
        </div>
        {challenge.skill_category && (
          <Badge variant="outline" className="w-fit">
            {challenge.skill_category}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-slate-700">{challenge.description}</p>

        {/* Target Metric */}
        {challenge.target_metric && (
          <div className="p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-600">Goal</span>
              <span className="text-sm font-bold">
                {challenge.target_metric.target_value} {challenge.target_metric.unit}
              </span>
            </div>
          </div>
        )}

        {/* Requirements */}
        {challenge.requirements?.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-700">Requirements:</p>
            <ul className="text-xs text-slate-600 space-y-0.5">
              {challenge.requirements.map((req, idx) => (
                <li key={idx}>✓ {req}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {challenge.participation_count || 0} participants
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Ends {format(new Date(challenge.end_date), 'MMM d')}
          </div>
        </div>

        {/* Reward */}
        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-int-orange/10 to-purple-500/10 rounded-lg border border-int-orange/20">
          <span className="text-sm font-medium">Reward</span>
          <Badge className="bg-int-orange text-white">
            +{challenge.points_reward} points
          </Badge>
        </div>

        {/* Action Button */}
        {!readOnly && !isExpired && (
          <Button
            onClick={() => joinChallengeMutation.mutate()}
            disabled={isParticipating || joinChallengeMutation.isPending}
            className={isParticipating ? 'bg-green-600 hover:bg-green-700' : 'bg-int-orange hover:bg-[#C46322]'}
            fullWidth
          >
            {isParticipating ? 'Participating' : 'Join Challenge'}
          </Button>
        )}

        {isExpired && (
          <Badge variant="outline" className="w-full justify-center">
            Challenge Ended
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}