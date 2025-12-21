import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useUserData } from '../components/hooks/useUserData';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BookOpen, 
  TrendingUp, 
  Target, 
  Sparkles,
  Loader2,
  Award
} from 'lucide-react';
import LearningPathCard from '../components/learning/LearningPathCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { toast } from 'sonner';

export default function LearningDashboard() {
  const { user } = useUserData(true);
  const [activeTab, setActiveTab] = useState('my-paths');
  const [targetSkill, setTargetSkill] = useState('');
  const [currentLevel, setCurrentLevel] = useState('beginner');
  const [targetLevel, setTargetLevel] = useState('intermediate');

  // Fetch user's learning paths
  const { data: myPaths = [], isLoading: pathsLoading } = useQuery({
    queryKey: ['my-learning-paths', user?.email],
    queryFn: async () => {
      return await base44.entities.LearningPath.filter({
        created_for: user?.email
      });
    },
    enabled: !!user?.email
  });

  // Fetch learning progress
  const { data: myProgress = [] } = useQuery({
    queryKey: ['learning-progress', user?.email],
    queryFn: async () => {
      return await base44.entities.LearningPathProgress.filter({
        user_email: user?.email
      });
    },
    enabled: !!user?.email
  });

  // Analyze skill gaps
  const analyzeGapsMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('learningPathAI', {
        action: 'analyze_skill_gaps',
        context: { user_email: user?.email }
      });
      return response.data;
    },
    onSuccess: () => toast.success('Skill gaps analyzed!')
  });

  // Generate learning path
  const generatePathMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('learningPathAI', {
        action: 'generate_learning_path',
        context: {
          target_skill: targetSkill,
          current_level: currentLevel,
          target_level: targetLevel,
          user_email: user?.email
        }
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Learning path created!');
      setTargetSkill('');
      queryClient.invalidateQueries(['my-learning-paths']);
    }
  });

  // Recommend resources
  const recommendMutation = useMutation({
    mutationFn: async (skillGaps) => {
      const response = await base44.functions.invoke('learningPathAI', {
        action: 'recommend_resources',
        context: {
          skill_gaps: skillGaps,
          user_email: user?.email
        }
      });
      return response.data;
    }
  });

  const queryClient = useQueryClient();

  const activePaths = myPaths.filter(p => {
    const prog = myProgress.find(pr => pr.learning_path_id === p.id);
    return prog?.status === 'in_progress';
  });

  const completedPaths = myPaths.filter(p => {
    const prog = myProgress.find(pr => pr.learning_path_id === p.id);
    return prog?.status === 'completed';
  });

  const notStartedPaths = myPaths.filter(p => {
    return !myProgress.some(pr => pr.learning_path_id === p.id);
  });

  if (pathsLoading) {
    return <LoadingSpinner className="min-h-[60vh]" message="Loading learning paths..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel-solid">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-int-navy mb-2">Learning Dashboard</h1>
            <p className="text-slate-600">Personalized skill development powered by AI</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-600">Total Paths</p>
            <p className="text-3xl font-bold text-int-orange">{myPaths.length}</p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="my-paths">
            <BookOpen className="h-4 w-4 mr-2" />
            My Paths
          </TabsTrigger>
          <TabsTrigger value="create">
            <Sparkles className="h-4 w-4 mr-2" />
            Create Path
          </TabsTrigger>
          <TabsTrigger value="gaps">
            <Target className="h-4 w-4 mr-2" />
            Skill Gaps
          </TabsTrigger>
        </TabsList>

        {/* My Paths */}
        <TabsContent value="my-paths" className="space-y-6 mt-6">
          {activePaths.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">In Progress</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {activePaths.map(path => (
                  <LearningPathCard
                    key={path.id}
                    path={path}
                    progress={myProgress.find(p => p.learning_path_id === path.id)}
                    userEmail={user?.email}
                  />
                ))}
              </div>
            </div>
          )}

          {notStartedPaths.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Available to Start</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {notStartedPaths.map(path => (
                  <LearningPathCard
                    key={path.id}
                    path={path}
                    progress={null}
                    userEmail={user?.email}
                  />
                ))}
              </div>
            </div>
          )}

          {completedPaths.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-slate-600 mb-3">Completed</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {completedPaths.map(path => (
                  <LearningPathCard
                    key={path.id}
                    path={path}
                    progress={myProgress.find(p => p.learning_path_id === path.id)}
                    userEmail={user?.email}
                  />
                ))}
              </div>
            </div>
          )}

          {myPaths.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600 mb-4">No learning paths yet</p>
                <Button onClick={() => setActiveTab('create')}>
                  Create Your First Path
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Create Path */}
        <TabsContent value="create" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                AI Learning Path Generator
              </CardTitle>
              <CardDescription>
                Tell AI what skill you want to develop, and it will create a personalized learning journey
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="target-skill">Target Skill</Label>
                <Input
                  id="target-skill"
                  value={targetSkill}
                  onChange={(e) => setTargetSkill(e.target.value)}
                  placeholder="e.g., React, Leadership, Data Analysis"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="current-level">Current Level</Label>
                  <Select value={currentLevel} onValueChange={setCurrentLevel}>
                    <SelectTrigger id="current-level">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="target-level">Target Level</Label>
                  <Select value={targetLevel} onValueChange={setTargetLevel}>
                    <SelectTrigger id="target-level">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={() => generatePathMutation.mutate()}
                disabled={!targetSkill.trim() || generatePathMutation.isPending}
                className="w-full bg-int-orange hover:bg-int-orange/90"
              >
                {generatePathMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating Your Learning Path...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Learning Path
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Skill Gaps Analysis */}
        <TabsContent value="gaps" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                AI Skill Gap Analysis
              </CardTitle>
              <CardDescription>
                Let AI analyze your activity and identify areas for growth
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => analyzeGapsMutation.mutate()}
                disabled={analyzeGapsMutation.isPending}
                className="w-full"
              >
                {analyzeGapsMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing Your Profile...
                  </>
                ) : (
                  <>
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Analyze My Skill Gaps
                  </>
                )}
              </Button>

              {analyzeGapsMutation.data?.analysis && (
                <div className="space-y-3 mt-6">
                  <h4 className="font-semibold text-sm">Identified Skill Gaps</h4>
                  {analyzeGapsMutation.data.analysis.map((gap, idx) => (
                    <div key={idx} className="p-4 rounded-lg bg-slate-50 border">
                      <div className="flex items-start justify-between mb-2">
                        <h5 className="font-semibold text-slate-900">{gap.skill}</h5>
                        <Badge className={
                          gap.impact === 'high' ? 'bg-red-100 text-red-800' :
                          gap.impact === 'medium' ? 'bg-amber-100 text-amber-800' :
                          'bg-blue-100 text-blue-800'
                        }>
                          {gap.impact} impact
                        </Badge>
                      </div>
                      <div className="text-xs text-slate-600 mb-2">
                        {gap.current_level} → {gap.target_level}
                      </div>
                      <p className="text-sm text-slate-700 mb-2">{gap.reason}</p>
                      <div className="bg-blue-50 border border-blue-200 rounded p-2">
                        <p className="text-xs font-medium text-blue-800">First Step:</p>
                        <p className="text-xs text-blue-700">{gap.first_step}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-2"
                        onClick={() => {
                          setTargetSkill(gap.skill);
                          setCurrentLevel(gap.current_level);
                          setTargetLevel(gap.target_level);
                          setActiveTab('create');
                        }}
                      >
                        Create Learning Path
                      </Button>
                    </div>
                  ))}

                  <Button
                    onClick={() => recommendMutation.mutate(analyzeGapsMutation.data.analysis.map(g => g.skill))}
                    disabled={recommendMutation.isPending}
                    variant="outline"
                    className="w-full mt-4"
                  >
                    {recommendMutation.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <BookOpen className="h-4 w-4 mr-2" />
                    )}
                    Get Resource Recommendations
                  </Button>

                  {recommendMutation.data?.resources && (
                    <div className="mt-4 space-y-2">
                      <h4 className="font-semibold text-sm">Recommended Resources</h4>
                      {recommendMutation.data.resources.map((resource, idx) => (
                        <a
                          key={idx}
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block p-3 rounded-lg bg-white border hover:border-int-orange transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h5 className="font-medium text-sm text-slate-900">{resource.title}</h5>
                              <p className="text-xs text-slate-600 mt-1">{resource.reason}</p>
                              <div className="flex gap-2 mt-2">
                                <Badge variant="outline" className="text-xs">{resource.type}</Badge>
                                <Badge variant="outline" className="text-xs">{resource.difficulty}</Badge>
                                <Badge variant="outline" className="text-xs">{resource.estimated_time}</Badge>
                              </div>
                            </div>
                          </div>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}