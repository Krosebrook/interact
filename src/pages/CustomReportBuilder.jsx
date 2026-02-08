import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useUserData } from '../components/hooks/useUserData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { FileText, Download, Play, Settings, TrendingUp, Users, Calendar, Award, Filter } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { toast } from 'sonner';

const COLORS = ['#D97230', '#14294D', '#F5C16A', '#2DD4BF', '#8B5CF6', '#F59E0B', '#EF4444', '#10B981'];

export default function CustomReportBuilder() {
  const { user } = useUserData(true, true);
  const [reportConfig, setReportConfig] = useState({
    reportType: 'engagement',
    dateRange: '30',
    startDate: '',
    endDate: '',
    department: 'all',
    userSegment: 'all',
    tier: 'all',
    metrics: ['total_users', 'active_users', 'events_attended']
  });
  const [reportData, setReportData] = useState(null);

  const generateReport = useMutation({
    mutationFn: async (config) => {
      const response = await base44.functions.invoke('generateCustomReport', config);
      return response.data;
    },
    onSuccess: (data) => {
      setReportData(data);
      toast.success('Report generated successfully!');
    },
    onError: () => {
      toast.error('Failed to generate report');
    }
  });

  const exportReport = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('exportCustomReport', {
        reportConfig,
        reportData
      });
      return response.data;
    },
    onSuccess: (data) => {
      window.open(data.downloadUrl, '_blank');
      toast.success('Report exported!');
    },
    onError: () => {
      toast.error('Export failed');
    }
  });

  const handleMetricToggle = (metric) => {
    setReportConfig(prev => ({
      ...prev,
      metrics: prev.metrics.includes(metric)
        ? prev.metrics.filter(m => m !== metric)
        : [...prev.metrics, metric]
    }));
  };

  const availableMetrics = {
    engagement: [
      { value: 'total_users', label: 'Total Users' },
      { value: 'active_users', label: 'Active Users' },
      { value: 'events_attended', label: 'Events Attended' },
      { value: 'avg_attendance_rate', label: 'Avg Attendance Rate' },
      { value: 'engagement_score', label: 'Engagement Score' }
    ],
    event_roi: [
      { value: 'events_hosted', label: 'Events Hosted' },
      { value: 'total_participants', label: 'Total Participants' },
      { value: 'avg_feedback_rating', label: 'Avg Feedback Rating' },
      { value: 'completion_rate', label: 'Completion Rate' },
      { value: 'cost_per_participant', label: 'Cost per Participant' }
    ],
    recognition: [
      { value: 'recognitions_sent', label: 'Recognitions Sent' },
      { value: 'recognitions_received', label: 'Recognitions Received' },
      { value: 'top_categories', label: 'Top Categories' },
      { value: 'recognition_rate', label: 'Recognition Rate' },
      { value: 'sentiment_score', label: 'Sentiment Score' }
    ],
    gamification: [
      { value: 'points_distributed', label: 'Points Distributed' },
      { value: 'badges_awarded', label: 'Badges Awarded' },
      { value: 'tier_distribution', label: 'Tier Distribution' },
      { value: 'challenge_completion', label: 'Challenge Completion' },
      { value: 'streak_performance', label: 'Streak Performance' }
    ]
  };

  if (!user || user.role !== 'admin') {
    return <div className="p-8 text-center">Admin access required.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Custom Report Builder</h1>
          <p className="text-slate-600">Generate tailored analytics reports with advanced filters</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Report Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Report Type */}
            <div>
              <Label>Report Type</Label>
              <Select 
                value={reportConfig.reportType} 
                onValueChange={(v) => setReportConfig(prev => ({ ...prev, reportType: v, metrics: [] }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="engagement">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      User Engagement
                    </div>
                  </SelectItem>
                  <SelectItem value="event_roi">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Event ROI
                    </div>
                  </SelectItem>
                  <SelectItem value="recognition">
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4" />
                      Recognition Impact
                    </div>
                  </SelectItem>
                  <SelectItem value="gamification">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Gamification Effectiveness
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Range */}
            <div>
              <Label>Date Range</Label>
              <Select 
                value={reportConfig.dateRange} 
                onValueChange={(v) => setReportConfig(prev => ({ ...prev, dateRange: v }))}
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
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {reportConfig.dateRange === 'custom' && (
              <div className="space-y-2">
                <div>
                  <Label>Start Date</Label>
                  <Input 
                    type="date" 
                    value={reportConfig.startDate}
                    onChange={(e) => setReportConfig(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input 
                    type="date" 
                    value={reportConfig.endDate}
                    onChange={(e) => setReportConfig(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
              </div>
            )}

            {/* Filters */}
            <div>
              <Label>Department</Label>
              <Select 
                value={reportConfig.department} 
                onValueChange={(v) => setReportConfig(prev => ({ ...prev, department: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="engineering">Engineering</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="hr">HR</SelectItem>
                  <SelectItem value="operations">Operations</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>User Segment</Label>
              <Select 
                value={reportConfig.userSegment} 
                onValueChange={(v) => setReportConfig(prev => ({ ...prev, userSegment: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="new">New Users (under 30 days)</SelectItem>
                  <SelectItem value="active">Active Users</SelectItem>
                  <SelectItem value="at_risk">At Risk (low engagement)</SelectItem>
                  <SelectItem value="power_users">Power Users</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Tier Filter</Label>
              <Select 
                value={reportConfig.tier} 
                onValueChange={(v) => setReportConfig(prev => ({ ...prev, tier: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tiers</SelectItem>
                  <SelectItem value="bronze">Bronze</SelectItem>
                  <SelectItem value="silver">Silver</SelectItem>
                  <SelectItem value="gold">Gold</SelectItem>
                  <SelectItem value="platinum">Platinum</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Metrics Selection */}
            <div>
              <Label className="mb-2 block">Metrics to Include</Label>
              <div className="space-y-2">
                {availableMetrics[reportConfig.reportType]?.map(metric => (
                  <div key={metric.value} className="flex items-center gap-2">
                    <Checkbox 
                      checked={reportConfig.metrics.includes(metric.value)}
                      onCheckedChange={() => handleMetricToggle(metric.value)}
                    />
                    <span className="text-sm">{metric.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <Button 
              onClick={() => generateReport.mutate(reportConfig)}
              disabled={generateReport.isPending || reportConfig.metrics.length === 0}
              className="w-full bg-int-orange hover:bg-int-orange-dark"
            >
              {generateReport.isPending ? (
                <LoadingSpinner size="small" />
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Generate Report
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results Panel */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Report Results
              </CardTitle>
              {reportData && (
                <Button 
                  onClick={() => exportReport.mutate()}
                  disabled={exportReport.isPending}
                  variant="outline"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!reportData ? (
              <div className="text-center py-12 text-slate-500">
                <Filter className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Configure your report and click "Generate Report" to see results</p>
              </div>
            ) : (
              <Tabs defaultValue="summary">
                <TabsList>
                  <TabsTrigger value="summary">Summary</TabsTrigger>
                  <TabsTrigger value="charts">Visualizations</TabsTrigger>
                  <TabsTrigger value="data">Raw Data</TabsTrigger>
                </TabsList>

                <TabsContent value="summary" className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {reportData.summary?.map((metric, i) => (
                      <Card key={i}>
                        <CardContent className="pt-6">
                          <p className="text-sm text-slate-600">{metric.label}</p>
                          <p className="text-2xl font-bold mt-1">{metric.value}</p>
                          {metric.change && (
                            <p className={`text-xs mt-1 ${metric.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {metric.change > 0 ? '↑' : '↓'} {Math.abs(metric.change)}%
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {reportData.insights && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Key Insights</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {reportData.insights.map((insight, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm">
                              <span className="text-int-orange mt-1">•</span>
                              {insight}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="charts" className="space-y-6">
                  {reportData.charts?.map((chart, i) => (
                    <Card key={i}>
                      <CardHeader>
                        <CardTitle className="text-base">{chart.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          {chart.type === 'bar' && (
                            <BarChart data={chart.data}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Tooltip />
                              <Bar dataKey="value" fill="#D97230" />
                            </BarChart>
                          )}
                          {chart.type === 'line' && (
                            <LineChart data={chart.data}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              <Line type="monotone" dataKey="value" stroke="#D97230" />
                            </LineChart>
                          )}
                          {chart.type === 'area' && (
                            <AreaChart data={chart.data}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Tooltip />
                              <Area type="monotone" dataKey="value" fill="#D97230" stroke="#D97230" />
                            </AreaChart>
                          )}
                          {chart.type === 'pie' && (
                            <PieChart>
                              <Pie data={chart.data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                {chart.data.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          )}
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="data">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-100">
                        <tr>
                          {reportData.tableData?.headers.map((header, i) => (
                            <th key={i} className="px-4 py-2 text-left font-semibold">{header}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.tableData?.rows.map((row, i) => (
                          <tr key={i} className="border-t">
                            {row.map((cell, j) => (
                              <td key={j} className="px-4 py-2">{cell}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}