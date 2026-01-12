import React, { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Sparkles, Award, Target, TrendingUp, Zap, Star, 
  ChevronRight, RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

export default function PersonalizedRecommendationsEngine({ userEmail, userPoints }) {
  const queryClient = useQueryClient();

  // Fetch user's badge history
  const { data: userBadges = [] } = useQuery({
    queryKey: ['user-badges', userEmail],
    queryFn: () => base44.entities.BadgeAward.filter({ user_email: userEmail }),
    enabled: !!userEmail
  });

  // Fetch all badges
  const { data: allBadges = [] } = useQuery({
    queryKey: ['all-badges'],
    queryFn: () => base44.entities.Badge.list()
  });

  // Fetch user's challenge history
  const { data: userChallenges = [] } = useQuery({
    queryKey: ['user-challenges', userEmail],
    queryFn: () => base44.entities.PersonalChallenge.filter({ user_email: userEmail }),
    enabled: !!userEmail
  });

  // Calculate personalized recommendations
  const recommendations = useMemo(() => {
    if (!userPoints) return { badges: [], challenges: [], difficulty: 'medium' };

    const earnedBadgeIds = new Set((userPoints.badges_earned || []).map(b => b));
    const unearnedBadges = allBadges.filter(b => !earnedBadgeIds.has(b.id));

    // Calculate user's performance level
    const completedChallenges = userChallenges.filter(c => c.status === 'completed').length;
    const totalChallenges = userChallenges.length;
    const completionRate = totalChallenges > 0 ? completedChallenges / totalChallenges : 0.5;

    // Determine recommended difficulty
    let recommendedDifficulty = 'medium';
    if (completionRate > 0.8 && completedChallenges >= 5) {
      recommendedDifficulty = 'hard';
    } else if (completionRate < 0.4 || completedChallenges < 2) {
      recommendedDifficulty = 'easy';
    }

    // Score badges by relevance
    const badgeScores = unearnedBadges.map(badge => {
      let score = 0;
      const criteria = badge.award_criteria || {};

      // Check if user is close to earning this badge
      if (criteria.type === 'events_attended') {
        const progress = (userPoints.events_attended || 0) / (criteria.threshold || 1);
        score += progress > 0.5 ? 30 : progress > 0.3 ? 20 : 10;
      }
      if (criteria.type === 'feedback_submitted') {
        const progress = (userPoints.feedback_submitted || 0) / (criteria.threshold || 1);
        score += progress > 0.5 ? 30 : progress > 0.3 ? 20 : 10;
      }
      if (criteria.type === 'streak_days') {
        const progress = (userPoints.streak_days || 0) / (criteria.threshold || 1);
        score += progress > 0.7 ? 40 : progress > 0.5 ? 25 : 10;
      }
      if (criteria.type === 'points_total') {
        const progress = (userPoints.total_points || 0) / (criteria.threshold || 1);
        score += progress > 0.8 ? 50 : progress > 0.5 ? 30 : 15;
      }

      // Boost score for easier badges
      if (badge.rarity === 'common') score += 15;
      if (badge.rarity === 'uncommon') score += 10;

      // Calculate progress percentage
      let progressPercent = 0;
      if (criteria.threshold) {
        const currentValue = {
          events_attended: userPoints.events_attended,
          feedback_submitted: userPoints.feedback_submitted,
          streak_days: userPoints.streak_days,
          points_total: userPoints.total_points,
          activities_completed: userPoints.activities_completed
        }[criteria.type] || 0;
        progressPercent = Math.min(100, (currentValue / criteria.threshold) * 100);
      }

      return { ...badge, score, progressPercent };
    });

    // Sort by score and take top 5
    const topBadges = badgeScores
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    // Generate challenge recommendations
    const challengeTypes = ['events_attended', 'feedback_submitted', 'recognitions_given', 'streak_days'];
    const challengeRecommendations = challengeTypes.map(type => {
      const baseTargets = {
        easy: { events_attended: 2, feedback_submitted: 3, recognitions_given: 2, streak_days: 3 },
        medium: { events_attended: 5, feedback_submitted: 5, recognitions_given: 5, streak_days: 7 },
        hard: { events_attended: 10, feedback_submitted: 10, recognitions_given: 10, streak_days: 14 }
      };

      const target = baseTargets[recommendedDifficulty][type];
      const points = { easy: 25, medium: 50, hard: 100 }[recommendedDifficulty];

      return {
        type,
        target,
        points,
        difficulty: recommendedDifficulty,
        title: {
          events_attended: `Attend ${target} Events`,
          feedback_submitted: `Submit ${target} Feedback Forms`,
          recognitions_given: `Give ${target} Recognitions`,
          streak_days: `Maintain a ${target}-Day Streak`
        }[type]
      };
    });

    return {
      badges: topBadges,
      challenges: challengeRecommendations,
      difficulty: recommendedDifficulty,
      performanceLevel: completionRate > 0.7 ? 'high' : completionRate > 0.4 ? 'medium' : 'developing'
    };
  }, [allBadges, userPoints, userChallenges]);

  // Create personalized challenge
  const createChallengeMutation = useMutation({
    mutationFn: async (challenge) => {
      return base44.entities.PersonalChallenge.create({
        user_email: userEmail,
        title: challenge.title,
        description: `Complete this personalized challenge to earn ${challenge.points} points!`,
        challenge_type: 'weekly',
        difficulty: challenge.difficulty,
        target_metric: challenge.type,
        target_value: challenge.target,
        points_reward: challenge.points,
        status: 'active',
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        is_ai_generated: true
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['user-challenges', userEmail]);
      toast.success('Challenge created!');
    }
  });

  const difficultyColors = {
    easy: 'bg-emerald-100 text-emerald-700',
    medium: 'bg-amber-100 text-amber-700',
    hard: 'bg-red-100 text-red-700'
  };

  return (
    <div data-b44-sync="true" data-feature="gamification" data-component="personalizedrecommendationsengine" className="space-y-6">
      {/* Performance Summary */}
      <Card className="bg-gradient-to-r from-int-orange/10 to-amber-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-int-navy">Your Performance Level</h3>
              <p className="text-sm text-slate-600">
                Based on your activity, we recommend 
                <Badge className={`ml-2 ${difficultyColors[recommendations.difficulty]}`}>
                  {recommendations.difficulty}
                </Badge> 
                challenges
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-int-orange capitalize">
                {recommendations.performanceLevel}
              </p>
              <p className="text-xs text-slate-500">Performer</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommended Badges */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Award className="h-5 w-5 text-int-orange" />
            Badges Within Reach
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recommendations.badges.map((badge) => (
              <div 
                key={badge.id} 
                className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <span className="text-2xl">{badge.badge_icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{badge.badge_name}</span>
                    <Badge variant="outline" className="text-xs capitalize">{badge.rarity}</Badge>
                  </div>
                  <p className="text-xs text-slate-500">{badge.badge_description}</p>
                  <div className="mt-2">
                    <Progress value={badge.progressPercent} className="h-1.5" />
                    <p className="text-xs text-slate-400 mt-1">{badge.progressPercent.toFixed(0)}% complete</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-int-orange">+{badge.points_value || 0}</p>
                  <p className="text-xs text-slate-500">points</p>
                </div>
              </div>
            ))}
            {recommendations.badges.length === 0 && (
              <p className="text-center text-slate-500 py-4">
                🎉 Amazing! You've earned all available badges!
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Suggested Challenges */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="h-5 w-5 text-int-orange" />
            Personalized Challenges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recommendations.challenges.map((challenge, idx) => (
              <div 
                key={idx}
                className="p-4 border rounded-lg hover:border-int-orange/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-sm">{challenge.title}</h4>
                  <Badge className={difficultyColors[challenge.difficulty]}>
                    {challenge.difficulty}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-int-orange font-medium">
                    +{challenge.points} pts
                  </span>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => createChallengeMutation.mutate(challenge)}
                    disabled={createChallengeMutation.isPending}
                  >
                    <Zap className="h-3 w-3 mr-1" />
                    Start
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}