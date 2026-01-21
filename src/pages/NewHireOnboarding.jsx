import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useUserData } from '../components/hooks/useUserData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Rocket, Users, BookOpen, Target } from 'lucide-react';
import TaskChecklist from '../components/onboarding/TaskChecklist';
import ProgressTracker from '../components/onboarding/ProgressTracker';
import LearningPathSuggestions from '../components/skills/LearningPathSuggestions';

export default function NewHireOnboarding() {
  const { user } = useUserData();
  const [selectedWeek, setSelectedWeek] = useState(null);

  const { data: myPlan } = useQuery({
    queryKey: ['my-onboarding-plan', user?.email],
    queryFn: async () => {
      const plans = await base44.entities.OnboardingPlan.filter({ new_hire_email: user.email });
      return plans[0] || null;
    },
    enabled: !!user
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['onboarding-tasks', myPlan?.id],
    queryFn: async () => await base44.entities.OnboardingTask.filter({ plan_id: myPlan.id }),
    enabled: !!myPlan
  });

  const { data: teamMembers = [] } = useQuery({
    queryKey: ['team-introductions', myPlan?.team_introductions],
    queryFn: async () => {
      if (!myPlan?.team_introductions?.length) return [];
      const profiles = await base44.entities.UserProfile.list();
      return profiles.filter(p => myPlan.team_introductions.includes(p.user_email));
    },
    enabled: !!myPlan?.team_introductions?.length
  });

  if (!myPlan) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="py-12 text-center">
            <Rocket className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Welcome to Intinc!</h2>
            <p className="text-slate-600">
              Your onboarding plan is being prepared. Check back soon!
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-gradient-orange flex items-center justify-center">
          <Rocket className="w-8 h-8 text-white" />
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-slate-900">Welcome, {user.full_name}!</h1>
          <p className="text-slate-600">{myPlan.role} • {myPlan.department}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <Tabs defaultValue="tasks">
            <TabsList>
              <TabsTrigger value="tasks">My Tasks</TabsTrigger>
              <TabsTrigger value="team">Meet the Team</TabsTrigger>
              <TabsTrigger value="learning">Learning Path</TabsTrigger>
            </TabsList>

            <TabsContent value="tasks" className="space-y-4">
              <div className="flex gap-2 mb-4">
                <Button
                  variant={selectedWeek === null ? 'default' : 'outline'}
                  onClick={() => setSelectedWeek(null)}
                  size="sm"
                >
                  All Weeks
                </Button>
                {Array.from({ length: myPlan.duration_weeks }, (_, i) => i + 1).map(week => (
                  <Button
                    key={week}
                    variant={selectedWeek === week ? 'default' : 'outline'}
                    onClick={() => setSelectedWeek(week)}
                    size="sm"
                  >
                    Week {week}
                  </Button>
                ))}
              </div>
              <TaskChecklist tasks={tasks} weekFilter={selectedWeek} canEdit={true} />
            </TabsContent>

            <TabsContent value="team">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    Your Team
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {teamMembers.map(member => (
                      <div key={member.user_email} className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                        <div className="h-12 w-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                          {member.user_email.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-900">{member.user_email}</h4>
                          <p className="text-sm text-slate-600">{member.role} • {member.department}</p>
                        </div>
                        <Button size="sm" variant="outline">Schedule 1:1</Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="learning">
              <LearningPathSuggestions />
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <ProgressTracker plan={myPlan} tasks={tasks} />
        </div>
      </div>
    </div>
  );
}