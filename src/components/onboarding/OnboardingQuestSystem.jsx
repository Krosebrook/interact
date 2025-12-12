/**
 * ONBOARDING QUEST SYSTEM
 * Gamified quest tracking with rewards
 */

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  Star, 
  Target, 
  CheckCircle2, 
  Lock,
  Gift,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

// Quest definitions
const ONBOARDING_QUESTS = {
  admin: [
    {
      id: 'profile-complete',
      title: 'Setup Your Profile',
      description: 'Add a profile picture and bio',
      points: 50,
      badge_id: 'profile-master',
      validation: (data) => data.profile?.avatar_url && data.profile?.bio,
      icon: 'user'
    },
    {
      id: 'first-event',
      title: 'Schedule First Event',
      description: 'Create your first team activity',
      points: 100,
      badge_id: 'event-creator',
      validation: (data) => data.events?.length > 0,
      icon: 'calendar'
    },
    {
      id: 'first-team',
      title: 'Create a Team',
      description: 'Organize your first team',
      points: 75,
      validation: (data) => data.teams?.length > 0,
      icon: 'users'
    },
    {
      id: 'gamification-setup',
      title: 'Configure Gamification',
      description: 'Set up badges and rewards',
      points: 150,
      badge_id: 'game-master',
      validation: (data) => data.badges?.length > 0 || data.rewards?.length > 0,
      icon: 'trophy'
    },
    {
      id: 'view-analytics',
      title: 'Check Analytics',
      description: 'Review engagement metrics',
      points: 50,
      validation: (data) => data.analytics_viewed === true,
      icon: 'chart'
    }
  ],
  participant: [
    {
      id: 'profile-setup',
      title: 'Complete Your Profile',
      description: 'Add your preferences and interests',
      points: 50,
      badge_id: 'profile-master',
      validation: (data) => data.profile?.activity_preferences?.preferred_types?.length >= 3,
      icon: 'user'
    },
    {
      id: 'first-rsvp',
      title: 'Join Your First Event',
      description: 'RSVP to an upcoming activity',
      points: 100,
      badge_id: 'early-adopter',
      validation: (data) => data.participations?.length > 0,
      icon: 'calendar'
    },
    {
      id: 'give-recognition',
      title: 'Send Recognition',
      description: 'Celebrate a teammate',
      points: 75,
      badge_id: 'team-player',
      validation: (data) => data.recognitions_sent?.length > 0,
      icon: 'heart'
    },
    {
      id: 'join-channel',
      title: 'Join a Channel',
      description: 'Connect with your team',
      points: 50,
      validation: (data) => data.channels_joined?.length > 0,
      icon: 'message'
    },
    {
      id: 'complete-challenge',
      title: 'Accept a Challenge',
      description: 'Start your first personal challenge',
      points: 100,
      badge_id: 'challenger',
      validation: (data) => data.challenges_accepted?.length > 0,
      icon: 'target'
    }
  ]
};

export default function OnboardingQuestSystem({ userEmail, userRole }) {
  const queryClient = useQueryClient();
  const quests = ONBOARDING_QUESTS[userRole === 'admin' ? 'admin' : 'participant'];

  // Fetch user progress data
  const { data: userData = {} } = useQuery({
    queryKey: ['onboarding-quest-data', userEmail],
    queryFn: async () => {
      const [profile, events, teams, participations, recognitions, badges] = await Promise.all([
        base44.entities.UserProfile.filter({ user_email: userEmail }),
        base44.entities.Event.filter({ facilitator_email: userEmail }),
        base44.entities.Team.list(),
        base44.entities.Participation.filter({ participant_email: userEmail }),
        base44.entities.Recognition.filter({ from_user_email: userEmail }),
        base44.entities.Badge.filter({ is_active: true })
      ]);

      return {
        profile: profile[0],
        events,
        teams,
        participations,
        recognitions_sent: recognitions,
        badges
      };
    },
    enabled: !!userEmail,
    refetchInterval: 30000 // Check progress every 30s
  });

  // Fetch quest completion status
  const { data: completedQuests = [] } = useQuery({
    queryKey: ['completed-quests', userEmail],
    queryFn: async () => {
      const userPoints = await base44.entities.UserPoints.filter({ user_email: userEmail });
      return userPoints[0]?.onboarding_quests_completed || [];
    },
    enabled: !!userEmail
  });

  // Claim quest reward
  const claimRewardMutation = useMutation({
    mutationFn: async ({ questId, points, badgeId }) => {
      // Award points
      const userPoints = await base44.entities.UserPoints.filter({ user_email: userEmail });
      if (userPoints[0]) {
        await base44.entities.UserPoints.update(userPoints[0].id, {
          total_points: (userPoints[0].total_points || 0) + points,
          available_points: (userPoints[0].available_points || 0) + points,
          lifetime_points: (userPoints[0].lifetime_points || 0) + points,
          onboarding_quests_completed: [...(userPoints[0].onboarding_quests_completed || []), questId],
          points_history: [
            ...(userPoints[0].points_history || []),
            {
              amount: points,
              reason: `Onboarding Quest: ${questId}`,
              source: 'onboarding',
              timestamp: new Date().toISOString()
            }
          ]
        });
      } else {
        await base44.entities.UserPoints.create({
          user_email: userEmail,
          total_points: points,
          available_points: points,
          lifetime_points: points,
          onboarding_quests_completed: [questId]
        });
      }

      // Award badge if applicable
      if (badgeId) {
        await base44.entities.BadgeAward.create({
          user_email: userEmail,
          badge_id: badgeId,
          awarded_date: new Date().toISOString(),
          awarded_by: 'system',
          reason: 'Onboarding quest completion'
        });
      }
    },
    onSuccess: (_, { points, questId }) => {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      
      toast.success(`Quest Complete! +${points} points earned`, {
        description: 'Keep completing quests to unlock more rewards'
      });

      queryClient.invalidateQueries(['completed-quests', userEmail]);
      queryClient.invalidateQueries(['user-points', userEmail]);
    }
  });

  // Check quest completion
  const checkQuestCompletion = (quest) => {
    if (completedQuests.includes(quest.id)) return 'completed';
    if (quest.validation(userData)) return 'claimable';
    return 'locked';
  };

  const totalQuests = quests.length;
  const completedCount = quests.filter(q => completedQuests.includes(q.id)).length;
  const progressPercent = (completedCount / totalQuests) * 100;

  const totalPoints = quests.reduce((sum, q) => {
    return completedQuests.includes(q.id) ? sum + q.points : sum;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">Onboarding Quests</CardTitle>
                <p className="text-sm text-slate-600">Complete challenges to earn rewards</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-amber-600">{completedCount}/{totalQuests}</div>
              <p className="text-xs text-slate-600">Quests Complete</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-slate-700">Overall Progress</span>
              <span className="text-slate-600">{Math.round(progressPercent)}%</span>
            </div>
            <Progress value={progressPercent} className="h-3" />
            
            <div className="flex items-center gap-4 pt-2">
              <div className="flex items-center gap-1 text-amber-600">
                <Star className="h-4 w-4 fill-current" />
                <span className="text-sm font-semibold">{totalPoints} Points Earned</span>
              </div>
              {completedCount === totalQuests && (
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                  <Trophy className="h-3 w-3 mr-1" />
                  Master Complete!
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quest List */}
      <div className="grid gap-4">
        <AnimatePresence>
          {quests.map((quest, idx) => {
            const status = checkQuestCompletion(quest);
            const isCompleted = status === 'completed';
            const isClaimable = status === 'claimable';
            const isLocked = status === 'locked';

            return (
              <motion.div
                key={quest.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card 
                  className={`relative overflow-hidden transition-all ${
                    isCompleted ? 'border-emerald-200 bg-emerald-50/50' : 
                    isClaimable ? 'border-amber-200 bg-amber-50/50 shadow-lg' : 
                    'border-slate-200 bg-white'
                  }`}
                >
                  {/* Shimmer effect for claimable */}
                  {isClaimable && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-100/50 to-transparent animate-shimmer" />
                  )}

                  <CardContent className="p-6 relative">
                    <div className="flex items-start gap-4">
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        isCompleted ? 'bg-emerald-500' :
                        isClaimable ? 'bg-amber-500 animate-pulse' :
                        'bg-slate-200'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle2 className="h-7 w-7 text-white" />
                        ) : isLocked ? (
                          <Lock className="h-7 w-7 text-slate-400" />
                        ) : (
                          <Target className="h-7 w-7 text-white" />
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-bold text-slate-900 text-lg">{quest.title}</h3>
                            <p className="text-sm text-slate-600 mt-1">{quest.description}</p>
                          </div>
                          {isCompleted && (
                            <Badge variant="success" className="bg-emerald-500">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Complete
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-4 mt-4">
                          <div className="flex items-center gap-1 text-amber-600">
                            <Star className="h-4 w-4 fill-current" />
                            <span className="text-sm font-semibold">{quest.points} Points</span>
                          </div>
                          {quest.badge_id && (
                            <div className="flex items-center gap-1 text-purple-600">
                              <Trophy className="h-4 w-4" />
                              <span className="text-sm font-semibold">Badge Reward</span>
                            </div>
                          )}
                        </div>

                        {isClaimable && (
                          <Button
                            onClick={() => claimRewardMutation.mutate({
                              questId: quest.id,
                              points: quest.points,
                              badgeId: quest.badge_id
                            })}
                            disabled={claimRewardMutation.isPending}
                            className="mt-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg"
                          >
                            <Gift className="h-4 w-4 mr-2" />
                            Claim Reward
                            <Zap className="h-4 w-4 ml-2" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Master Completion Bonus */}
      {completedCount === totalQuests && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50">
            <CardContent className="p-6 text-center">
              <Trophy className="h-12 w-12 text-purple-600 mx-auto mb-3" />
              <h3 className="text-xl font-bold text-purple-900 mb-2">
                🎉 Onboarding Master!
              </h3>
              <p className="text-slate-600 mb-4">
                You've completed all onboarding quests. You're now ready to make the most of INTeract!
              </p>
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-base px-4 py-2">
                <Star className="h-4 w-4 mr-2 fill-current" />
                +500 Bonus Points
              </Badge>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}