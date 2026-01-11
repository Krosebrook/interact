import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useUserData } from '../components/hooks/useUserData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Folder,
  Plus,
  AlertTriangle,
  TrendingUp,
  Users,
  Clock,
  CheckCircle2,
  FileText,
  Sparkles
} from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { toast } from 'sonner';

export default function ProjectManagement() {
  const { user, loading: userLoading } = useUserData(true);
  const queryClient = useQueryClient();
  const [selectedProject, setSelectedProject] = useState(null);

  // Fetch projects
  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => base44.entities.Project.list()
  });

  // Risk analysis mutation
  const riskAnalysisMutation = useMutation({
    mutationFn: async (projectId) => {
      const result = await base44.functions.invoke('aiProjectRiskAnalysis', {
        project_id: projectId
      });
      return result.data || result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['projects']);
      toast.success(`Risk analysis complete: ${data.analysis.risk_level} risk`);
    }
  });

  // Status report mutation
  const statusReportMutation = useMutation({
    mutationFn: async (projectId) => {
      const result = await base44.functions.invoke('aiProjectStatusReport', {
        project_id: projectId
      });
      return result.data || result;
    }
  });

  if (userLoading) {
    return <LoadingSpinner className="min-h-[60vh]" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel-solid">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600">
              <Folder className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-int-navy">Project Management</h1>
              <p className="text-slate-600">AI-powered project tracking & insights</p>
            </div>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <LoadingSpinner message="Loading projects..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects?.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onAnalyzeRisk={() => riskAnalysisMutation.mutate(project.id)}
              onGenerateReport={() => statusReportMutation.mutate(project.id)}
              isAnalyzing={riskAnalysisMutation.isPending}
            />
          ))}
        </div>
      )}

      {/* Status Report Dialog */}
      {statusReportMutation.data && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-3xl w-full max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Project Status Report</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">Executive Summary</h3>
                <p className="text-slate-700">{statusReportMutation.data.report.executive_summary}</p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Progress Highlights</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {statusReportMutation.data.report.progress_highlights?.map((h, i) => (
                    <li key={i} className="text-slate-700">{h}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Current Challenges</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {statusReportMutation.data.report.current_challenges?.map((c, i) => (
                    <li key={i} className="text-slate-700">{c}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Recommendations</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {statusReportMutation.data.report.recommendations?.map((r, i) => (
                    <li key={i} className="text-slate-700">{r}</li>
                  ))}
                </ul>
              </div>

              <Button onClick={() => statusReportMutation.reset()}>Close</Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function ProjectCard({ project, onAnalyzeRisk, onGenerateReport, isAnalyzing }) {
  const getRiskColor = (score) => {
    if (!score) return 'gray';
    if (score >= 75) return 'red';
    if (score >= 50) return 'orange';
    if (score >= 25) return 'yellow';
    return 'green';
  };

  const riskColor = getRiskColor(project.risk_score);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{project.project_name}</CardTitle>
            <p className="text-sm text-slate-600 mt-1">{project.description}</p>
          </div>
          <Badge className={`bg-${project.status === 'active' ? 'green' : 'gray'}-600`}>
            {project.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-600">Progress</span>
            <span className="font-medium">{project.progress_percentage || 0}%</span>
          </div>
          <Progress value={project.progress_percentage || 0} />
        </div>

        {/* Risk Score */}
        {project.risk_score && (
          <div className={`p-3 rounded-lg bg-${riskColor}-50 border border-${riskColor}-200`}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Risk Score</span>
              <Badge className={`bg-${riskColor}-600`}>{Math.round(project.risk_score)}/100</Badge>
            </div>
            {project.predicted_delay_days > 0 && (
              <p className="text-xs text-slate-600 mt-1">
                Predicted delay: {project.predicted_delay_days} days
              </p>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-slate-500" />
            <span>{project.team_members?.length || 0} members</span>
          </div>
          {project.due_date && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-slate-500" />
              <span>{new Date(project.due_date).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onAnalyzeRisk}
            disabled={isAnalyzing}
            className="flex-1"
          >
            <Sparkles className="h-3 w-3 mr-1" />
            Analyze Risk
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onGenerateReport}
            className="flex-1"
          >
            <FileText className="h-3 w-3 mr-1" />
            Report
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}