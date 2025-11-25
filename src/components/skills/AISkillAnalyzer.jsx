import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  TrendingUp, 
  Users, 
  BookOpen, 
  Lightbulb, 
  Loader2,
  RefreshCw,
  Target,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';

export default function AISkillAnalyzer({ 
  participations, 
  events, 
  activities,
  userProfiles,
  teams,
  scope = 'organization',
  scopeId = null 
}) {
  const queryClient = useQueryClient();
  const [analysis, setAnalysis] = useState(null);

  const analyzeMutation = useMutation({
    mutationFn: async () => {
      // Prepare data for AI analysis
      const participationData = participations.map(p => {
        const event = events.find(e => e.id === p.event_id);
        const activity = activities.find(a => a.id === event?.activity_id);
        return {
          participant_email: p.participant_email,
          event_title: event?.title,
          activity_type: activity?.type,
          skills_developed: activity?.skills_developed || [],
          skills_gained: p.skills_gained || [],
          engagement_score: p.engagement_score,
          feedback: p.feedback,
          skill_self_rating: p.skill_self_rating,
          mentorship_interest: p.mentorship_interest
        };
      }).filter(p => p.event_title);

      const profileData = userProfiles.map(up => ({
        email: up.user_email,
        skill_levels: up.skill_levels || [],
        learning_goals: up.learning_goals || [],
        expertise_areas: up.expertise_areas || []
      }));

      const prompt = `Analyze the following team skill development data and provide insights:

PARTICIPATION DATA (${participationData.length} records):
${JSON.stringify(participationData.slice(0, 50), null, 2)}

USER PROFILES (${profileData.length} users):
${JSON.stringify(profileData.slice(0, 30), null, 2)}

ACTIVITIES AVAILABLE:
${JSON.stringify(activities.map(a => ({ title: a.title, type: a.type, skills: a.skills_developed })), null, 2)}

Provide a comprehensive skill trend analysis including:
1. Top 5 trending skills (with growth rate and participant count)
2. Top 3 skill gaps identified (with severity and recommended activities)
3. Top 5 mentorship opportunities (potential mentor-mentee pairings based on expertise and learning goals)
4. Top 5 personalized learning resource recommendations
5. A summary of key insights
6. 3-5 actionable recommendations`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            trending_skills: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  skill_name: { type: "string" },
                  growth_rate: { type: "number" },
                  participant_count: { type: "number" },
                  avg_improvement: { type: "number" },
                  trend: { type: "string" }
                }
              }
            },
            skill_gaps: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  skill_name: { type: "string" },
                  current_avg: { type: "number" },
                  target_avg: { type: "number" },
                  gap_severity: { type: "string" },
                  recommended_activities: { type: "array", items: { type: "string" } }
                }
              }
            },
            mentorship_opportunities: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  skill_name: { type: "string" },
                  mentor_name: { type: "string" },
                  mentor_email: { type: "string" },
                  mentee_name: { type: "string" },
                  mentee_email: { type: "string" },
                  match_score: { type: "number" }
                }
              }
            },
            learning_recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  skill_name: { type: "string" },
                  resource_title: { type: "string" },
                  resource_type: { type: "string" },
                  resource_url: { type: "string" },
                  relevance_score: { type: "number" }
                }
              }
            },
            insights_summary: { type: "string" },
            action_items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  action: { type: "string" },
                  priority: { type: "string" },
                  target_audience: { type: "string" }
                }
              }
            }
          }
        }
      });

      // Save analysis to database
      await base44.entities.SkillTrendAnalysis.create({
        analysis_date: new Date().toISOString(),
        analysis_scope: scope,
        team_id: scope === 'team' ? scopeId : null,
        user_email: scope === 'individual' ? scopeId : null,
        trending_skills: response.trending_skills || [],
        skill_gaps: response.skill_gaps || [],
        mentorship_opportunities: response.mentorship_opportunities?.map(m => ({
          skill_name: m.skill_name,
          potential_mentors: [m.mentor_email],
          potential_mentees: [m.mentee_email],
          match_score: m.match_score
        })) || [],
        learning_recommendations: response.learning_recommendations?.map(r => ({
          skill_name: r.skill_name,
          resources: [{
            title: r.resource_title,
            url: r.resource_url || '',
            type: r.resource_type,
            relevance_score: r.relevance_score
          }]
        })) || [],
        insights_summary: response.insights_summary,
        action_items: response.action_items || []
      });

      return response;
    },
    onSuccess: (data) => {
      setAnalysis(data);
      queryClient.invalidateQueries(['skill-trend-analysis']);
      toast.success('Skill analysis complete!');
    },
    onError: (error) => {
      toast.error('Analysis failed: ' + error.message);
    }
  });

  return (
    <Card className="border-2 border-int-navy">
      <CardHeader className="bg-gradient-to-r from-int-navy to-[#4A6070] text-white">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Skill Trend Analysis
          </span>
          <Button 
            onClick={() => analyzeMutation.mutate()}
            disabled={analyzeMutation.isPending}
            size="sm"
            className="bg-int-orange hover:bg-[#C46322]"
          >
            {analyzeMutation.isPending ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analyzing...</>
            ) : (
              <><RefreshCw className="h-4 w-4 mr-2" /> Run Analysis</>
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {!analysis && !analyzeMutation.isPending && (
          <div className="text-center py-12">
            <Brain className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-700 mb-2">
              Ready to Analyze Skill Trends
            </h3>
            <p className="text-slate-500 mb-4 max-w-md mx-auto">
              AI will analyze participation data, feedback, and user profiles to identify
              emerging skills, gaps, and mentorship opportunities.
            </p>
            <Button onClick={() => analyzeMutation.mutate()} className="bg-int-orange hover:bg-[#C46322]">
              <Brain className="h-4 w-4 mr-2" />
              Start Analysis
            </Button>
          </div>
        )}

        {analyzeMutation.isPending && (
          <div className="text-center py-12">
            <Loader2 className="h-12 w-12 text-int-orange animate-spin mx-auto mb-4" />
            <p className="text-slate-600">Analyzing skill data across all participants...</p>
          </div>
        )}

        {analysis && (
          <Tabs defaultValue="trends" className="space-y-4">
            <TabsList className="grid grid-cols-5 w-full">
              <TabsTrigger value="trends">
                <TrendingUp className="h-4 w-4 mr-1" />
                Trends
              </TabsTrigger>
              <TabsTrigger value="gaps">
                <Target className="h-4 w-4 mr-1" />
                Gaps
              </TabsTrigger>
              <TabsTrigger value="mentorship">
                <Users className="h-4 w-4 mr-1" />
                Mentorship
              </TabsTrigger>
              <TabsTrigger value="resources">
                <BookOpen className="h-4 w-4 mr-1" />
                Resources
              </TabsTrigger>
              <TabsTrigger value="actions">
                <Lightbulb className="h-4 w-4 mr-1" />
                Actions
              </TabsTrigger>
            </TabsList>

            <TabsContent value="trends" className="space-y-4">
              <h4 className="font-semibold text-slate-900">Trending Skills</h4>
              {analysis.trending_skills?.map((skill, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{skill.skill_name}</div>
                    <div className="text-sm text-slate-500">
                      {skill.participant_count} participants • {skill.avg_improvement}% avg improvement
                    </div>
                  </div>
                  <Badge className={
                    skill.trend === 'rising' ? 'bg-green-100 text-green-700' :
                    skill.trend === 'stable' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }>
                    {skill.trend === 'rising' ? '📈' : skill.trend === 'stable' ? '➡️' : '📉'} {skill.growth_rate}%
                  </Badge>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="gaps" className="space-y-4">
              <h4 className="font-semibold text-slate-900">Skill Gaps Identified</h4>
              {analysis.skill_gaps?.map((gap, i) => (
                <div key={i} className="p-4 bg-slate-50 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium">{gap.skill_name}</span>
                    <Badge variant={gap.gap_severity === 'high' ? 'destructive' : 'outline'}>
                      {gap.gap_severity} priority
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm mb-2">
                    <span>Current: {gap.current_avg}</span>
                    <ArrowRight className="h-4 w-4" />
                    <span>Target: {gap.target_avg}</span>
                  </div>
                  <Progress value={(gap.current_avg / gap.target_avg) * 100} className="h-2 mb-2" />
                  <div className="text-sm text-slate-500">
                    Recommended: {gap.recommended_activities?.join(', ')}
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="mentorship" className="space-y-4">
              <h4 className="font-semibold text-slate-900">Mentorship Opportunities</h4>
              {analysis.mentorship_opportunities?.map((match, i) => (
                <div key={i} className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className="bg-purple-100 text-purple-700">{match.skill_name}</Badge>
                    <span className="text-sm font-medium text-green-600">
                      {match.match_score}% match
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 text-center p-2 bg-white rounded">
                      <div className="text-xs text-slate-500">Mentor</div>
                      <div className="font-medium">{match.mentor_name || match.mentor_email}</div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-slate-400" />
                    <div className="flex-1 text-center p-2 bg-white rounded">
                      <div className="text-xs text-slate-500">Mentee</div>
                      <div className="font-medium">{match.mentee_name || match.mentee_email}</div>
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="resources" className="space-y-4">
              <h4 className="font-semibold text-slate-900">Recommended Learning Resources</h4>
              {analysis.learning_recommendations?.map((rec, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                  <BookOpen className="h-8 w-8 text-int-orange" />
                  <div className="flex-1">
                    <div className="font-medium">{rec.resource_title}</div>
                    <div className="text-sm text-slate-500">
                      {rec.resource_type} • For: {rec.skill_name}
                    </div>
                  </div>
                  {rec.resource_url && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={rec.resource_url} target="_blank" rel="noopener noreferrer">
                        View
                      </a>
                    </Button>
                  )}
                </div>
              ))}
            </TabsContent>

            <TabsContent value="actions" className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <h4 className="font-semibold text-slate-900 mb-2">Summary</h4>
                <p className="text-slate-700">{analysis.insights_summary}</p>
              </div>
              
              <h4 className="font-semibold text-slate-900">Action Items</h4>
              {analysis.action_items?.map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                  <Badge className={
                    item.priority === 'high' ? 'bg-red-100 text-red-700' :
                    item.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }>
                    {item.priority}
                  </Badge>
                  <div>
                    <div className="font-medium">{item.action}</div>
                    <div className="text-sm text-slate-500">Target: {item.target_audience}</div>
                  </div>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}