import React, { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  History, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Users,
  Star,
  ThumbsUp,
  ThumbsDown,
  BarChart3,
  Clock,
  Award,
  Zap,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Brain,
  FileText
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { format, subMonths, subDays, isAfter, parseISO } from 'date-fns';
import LoadingSpinner from '../common/LoadingSpinner';

const ACTIVITY_TYPE_CONFIG = {
  icebreaker: { emoji: '🧊', color: 'bg-blue-100 text-blue-700' },
  creative: { emoji: '🎨', color: 'bg-purple-100 text-purple-700' },
  competitive: { emoji: '🏆', color: 'bg-amber-100 text-amber-700' },
  wellness: { emoji: '🧘', color: 'bg-emerald-100 text-emerald-700' },
  learning: { emoji: '📚', color: 'bg-cyan-100 text-cyan-700' },
  social: { emoji: '🎉', color: 'bg-pink-100 text-pink-700' }
};

export default function EventHistoryAnalyzer() {
  const [timeRange, setTimeRange] = useState('3months');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const { data: events = [] } = useQuery({
    queryKey: ['events'],
    queryFn: () => base44.entities.Event.list('-scheduled_date', 200)
  });

  const { data: participations = [] } = useQuery({
    queryKey: ['participations'],
    queryFn: () => base44.entities.Participation.list('-created_date', 1000)
  });

  const { data: activities = [] } = useQuery({
    queryKey: ['activities'],
    queryFn: () => base44.entities.Activity.list()
  });

  const { data: feedbackAnalyses = [] } = useQuery({
    queryKey: ['feedback-analyses'],
    queryFn: () => base44.entities.FeedbackAnalysis.list('-analysis_date', 50)
  });

  // Filter by time range
  const filteredEvents = useMemo(() => {
    const cutoffDate = timeRange === '1month' ? subMonths(new Date(), 1) :
                       timeRange === '3months' ? subMonths(new Date(), 3) :
                       timeRange === '6months' ? subMonths(new Date(), 6) :
                       subMonths(new Date(), 12);
    
    return events.filter(e => {
      if (!e.scheduled_date) return false;
      return isAfter(parseISO(e.scheduled_date), cutoffDate) && e.status === 'completed';
    });
  }, [events, timeRange]);

  // Calculate event stats
  const eventStats = useMemo(() => {
    return filteredEvents.map(event => {
      const activity = activities.find(a => a.id === event.activity_id);
      const eventParticipations = participations.filter(p => p.event_id === event.id);
      const attended = eventParticipations.filter(p => p.attended).length;
      const registered = eventParticipations.length;
      const attendanceRate = registered > 0 ? (attended / registered) * 100 : 0;
      const avgEngagement = eventParticipations.length > 0
        ? eventParticipations.reduce((sum, p) => sum + (p.engagement_score || 3), 0) / eventParticipations.length
        : 0;

      return {
        ...event,
        activity,
        attended,
        registered,
        attendanceRate: attendanceRate.toFixed(0),
        avgEngagement: avgEngagement.toFixed(1)
      };
    });
  }, [filteredEvents, activities, participations]);

  // Trend data
  const trendData = useMemo(() => {
    const months = timeRange === '1month' ? 4 : 
                   timeRange === '3months' ? 12 :
                   timeRange === '6months' ? 24 : 52;
    
    return Array.from({ length: Math.min(months, 12) }, (_, i) => {
      const weekStart = subDays(new Date(), (11 - i) * 7);
      const weekEnd = subDays(new Date(), (10 - i) * 7);
      
      const weekEvents = eventStats.filter(e => {
        const eventDate = parseISO(e.scheduled_date);
        return eventDate >= weekStart && eventDate < weekEnd;
      });

      return {
        week: format(weekStart, 'MMM d'),
        events: weekEvents.length,
        avgAttendance: weekEvents.length > 0 
          ? Math.round(weekEvents.reduce((sum, e) => sum + parseInt(e.attendanceRate), 0) / weekEvents.length)
          : 0
      };
    });
  }, [eventStats, timeRange]);

  // Top performing events
  const topEvents = useMemo(() => {
    return [...eventStats]
      .sort((a, b) => parseInt(b.attendanceRate) - parseInt(a.attendanceRate))
      .slice(0, 5);
  }, [eventStats]);

  // Activity type performance
  const activityTypePerformance = useMemo(() => {
    const typeStats = {};
    
    eventStats.forEach(event => {
      const type = event.activity?.type || 'other';
      if (!typeStats[type]) {
        typeStats[type] = { count: 0, totalAttendance: 0, totalEngagement: 0 };
      }
      typeStats[type].count++;
      typeStats[type].totalAttendance += parseInt(event.attendanceRate) || 0;
      typeStats[type].totalEngagement += parseFloat(event.avgEngagement) || 0;
    });

    return Object.entries(typeStats).map(([type, stats]) => ({
      type,
      count: stats.count,
      avgAttendance: stats.count > 0 ? Math.round(stats.totalAttendance / stats.count) : 0,
      avgEngagement: stats.count > 0 ? (stats.totalEngagement / stats.count).toFixed(1) : 0
    })).sort((a, b) => b.avgAttendance - a.avgAttendance);
  }, [eventStats]);

  // Generate AI analysis
  const generateAnalysisMutation = useMutation({
    mutationFn: async () => {
      setAnalyzing(true);
      
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze historical event data and provide insights.

Event History (${timeRange}):
- Total events: ${filteredEvents.length}
- Average attendance rate: ${eventStats.length > 0 ? Math.round(eventStats.reduce((s, e) => s + parseInt(e.attendanceRate), 0) / eventStats.length) : 0}%

Top performing activity types:
${activityTypePerformance.slice(0, 3).map(t => `- ${t.type}: ${t.avgAttendance}% avg attendance`).join('\n')}

Recent trend: ${trendData.slice(-4).map(t => `${t.week}: ${t.events} events`).join(', ')}

Provide:
1. Overall performance summary
2. Key success patterns
3. Areas that need attention
4. Recommendations for future events
5. Optimal activity mix suggestion`,
        response_json_schema: {
          type: 'object',
          properties: {
            performance_summary: { type: 'string' },
            success_patterns: {
              type: 'array',
              items: { type: 'string' }
            },
            attention_areas: {
              type: 'array',
              items: { type: 'string' }
            },
            recommendations: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  recommendation: { type: 'string' },
                  expected_impact: { type: 'string' }
                }
              }
            },
            optimal_mix: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  activity_type: { type: 'string' },
                  percentage: { type: 'number' }
                }
              }
            }
          }
        }
      });

      setAnalyzing(false);
      return response;
    },
    onSuccess: (data) => {
      setAnalysis(data);
    },
    onError: () => {
      setAnalyzing(false);
    }
  });

  return (
    <div data-b44-sync="true" data-feature="ai" data-component="eventhistoryanalyzer" className="space-y-6">
      {/* Header */}
      <Card className="border-2 border-emerald-200">
        <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle className="flex items-center gap-2 text-emerald-700">
              <History className="h-6 w-6" />
              Event History Analysis
            </CardTitle>
            <div className="flex items-center gap-3">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1month">Last Month</SelectItem>
                  <SelectItem value="3months">Last 3 Months</SelectItem>
                  <SelectItem value="6months">Last 6 Months</SelectItem>
                  <SelectItem value="12months">Last Year</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={() => generateAnalysisMutation.mutate()}
                disabled={analyzing}
                className="bg-gradient-wellness hover:opacity-90 text-white shadow-lg"
              >
                {analyzing ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Brain className="h-4 w-4 mr-2" />
                )}
                Analyze Patterns
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-emerald-600" />
              <div>
                <div className="text-2xl font-bold text-emerald-700">{filteredEvents.length}</div>
                <div className="text-sm text-emerald-600">Completed Events</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold text-blue-700">
                  {participations.filter(p => p.attended).length}
                </div>
                <div className="text-sm text-blue-600">Total Attendances</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div>
                <div className="text-2xl font-bold text-purple-700">
                  {eventStats.length > 0 
                    ? Math.round(eventStats.reduce((s, e) => s + parseInt(e.attendanceRate), 0) / eventStats.length) 
                    : 0}%
                </div>
                <div className="text-sm text-purple-600">Avg Attendance</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Star className="h-8 w-8 text-amber-600" />
              <div>
                <div className="text-2xl font-bold text-amber-700">
                  {eventStats.length > 0 
                    ? (eventStats.reduce((s, e) => s + parseFloat(e.avgEngagement), 0) / eventStats.length).toFixed(1)
                    : 0}
                </div>
                <div className="text-sm text-amber-600">Avg Engagement</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Analysis */}
      {analyzing && (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <LoadingSpinner size="large" type="wellness" />
            <p className="mt-4 text-slate-600 animate-pulse">
              Analyzing event history patterns...
            </p>
          </CardContent>
        </Card>
      )}

      {analysis && !analyzing && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-gradient-purple shadow-lg">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 mb-2">Performance Summary</h3>
                  <p className="text-slate-700">{analysis.performance_summary}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Success Patterns */}
            <Card className="border-2 border-emerald-200">
              <CardHeader className="bg-emerald-50">
                <CardTitle className="flex items-center gap-2 text-emerald-700">
                  <CheckCircle2 className="h-5 w-5" />
                  Success Patterns
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <ul className="space-y-2">
                  {analysis.success_patterns?.map((pattern, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-emerald-700">
                      <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      {pattern}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Attention Areas */}
            <Card className="border-2 border-amber-200">
              <CardHeader className="bg-amber-50">
                <CardTitle className="flex items-center gap-2 text-amber-700">
                  <XCircle className="h-5 w-5" />
                  Areas for Attention
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <ul className="space-y-2">
                  {analysis.attention_areas?.map((area, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-amber-700">
                      <XCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      {area}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-int-orange" />
                AI Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analysis.recommendations?.map((rec, idx) => (
                  <Card key={idx} className="border border-int-orange/20 bg-int-orange/5">
                    <CardContent className="p-4">
                      <p className="font-medium text-slate-900 mb-2">{rec.recommendation}</p>
                      <Badge className="bg-int-orange/20 text-int-orange">
                        Impact: {rec.expected_impact}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Chart */}
        <Card className="border-2 border-int-navy/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-int-navy" />
              Event Frequency & Attendance Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="attendanceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D97230" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#D97230" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="week" stroke="#64748b" fontSize={12} />
                <YAxis yAxisId="left" stroke="#14294D" />
                <YAxis yAxisId="right" orientation="right" stroke="#D97230" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#14294D',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px'
                  }}
                />
                <Bar yAxisId="left" dataKey="events" fill="#14294D" radius={[4, 4, 0, 0]} name="Events" />
                <Area 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="avgAttendance" 
                  stroke="#D97230" 
                  strokeWidth={2}
                  fill="url(#attendanceGradient)"
                  name="Avg Attendance %"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Activity Type Performance */}
        <Card className="border-2 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-purple-600" />
              Activity Type Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activityTypePerformance.map((type, idx) => {
                const config = ACTIVITY_TYPE_CONFIG[type.type] || { emoji: '📋', color: 'bg-slate-100 text-slate-700' };
                return (
                  <div key={type.type} className="flex items-center gap-4">
                    <Badge className={`${config.color} w-28 justify-center`}>
                      {config.emoji} {type.type}
                    </Badge>
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>{type.count} events</span>
                        <span className="font-semibold">{type.avgAttendance}% attendance</span>
                      </div>
                      <Progress value={type.avgAttendance} className="h-2" />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-amber-500" />
            Top Performing Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topEvents.map((event, idx) => {
              const config = ACTIVITY_TYPE_CONFIG[event.activity?.type] || { emoji: '📋', color: 'bg-slate-100 text-slate-700' };
              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg"
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                    idx === 0 ? 'bg-gradient-to-br from-amber-400 to-orange-500' :
                    idx === 1 ? 'bg-gradient-to-br from-slate-400 to-slate-500' :
                    idx === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-700' :
                    'bg-slate-300'
                  }`}>
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900">{event.title}</h4>
                    <div className="flex items-center gap-3 text-sm text-slate-500">
                      <Badge className={config.color}>{config.emoji} {event.activity?.type}</Badge>
                      <span>{format(parseISO(event.scheduled_date), 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-emerald-600">{event.attendanceRate}%</div>
                    <div className="text-xs text-slate-500">{event.attended}/{event.registered} attended</div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}