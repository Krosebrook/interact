import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Calendar, 
  Clock, 
  Users, 
  Sparkles, 
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Zap,
  Sun,
  Moon,
  CloudSun,
  RefreshCw
} from 'lucide-react';
import { format, addDays, setHours, setMinutes, isSameDay } from 'date-fns';
import LoadingSpinner from '../common/LoadingSpinner';
import { toast } from 'sonner';

const TIME_SLOTS = [
  { value: '09:00', label: '9:00 AM', icon: Sun, period: 'morning' },
  { value: '10:00', label: '10:00 AM', icon: Sun, period: 'morning' },
  { value: '11:00', label: '11:00 AM', icon: Sun, period: 'morning' },
  { value: '12:00', label: '12:00 PM', icon: CloudSun, period: 'midday' },
  { value: '13:00', label: '1:00 PM', icon: CloudSun, period: 'afternoon' },
  { value: '14:00', label: '2:00 PM', icon: CloudSun, period: 'afternoon' },
  { value: '15:00', label: '3:00 PM', icon: CloudSun, period: 'afternoon' },
  { value: '16:00', label: '4:00 PM', icon: Moon, period: 'late afternoon' },
  { value: '17:00', label: '5:00 PM', icon: Moon, period: 'evening' }
];

export default function SmartSchedulingAssistant({ onEventCreated, selectedActivity }) {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(format(addDays(new Date(), 1), 'yyyy-MM-dd'));
  const [analyzing, setAnalyzing] = useState(false);
  const [recommendations, setRecommendations] = useState(null);

  const { data: events = [] } = useQuery({
    queryKey: ['events'],
    queryFn: () => base44.entities.Event.list('-scheduled_date', 200)
  });

  const { data: participations = [] } = useQuery({
    queryKey: ['participations'],
    queryFn: () => base44.entities.Participation.list('-created_date', 500)
  });

  const { data: teams = [] } = useQuery({
    queryKey: ['teams'],
    queryFn: () => base44.entities.Team.list()
  });

  // Analyze optimal times
  const analyzeOptimalTimes = useMutation({
    mutationFn: async () => {
      setAnalyzing(true);
      
      // Analyze past attendance patterns
      const attendanceByHour = {};
      events.forEach(event => {
        if (event.scheduled_date) {
          const hour = new Date(event.scheduled_date).getHours();
          const eventParticipations = participations.filter(p => p.event_id === event.id && p.attended);
          attendanceByHour[hour] = (attendanceByHour[hour] || 0) + eventParticipations.length;
        }
      });

      // Check conflicts for selected date
      const dateEvents = events.filter(e => 
        e.scheduled_date && isSameDay(new Date(e.scheduled_date), new Date(selectedDate))
      );

      // Use AI for deeper analysis
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze team scheduling patterns and recommend optimal times.

Historical attendance by hour: ${JSON.stringify(attendanceByHour)}
Events already scheduled on ${selectedDate}: ${dateEvents.map(e => `${e.title} at ${format(new Date(e.scheduled_date), 'HH:mm')}`).join(', ') || 'None'}
Total teams: ${teams.length}
Available time slots: 9AM-5PM

Provide:
1. Top 3 recommended time slots with reasoning
2. Times to avoid and why
3. Engagement prediction score for each slot`,
        response_json_schema: {
          type: 'object',
          properties: {
            recommended_slots: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  time: { type: 'string' },
                  score: { type: 'number' },
                  reasoning: { type: 'string' },
                  predicted_attendance: { type: 'string' }
                }
              }
            },
            avoid_slots: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  time: { type: 'string' },
                  reason: { type: 'string' }
                }
              }
            },
            insights: { type: 'string' }
          }
        }
      });

      setAnalyzing(false);
      return response;
    },
    onSuccess: (data) => {
      setRecommendations(data);
    },
    onError: () => {
      setAnalyzing(false);
      toast.error('Failed to analyze scheduling');
    }
  });

  // Get time slot status
  const getTimeSlotStatus = (slot) => {
    if (!recommendations) return { status: 'neutral', score: 0 };
    
    const recommended = recommendations.recommended_slots?.find(r => r.time === slot.value);
    const avoided = recommendations.avoid_slots?.find(a => a.time === slot.value);
    
    if (recommended) {
      return { status: 'recommended', score: recommended.score, reason: recommended.reasoning };
    }
    if (avoided) {
      return { status: 'avoid', reason: avoided.reason };
    }
    return { status: 'neutral', score: 50 };
  };

  return (
    <div data-b44-sync="true" data-feature="ai" data-component="smartschedulingassistant" className="space-y-6">
      {/* Control Panel */}
      <Card className="border-2 border-int-orange/20">
        <CardHeader className="bg-gradient-to-r from-int-orange/10 to-transparent">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-int-orange" />
            Smart Scheduling Assistant
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[200px]">
              <Label>Select Date</Label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={format(new Date(), 'yyyy-MM-dd')}
              />
            </div>
            <Button
              onClick={() => analyzeOptimalTimes.mutate()}
              disabled={analyzing}
              className="bg-gradient-orange hover:opacity-90 text-white shadow-lg press-effect"
            >
              {analyzing ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              Analyze Optimal Times
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {analyzing && (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <LoadingSpinner size="large" type="orange" />
            <p className="mt-4 text-slate-600 animate-pulse">
              Analyzing team patterns and finding optimal times...
            </p>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {recommendations && !analyzing && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* AI Insights */}
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-gradient-purple shadow-lg">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-2">AI Insights</h3>
                  <p className="text-slate-700">{recommendations.insights}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Time Slots Grid */}
          <Card>
            <CardHeader>
              <CardTitle>Time Slot Analysis for {format(new Date(selectedDate), 'EEEE, MMMM d')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {TIME_SLOTS.map((slot, idx) => {
                  const slotStatus = getTimeSlotStatus(slot);
                  const Icon = slot.icon;
                  
                  return (
                    <motion.div
                      key={slot.value}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Card className={`cursor-pointer transition-all hover:shadow-lg ${
                        slotStatus.status === 'recommended' 
                          ? 'border-2 border-emerald-400 bg-emerald-50/50' 
                          : slotStatus.status === 'avoid'
                          ? 'border-2 border-red-300 bg-red-50/50'
                          : 'border hover:border-int-orange'
                      }`}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Icon className={`h-5 w-5 ${
                                slotStatus.status === 'recommended' ? 'text-emerald-600' :
                                slotStatus.status === 'avoid' ? 'text-red-500' :
                                'text-slate-500'
                              }`} />
                              <span className="font-bold text-lg">{slot.label}</span>
                            </div>
                            {slotStatus.status === 'recommended' && (
                              <Badge className="bg-emerald-100 text-emerald-700">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Best
                              </Badge>
                            )}
                            {slotStatus.status === 'avoid' && (
                              <Badge className="bg-red-100 text-red-700">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Avoid
                              </Badge>
                            )}
                          </div>
                          
                          {slotStatus.status === 'recommended' && (
                            <>
                              <div className="mb-2">
                                <div className="flex items-center justify-between text-sm mb-1">
                                  <span className="text-slate-600">Engagement Score</span>
                                  <span className="font-semibold text-emerald-600">{slotStatus.score}%</span>
                                </div>
                                <Progress value={slotStatus.score} className="h-2" />
                              </div>
                              <p className="text-xs text-slate-600">{slotStatus.reason}</p>
                            </>
                          )}
                          
                          {slotStatus.status === 'avoid' && (
                            <p className="text-xs text-red-600">{slotStatus.reason}</p>
                          )}
                          
                          {slotStatus.status === 'neutral' && (
                            <div className="flex items-center gap-1 text-sm text-slate-500">
                              <Clock className="h-4 w-4" />
                              Available
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Top Recommendations */}
          {recommendations.recommended_slots?.length > 0 && (
            <Card className="border-2 border-emerald-200">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50">
                <CardTitle className="flex items-center gap-2 text-emerald-700">
                  <TrendingUp className="h-5 w-5" />
                  Top 3 Recommended Times
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {recommendations.recommended_slots.slice(0, 3).map((rec, idx) => (
                    <div 
                      key={idx}
                      className="flex items-center justify-between p-4 bg-white rounded-lg border border-emerald-200"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                          idx === 0 ? 'bg-gradient-to-br from-amber-400 to-orange-500' :
                          idx === 1 ? 'bg-gradient-to-br from-slate-400 to-slate-500' :
                          'bg-gradient-to-br from-amber-600 to-amber-700'
                        }`}>
                          {idx + 1}
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-900">
                            {rec.time}
                          </h4>
                          <p className="text-sm text-slate-600">{rec.reasoning}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-emerald-600 font-bold">
                          <Zap className="h-4 w-4" />
                          {rec.score}%
                        </div>
                        <span className="text-xs text-slate-500">{rec.predicted_attendance}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}

      {/* Empty State */}
      {!recommendations && !analyzing && (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="p-4 rounded-full bg-int-orange/10 mb-4">
              <Calendar className="h-10 w-10 text-int-orange" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Find the Perfect Time
            </h3>
            <p className="text-sm text-slate-500 text-center max-w-md mb-4">
              Select a date and let AI analyze your team's patterns to recommend the best times for maximum engagement
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}