import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Calendar, TrendingUp } from 'lucide-react';

export default function ProjectContributionsShowcase({ contributions }) {
  if (!contributions?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-purple-600" />
            Project Contributions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600">No projects added yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-purple-600" />
          Project Contributions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {contributions.map((project, idx) => (
          <div key={idx} className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-100">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="font-semibold text-slate-900">{project.project_name}</h4>
                <p className="text-sm text-purple-700">{project.role}</p>
              </div>
              <Badge className="bg-purple-600">
                {project.end_date ? 'Completed' : 'Ongoing'}
              </Badge>
            </div>
            <p className="text-sm text-slate-700 mb-3">{project.impact}</p>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <Calendar className="w-3 h-3" />
              {new Date(project.start_date).toLocaleDateString()} - 
              {project.end_date ? new Date(project.end_date).toLocaleDateString() : 'Present'}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}