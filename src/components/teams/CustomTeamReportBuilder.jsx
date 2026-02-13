import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Download, Calendar } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { toast } from 'sonner';

export default function CustomTeamReportBuilder({ teamId }) {
  const [reportConfig, setReportConfig] = useState({
    dateRange: 30,
    includeEngagement: true,
    includePoints: true,
    includeChallenges: true,
    includeLearning: true,
    includeRecognitions: true,
    includeMemberDetails: true,
    format: 'json'
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: team } = useQuery({
    queryKey: ['team', teamId],
    queryFn: () => base44.entities.Team.get(teamId),
    enabled: !!teamId
  });

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    try {
      const startDate = subDays(new Date(), reportConfig.dateRange).toISOString();
      const endDate = new Date().toISOString();

      // Fetch data based on configuration
      const [memberships, allUsers, points, participations, challengeParticipations, learningProgress, recognitions] = await Promise.all([
        base44.entities.TeamMembership.filter({ team_id: teamId }),
        base44.asServiceRole.entities.User.list(),
        reportConfig.includePoints ? base44.entities.UserPoints.list() : Promise.resolve([]),
        reportConfig.includeEngagement ? base44.entities.Participation.list() : Promise.resolve([]),
        reportConfig.includeChallenges ? base44.entities.ChallengeParticipation.list() : Promise.resolve([]),
        reportConfig.includeLearning ? base44.entities.LearningPathProgress.list() : Promise.resolve([]),
        reportConfig.includeRecognitions ? base44.entities.Recognition.list() : Promise.resolve([])
      ]);

      const memberEmails = memberships.map(m => m.user_email);
      
      // Build report data
      const reportData = {
        team: {
          id: team.id,
          name: team.name,
          description: team.description
        },
        generatedAt: new Date().toISOString(),
        dateRange: {
          start: startDate,
          end: endDate,
          days: reportConfig.dateRange
        },
        memberCount: memberEmails.length,
        summary: {}
      };

      // Add sections based on config
      if (reportConfig.includePoints) {
        const teamPoints = points.filter(p => memberEmails.includes(p.user_email));
        reportData.summary.points = {
          total: teamPoints.reduce((sum, p) => sum + (p.total_points || 0), 0),
          average: teamPoints.reduce((sum, p) => sum + (p.total_points || 0), 0) / (teamPoints.length || 1),
          distribution: teamPoints.reduce((acc, p) => {
            const tier = p.tier || 'Bronze';
            acc[tier] = (acc[tier] || 0) + 1;
            return acc;
          }, {})
        };
      }

      if (reportConfig.includeEngagement) {
        const teamParticipations = participations.filter(p => 
          memberEmails.includes(p.user_email) &&
          new Date(p.created_date) >= new Date(startDate)
        );
        reportData.summary.engagement = {
          totalActivities: teamParticipations.length,
          attended: teamParticipations.filter(p => p.attendance_status === 'attended').length,
          attendanceRate: teamParticipations.length > 0 ? 
            (teamParticipations.filter(p => p.attendance_status === 'attended').length / teamParticipations.length * 100) : 0
        };
      }

      if (reportConfig.includeChallenges) {
        const teamChallenges = challengeParticipations.filter(cp => 
          memberEmails.includes(cp.user_email) &&
          new Date(cp.joined_date) >= new Date(startDate)
        );
        reportData.summary.challenges = {
          total: teamChallenges.length,
          active: teamChallenges.filter(cp => cp.status === 'active').length,
          completed: teamChallenges.filter(cp => cp.status === 'completed').length,
          completionRate: teamChallenges.length > 0 ?
            (teamChallenges.filter(cp => cp.status === 'completed').length / teamChallenges.length * 100) : 0
        };
      }

      if (reportConfig.includeLearning) {
        const teamLearning = learningProgress.filter(lp => memberEmails.includes(lp.user_email));
        reportData.summary.learning = {
          enrolled: teamLearning.length,
          inProgress: teamLearning.filter(lp => lp.status === 'in_progress').length,
          completed: teamLearning.filter(lp => lp.status === 'completed').length,
          averageProgress: teamLearning.reduce((sum, lp) => sum + (lp.progress_percentage || 0), 0) / (teamLearning.length || 1)
        };
      }

      if (reportConfig.includeRecognitions) {
        const teamRecognitions = recognitions.filter(r => 
          (memberEmails.includes(r.sender_email) || memberEmails.includes(r.recipient_email)) &&
          new Date(r.created_date) >= new Date(startDate)
        );
        reportData.summary.recognitions = {
          total: teamRecognitions.length,
          given: teamRecognitions.filter(r => memberEmails.includes(r.sender_email)).length,
          received: teamRecognitions.filter(r => memberEmails.includes(r.recipient_email)).length
        };
      }

      if (reportConfig.includeMemberDetails) {
        reportData.members = memberEmails.map(email => {
          const user = allUsers.find(u => u.email === email);
          const userPoints = points.find(p => p.user_email === email);
          const userParticipations = participations.filter(p => p.user_email === email);
          const userChallenges = challengeParticipations.filter(cp => cp.user_email === email);
          const userLearning = learningProgress.filter(lp => lp.user_email === email);

          return {
            name: user?.full_name || email,
            email,
            points: userPoints?.total_points || 0,
            tier: userPoints?.tier || 'Bronze',
            activities: userParticipations.filter(p => p.attendance_status === 'attended').length,
            challenges: userChallenges.filter(cp => cp.status === 'completed').length,
            learning: userLearning.filter(lp => lp.status === 'completed').length
          };
        }).sort((a, b) => b.points - a.points);
      }

      // Export based on format
      const fileName = `${team.name.replace(/\s+/g, '-')}-report-${format(new Date(), 'yyyy-MM-dd')}`;
      
      if (reportConfig.format === 'json') {
        const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${fileName}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      } else if (reportConfig.format === 'csv') {
        // Convert to CSV
        let csv = 'Member,Email,Points,Tier,Activities,Challenges,Learning\n';
        reportData.members?.forEach(member => {
          csv += `"${member.name}","${member.email}",${member.points},"${member.tier}",${member.activities},${member.challenges},${member.learning}\n`;
        });
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${fileName}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      }

      toast.success('Report generated successfully');
    } catch (error) {
      console.error('Report generation error:', error);
      toast.error('Failed to generate report');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-int-orange" />
          Custom Team Report Builder
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Date Range */}
        <div>
          <Label className="mb-2 block">Date Range</Label>
          <Select 
            value={reportConfig.dateRange.toString()} 
            onValueChange={(value) => setReportConfig({ ...reportConfig, dateRange: parseInt(value) })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="180">Last 6 months</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Include Sections */}
        <div className="space-y-3">
          <Label className="block">Include in Report</Label>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="engagement" 
              checked={reportConfig.includeEngagement}
              onCheckedChange={(checked) => setReportConfig({ ...reportConfig, includeEngagement: checked })}
            />
            <Label htmlFor="engagement" className="cursor-pointer">User Engagement Metrics</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="points" 
              checked={reportConfig.includePoints}
              onCheckedChange={(checked) => setReportConfig({ ...reportConfig, includePoints: checked })}
            />
            <Label htmlFor="points" className="cursor-pointer">Points & Tier Distribution</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="challenges" 
              checked={reportConfig.includeChallenges}
              onCheckedChange={(checked) => setReportConfig({ ...reportConfig, includeChallenges: checked })}
            />
            <Label htmlFor="challenges" className="cursor-pointer">Challenge Participation</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="learning" 
              checked={reportConfig.includeLearning}
              onCheckedChange={(checked) => setReportConfig({ ...reportConfig, includeLearning: checked })}
            />
            <Label htmlFor="learning" className="cursor-pointer">Learning Path Progress</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="recognitions" 
              checked={reportConfig.includeRecognitions}
              onCheckedChange={(checked) => setReportConfig({ ...reportConfig, includeRecognitions: checked })}
            />
            <Label htmlFor="recognitions" className="cursor-pointer">Recognition Activity</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="members" 
              checked={reportConfig.includeMemberDetails}
              onCheckedChange={(checked) => setReportConfig({ ...reportConfig, includeMemberDetails: checked })}
            />
            <Label htmlFor="members" className="cursor-pointer">Individual Member Details</Label>
          </div>
        </div>

        {/* Export Format */}
        <div>
          <Label className="mb-2 block">Export Format</Label>
          <Select 
            value={reportConfig.format} 
            onValueChange={(value) => setReportConfig({ ...reportConfig, format: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="json">JSON (detailed)</SelectItem>
              <SelectItem value="csv">CSV (member data)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Generate Button */}
        <Button 
          onClick={handleGenerateReport} 
          className="w-full bg-int-orange hover:bg-[#C46322]"
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>Generating...</>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Generate Report
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}