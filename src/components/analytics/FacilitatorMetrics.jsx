import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { Star, Users, Calendar, TrendingUp, Award } from 'lucide-react';

export default function FacilitatorMetrics({ events = [], participations = [] }) {
  // Calculate facilitator performance metrics
  const facilitatorStats = useMemo(() => {
    const stats = {};

    (events || []).forEach(event => {
      const email = event.facilitator_email || event.created_by;
      const name = event.facilitator_name || email?.split('@')[0] || 'Unknown';
      
      if (!email) return;

      if (!stats[email]) {
        stats[email] = {
          email,
          name,
          totalEvents: 0,
          completedEvents: 0,
          totalParticipants: 0,
          totalAttended: 0,
          totalEngagement: 0,
          engagementCount: 0,
          feedbackCount: 0,
          activityTypes: new Set()
        };
      }

      const eventParticipations = (participations || []).filter(p => p.event_id === event.id);
      const activity = event.activity_id;

      stats[email].totalEvents += 1;
      if (event.status === 'completed') stats[email].completedEvents += 1;
      stats[email].totalParticipants += eventParticipations.length;
      stats[email].totalAttended += eventParticipations.filter(p => p.attended).length;
      
      eventParticipations.forEach(p => {
        if (p.engagement_score) {
          stats[email].totalEngagement += p.engagement_score;
          stats[email].engagementCount += 1;
        }
        if (p.feedback_submitted) {
          stats[email].feedbackCount += 1;
        }
      });

      if (activity) stats[email].activityTypes.add(activity);
    });

    return Object.values(stats)
      .map(stat => ({
        ...stat,
        attendanceRate: stat.totalParticipants > 0 
          ? Math.round((stat.totalAttended / stat.totalParticipants) * 100) 
          : 0,
        avgEngagement: stat.engagementCount > 0 
          ? Math.round((stat.totalEngagement / stat.engagementCount) * 10) / 10 
          : 0,
        completionRate: stat.totalEvents > 0 
          ? Math.round((stat.completedEvents / stat.totalEvents) * 100) 
          : 0,
        activityDiversity: stat.activityTypes.size,
        // Calculate overall score (weighted average)
        overallScore: Math.round(
          (stat.totalParticipants > 0 ? (stat.totalAttended / stat.totalParticipants) * 30 : 0) +
          (stat.engagementCount > 0 ? (stat.totalEngagement / stat.engagementCount) * 10 : 0) +
          (stat.totalEvents > 0 ? (stat.completedEvents / stat.totalEvents) * 20 : 0) +
          Math.min(stat.totalEvents * 2, 20) +
          Math.min(stat.activityTypes.size * 5, 20)
        )
      }))
      .sort((a, b) => b.overallScore - a.overallScore);
  }, [events, participations]);

  // Top facilitator for radar chart
  const topFacilitator = facilitatorStats[0];
  const radarData = topFacilitator ? [
    { metric: 'Attendance', value: topFacilitator.attendanceRate, fullMark: 100 },
    { metric: 'Engagement', value: topFacilitator.avgEngagement * 20, fullMark: 100 },
    { metric: 'Completion', value: topFacilitator.completionRate, fullMark: 100 },
    { metric: 'Volume', value: Math.min(topFacilitator.totalEvents * 10, 100), fullMark: 100 },
    { metric: 'Diversity', value: Math.min(topFacilitator.activityDiversity * 20, 100), fullMark: 100 }
  ] : [];

  // Chart data for comparison
  const chartData = facilitatorStats.slice(0, 8).map(f => ({
    name: f.name.split(' ')[0],
    attendance: f.attendanceRate,
    engagement: f.avgEngagement * 20,
    events: f.totalEvents
  }));

  return (
    <div className="space-y-6">
      {/* Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {facilitatorStats.slice(0, 3).map((facilitator, index) => (
          <Card key={facilitator.email} className={`border-0 shadow-lg ${index === 0 ? 'ring-2 ring-int-orange' : ''}`}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="relative">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-int-navy text-white">
                      {facilitator.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {index === 0 && (
                    <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-1">
                      <Award className="h-3 w-3 text-yellow-900" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold truncate">{facilitator.name}</h4>
                  <p className="text-sm text-slate-500 truncate">{facilitator.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      Score: {facilitator.overallScore}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      #{index + 1}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Events</span>
                  <span className="font-medium">{facilitator.totalEvents}</span>
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-slate-500">Attendance</span>
                    <span className="font-medium">{facilitator.attendanceRate}%</span>
                  </div>
                  <Progress value={facilitator.attendanceRate} className="h-1.5" />
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-slate-500">Engagement</span>
                    <span className="font-medium">{facilitator.avgEngagement}/5</span>
                  </div>
                  <Progress value={facilitator.avgEngagement * 20} className="h-1.5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Radar */}
        {topFacilitator && (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-500" />
                Top Facilitator: {topFacilitator.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <Radar
                    name="Performance"
                    dataKey="value"
                    stroke="#F47C20"
                    fill="#F47C20"
                    fillOpacity={0.4}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Comparison Chart */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Facilitator Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="attendance" fill="#0A1C39" name="Attendance %" radius={[4, 4, 0, 0]} />
                <Bar dataKey="engagement" fill="#F47C20" name="Engagement" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Full Leaderboard */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>All Facilitators</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Rank</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Facilitator</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-slate-500">Events</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-slate-500">Participants</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-slate-500">Attendance</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-slate-500">Engagement</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-slate-500">Score</th>
                </tr>
              </thead>
              <tbody>
                {facilitatorStats.map((facilitator, index) => (
                  <tr key={facilitator.email} className="border-b hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <Badge variant={index < 3 ? "default" : "outline"} className={index < 3 ? "bg-int-orange" : ""}>
                        #{index + 1}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs bg-slate-200">
                            {facilitator.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{facilitator.name}</p>
                          <p className="text-xs text-slate-500">{facilitator.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">{facilitator.totalEvents}</td>
                    <td className="py-3 px-4 text-center">{facilitator.totalParticipants}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={facilitator.attendanceRate >= 70 ? "text-green-600" : "text-amber-600"}>
                        {facilitator.attendanceRate}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500" />
                        {facilitator.avgEngagement}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center font-semibold">{facilitator.overallScore}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}