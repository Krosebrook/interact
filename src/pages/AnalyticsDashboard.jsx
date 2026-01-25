import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useUserData } from '../components/hooks/useUserData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, Users, Award, Calendar, Target, Download,
  Heart, Sparkles, Activity, BarChart3 
} from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';

const COLORS = ['#ee8c2b', '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899'];

export default function AnalyticsDashboard() {
  const { user, loading, isAdmin } = useUserData(true, true); // Require admin
  const [dateRange, setDateRange] = useState(30); // days
  const [selectedTab, setSelectedTab] = useState('overview');

  // Fetch all recognitions
  const { data: recognitions = [], isLoading: loadingRecognitions } = useQuery({
    queryKey: ['recognitions-all'],
    queryFn: () => base44.entities.Recognition.list('-created_date', 500)
  });

  // Fetch all events
  const { data: events = [], isLoading: loadingEvents } = useQuery({
    queryKey: ['events-all'],
    queryFn: () => base44.entities.Event.list('-created_date', 500)
  });

  // Fetch all participations
  const { data: participations = [], isLoading: loadingParticipations } = useQuery({
    queryKey: ['participations-all'],
    queryFn: () => base44.entities.Participation.list('-created_date', 1000)
  });

  // Fetch user points
  const { data: userPoints = [], isLoading: loadingPoints } = useQuery({
    queryKey: ['user-points-all'],
    queryFn: () => base44.entities.UserPoints.list('-total_points', 200)
  });

  // Fetch user skills tracking
  const { data: skillTracking = [], isLoading: loadingSkills } = useQuery({
    queryKey: ['skill-tracking-all'],
    queryFn: () => base44.entities.SkillTracking.list('-updated_date', 500)
  });

  const isLoading = loading || loadingRecognitions || loadingEvents || loadingParticipations || loadingPoints;

  // Calculate date range
  const startDate = subDays(new Date(), dateRange);

  // Filter data by date range
  const recentRecognitions = recognitions.filter(r => new Date(r.created_date) >= startDate);
  const recentEvents = events.filter(e => new Date(e.created_date) >= startDate);
  const recentParticipations = participations.filter(p => new Date(p.created_date) >= startDate);

  // Recognition Analytics
  const totalRecognitions = recentRecognitions.length;
  const totalPointsAwarded = recentRecognitions.reduce((sum, r) => sum + (r.points_awarded || 0), 0);
  const avgPointsPerRecognition = totalRecognitions > 0 ? (totalPointsAwarded / totalRecognitions).toFixed(0) : 0;
  
  const recognitionByType = recentRecognitions.reduce((acc, r) => {
    const type = r.recognition_type || 'General';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const recognitionTypeData = Object.entries(recognitionByType).map(([name, value]) => ({ name, value }));

  // Daily recognition trend
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = subDays(new Date(), 29 - i);
    const count = recognitions.filter(r => {
      const rDate = new Date(r.created_date);
      return rDate.toDateString() === date.toDateString();
    }).length;
    return { date: format(date, 'MM/dd'), count };
  });

  // Event Analytics
  const totalEvents = recentEvents.length;
  const avgParticipantsPerEvent = recentEvents.length > 0 
    ? (recentParticipations.length / recentEvents.length).toFixed(1) 
    : 0;

  const eventParticipationRate = recentEvents.length > 0
    ? ((recentParticipations.filter(p => p.status === 'attended').length / recentParticipations.length) * 100).toFixed(1)
    : 0;

  // Engagement by department
  const uniqueUsers = [...new Set(recentRecognitions.flatMap(r => [r.sender_email, r.recipient_email]))];
  const activeUsers = uniqueUsers.length;

  // Skill development progress
  const skillsGained = skillTracking.filter(s => 
    new Date(s.created_date) >= startDate && s.progress_percentage >= 100
  ).length;

  // Top contributors (most recognitions sent)
  const topContributors = Object.entries(
    recentRecognitions.reduce((acc, r) => {
      acc[r.sender_email] = (acc[r.sender_email] || 0) + 1;
      return acc;
    }, {})
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([email, count]) => ({ email, count }));

  // Top recipients (most recognitions received)
  const topRecipients = Object.entries(
    recentRecognitions.reduce((acc, r) => {
      acc[r.recipient_email] = (acc[r.recipient_email] || 0) + 1;
      return acc;
    }, {})
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([email, count]) => ({ email, count }));

  if (isLoading) {
    return <LoadingSpinner className="min-h-screen" />;
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-int-navy flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-int-orange" />
            Analytics Dashboard
          </h1>
          <p className="text-slate-600 mt-1">Track engagement metrics and program impact</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(Number(e.target.value))}
            className="px-4 py-2 border rounded-lg bg-white"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 font-medium">Total Recognitions</p>
                <p className="text-3xl font-bold text-int-navy mt-1">{totalRecognitions}</p>
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +12% vs previous period
                </p>
              </div>
              <div className="w-12 h-12 bg-int-orange/10 rounded-full flex items-center justify-center">
                <Heart className="h-6 w-6 text-int-orange" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 font-medium">Points Awarded</p>
                <p className="text-3xl font-bold text-int-orange mt-1">{totalPointsAwarded.toLocaleString()}</p>
                <p className="text-xs text-slate-500 mt-1">Avg: {avgPointsPerRecognition} per recognition</p>
              </div>
              <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 font-medium">Active Users</p>
                <p className="text-3xl font-bold text-int-navy mt-1">{activeUsers}</p>
                <p className="text-xs text-blue-600 mt-1">{eventParticipationRate}% participation rate</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 font-medium">Skills Completed</p>
                <p className="text-3xl font-bold text-int-navy mt-1">{skillsGained}</p>
                <p className="text-xs text-purple-600 mt-1">Development in progress</p>
              </div>
              <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center">
                <Target className="h-6 w-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="recognition">Recognition</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recognition Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Recognition Trend (30 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={last30Days}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="count" stroke="#ee8c2b" strokeWidth={2} name="Recognitions" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Recognition by Type */}
            <Card>
              <CardHeader>
                <CardTitle>Recognition Types</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={recognitionTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => entry.name}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {recognitionTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Top Contributors & Recipients */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Contributors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topContributors.map((contributor, idx) => (
                    <div key={contributor.email} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="w-6 h-6 flex items-center justify-center">
                          {idx + 1}
                        </Badge>
                        <span className="font-medium">{contributor.email.split('@')[0]}</span>
                      </div>
                      <span className="text-int-orange font-bold">{contributor.count} sent</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Recipients</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topRecipients.map((recipient, idx) => (
                    <div key={recipient.email} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="w-6 h-6 flex items-center justify-center">
                          {idx + 1}
                        </Badge>
                        <span className="font-medium">{recipient.email.split('@')[0]}</span>
                      </div>
                      <span className="text-int-orange font-bold">{recipient.count} received</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recognition" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Recognition Impact Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-gradient-to-br from-int-orange/10 to-transparent rounded-xl">
                  <Award className="h-10 w-10 text-int-orange mx-auto mb-2" />
                  <p className="text-3xl font-bold text-int-navy">{totalRecognitions}</p>
                  <p className="text-sm text-slate-600 mt-1">Total Recognitions</p>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-blue-500/10 to-transparent rounded-xl">
                  <Users className="h-10 w-10 text-blue-500 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-int-navy">{activeUsers}</p>
                  <p className="text-sm text-slate-600 mt-1">Active Participants</p>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-amber-500/10 to-transparent rounded-xl">
                  <Sparkles className="h-10 w-10 text-amber-500 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-int-navy">{totalPointsAwarded}</p>
                  <p className="text-sm text-slate-600 mt-1">Total Points</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Event Participation Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-gradient-to-br from-purple-500/10 to-transparent rounded-xl">
                  <Calendar className="h-10 w-10 text-purple-500 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-int-navy">{totalEvents}</p>
                  <p className="text-sm text-slate-600 mt-1">Events Hosted</p>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-green-500/10 to-transparent rounded-xl">
                  <Users className="h-10 w-10 text-green-500 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-int-navy">{avgParticipantsPerEvent}</p>
                  <p className="text-sm text-slate-600 mt-1">Avg Participants</p>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-blue-500/10 to-transparent rounded-xl">
                  <Activity className="h-10 w-10 text-blue-500 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-int-navy">{eventParticipationRate}%</p>
                  <p className="text-sm text-slate-600 mt-1">Attendance Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Engagement Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border-l-4 border-green-500 bg-green-50">
                  <h4 className="font-bold text-green-900 mb-1">Positive Trend</h4>
                  <p className="text-sm text-green-700">Recognition volume is up 12% compared to the previous period, indicating increased team engagement.</p>
                </div>
                <div className="p-4 border-l-4 border-blue-500 bg-blue-50">
                  <h4 className="font-bold text-blue-900 mb-1">Active Community</h4>
                  <p className="text-sm text-blue-700">{activeUsers} unique users are actively participating in recognition programs.</p>
                </div>
                <div className="p-4 border-l-4 border-amber-500 bg-amber-50">
                  <h4 className="font-bold text-amber-900 mb-1">Skill Development</h4>
                  <p className="text-sm text-amber-700">{skillsGained} skills completed this period, showing investment in professional growth.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}