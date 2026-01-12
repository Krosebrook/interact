import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  TrendingUp, 
  Zap, 
  RefreshCw, 
  Loader2,
  CheckCircle2,
  AlertCircle,
  Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const sentimentConfig = {
  high: {
    color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    icon: TrendingUp,
    label: 'High Energy'
  },
  medium: {
    color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    icon: Activity,
    label: 'Moderate Energy'
  },
  low: {
    color: 'text-red-600 bg-red-50 border-red-200',
    icon: AlertCircle,
    label: 'Low Energy'
  }
};

const priorityConfig = {
  high: { color: 'bg-red-600', icon: Zap },
  medium: { color: 'bg-yellow-600', icon: AlertTriangle },
  low: { color: 'bg-blue-600', icon: CheckCircle2 }
};

export default function LiveCoachingWidget({ eventId }) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['live-coaching', eventId],
    queryFn: async () => {
      const response = await base44.functions.invoke('generateLiveCoaching', { eventId });
      return response.data;
    },
    refetchInterval: 120000, // Auto-refresh every 2 minutes
    enabled: !!eventId
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  if (isLoading) {
    return (
      <Card className="p-6" data-b44-sync="true" data-feature="facilitator" data-component="livecoachingwidget">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      </Card>
    );
  }

  if (!data) return null;

  const { coaching, metrics } = data;
  const SentimentIcon = sentimentConfig[coaching.sentiment?.level]?.icon || Activity;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
          <h3 className="font-bold text-lg">Live AI Coach</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-4 gap-2">
        <div className="text-center p-2 bg-slate-50 rounded-lg">
          <p className="text-lg font-bold text-slate-900">{metrics.totalParticipants}</p>
          <p className="text-xs text-slate-600">Total</p>
        </div>
        <div className="text-center p-2 bg-slate-50 rounded-lg">
          <p className="text-lg font-bold text-indigo-600">{metrics.attendanceRate.toFixed(0)}%</p>
          <p className="text-xs text-slate-600">Present</p>
        </div>
        <div className="text-center p-2 bg-slate-50 rounded-lg">
          <p className="text-lg font-bold text-emerald-600">{metrics.avgEngagement.toFixed(1)}</p>
          <p className="text-xs text-slate-600">Engagement</p>
        </div>
        <div className="text-center p-2 bg-slate-50 rounded-lg">
          <p className="text-lg font-bold text-purple-600">{metrics.submissionRate.toFixed(0)}%</p>
          <p className="text-xs text-slate-600">Active</p>
        </div>
      </div>

      {/* Immediate Action Alert */}
      <AnimatePresence>
        {coaching.immediate_action?.needed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <Card className={`p-4 border-2 ${
              coaching.immediate_action.urgency === 'high' 
                ? 'border-red-500 bg-red-50'
                : 'border-yellow-500 bg-yellow-50'
            }`}>
              <div className="flex items-start gap-3">
                <AlertTriangle className={`h-5 w-5 mt-0.5 ${
                  coaching.immediate_action.urgency === 'high' 
                    ? 'text-red-600' 
                    : 'text-yellow-600'
                }`} />
                <div className="flex-1">
                  <p className="font-bold text-sm mb-1">
                    Action Needed Now
                  </p>
                  <p className="text-sm">{coaching.immediate_action.action}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sentiment */}
      <Card className={`p-4 border ${sentimentConfig[coaching.sentiment?.level]?.color}`}>
        <div className="flex items-center gap-3">
          <SentimentIcon className="h-6 w-6" />
          <div className="flex-1">
            <p className="font-bold text-sm">{sentimentConfig[coaching.sentiment?.level]?.label}</p>
            <p className="text-sm mt-1">{coaching.sentiment?.description}</p>
          </div>
        </div>
      </Card>

      {/* Coaching Tips */}
      <Card className="p-4">
        <h4 className="font-bold text-sm mb-3">Actionable Tips</h4>
        <div className="space-y-3">
          {coaching.tips?.map((tip, i) => {
            const PriorityIcon = priorityConfig[tip.priority]?.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg"
              >
                <Badge className={`${priorityConfig[tip.priority]?.color} text-white mt-0.5`}>
                  <PriorityIcon className="h-3 w-3" />
                </Badge>
                <div className="flex-1">
                  <p className="font-semibold text-sm mb-1">{tip.title}</p>
                  <p className="text-xs text-slate-700">{tip.action}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </Card>

      {/* Red Flags */}
      {coaching.red_flags?.length > 0 && (
        <Card className="p-4 border-orange-200 bg-orange-50">
          <h4 className="font-bold text-sm text-orange-900 mb-2">Watch For:</h4>
          <ul className="space-y-1">
            {coaching.red_flags.map((flag, i) => (
              <li key={i} className="text-xs text-orange-800 flex items-start gap-2">
                <span className="text-orange-600 mt-0.5">•</span>
                <span>{flag}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Encouragement */}
      <Card className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
        <p className="text-sm text-purple-900 font-medium">
          💪 {coaching.encouragement}
        </p>
      </Card>
    </div>
  );
}