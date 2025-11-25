import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import SkillProgressCard from './SkillProgressCard';
import { 
  GraduationCap, 
  TrendingUp, 
  Users, 
  BookOpen, 
  Target,
  Award,
  Plus
} from 'lucide-react';
import { toast } from 'sonner';

export default function UserSkillDashboard({ userEmail, userName }) {
  const queryClient = useQueryClient();
  const [selectedSkill, setSelectedSkill] = useState(null);

  const { data: userSkills = [], isLoading } = useQuery({
    queryKey: ['user-skills', userEmail],
    queryFn: () => base44.entities.SkillTracking.filter({ user_email: userEmail }),
    enabled: !!userEmail
  });

  const { data: recommendations = [] } = useQuery({
    queryKey: ['skill-recommendations', userEmail],
    queryFn: async () => {
      const analyses = await base44.entities.SkillTrendAnalysis.list('-created_date', 5);
      const latest = analyses[0];
      if (!latest) return [];
      return latest.learning_recommendations || [];
    }
  });

  const updateMentorshipMutation = useMutation({
    mutationFn: async ({ skillId, status }) => {
      return base44.entities.SkillTracking.update(skillId, { mentorship_status: status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['user-skills']);
      toast.success('Mentorship status updated!');
    }
  });

  // Calculate stats
  const totalSkills = userSkills.length;
  const avgProficiency = totalSkills > 0 
    ? Math.round(userSkills.reduce((sum, s) => sum + (s.proficiency_score || 0), 0) / totalSkills)
    : 0;
  const expertSkills = userSkills.filter(s => s.proficiency_level === 'expert' || s.proficiency_level === 'advanced').length;
  const mentorSkills = userSkills.filter(s => s.mentorship_status === 'is_mentor').length;

  // Group by category
  const skillsByCategory = userSkills.reduce((acc, skill) => {
    const cat = skill.skill_category || 'other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(skill);
    return acc;
  }, {});

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-int-orange" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-int-orange" />
              <span className="text-sm text-slate-500">Total Skills</span>
            </div>
            <div className="text-2xl font-bold mt-1">{totalSkills}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <span className="text-sm text-slate-500">Avg Proficiency</span>
            </div>
            <div className="text-2xl font-bold mt-1">{avgProficiency}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-purple-500" />
              <span className="text-sm text-slate-500">Advanced+</span>
            </div>
            <div className="text-2xl font-bold mt-1">{expertSkills}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              <span className="text-sm text-slate-500">Mentoring</span>
            </div>
            <div className="text-2xl font-bold mt-1">{mentorSkills}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Skills</TabsTrigger>
          <TabsTrigger value="categories">By Category</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {userSkills.length === 0 ? (
            <Card className="bg-slate-50 border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <GraduationCap className="h-12 w-12 text-slate-300 mb-4" />
                <h3 className="text-lg font-semibold text-slate-700 mb-2">No Skills Tracked Yet</h3>
                <p className="text-slate-500 text-center mb-4">
                  Participate in events and activities to start building your skill profile
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userSkills.map(skill => (
                <SkillProgressCard
                  key={skill.id}
                  skill={skill}
                  onViewResources={() => setSelectedSkill(skill)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          {Object.entries(skillsByCategory).map(([category, skills]) => (
            <div key={category}>
              <h3 className="text-lg font-semibold capitalize mb-3 flex items-center gap-2">
                <Target className="h-5 w-5 text-int-orange" />
                {category.replace('_', ' ')}
                <Badge variant="outline">{skills.length}</Badge>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {skills.map(skill => (
                  <SkillProgressCard key={skill.id} skill={skill} compact />
                ))}
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <h3 className="text-lg font-semibold">Recommended Learning Resources</h3>
          {recommendations.length === 0 ? (
            <Card className="bg-slate-50">
              <CardContent className="py-8 text-center text-slate-500">
                No recommendations available. Run an AI skill analysis to get personalized suggestions.
              </CardContent>
            </Card>
          ) : (
            recommendations.map((rec, i) => (
              <Card key={i}>
                <CardContent className="flex items-center gap-4 p-4">
                  <BookOpen className="h-10 w-10 text-int-orange" />
                  <div className="flex-1">
                    <div className="font-medium">{rec.skill_name}</div>
                    {rec.resources?.map((resource, j) => (
                      <div key={j} className="text-sm text-slate-500">
                        {resource.title} ({resource.type})
                      </div>
                    ))}
                  </div>
                  {rec.resources?.[0]?.url && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={rec.resources[0].url} target="_blank" rel="noopener noreferrer">
                        Learn
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Skill Detail Dialog */}
      <Dialog open={!!selectedSkill} onOpenChange={() => setSelectedSkill(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedSkill?.skill_name}</DialogTitle>
          </DialogHeader>
          {selectedSkill && (
            <div className="space-y-4">
              <div>
                <div className="text-sm text-slate-500 mb-1">Proficiency Level</div>
                <Progress value={selectedSkill.proficiency_score || 0} className="h-3" />
                <div className="flex justify-between text-sm mt-1">
                  <span className="capitalize">{selectedSkill.proficiency_level}</span>
                  <span>{selectedSkill.proficiency_score}%</span>
                </div>
              </div>

              <div>
                <div className="text-sm text-slate-500 mb-2">Mentorship</div>
                <div className="flex gap-2">
                  <Button
                    variant={selectedSkill.mentorship_status === 'seeking_mentor' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateMentorshipMutation.mutate({ 
                      skillId: selectedSkill.id, 
                      status: 'seeking_mentor' 
                    })}
                  >
                    Seek Mentor
                  </Button>
                  <Button
                    variant={selectedSkill.mentorship_status === 'is_mentor' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateMentorshipMutation.mutate({ 
                      skillId: selectedSkill.id, 
                      status: 'is_mentor' 
                    })}
                  >
                    Offer to Mentor
                  </Button>
                </div>
              </div>

              {selectedSkill.learning_resources?.length > 0 && (
                <div>
                  <div className="text-sm text-slate-500 mb-2">Learning Resources</div>
                  {selectedSkill.learning_resources.map((resource, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 bg-slate-50 rounded mb-2">
                      <BookOpen className="h-4 w-4" />
                      <span className="flex-1">{resource.title}</span>
                      {resource.url && (
                        <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-int-orange text-sm">
                          View
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {selectedSkill.growth_history?.length > 0 && (
                <div>
                  <div className="text-sm text-slate-500 mb-2">Recent Progress</div>
                  {selectedSkill.growth_history.slice(-5).map((entry, i) => (
                    <div key={i} className="flex justify-between text-sm py-1 border-b">
                      <span>{new Date(entry.date).toLocaleDateString()}</span>
                      <span className={entry.score_change > 0 ? 'text-green-600' : 'text-red-600'}>
                        {entry.score_change > 0 ? '+' : ''}{entry.score_change}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}