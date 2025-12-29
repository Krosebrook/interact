import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Target, Sparkles, Loader2, Zap, TrendingUp, BookOpen } from 'lucide-react';
import MicroLearningModule from './MicroLearningModule';
import { toast } from 'sonner';

export default function SkillGapMicroLearning({ userEmail }) {
  const [generatingModules, setGeneratingModules] = useState(false);

  // Analyze skill gaps with AI
  const analyzeGapsMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('learningPathAI', {
        action: 'analyze_skill_gaps_with_micro',
        context: { user_email: userEmail }
      });
      return response.data;
    },
    onSuccess: (data) => {
      if (data?.gaps?.length > 0) {
        toast.success(`Found ${data.gaps.length} skill gap${data.gaps.length > 1 ? 's' : ''}!`);
      } else {
        toast.info('No skill gaps detected - great job!');
      }
    },
    onError: (error) => {
      toast.error('Analysis failed: ' + error.message);
    }
  });

  // Generate micro-learning modules for a specific gap
  const generateModulesMutation = useMutation({
    mutationFn: async (skillGap) => {
      setGeneratingModules(true);
      const response = await base44.functions.invoke('learningPathAI', {
        action: 'generate_micro_modules',
        context: {
          user_email: userEmail,
          skill_gap: skillGap
        }
      });
      return { skill: skillGap, modules: response.data.modules || [] };
    },
    onSuccess: (data) => {
      setGeneratingModules(false);
      if (data.modules.length > 0) {
        toast.success(`Generated ${data.modules.length} micro-learning modules!`);
      } else {
        toast.warning('No modules generated');
      }
    },
    onError: (error) => {
      setGeneratingModules(false);
      toast.error('Failed to generate modules: ' + error.message);
    }
  });

  const skillGaps = analyzeGapsMutation.data?.gaps || [];
  const microModules = generateModulesMutation.data?.modules || [];
  const selectedSkill = generateModulesMutation.data?.skill;

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-6 w-6 text-purple-600" />
                AI Skill Gap Analysis with Micro-Learning
              </CardTitle>
              <CardDescription className="mt-1">
                Identify gaps and close them with quick, targeted learning modules (5-10 mins each)
              </CardDescription>
            </div>
            <Zap className="h-12 w-12 text-amber-500" />
          </div>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => analyzeGapsMutation.mutate()}
            disabled={analyzeGapsMutation.isPending}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {analyzeGapsMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing Your Skills...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Analyze My Skill Gaps
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Skill Gaps List */}
      {skillGaps.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Identified Skill Gaps
          </h3>
          
          <div className="grid gap-3">
            {skillGaps.map((gap, idx) => (
              <Card key={idx} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-slate-900">{gap.skill}</h4>
                        <Badge className={
                          gap.impact === 'high' ? 'bg-red-100 text-red-800' :
                          gap.impact === 'medium' ? 'bg-amber-100 text-amber-800' :
                          'bg-blue-100 text-blue-800'
                        }>
                          {gap.impact} impact
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-slate-600 mb-2">{gap.reason}</p>
                      
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span>Current: {gap.current_level}</span>
                        <span>→</span>
                        <span>Target: {gap.target_level}</span>
                      </div>

                      {gap.estimated_time && (
                        <div className="mt-2 flex items-center gap-1 text-xs text-purple-700">
                          <Zap className="h-3 w-3" />
                          <span>{gap.estimated_time} of micro-learning available</span>
                        </div>
                      )}
                    </div>

                    <Button
                      size="sm"
                      onClick={() => generateModulesMutation.mutate(gap.skill)}
                      disabled={generatingModules}
                      className="ml-4 bg-purple-600 hover:bg-purple-700"
                    >
                      {generatingModules ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <BookOpen className="h-4 w-4 mr-1" />
                          Quick Modules
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Micro-Learning Modules */}
      {microModules.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-600" />
              Quick Wins: {selectedSkill} Modules
            </h3>
            <Badge className="bg-amber-100 text-amber-800">
              {microModules.filter(m => !m.completed).length} available
            </Badge>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {microModules.map((module, idx) => (
              <MicroLearningModule
                key={idx}
                module={module}
                userEmail={userEmail}
                skillGap={selectedSkill}
                onComplete={() => {
                  // Refresh analysis after completion
                  analyzeGapsMutation.mutate();
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {skillGaps.length === 0 && !analyzeGapsMutation.isPending && analyzeGapsMutation.isSuccess && (
        <Card>
          <CardContent className="py-12 text-center">
            <Target className="h-12 w-12 text-emerald-300 mx-auto mb-3" />
            <p className="text-slate-600 mb-2">Great job! No skill gaps detected.</p>
            <p className="text-sm text-slate-500">Keep engaging with activities to continue growing.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}