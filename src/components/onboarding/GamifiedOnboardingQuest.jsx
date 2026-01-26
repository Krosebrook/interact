import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Circle, Award, Sparkles, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import SwipeableListItem from '../mobile/SwipeableListItem';

const ONBOARDING_TASKS = [
  {
    id: 'profile_setup',
    title: 'Complete Your Profile',
    description: 'Add your name, role, and department',
    points: 100,
    icon: '👤',
    checkFn: (profile) => profile?.role && profile?.department
  },
  {
    id: 'profile_picture',
    title: 'Upload Profile Picture',
    description: 'Add a photo to personalize your profile',
    points: 50,
    icon: '📸',
    checkFn: (profile) => !!profile?.profile_picture_url
  },
  {
    id: 'bio_completed',
    title: 'Write Your Bio',
    description: 'Tell your team about yourself',
    points: 50,
    icon: '✍️',
    checkFn: (profile) => profile?.bio?.length > 20
  },
  {
    id: 'skills_added',
    title: 'Add Your Skills',
    description: 'List at least 3 professional skills',
    points: 75,
    icon: '🎯',
    checkFn: (profile) => profile?.skills?.length >= 3
  },
  {
    id: 'first_recognition',
    title: 'Send Your First Recognition',
    description: 'Give a shoutout to a colleague',
    points: 150,
    icon: '❤️',
    checkFn: (recognitions) => recognitions?.length > 0
  },
  {
    id: 'first_event_registration',
    title: 'Register for an Event',
    description: 'Join your first team activity',
    points: 100,
    icon: '📅',
    checkFn: (participations) => participations?.length > 0
  },
  {
    id: 'team_joined',
    title: 'Join a Team',
    description: 'Become part of a team',
    points: 75,
    icon: '👥',
    checkFn: (memberships) => memberships?.length > 0
  }
];

export default function GamifiedOnboardingQuest({ userEmail }) {
  const queryClient = useQueryClient();
  const [completedTasks, setCompletedTasks] = useState(new Set());
  
  const { data: profile } = useQuery({
    queryKey: ['userProfile', userEmail],
    queryFn: () => base44.entities.UserProfile.filter({ user_email: userEmail }),
    select: (data) => data[0]
  });
  
  const { data: recognitions } = useQuery({
    queryKey: ['recognitions', userEmail],
    queryFn: () => base44.entities.Recognition.filter({ sender_email: userEmail })
  });
  
  const { data: participations } = useQuery({
    queryKey: ['participations', userEmail],
    queryFn: () => base44.entities.Participation.filter({ user_email: userEmail })
  });
  
  const { data: memberships } = useQuery({
    queryKey: ['teamMemberships', userEmail],
    queryFn: () => base44.entities.TeamMembership.filter({ user_email: userEmail })
  });
  
  const awardPointsMutation = useMutation({
    mutationFn: async (taskType) => {
      const response = await base44.functions.invoke('awardOnboardingPoints', {
        taskType
      });
      return response.data;
    },
    onSuccess: (data, taskType) => {
      setCompletedTasks(prev => new Set([...prev, taskType]));
      queryClient.invalidateQueries(['userPoints']);
      
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      
      toast.success(`Quest Complete! +${data.pointsAwarded} points`, {
        description: data.badgesEarned?.length > 0 ? `Badge earned: ${data.badgesEarned[0]}` : undefined
      });
    }
  });
  
  useEffect(() => {
    ONBOARDING_TASKS.forEach(task => {
      let isComplete = false;
      
      switch (task.id) {
        case 'profile_setup':
        case 'profile_picture':
        case 'bio_completed':
        case 'skills_added':
          isComplete = task.checkFn(profile);
          break;
        case 'first_recognition':
          isComplete = task.checkFn(recognitions);
          break;
        case 'first_event_registration':
          isComplete = task.checkFn(participations);
          break;
        case 'team_joined':
          isComplete = task.checkFn(memberships);
          break;
      }
      
      if (isComplete && !completedTasks.has(task.id)) {
        awardPointsMutation.mutate(task.id);
      }
    });
  }, [profile, recognitions, participations, memberships]);
  
  const tasksCompleted = ONBOARDING_TASKS.filter(task => {
    switch (task.id) {
      case 'profile_setup':
      case 'profile_picture':
      case 'bio_completed':
      case 'skills_added':
        return task.checkFn(profile);
      case 'first_recognition':
        return task.checkFn(recognitions);
      case 'first_event_registration':
        return task.checkFn(participations);
      case 'team_joined':
        return task.checkFn(memberships);
      default:
        return false;
    }
  }).length;
  
  const totalPoints = ONBOARDING_TASKS.reduce((sum, task) => sum + task.points, 0);
  const earnedPoints = ONBOARDING_TASKS.filter(task => completedTasks.has(task.id))
    .reduce((sum, task) => sum + task.points, 0);
  
  const progressPercentage = (tasksCompleted / ONBOARDING_TASKS.length) * 100;
  
  return (
    <Card className="border-2 border-int-orange/20 bg-gradient-to-br from-int-orange/5 to-transparent">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-int-orange" />
            Onboarding Quest
          </CardTitle>
          <Badge className="bg-int-gold text-white">
            {earnedPoints} / {totalPoints} pts
          </Badge>
        </div>
        <Progress value={progressPercentage} className="mt-2" />
        <p className="text-sm text-slate-600 mt-2">
          {tasksCompleted} of {ONBOARDING_TASKS.length} tasks complete
        </p>
      </CardHeader>
      <CardContent className="space-y-2">
        {ONBOARDING_TASKS.map(task => {
          let isComplete = false;
          
          switch (task.id) {
            case 'profile_setup':
            case 'profile_picture':
            case 'bio_completed':
            case 'skills_added':
              isComplete = task.checkFn(profile);
              break;
            case 'first_recognition':
              isComplete = task.checkFn(recognitions);
              break;
            case 'first_event_registration':
              isComplete = task.checkFn(participations);
              break;
            case 'team_joined':
              isComplete = task.checkFn(memberships);
              break;
          }
          
          return (
            <SwipeableListItem
              key={task.id}
              showComplete={!isComplete}
              showDelete={false}
              onComplete={() => toast.info('Complete this task to earn points!')}
            >
              <div
                className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                  isComplete ? 'bg-green-50 border border-green-200' : 'bg-white border border-slate-200'
                }`}
              >
                <div className="text-2xl">{task.icon}</div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{task.title}</p>
                  <p className="text-xs text-slate-500">{task.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    +{task.points}
                  </Badge>
                  {isComplete ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <Circle className="h-5 w-5 text-slate-300" />
                  )}
                </div>
              </div>
            </SwipeableListItem>
          );
        })}
        
        {progressPercentage === 100 && (
          <div className="mt-4 p-4 bg-gradient-to-r from-int-orange to-int-gold rounded-lg text-white text-center">
            <Trophy className="h-8 w-8 mx-auto mb-2" />
            <p className="font-bold">Quest Complete! 🎉</p>
            <p className="text-sm opacity-90">You've earned the "Quick Learner" badge!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}