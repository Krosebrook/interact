import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Brain, 
  AlertTriangle, 
  TrendingUp, 
  Users,
  BookOpen,
  Lightbulb,
  MessageSquare,
  Target,
  Loader2,
  Star,
  Award,
  GraduationCap
} from 'lucide-react';
import { toast } from 'sonner';

export default function TeamCoachingModule({ team }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [insights, setInsights] = useState(null);

  const coachingMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('teamCoachingAI', {
        team_id: team.id
      });
      return response.data;
    },
    onSuccess: (data) => {
      setInsights(data);
      toast.success('Coaching insights generated!');
    },
    onError: () => {
      toast.error('Failed to generate insights');
    }
  });

  return (
    <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-indigo-600" />
          AI Team Coach
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!insights ? (
          <div className="text-center py-8">
            <Brain className="h-16 w-16 text-indigo-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">AI-Powered Team Coaching</h3>
            <p className="text-sm text-slate-600 mb-6 max-w-md mx-auto">
              Get personalized insights about team member engagement, skill gaps, 
              and actionable coaching strategies powered by AI.
            </p>
            <Button
              onClick={() => coachingMutation.mutate()}
              disabled={coachingMutation.isPending}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {coachingMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing Team...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Generate Insights
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white rounded-lg p-3 border">
                <p className="text-xs text-slate-600">Team Members</p>
                <p className="text-2xl font-bold text-int-navy">
                  {insights.team_summary.total_members}
                </p>
              </div>
              <div className="bg-white rounded-lg p-3 border">
                <p className="text-xs text-slate-600">At Risk</p>
                <p className="text-2xl font-bold text-red-600">
                  {insights.team_summary.at_risk_count}
                </p>
              </div>
              <div className="bg-white rounded-lg p-3 border">
                <p className="text-xs text-slate-600">Excelling</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {insights.team_summary.excelling_count}
                </p>
              </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview" className="text-xs gap-1">
                  <Users className="h-3 w-3" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="at-risk" className="text-xs gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  At Risk
                  {insights.team_summary.at_risk_count > 0 && (
                    <Badge className="ml-1 bg-red-500 text-white h-4 min-w-4 px-1">
                      {insights.team_summary.at_risk_count}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="skills" className="text-xs gap-1">
                  <GraduationCap className="h-3 w-3" />
                  Skills
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-3">
                {insights.excelling_members.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-emerald-700 mb-2 flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      High Performers
                    </h4>
                    <div className="space-y-2">
                      {insights.excelling_members.map((member, idx) => (
                        <ExcellingMemberCard key={idx} member={member} />
                      ))}
                    </div>
                  </div>
                )}

                {insights.at_risk_members.length > 0 && (
                  <Alert className="border-amber-200 bg-amber-50">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <AlertDescription>
                      <span className="font-semibold">{insights.at_risk_members.length} member(s)</span> may need attention. 
                      Check the "At Risk" tab for coaching strategies.
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>

              <TabsContent value="at-risk" className="space-y-3">
                {insights.at_risk_members.length === 0 ? (
                  <div className="text-center py-8">
                    <TrendingUp className="h-12 w-12 text-emerald-500 mx-auto mb-2" />
                    <p className="text-slate-600">All team members are engaged! 🎉</p>
                  </div>
                ) : (
                  insights.at_risk_members.map((member, idx) => (
                    <AtRiskMemberCard key={idx} member={member} />
                  ))
                )}
              </TabsContent>

              <TabsContent value="skills" className="space-y-3">
                <SkillGapsSection skillData={insights.skill_gaps} />
              </TabsContent>
            </Tabs>

            <Button
              variant="outline"
              size="sm"
              onClick={() => coachingMutation.mutate()}
              className="w-full"
              disabled={coachingMutation.isPending}
            >
              <Brain className="h-3 w-3 mr-2" />
              Refresh Insights
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function AtRiskMemberCard({ member }) {
  const [expanded, setExpanded] = useState(false);

  const riskColors = {
    low: 'bg-yellow-100 text-yellow-800',
    medium: 'bg-orange-100 text-orange-800',
    high: 'bg-red-100 text-red-800'
  };

  return (
    <div className="bg-white rounded-lg border p-3">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <p className="font-medium text-sm">{member.email}</p>
          <div className="flex items-center gap-2 mt-1">
            <Badge className={riskColors[member.coaching.risk_level]} variant="outline">
              {member.coaching.risk_level} risk
            </Badge>
            <span className="text-xs text-slate-600">
              {member.recent_events} events • {member.current_streak} day streak
            </span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? 'Hide' : 'View'}
        </Button>
      </div>

      {expanded && (
        <div className="space-y-3 mt-3 pt-3 border-t">
          <div>
            <h5 className="text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <Target className="h-3 w-3" />
              Coaching Strategies
            </h5>
            <ul className="space-y-1">
              {member.coaching.coaching_strategies.map((strategy, idx) => (
                <li key={idx} className="text-xs text-slate-600 flex items-start gap-1">
                  <span className="text-indigo-600 mt-0.5">•</span>
                  {strategy}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h5 className="text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              Conversation Starters
            </h5>
            <ul className="space-y-1">
              {member.coaching.conversation_starters.map((starter, idx) => (
                <li key={idx} className="text-xs text-slate-600 italic bg-slate-50 p-2 rounded">
                  "{starter}"
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h5 className="text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <Lightbulb className="h-3 w-3" />
              Immediate Actions
            </h5>
            <ul className="space-y-1">
              {member.coaching.immediate_actions.map((action, idx) => (
                <li key={idx} className="text-xs text-slate-600 flex items-start gap-1">
                  <span className="text-emerald-600 mt-0.5">→</span>
                  {action}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

function ExcellingMemberCard({ member }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-lg border border-emerald-200 p-3">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <p className="font-medium text-sm">{member.email}</p>
          <div className="flex items-center gap-2 mt-1">
            <Badge className="bg-emerald-100 text-emerald-800">
              {member.coaching.performance_level}
            </Badge>
            <span className="text-xs text-slate-600">
              {member.total_points} pts • {member.recent_events} events
            </span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? 'Hide' : 'View'}
        </Button>
      </div>

      {expanded && (
        <div className="space-y-3 mt-3 pt-3 border-t">
          <div>
            <h5 className="text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <Award className="h-3 w-3" />
              Leverage Opportunities
            </h5>
            <ul className="space-y-1">
              {member.coaching.leverage_opportunities.map((opp, idx) => (
                <li key={idx} className="text-xs text-slate-600 flex items-start gap-1">
                  <span className="text-emerald-600 mt-0.5">•</span>
                  {opp}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h5 className="text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              Recognition Ideas
            </h5>
            <ul className="space-y-1">
              {member.coaching.recognition_suggestions.map((rec, idx) => (
                <li key={idx} className="text-xs text-slate-600 italic bg-emerald-50 p-2 rounded">
                  "{rec}"
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

function SkillGapsSection({ skillData }) {
  if (!skillData.top_gaps.length) {
    return (
      <div className="text-center py-8">
        <GraduationCap className="h-12 w-12 text-slate-300 mx-auto mb-2" />
        <p className="text-slate-600">No skill gaps identified</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div>
        <h4 className="font-semibold text-indigo-700 mb-2">Top Skill Gaps</h4>
        <div className="space-y-2">
          {skillData.top_gaps.map((gap, idx) => (
            <div key={idx} className="bg-white rounded-lg p-3 border">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">{gap.skill}</span>
                <Badge variant="outline">{gap.affected_members} members</Badge>
              </div>
            </div>
          ))}
        </div>
      </div>

      {skillData.recommendations.length > 0 && (
        <div>
          <h4 className="font-semibold text-purple-700 mb-2 flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Learning Recommendations
          </h4>
          <div className="space-y-3">
            {skillData.recommendations.map((rec, idx) => (
              <div key={idx} className="bg-white rounded-lg p-3 border">
                <h5 className="font-semibold text-sm mb-2">{rec.skill}</h5>
                
                <div className="space-y-2 text-xs">
                  <div>
                    <p className="font-medium text-slate-700 mb-1">Suggested Activities:</p>
                    <ul className="space-y-1">
                      {rec.activities.map((activity, i) => (
                        <li key={i} className="text-slate-600 flex items-start gap-1">
                          <span className="text-purple-600">•</span>
                          {activity}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <p className="font-medium text-slate-700 mb-1">Resources:</p>
                    <ul className="space-y-1">
                      {rec.resources.map((resource, i) => (
                        <li key={i} className="text-slate-600 flex items-start gap-1">
                          <span className="text-blue-600">→</span>
                          {resource}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {rec.mentorship_ideas && (
                    <div>
                      <p className="font-medium text-slate-700 mb-1">Mentorship:</p>
                      <p className="text-slate-600 italic">{rec.mentorship_ideas}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}