import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, TrendingUp, BookOpen, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const SEVERITY_COLORS = {
  critical: 'bg-red-100 text-red-800 border-red-300',
  moderate: 'bg-orange-100 text-orange-800 border-orange-300',
  minor: 'bg-yellow-100 text-yellow-800 border-yellow-300'
};

export default function SkillGapAnalysis({ userEmail }) {
  const { data, isLoading } = useQuery({
    queryKey: ['skill-gaps', userEmail],
    queryFn: async () => {
      const response = await base44.functions.invoke('aiCoachingRecommendations', {
        target_user_email: userEmail,
        focus_area: 'skill development'
      });
      return response.data;
    },
    enabled: !!userEmail
  });

  if (isLoading) {
    return <div className="text-sm text-slate-500">Analyzing skills...</div>;
  }

  const skillGaps = data?.coaching?.skill_gaps || [];
  const skillDev = data?.coaching?.skill_development_opportunities || [];

  if (skillGaps.length === 0 && skillDev.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Skill Gaps */}
      {skillGaps.length > 0 && (
        <Card className="border-2 border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertCircle className="h-5 w-5 text-red-600" />
              Skill Gaps to Address
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {skillGaps.map((gap, idx) => (
                <div key={idx} className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-slate-900">{gap.skill}</h4>
                    <Badge className={SEVERITY_COLORS[gap.gap_severity]}>
                      {gap.gap_severity}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-700 mb-2">
                    <strong>Impact:</strong> {gap.impact}
                  </p>
                  <div className="bg-white p-2 rounded text-xs text-slate-600">
                    💡 {gap.suggested_learning_path}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Development Opportunities */}
      {skillDev.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Growth Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {skillDev.map((skill, idx) => (
                <div key={idx} className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-slate-900">{skill.skill}</h4>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="capitalize">{skill.current_level}</Badge>
                      <Badge className="bg-green-600">→ {skill.target_level}</Badge>
                    </div>
                  </div>
                  <p className="text-sm text-slate-700 mb-2">{skill.suggested_path}</p>
                  <p className="text-xs text-green-700 mb-2">⏱️ {skill.estimated_time}</p>
                  
                  {skill.resource_objects?.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs font-medium text-slate-800">Recommended Resources:</p>
                      {skill.resource_objects.map((resource, ridx) => (
                        <div key={ridx} className="bg-white p-3 rounded border border-green-200">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="font-medium text-sm">{resource.title}</div>
                              <div className="text-xs text-slate-600">{resource.description}</div>
                              <Badge variant="outline" className="mt-1 text-xs capitalize">
                                {resource.resource_type}
                              </Badge>
                            </div>
                            {resource.url && (
                              <a 
                                href={resource.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-purple-600 hover:text-purple-700"
                              >
                                <ArrowRight className="h-4 w-4" />
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <Link to={createPageUrl('LearningDashboard')}>
              <Button className="w-full mt-4" variant="outline">
                <BookOpen className="h-4 w-4 mr-2" />
                Explore Learning Paths
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}