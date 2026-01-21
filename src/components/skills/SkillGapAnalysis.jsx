import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, TrendingDown, Sparkles } from 'lucide-react';

export default function SkillGapAnalysis() {
  const [department, setDepartment] = useState('all');

  const { data: profiles } = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => await base44.entities.UserProfile.list(),
    initialData: []
  });

  const departments = [...new Set(profiles.map(p => p.department).filter(Boolean))];

  const { data: analysis, isLoading, refetch } = useQuery({
    queryKey: ['skill-gap-analysis', department],
    queryFn: async () => {
      const response = await base44.functions.invoke('analyzeSkillGaps', {
        department: department === 'all' ? null : department
      });
      return response.data;
    },
    enabled: false
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              AI Skill Gap Analysis
            </CardTitle>
            <div className="flex gap-2">
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={() => refetch()} disabled={isLoading}>
                {isLoading ? 'Analyzing...' : 'Run Analysis'}
              </Button>
            </div>
          </div>
        </CardHeader>
        {analysis && (
          <CardContent className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-900">{analysis.ai_analysis.summary}</p>
            </div>

            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                Critical Skill Gaps
              </h3>
              <div className="space-y-2">
                {analysis.ai_analysis.critical_gaps?.map((gap, idx) => (
                  <Card key={idx} className="border-red-200">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-900 mb-1">{gap.skill_name}</h4>
                          <p className="text-sm text-slate-600">{gap.reason}</p>
                        </div>
                        <Badge className={gap.priority === 'critical' ? 'bg-red-600' : 'bg-orange-600'}>
                          {gap.priority}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-yellow-600" />
                Skills Needing Depth
              </h3>
              <div className="grid gap-2">
                {analysis.ai_analysis.depth_gaps?.map((gap, idx) => (
                  <div key={idx} className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-900">{gap.skill_name}</span>
                      <div className="text-sm text-slate-600">
                        Current: <span className="font-medium">{gap.current_level}</span> → 
                        Target: <span className="font-medium text-green-700">{gap.target_level}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Training Priorities</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1">
                    {analysis.ai_analysis.training_priorities?.map((skill, idx) => (
                      <li key={idx} className="text-sm flex items-center gap-2">
                        <span className="text-purple-600">●</span>
                        {skill}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Hiring Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1">
                    {analysis.ai_analysis.hiring_recommendations?.map((role, idx) => (
                      <li key={idx} className="text-sm flex items-center gap-2">
                        <span className="text-blue-600">●</span>
                        {role}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}