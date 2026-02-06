import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, TrendingUp, Award, Target } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import LoadingSpinner from '../common/LoadingSpinner';
import { toast } from 'sonner';

export default function UserProgressReportCard({ userEmail }) {
  const { data: report, isLoading } = useQuery({
    queryKey: ['userReport', userEmail],
    queryFn: async () => {
      const response = await base44.functions.invoke('generateUserProgressReport', {
        userEmail,
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString()
      });
      return response.data.report;
    },
    enabled: !!userEmail,
    staleTime: 5 * 60 * 1000
  });
  
  const exportReport = async (format) => {
    try {
      const response = await base44.functions.invoke('exportReport', {
        reportType: 'user_progress',
        reportData: report,
        format
      });
      
      const blob = new Blob([response.data], { 
        type: format === 'pdf' ? 'application/pdf' : 'text/csv' 
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `progress_report_${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      
      toast.success(`Report downloaded as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error('Export failed');
    }
  };
  
  if (isLoading) return <LoadingSpinner />;
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>My Progress Report</CardTitle>
            <CardDescription>Last 30 days performance summary</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => exportReport('pdf')}>
              <Download className="h-4 w-4 mr-1" />
              PDF
            </Button>
            <Button variant="outline" size="sm" onClick={() => exportReport('csv')}>
              <Download className="h-4 w-4 mr-1" />
              CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-int-orange/10 rounded-lg">
            <p className="text-3xl font-bold text-int-orange">{report?.overview.total_points}</p>
            <p className="text-xs text-slate-600 mt-1">Total Points</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-3xl font-bold text-blue-600">{report?.overview.current_level}</p>
            <p className="text-xs text-slate-600 mt-1">Level</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-3xl font-bold text-purple-600">{report?.overview.badges_earned}</p>
            <p className="text-xs text-slate-600 mt-1">Badges</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-3xl font-bold text-green-600">{report?.overview.current_streak}</p>
            <p className="text-xs text-slate-600 mt-1">Day Streak</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-int-orange" />
                <span className="font-semibold text-sm">Personal Goals</span>
              </div>
              <span className="text-sm text-slate-600">
                {report?.goals_summary.personal_goals.completed}/{report?.goals_summary.personal_goals.total}
              </span>
            </div>
            <Progress value={report?.goals_summary.personal_goals.completion_rate || 0} />
            <p className="text-xs text-slate-500 mt-1">
              {Math.round(report?.goals_summary.personal_goals.completion_rate || 0)}% completion rate
            </p>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-green-600" />
                <span className="font-semibold text-sm">Wellness Goals</span>
              </div>
              <span className="text-sm text-slate-600">
                {report?.goals_summary.wellness_goals.completed}/{report?.goals_summary.wellness_goals.total}
              </span>
            </div>
            <Progress value={report?.goals_summary.wellness_goals.avg_progress || 0} />
            <p className="text-xs text-slate-500 mt-1">
              {Math.round(report?.goals_summary.wellness_goals.avg_progress || 0)}% average progress
            </p>
          </div>
        </div>
        
        <div className="pt-4 border-t">
          <h4 className="font-semibold text-sm mb-3">Engagement Summary</h4>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-2xl font-bold">{report?.engagement.events_attended}</p>
              <p className="text-xs text-slate-500">Events</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">{report?.engagement.recognitions_sent}</p>
              <p className="text-xs text-slate-500">Sent</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{report?.engagement.recognitions_received}</p>
              <p className="text-xs text-slate-500">Received</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}