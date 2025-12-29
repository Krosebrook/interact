import React, { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useUserData } from '../components/hooks/useUserData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  Users, 
  CheckCircle, 
  BookOpen,
  MessageCircle,
  Rocket,
  Target,
  Heart,
  Briefcase
} from 'lucide-react';
import OnboardingChatbot from '../components/onboarding/OnboardingChatbot';
import OnboardingPlanDisplay from '../components/onboarding/OnboardingPlanDisplay';
import LoadingSpinner from '../components/common/LoadingSpinner';
import AIFeedbackPanel from '../components/onboarding/AIFeedbackPanel';
import ProactiveSuggestionsWidget from '../components/onboarding/ProactiveSuggestionsWidget';
import TeamConnectionsPanel from '../components/onboarding/TeamConnectionsPanel';
import SkillProgressAnalyzer from '../components/onboarding/SkillProgressAnalyzer';
import { toast } from 'sonner';

export default function NewEmployeeOnboarding() {
  const { user, profile } = useUserData(true);
  const [activeTab, setActiveTab] = useState('welcome');
  const [onboardingData, setOnboardingData] = useState(null);
  const [completedTasks, setCompletedTasks] = useState(new Set());
  const [showFeedback, setShowFeedback] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState(null);

  const [onboardingRecord, setOnboardingRecord] = useState(null);

  // Fetch or create UserOnboarding record
  useEffect(() => {
    const fetchOnboarding = async () => {
      if (!user?.email) return;
      
      try {
        const records = await base44.entities.UserOnboarding.filter({ user_email: user.email });
        
        if (records.length > 0) {
          setOnboardingRecord(records[0]);
        } else {
          // Create new onboarding record
          const newRecord = await base44.entities.UserOnboarding.create({
            user_email: user.email,
            start_date: new Date().toISOString(),
            expected_completion_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'in_progress',
            role: user.user_type || 'participant',
            department: profile?.department || 'General'
          });
          setOnboardingRecord(newRecord);
        }
      } catch (error) {
        console.error('Error with onboarding record:', error);
        toast.error('Failed to initialize onboarding');
      }
    };
    
    fetchOnboarding();
  }, [user, profile]);

  // Check if onboarding is already completed
  useEffect(() => {
    if (profile?.onboarding_completed) {
      // Redirect to dashboard
      window.location.href = '/Dashboard';
    }
  }, [profile]);

  // Generate onboarding plan
  const planMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('newEmployeeOnboardingAI', {
        action: 'generate_plan',
        context: {
          role: user?.user_type,
          department: profile?.department
        }
      });
      return response.data;
    },
    onSuccess: (data) => {
      setOnboardingData(prev => ({ ...prev, plan: data.plan }));
    }
  });

  // Generate introductions
  const introsMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('newEmployeeOnboardingAI', {
        action: 'generate_introductions',
        context: {}
      });
      return response.data;
    },
    onSuccess: (data) => {
      setOnboardingData(prev => ({ ...prev, introductions: data.introductions, team_leaders: data.team_leaders }));
    }
  });

  // Generate tasks
  const tasksMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('newEmployeeOnboardingAI', {
        action: 'suggest_tasks',
        context: {}
      });
      return response.data;
    },
    onSuccess: (data) => {
      setOnboardingData(prev => ({ ...prev, tasks: data.tasks, upcoming_events: data.upcoming_events }));
    }
  });

  // Generate learning resources
  const resourcesMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('newEmployeeOnboardingAI', {
        action: 'learning_resources',
        context: {
          interests: profile?.skill_interests || []
        }
      });
      return response.data;
    },
    onSuccess: (data) => {
      setOnboardingData(prev => ({ ...prev, resources: data.resources }));
    }
  });

  // Generate project suggestions
  const projectsMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('newEmployeeOnboardingAI', {
        action: 'suggest_projects',
        context: {
          role: user?.user_type,
          skills: profile?.skill_interests || []
        }
      });
      return response.data;
    },
    onSuccess: (data) => {
      setOnboardingData(prev => ({ ...prev, projects: data.projects }));
    }
  });

  // Generate welcome messages
  const welcomeMessagesMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('newEmployeeOnboardingAI', {
        action: 'generate_welcome_messages',
        context: {}
      });
      return response.data;
    },
    onSuccess: (data) => {
      setOnboardingData(prev => ({ ...prev, welcome_messages: data.welcome_messages }));
    }
  });

  // Initialize onboarding
  useEffect(() => {
    if (user && !onboardingData) {
      planMutation.mutate();
      introsMutation.mutate();
      tasksMutation.mutate();
      resourcesMutation.mutate();
      projectsMutation.mutate();
      welcomeMessagesMutation.mutate();
    }
  }, [user]);

  // Task completion with AI feedback
  const feedbackMutation = useMutation({
    mutationFn: async (taskTitle) => {
      const response = await base44.functions.invoke('newEmployeeOnboardingAI', {
        action: 'task_completion_feedback',
        context: {
          task_title: taskTitle,
          completed_tasks_count: completedTasks.size + 1,
          total_tasks: totalTasks,
          user_interests: profile?.skill_interests || []
        }
      });
      return response.data;
    },
    onSuccess: (data) => {
      setCurrentFeedback(data.feedback);
      setShowFeedback(true);
    }
  });

  const toggleTask = (taskId, taskTitle) => {
    setCompletedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
        // Trigger AI feedback on task completion
        if (taskTitle) {
          feedbackMutation.mutate(taskTitle);
        }
      }
      return newSet;
    });
  };

  const totalTasks = onboardingData?.tasks?.reduce((sum, cat) => sum + cat.tasks.length, 0) || 0;
  const progress = totalTasks > 0 ? (completedTasks.size / totalTasks) * 100 : 0;

  const isLoading = planMutation.isPending || introsMutation.isPending || 
                    tasksMutation.isPending || resourcesMutation.isPending ||
                    projectsMutation.isPending || welcomeMessagesMutation.isPending;

  if (isLoading && !onboardingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner message="Preparing your personalized onboarding..." size="large" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      {/* Welcome Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-int-orange to-int-gold mb-4">
          <Rocket className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-int-navy mb-2">
          Welcome to INTeract, {user?.full_name?.split(' ')[0]}! 🎉
        </h1>
        <p className="text-lg text-slate-600">
          Your personalized onboarding journey starts here
        </p>
        
        {totalTasks > 0 && (
          <div className="max-w-md mx-auto mt-6">
            <div className="flex items-center justify-between text-sm text-slate-600 mb-2">
              <span>Onboarding Progress</span>
              <span className="font-medium">{completedTasks.size}/{totalTasks} tasks</span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>
        )}
      </div>

      {/* AI Feedback Modal */}
      <AnimatePresence>
        {showFeedback && (
          <AIFeedbackPanel 
            feedback={currentFeedback}
            onClose={() => setShowFeedback(false)}
          />
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5 mb-6">
              <TabsTrigger value="welcome" className="gap-1">
                <Sparkles className="h-4 w-4" />
                Welcome
              </TabsTrigger>
              <TabsTrigger value="plan" className="gap-1">
                <Target className="h-4 w-4" />
                Plan
              </TabsTrigger>
              <TabsTrigger value="team" className="gap-1">
                <Users className="h-4 w-4" />
                Team
              </TabsTrigger>
              <TabsTrigger value="tasks" className="gap-1">
                <CheckCircle className="h-4 w-4" />
                Tasks
              </TabsTrigger>
              <TabsTrigger value="learn" className="gap-1">
                <BookOpen className="h-4 w-4" />
                Learn
              </TabsTrigger>
            </TabsList>

            <TabsContent value="welcome">
              <WelcomeMessages messages={onboardingData?.welcome_messages} />
            </TabsContent>

            <TabsContent value="plan">
              {onboardingData?.plan && (
                <OnboardingPlanDisplay plan={onboardingData.plan} />
              )}
            </TabsContent>

            <TabsContent value="team">
              <TeamIntroductions 
                introductions={onboardingData?.introductions} 
                teamLeaders={onboardingData?.team_leaders}
              />
            </TabsContent>

            <TabsContent value="tasks">
              <TasksList 
                tasks={onboardingData?.tasks}
                completedTasks={completedTasks}
                toggleTask={toggleTask}
                upcomingEvents={onboardingData?.upcoming_events}
              />
            </TabsContent>

            <TabsContent value="learn">
              <div className="space-y-6">
                <LearningResources resources={onboardingData?.resources} />
                <StarterProjects projects={onboardingData?.projects} />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* AI Panels Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Proactive Suggestions */}
          <ProactiveSuggestionsWidget
            userEmail={user?.email}
            completedTasks={Array.from(completedTasks)}
            skillInterests={profile?.skill_interests}
            daysSinceStart={onboardingRecord ? Math.floor((Date.now() - new Date(onboardingRecord.start_date).getTime()) / (1000 * 60 * 60 * 24)) : 0}
          />

          {/* Team Connections */}
          <TeamConnectionsPanel
            userEmail={user?.email}
            skillInterests={profile?.skill_interests}
            personalityTraits={profile?.personality_traits}
            completedTasks={Array.from(completedTasks)}
          />

          {/* Skill Progress */}
          {completedTasks.size > 2 && (
            <SkillProgressAnalyzer
              userEmail={user?.email}
              completedTasks={Array.from(completedTasks)}
              skillInterests={profile?.skill_interests}
              daysSinceStart={onboardingRecord ? Math.floor((Date.now() - new Date(onboardingRecord.start_date).getTime()) / (1000 * 60 * 60 * 24)) : 0}
            />
          )}

          {/* AI Chatbot */}
          <OnboardingChatbot userName={user?.full_name} />
        </div>
        </div>
    </div>
  );
}

function TeamIntroductions({ introductions, teamLeaders }) {
  if (!introductions) {
    return <Card><CardContent className="py-12 text-center"><LoadingSpinner /></CardContent></Card>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Key People to Meet
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {introductions.map((intro, idx) => (
            <div key={idx} className="p-4 rounded-lg bg-slate-50 border">
              <h4 className="font-semibold text-int-navy mb-2">{intro.person_role}</h4>
              <p className="text-sm text-slate-700 mb-2">{intro.why_connect}</p>
              <div className="bg-white p-3 rounded border border-blue-200 mb-2">
                <p className="text-xs font-medium text-blue-700 mb-1">Icebreaker:</p>
                <p className="text-sm italic text-slate-600">"{intro.icebreaker}"</p>
              </div>
              <p className="text-xs text-slate-500">{intro.context}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {teamLeaders && teamLeaders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Available Team Leaders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {teamLeaders.map((leader, idx) => (
                <div key={idx} className="flex items-center gap-3 p-2 rounded hover:bg-slate-50">
                  <div className="w-10 h-10 rounded-full bg-int-orange text-white flex items-center justify-center font-medium">
                    {leader.name?.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{leader.name}</p>
                    <p className="text-xs text-slate-500">{leader.email}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function TasksList({ tasks, completedTasks, toggleTask, upcomingEvents }) {
  if (!tasks) {
    return <Card><CardContent className="py-12 text-center"><LoadingSpinner /></CardContent></Card>;
  }

  return (
    <div className="space-y-4">
      {tasks.map((category, catIdx) => (
        <Card key={catIdx}>
          <CardHeader>
            <CardTitle className="text-base">{category.category}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {category.tasks.map((task, taskIdx) => {
              const taskId = `${catIdx}-${taskIdx}`;
              const isCompleted = completedTasks.has(taskId);
              
              return (
                <div key={taskIdx} className={`p-3 rounded-lg border ${isCompleted ? 'bg-emerald-50 border-emerald-200' : 'bg-white'}`}>
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => toggleTask(taskId, task.title)}
                      className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        isCompleted ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 hover:border-int-orange'
                      }`}
                    >
                      {isCompleted && <CheckCircle className="h-4 w-4 text-white" />}
                    </button>
                    <div className="flex-1">
                      <h5 className={`font-medium text-sm ${isCompleted ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                        {task.title}
                      </h5>
                      <p className="text-xs text-slate-600 mt-1">{task.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">{task.estimated_time}</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      ))}

      {upcomingEvents && upcomingEvents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Upcoming Events to Join</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <p className="font-medium text-sm">{event.title}</p>
                  <p className="text-xs text-slate-600 mt-1">
                    {new Date(event.date).toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function LearningResources({ resources }) {
  if (!resources) {
    return <Card><CardContent className="py-12 text-center"><LoadingSpinner /></CardContent></Card>;
  }

  const highPriority = resources.filter(r => r.priority === 'high');
  const mediumPriority = resources.filter(r => r.priority === 'medium');

  return (
    <div className="space-y-4">
      {highPriority.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-4 w-4 text-red-600" />
              Priority Resources
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {highPriority.map((resource, idx) => (
              <ResourceCard key={idx} resource={resource} />
            ))}
          </CardContent>
        </Card>
      )}

      {mediumPriority.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Additional Learning</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {mediumPriority.map((resource, idx) => (
              <ResourceCard key={idx} resource={resource} />
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ResourceCard({ resource }) {
  return (
    <div className="p-3 rounded-lg bg-slate-50 border">
      <div className="flex items-start justify-between mb-2">
        <h5 className="font-medium text-sm">{resource.title}</h5>
        <Badge variant="outline" className="text-xs">{resource.type}</Badge>
      </div>
      <p className="text-xs text-slate-600 mb-2">{resource.relevance}</p>
      <p className="text-xs text-slate-500">⏱️ {resource.estimated_time}</p>
    </div>
  );
}

function WelcomeMessages({ messages }) {
  if (!messages) {
    return <Card><CardContent className="py-12 text-center"><LoadingSpinner /></CardContent></Card>;
  }

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-int-orange/10 to-int-gold/10 border-int-orange/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-int-orange" />
            Welcome Messages from Your Team
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {messages.map((msg, idx) => (
            <div key={idx} className="p-4 rounded-lg bg-white border border-slate-200">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                  {msg.from_role.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm text-slate-900 mb-1">{msg.from_role}</p>
                  <p className="text-sm text-slate-700 leading-relaxed mb-2">{msg.message}</p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                    <p className="text-xs font-medium text-blue-800">{msg.invitation}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function StarterProjects({ projects }) {
  if (!projects) {
    return <Card><CardContent className="py-12 text-center"><LoadingSpinner /></CardContent></Card>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-purple-600" />
          Starter Projects for You
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {projects.map((project, idx) => (
          <div key={idx} className="p-4 rounded-lg bg-slate-50 border">
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-semibold text-slate-900">{project.name}</h4>
              <Badge variant="outline" className="text-xs">{project.duration}</Badge>
            </div>
            <p className="text-sm text-slate-700 mb-3">{project.description}</p>
            
            <div className="space-y-2 text-xs">
              <div>
                <p className="font-medium text-slate-600 mb-1">Skills you'll develop:</p>
                <div className="flex flex-wrap gap-1">
                  {project.skills_developed.map((skill, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">{skill}</Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <p className="font-medium text-slate-600 mb-1">Collaborate with:</p>
                <p className="text-slate-600">{project.stakeholders.join(', ')}</p>
              </div>
              
              <div>
                <p className="font-medium text-slate-600 mb-1">Success looks like:</p>
                <ul className="space-y-0.5 ml-3">
                  {project.success_criteria.map((criteria, i) => (
                    <li key={i} className="text-slate-600">• {criteria}</li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-emerald-50 border border-emerald-200 rounded p-2 mt-2">
                <p className="text-emerald-800"><strong>Why this project?</strong> {project.why_good_fit}</p>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}