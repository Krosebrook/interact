import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  Users, 
  TrendingUp, 
  BookOpen, 
  Target,
  Briefcase,
  Award,
  RefreshCw,
  ChevronRight
} from 'lucide-react';
import { useUserData } from '../components/hooks/useUserData';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

export default function AIPersonalization() {
  const { user, loading: userLoading } = useUserData(true);
  const [activeTab, setActiveTab] = useState('career');
  const [careerData, setCareerData] = useState(null);
  const [contentData, setContentData] = useState(null);
  const [challengesData, setChallengesData] = useState(null);
  const [teamData, setTeamData] = useState(null);

  const careerMutation = useMutation({
    mutationFn: async () => {
      const result = await base44.functions.invoke('aiCareerPathRecommendations', { 
        user_email: user.email 
      });
      return result.data || result;
    },
    onSuccess: (data) => {
      setCareerData(data);
      toast.success('Career recommendations generated');
    }
  });

  const contentMutation = useMutation({
    mutationFn: async (context) => {
      const result = await base44.functions.invoke('aiContentCurator', { 
        user_email: user.email,
        context 
      });
      return result.data || result;
    },
    onSuccess: (data) => {
      setContentData(data);
      toast.success('Content curated for you');
    }
  });

  const challengesMutation = useMutation({
    mutationFn: async () => {
      const result = await base44.functions.invoke('aiPersonalizedChallenges', { 
        user_email: user.email 
      });
      return result.data || result;
    },
    onSuccess: (data) => {
      setChallengesData(data);
      toast.success(`${data.auto_created_count} challenges created for you!`);
    }
  });

  const teamMutation = useMutation({
    mutationFn: async () => {
      const result = await base44.functions.invoke('aiTeamStructureOptimizer', {});
      return result.data || result;
    },
    onSuccess: (data) => {
      setTeamData(data);
      toast.success('Team optimization analysis complete');
    }
  });

  if (userLoading) {
    return <LoadingSpinner className="min-h-[60vh]" message="Loading..." />;
  }

  const isAdmin = user?.role === 'admin';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel-solid">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-int-navy">AI Personalization</h1>
            <p className="text-slate-600">Intelligent recommendations powered by your data</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white border shadow-sm">
          <TabsTrigger value="career">
            <Briefcase className="h-4 w-4 mr-2" />
            Career Path
          </TabsTrigger>
          <TabsTrigger value="content">
            <BookOpen className="h-4 w-4 mr-2" />
            Content Curation
          </TabsTrigger>
          <TabsTrigger value="challenges">
            <Target className="h-4 w-4 mr-2" />
            Personal Challenges
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="teams">
              <Users className="h-4 w-4 mr-2" />
              Team Optimization
            </TabsTrigger>
          )}
        </TabsList>

        {/* Career Path Recommendations */}
        <TabsContent value="career" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Career Development Paths</CardTitle>
                <Button
                  onClick={() => careerMutation.mutate()}
                  disabled={careerMutation.isPending}
                  size="sm"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${careerMutation.isPending ? 'animate-spin' : ''}`} />
                  Generate
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {careerMutation.isPending && <LoadingSpinner message="Analyzing your career path..." />}
              
              {careerData && (
                <div className="space-y-6">
                  {careerData.career_paths?.map((path, idx) => (
                    <Card key={idx} className="border-2 border-purple-200 bg-purple-50">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-lg text-slate-900">{path.path_name}</h4>
                            <p className="text-sm text-slate-600 mt-1">{path.description}</p>
                          </div>
                          <Badge className="bg-purple-600">
                            {Math.round(path.alignment_score * 100)}% match
                          </Badge>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 mt-4">
                          <div>
                            <h5 className="text-sm font-medium text-slate-700 mb-2">Required Skills</h5>
                            <div className="flex flex-wrap gap-2">
                              {path.required_skills?.map((skill, i) => (
                                <Badge key={i} variant="outline">{skill}</Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h5 className="text-sm font-medium text-slate-700 mb-2">Skill Gaps</h5>
                            <div className="flex flex-wrap gap-2">
                              {path.skill_gaps?.map((gap, i) => (
                                <Badge key={i} variant="outline" className="text-amber-600 border-amber-300">
                                  {gap}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 p-3 bg-white rounded-lg">
                          <p className="text-sm text-slate-600">
                            <span className="font-medium">Timeline:</span> {path.estimated_timeline}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Curation */}
        <TabsContent value="content" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Personalized Learning Content</CardTitle>
                <Button
                  onClick={() => contentMutation.mutate('learning')}
                  disabled={contentMutation.isPending}
                  size="sm"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${contentMutation.isPending ? 'animate-spin' : ''}`} />
                  Curate Content
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {contentMutation.isPending && <LoadingSpinner message="Curating content for you..." />}
              
              {contentData && (
                <div className="space-y-4">
                  {contentData.curated_content?.map((item, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-slate-900">{item.title}</h4>
                        <Badge variant="outline">
                          {Math.round(item.relevance_score * 100)}% relevant
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{item.description}</p>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="capitalize">{item.content_type}</span>
                        <span>•</span>
                        <span>{item.estimated_time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Personal Challenges */}
        <TabsContent value="challenges" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>AI-Generated Challenges</CardTitle>
                <Button
                  onClick={() => challengesMutation.mutate()}
                  disabled={challengesMutation.isPending}
                  size="sm"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${challengesMutation.isPending ? 'animate-spin' : ''}`} />
                  Generate Challenges
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {challengesMutation.isPending && <LoadingSpinner message="Creating personalized challenges..." />}
              
              {challengesData && (
                <div className="space-y-4">
                  {challengesData.challenges?.map((challenge, idx) => (
                    <Card key={idx} className="border-2 border-blue-200 bg-blue-50">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-slate-900">{challenge.title}</h4>
                          <Badge className={`${
                            challenge.difficulty === 'easy' ? 'bg-green-600' :
                            challenge.difficulty === 'medium' ? 'bg-yellow-600' : 'bg-red-600'
                          }`}>
                            {challenge.difficulty}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 mb-3">{challenge.description}</p>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="p-2 bg-white rounded">
                            <span className="text-slate-600">Reward:</span>
                            <span className="font-medium ml-1">{challenge.points_reward} points</span>
                          </div>
                          <div className="p-2 bg-white rounded">
                            <span className="text-slate-600">Duration:</span>
                            <span className="font-medium ml-1">{challenge.duration_days} days</span>
                          </div>
                        </div>
                        <p className="text-xs text-blue-700 mt-2">{challenge.why_recommended}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Optimization (Admin Only) */}
        {isAdmin && (
          <TabsContent value="teams" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Team Structure Optimization</CardTitle>
                  <Button
                    onClick={() => teamMutation.mutate()}
                    disabled={teamMutation.isPending}
                    size="sm"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${teamMutation.isPending ? 'animate-spin' : ''}`} />
                    Analyze Teams
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {teamMutation.isPending && <LoadingSpinner message="Analyzing team structures..." />}
                
                {teamData && (
                  <div className="space-y-6">
                    {teamData.optimal_structures?.length > 0 && (
                      <div>
                        <h4 className="font-medium text-slate-900 mb-3">Team Size Recommendations</h4>
                        <div className="space-y-2">
                          {teamData.optimal_structures.map((team, idx) => (
                            <div key={idx} className="p-3 bg-slate-50 rounded-lg">
                              <div className="flex items-center justify-between">
                                <span className="font-medium">{team.team_id}</span>
                                <Badge variant="outline">
                                  {team.current_size} → {team.recommended_size}
                                </Badge>
                              </div>
                              <p className="text-sm text-slate-600 mt-1">{team.reasoning}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {teamData.health_alerts?.length > 0 && (
                      <div>
                        <h4 className="font-medium text-slate-900 mb-3">Health Alerts</h4>
                        <div className="space-y-2">
                          {teamData.health_alerts.map((alert, idx) => (
                            <div key={idx} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                              <div className="flex items-start justify-between mb-1">
                                <span className="font-medium text-red-900">{alert.team_id}</span>
                                <Badge variant="destructive">{alert.severity}</Badge>
                              </div>
                              <p className="text-sm text-red-800">{alert.issue}</p>
                              <p className="text-xs text-red-700 mt-1">{alert.recommended_action}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}