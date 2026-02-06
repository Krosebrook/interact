import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useUserData } from '../components/hooks/useUserData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Award, Calendar, Gift, Users, Download, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

const COLORS = ['#D97230', '#14294D', '#F5C16A', '#2DD4BF', '#8B5CF6', '#F59E0B'];

export default function AdminAnalyticsDashboard() {
  const { user } = useUserData();
  const [dateRange, setDateRange] = useState('30');
  const [exporting, setExporting] = useState(false);

  // Fetch all analytics data
  const { data: allUserPoints = [] } = useQuery({
    queryKey: ['analytics-userpoints'],
    queryFn: () => base44.entities.UserPoints.list()
  });

  const { data: allBadgeAwards = [] } = useQuery({
    queryKey: ['analytics-badges'],
    queryFn: () => base44.entities.BadgeAward.list()
  });

  const { data: allRecognitions = [] } = useQuery({
    queryKey: ['analytics-recognitions'],
    queryFn: () => base44.entities.Recognition.list()
  });

  const { data: allEvents = [] } = useQuery({
    queryKey: ['analytics-events'],
    queryFn: () => base44.entities.Event.list()
  });

  const { data: allParticipations = [] } = useQuery({
    queryKey: ['analytics-participations'],
    queryFn: () => base44.entities.Participation.list()
  });

  const { data: allFeedback = [] } = useQuery({
    queryKey: ['analytics-feedback'],
    queryFn: () => base44.entities.PostEventFeedback.list()
  });

  const { data: allProposals = [] } = useQuery({
    queryKey: ['analytics-proposals'],
    queryFn: () => base44.entities.EventProposal.list()
  });

  const { data: allCategories = [] } = useQuery({
    queryKey: ['analytics-categories'],
    queryFn: () => base44.entities.RecognitionCategory.list()
  });

  // Gamification Analytics
  const tierDistribution = [
    { tier: 'Bronze', count: allUserPoints.filter(u => u.tier === 'bronze').length },
    { tier: 'Silver', count: allUserPoints.filter(u => u.tier === 'silver').length },
    { tier: 'Gold', count: allUserPoints.filter(u => u.tier === 'gold').length },
    { tier: 'Platinum', count: allUserPoints.filter(u => u.tier === 'platinum').length }
  ];

  const totalPoints = allUserPoints.reduce((sum, u) => sum + (u.total_points || 0), 0);
  const avgPoints = allUserPoints.length > 0 ? Math.round(totalPoints / allUserPoints.length) : 0;
  const totalBadges = allBadgeAwards.length;

  const topEarners = [...allUserPoints]
    .sort((a, b) => (b.total_points || 0) - (a.total_points || 0))
    .slice(0, 10);

  // Event Analytics
  const participationRate = allEvents.length > 0
    ? Math.round((allParticipations.filter(p => p.status === 'attended').length / allEvents.length) * 100)
    : 0;

  const avgFeedbackRating = allFeedback.length > 0
    ? (allFeedback.reduce((sum, f) => sum + f.rating, 0) / allFeedback.length).toFixed(1)
    : 0;

  const proposalApprovalRate = allProposals.length > 0
    ? Math.round((allProposals.filter(p => p.status === 'approved').length / allProposals.length) * 100)
    : 0;

  // Recognition Analytics
  const categoryUsage = allCategories.map(cat => ({
    name: cat.name,
    count: cat.usage_count || 0
  })).sort((a, b) => b.count - a.count);

  const exportReport = async () => {
    setExporting(true);
    try {
      const response = await base44.functions.invoke('exportAnalyticsReport', {
        dateRange: parseInt(dateRange),
        metrics: {
          gamification: { totalPoints, avgPoints, totalBadges, tierDistribution },
          events: { participationRate, avgFeedbackRating, proposalApprovalRate },
          recognition: { categoryUsage, totalRecognitions: allRecognitions.length }
        }
      });
      
      toast.success('Analytics report exported!');
      window.open(response.data.downloadUrl, '_blank');
    } catch (error) {
      toast.error('Export failed');
    } finally {
      setExporting(false);
    }
  };

  if (user?.role !== 'admin') {
    return <div className="p-8 text-center">Admin access required.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Analytics Dashboard</h1>
          <p className="text-slate-600">Comprehensive platform insights</p>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportReport} disabled={exporting}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-600">Total Points Distributed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{totalPoints.toLocaleString()}</span>
              <span className="text-sm text-slate-500">avg {avgPoints}/user</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-600">Badges Awarded</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Award className="h-8 w-8 text-int-orange" />
              <span className="text-3xl font-bold">{totalBadges}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-600">Event Participation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{participationRate}%</span>
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-600">Avg Feedback Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{avgFeedbackRating}</span>
              <span className="text-sm text-slate-500">/ 5.0</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="gamification">
        <TabsList>
          <TabsTrigger value="gamification">Gamification</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="recognition">Recognition</TabsTrigger>
        </TabsList>

        <TabsContent value="gamification" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tier Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Tier Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={tierDistribution}
                      dataKey="count"
                      nameKey="tier"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {tierDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Top Earners */}
            <Card>
              <CardHeader>
                <CardTitle>Top 10 Point Earners</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {topEarners.map((user, i) => (
                    <div key={user.id} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-400">{i + 1}</span>
                        <span className="text-sm">{user.user_email}</span>
                      </div>
                      <span className="font-semibold text-int-orange">{user.total_points}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="events" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Event Proposal Success */}
            <Card>
              <CardHeader>
                <CardTitle>Event Proposals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Pending</span>
                    <span className="font-bold">{allProposals.filter(p => p.status === 'pending').length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Approved</span>
                    <span className="font-bold text-green-600">{allProposals.filter(p => p.status === 'approved').length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Rejected</span>
                    <span className="font-bold text-red-600">{allProposals.filter(p => p.status === 'rejected').length}</span>
                  </div>
                  <div className="pt-4 border-t">
                    <span className="text-lg font-bold">Approval Rate: {proposalApprovalRate}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Feedback Insights */}
            <Card>
              <CardHeader>
                <CardTitle>Event Feedback</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-600">Average Rating</p>
                    <p className="text-3xl font-bold">{avgFeedbackRating} / 5.0</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Total Responses</p>
                    <p className="text-2xl font-bold">{allFeedback.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Would Recommend</p>
                    <p className="text-2xl font-bold">
                      {allFeedback.length > 0 
                        ? Math.round((allFeedback.filter(f => f.would_recommend).length / allFeedback.length) * 100)
                        : 0}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recognition" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category Usage */}
            <Card>
              <CardHeader>
                <CardTitle>Top Recognition Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={categoryUsage.slice(0, 8)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#D97230" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Recognition Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Recognition Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-600">Total Recognitions</p>
                    <p className="text-3xl font-bold">{allRecognitions.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Avg per User</p>
                    <p className="text-2xl font-bold">
                      {allUserPoints.length > 0 
                        ? (allRecognitions.length / allUserPoints.length).toFixed(1)
                        : 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">With Bonus Points</p>
                    <p className="text-2xl font-bold">
                      {allRecognitions.filter(r => (r.bonus_points || 0) > 0).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}