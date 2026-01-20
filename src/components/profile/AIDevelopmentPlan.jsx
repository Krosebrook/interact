import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, BookOpen, Target, Users, TrendingUp, Calendar, ChevronDown, ChevronUp } from 'lucide-react';

export default function AIDevelopmentPlan({ userEmail }) {
  const [expandedSection, setExpandedSection] = useState(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['ai-development-plan', userEmail],
    queryFn: async () => {
      const response = await base44.functions.invoke('aiDevelopmentPlanner', {
        user_email: userEmail
      });
      return response.data;
    },
    enabled: !!userEmail
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 flex items-center justify-center gap-2">
          <Sparkles className="w-5 h-5 animate-pulse text-purple-600" />
          <span className="text-slate-600">AI is creating your development plan...</span>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Button onClick={() => refetch()} className="bg-purple-600 hover:bg-purple-700">
            <Sparkles className="w-4 h-4 mr-2" />
            Generate AI Development Plan
          </Button>
        </CardContent>
      </Card>
    );
  }

  const { development_plan } = data;

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="space-y-4">
      <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-600" />
              AI-Powered Development Plan
            </CardTitle>
            <Button size="sm" variant="outline" onClick={() => refetch()}>
              Regenerate
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Next Steps */}
      <Card className="border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-900">
            <Target className="w-5 h-5" />
            Immediate Next Steps
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {development_plan.next_steps?.map((step, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3 bg-white rounded-lg border">
              <div className="h-6 w-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                {idx + 1}
              </div>
              <div className="flex-1">
                <p className="font-medium text-slate-900">{step.action}</p>
                <div className="flex gap-2 mt-1">
                  <Badge className={
                    step.priority === 'high' ? 'bg-red-100 text-red-800' :
                    step.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-slate-100 text-slate-800'
                  }>
                    {step.priority}
                  </Badge>
                  <Badge variant="outline">{step.timeline}</Badge>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Skill Gaps */}
      <Card>
        <CardHeader className="cursor-pointer" onClick={() => toggleSection('skills')}>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              Skill Gaps to Address ({development_plan.skill_gaps?.length || 0})
            </span>
            {expandedSection === 'skills' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </CardTitle>
        </CardHeader>
        {expandedSection === 'skills' && (
          <CardContent className="space-y-3">
            {development_plan.skill_gaps?.map((gap, idx) => (
              <div key={idx} className="border rounded-lg p-3">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-slate-900">{gap.skill}</p>
                    <p className="text-sm text-slate-600">{gap.current_level} → {gap.target_level}</p>
                  </div>
                  <Badge className={
                    gap.priority === 'high' ? 'bg-red-100 text-red-800' :
                    gap.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }>
                    {gap.priority} priority
                  </Badge>
                </div>
                <p className="text-sm text-slate-600">{gap.reason}</p>
              </div>
            ))}
          </CardContent>
        )}
      </Card>

      {/* Learning Paths */}
      <Card>
        <CardHeader className="cursor-pointer" onClick={() => toggleSection('learning')}>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-600" />
              Recommended Learning Paths ({development_plan.learning_paths?.length || 0})
            </span>
            {expandedSection === 'learning' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </CardTitle>
        </CardHeader>
        {expandedSection === 'learning' && (
          <CardContent className="space-y-3">
            {development_plan.learning_paths?.map((path, idx) => (
              <div key={idx} className="border rounded-lg p-4 bg-purple-50">
                <h4 className="font-semibold text-slate-900 mb-1">{path.title}</h4>
                <p className="text-sm text-slate-700 mb-2">{path.description}</p>
                <div className="flex gap-2 text-xs">
                  <Badge variant="outline">{path.type}</Badge>
                  <Badge variant="outline">{path.duration}</Badge>
                  {path.provider && <Badge variant="outline">{path.provider}</Badge>}
                </div>
              </div>
            ))}
          </CardContent>
        )}
      </Card>

      {/* Stretch Assignments */}
      <Card>
        <CardHeader className="cursor-pointer" onClick={() => toggleSection('assignments')}>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Target className="w-5 h-5 text-orange-600" />
              Stretch Assignments ({development_plan.stretch_assignments?.length || 0})
            </span>
            {expandedSection === 'assignments' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </CardTitle>
        </CardHeader>
        {expandedSection === 'assignments' && (
          <CardContent className="space-y-3">
            {development_plan.stretch_assignments?.map((assignment, idx) => (
              <div key={idx} className="border rounded-lg p-3">
                <p className="font-medium text-slate-900 mb-2">{assignment.assignment}</p>
                <div className="flex flex-wrap gap-1 mb-2">
                  {assignment.skills_developed?.map((skill, sIdx) => (
                    <Badge key={sIdx} variant="outline" className="text-xs">{skill}</Badge>
                  ))}
                </div>
                <p className="text-xs text-slate-600">Duration: {assignment.estimated_duration}</p>
              </div>
            ))}
          </CardContent>
        )}
      </Card>

      {/* Mentorship */}
      <Card>
        <CardHeader className="cursor-pointer" onClick={() => toggleSection('mentorship')}>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Mentorship Recommendations ({development_plan.mentorship_recommendations?.length || 0})
            </span>
            {expandedSection === 'mentorship' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </CardTitle>
        </CardHeader>
        {expandedSection === 'mentorship' && (
          <CardContent className="space-y-3">
            {development_plan.mentorship_recommendations?.map((mentor, idx) => (
              <div key={idx} className="border rounded-lg p-3 bg-blue-50">
                <p className="font-medium text-slate-900 mb-1">{mentor.area}</p>
                <p className="text-sm text-slate-700 mb-2">{mentor.ideal_mentor_profile}</p>
                <div className="flex flex-wrap gap-1">
                  {mentor.focus_topics?.map((topic, tIdx) => (
                    <span key={tIdx} className="text-xs bg-white px-2 py-1 rounded">{topic}</span>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        )}
      </Card>

      {/* Career Timeline */}
      {development_plan.career_timeline && (
        <Card className="border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              Career Progression Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Current Position</p>
                  <p className="font-semibold text-slate-900">{development_plan.career_timeline.current_position}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-600">Target Role</p>
                  <p className="font-semibold text-purple-600">{development_plan.career_timeline.next_role}</p>
                </div>
              </div>
              <div className="border-t pt-3">
                <p className="text-sm text-slate-600 mb-2">Estimated Timeline: {development_plan.career_timeline.estimated_timeline}</p>
                <div className="space-y-1">
                  {development_plan.career_timeline.key_milestones?.map((milestone, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <Calendar className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-slate-700">{milestone}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}