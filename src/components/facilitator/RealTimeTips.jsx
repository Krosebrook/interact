import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Zap, RefreshCw, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RealTimeTips({ eventId }) {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['facilitator-tips', eventId, 'real_time'],
    queryFn: async () => {
      const response = await base44.functions.invoke('generateFacilitatorGuide', {
        eventId,
        guideType: 'real_time'
      });
      return response.data.guide;
    },
    refetchInterval: 2 * 60 * 1000 // Refresh every 2 minutes
  });

  const priorityColors = {
    high: 'bg-red-100 text-red-700 border-red-300',
    medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    low: 'bg-blue-100 text-blue-700 border-blue-300'
  };

  const priorityIcons = {
    high: AlertCircle,
    medium: Zap,
    low: CheckCircle2
  };

  return (
    <Card className="p-6 border-0 shadow-lg sticky top-4" data-b44-sync="true" data-feature="facilitator" data-component="realtimetips">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-600" />
          <h3 className="font-bold text-lg">Real-Time Tips</h3>
          <Badge variant="outline" className="animate-pulse">LIVE</Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => refetch()}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-slate-600 py-4">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Analyzing event...</span>
        </div>
      ) : data ? (
        <div className="space-y-4">
          {/* Sentiment Check */}
          {data.sentiment_check && (
            <div className="p-3 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg">
              <p className="text-sm font-semibold text-purple-900 mb-1">Sentiment Check:</p>
              <p className="text-sm text-purple-700">{data.sentiment_check}</p>
            </div>
          )}

          {/* Tips */}
          <div className="space-y-3">
            {data.tips?.map((tip, i) => {
              const Icon = priorityIcons[tip.priority];
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`p-4 border-2 rounded-lg ${priorityColors[tip.priority]}`}
                >
                  <div className="flex items-start gap-3">
                    <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold mb-1">{tip.title}</h4>
                      <p className="text-sm">{tip.description}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Suggested Action */}
          {data.suggested_action && (
            <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-lg">
              <p className="text-sm font-semibold text-emerald-900 mb-1">
                💡 Suggested Action:
              </p>
              <p className="text-sm text-emerald-700">{data.suggested_action}</p>
            </div>
          )}
        </div>
      ) : (
        <p className="text-sm text-slate-600">No tips available</p>
      )}
    </Card>
  );
}