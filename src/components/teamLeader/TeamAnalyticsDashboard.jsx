import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Award, 
  Users, 
  Target,
  Calendar,
  MessageSquare,
  Star
} from 'lucide-react';

export default function TeamAnalyticsDashboard({ team, members }) {
  // Fetch team member points
  const { data: memberPoints = [], isLoading: pointsLoading } = useQuery({
    queryKey: ['team-member-points', team?.id],
    queryFn: async () => {
      const allPoints = await base44.entities.UserPoints.filter({});
      return allPoints.filter(p => p.team_id === team?.id);
    },
    enabled: !!team?.id
  });

  // Fetch team participations
  const { data: teamParticipations = [], isLoading: participationsLoading } = useQuery({
    queryKey: ['team-participations', members],
    queryFn: async () => {
      if (!members.length) return [];
      const memberEmails = members.map(m => m.user_email);
      const allParticipations = await base44.entities.Participation.filter({});
      return allParticipations.filter(p => memberEmails.includes(p.user_email));
    },
    enabled: members.length > 0
  });

  // Fetch team recognitions
  const { data: teamRecognitions = [], isLoading: recognitionsLoading } = useQuery({
    queryKey: ['team-recognitions', members],
    queryFn: async () => {
      if (!members.length) return [];
      const memberEmails = members.map(m => m.user_email);
      const allRecognitions = await base44.entities.Recognition.filter({
        status: 'approved'
      });
      return allRecognitions.filter(r => 
        memberEmails.includes(r.sender_email) || 
        memberEmails.includes(r.recipient_email)
      );
    },
    enabled: members.length > 0
  });

  const isLoading = pointsLoading || participationsLoading || recognitionsLoading;

  // Calculate metrics
  const totalPoints = memberPoints.reduce((sum, p) => sum + (p.total_points || 0), 0);
  const avgPointsPerMember = members.length > 0 ? Math.round(totalPoints / members.length) : 0;
  const totalEvents = teamParticipations.filter(p => p.attendance_status === 'attended').length;
  const totalRecognitions = teamRecognitions.length;
  
  // Top performers
  const topPerformers = memberPoints
    .sort((a, b) => (b.total_points || 0) - (a.total_points || 0))
    .slice(0, 5);

  // Engagement trend (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentParticipations = teamParticipations.filter(p => 
    new Date(p.created_date) > thirtyDaysAgo
  );
  const engagementRate = members.length > 0 
    ? Math.round((recentParticipations.length / members.length) * 100) 
    : 0;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-int-orange border-t-transparent rounded-full mx-auto" />
          <p className="text-sm text-slate-600 mt-4">Loading analytics...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Points</p>
                <p className="text-2xl font-bold text-int-orange">{totalPoints}</p>
                <p className="text-xs text-slate-500 mt-1">Avg: {avgPointsPerMember}/member</p>
              </div>
              <Award className="h-8 w-8 text-int-orange" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Events Attended</p>
                <p className="text-2xl font-bold text-blue-600">{totalEvents}</p>
                <p className="text-xs text-slate-500 mt-1">Last 30 days</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Recognitions</p>
                <p className="text-2xl font-bold text-emerald-600">{totalRecognitions}</p>
                <p className="text-xs text-slate-500 mt-1">Given & received</p>
              </div>
              <MessageSquare className="h-8 w-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Engagement</p>
                <p className="text-2xl font-bold text-purple-600">{engagementRate}%</p>
                <p className="text-xs text-slate-500 mt-1">30-day rate</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-int-gold" />
            Top Performers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topPerformers.map((performer, idx) => (
              <div key={performer.id} className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-int-orange to-int-gold flex items-center justify-center text-white font-bold text-sm">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{performer.user_email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Progress 
                      value={(performer.total_points / (topPerformers[0]?.total_points || 1)) * 100} 
                      className="flex-1 h-2"
                    />
                    <span className="text-sm font-medium text-int-orange">
                      {performer.total_points} pts
                    </span>
                  </div>
                </div>
                {performer.current_streak > 0 && (
                  <Badge variant="outline" className="gap-1">
                    🔥 {performer.current_streak} day streak
                  </Badge>
                )}
              </div>
            ))}
            {topPerformers.length === 0 && (
              <p className="text-center text-slate-500 py-8">No activity data yet</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Team Activity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Team Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {teamRecognitions.slice(0, 5).map((recognition) => (
              <div key={recognition.id} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
                <MessageSquare className="h-5 w-5 text-int-orange mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-medium">{recognition.sender_name}</span>
                    {' recognized '}
                    <span className="font-medium">{recognition.recipient_name}</span>
                  </p>
                  <p className="text-xs text-slate-600 mt-1">{recognition.message}</p>
                  <Badge className="mt-2 text-xs" variant="outline">
                    {recognition.category}
                  </Badge>
                </div>
              </div>
            ))}
            {teamRecognitions.length === 0 && (
              <p className="text-center text-slate-500 py-8">No recent recognitions</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}