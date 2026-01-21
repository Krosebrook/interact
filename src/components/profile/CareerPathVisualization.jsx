import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, MapPin, Calendar } from 'lucide-react';

export default function CareerPathVisualization({ careerHistory, currentRole, performanceMetrics, skills }) {
  const sortedHistory = [...(careerHistory || [])].sort((a, b) => 
    new Date(a.start_date) - new Date(b.start_date)
  );

  // Add current role to the end
  const fullPath = [
    ...sortedHistory,
    {
      title: currentRole,
      start_date: sortedHistory.length > 0 ? sortedHistory[sortedHistory.length - 1].end_date : null,
      end_date: null,
      current: true
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-600" />
          Career Progression
        </CardTitle>
      </CardHeader>
      <CardContent>
        {performanceMetrics && (
          <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
            <div className="text-center">
              <p className="text-xs text-slate-600 mb-1">Productivity</p>
              <p className="text-2xl font-bold text-green-600">
                {performanceMetrics.productivity_score || 0}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-600 mb-1">Collaboration</p>
              <p className="text-2xl font-bold text-blue-600">
                {performanceMetrics.collaboration_score || 0}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-600 mb-1">Innovation</p>
              <p className="text-2xl font-bold text-purple-600">
                {performanceMetrics.innovation_score || 0}
              </p>
            </div>
          </div>
        )}

        <div className="relative">
          {/* Vertical timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-600 to-purple-600" />

          <div className="space-y-6">
            {fullPath.map((position, idx) => (
              <div key={idx} className="relative pl-16">
                {/* Timeline dot */}
                <div className={`absolute left-3 top-1 h-6 w-6 rounded-full border-4 ${
                  position.current 
                    ? 'bg-green-600 border-green-200' 
                    : 'bg-blue-600 border-blue-200'
                }`} />

                <div className={`p-4 rounded-lg ${
                  position.current 
                    ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200' 
                    : 'bg-slate-50 border border-slate-200'
                }`}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-slate-900">{position.title}</h4>
                      {position.department && (
                        <p className="text-sm text-slate-600">{position.department}</p>
                      )}
                    </div>
                    {position.current && (
                      <Badge className="bg-green-600">Current</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Calendar className="w-3 h-3" />
                    {position.start_date ? new Date(position.start_date).toLocaleDateString() : 'Start'} - 
                    {position.end_date ? new Date(position.end_date).toLocaleDateString() : 'Present'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {skills?.length > 0 && (
          <div className="mt-6 pt-6 border-t">
            <h4 className="font-semibold text-slate-900 mb-3">Key Skills Developed</h4>
            <div className="flex flex-wrap gap-2">
              {skills.slice(0, 8).map((skill, idx) => (
                <Badge key={idx} variant="outline" className="border-purple-200">
                  {skill.skill_name}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}