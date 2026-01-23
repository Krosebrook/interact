import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Sparkles, X, TrendingUp, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function WellnessCheckWidget() {
  const [dismissed, setDismissed] = useState(false);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: burnoutRisk, isLoading } = useQuery({
    queryKey: ['myBurnoutRisk'],
    queryFn: async () => {
      const risks = await base44.entities.BurnoutRisk.filter({
        user_email: user.email,
        created_date: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() }
      });
      return risks[0];
    },
    enabled: !!user
  });

  const analyzeMutation = useMutation({
    mutationFn: () => base44.functions.invoke('analyzeBurnoutRisk', {
      userEmail: user.email
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['myBurnoutRisk']);
    }
  });

  if (isLoading || !burnoutRisk || dismissed) {
    return null;
  }

  // Only show widget if there's moderate or higher risk
  if (burnoutRisk.risk_level === 'low') {
    return null;
  }

  const riskConfig = {
    moderate: {
      color: 'from-yellow-500 to-orange-500',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-900'
    },
    high: {
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-300',
      textColor: 'text-orange-900'
    },
    critical: {
      color: 'from-red-500 to-pink-500',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-300',
      textColor: 'text-red-900'
    }
  };

  const config = riskConfig[burnoutRisk.risk_level];
  const topIntervention = burnoutRisk.employee_interventions?.[0];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="relative"
      >
        <Card className={`${config.bgColor} ${config.borderColor} border-2 overflow-hidden`}>
          {/* Gradient accent */}
          <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${config.color}`} />
          
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg bg-gradient-to-br ${config.color}`}>
                  <Heart className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className={`text-lg ${config.textColor}`}>
                    Wellness Check-In
                  </CardTitle>
                  <p className="text-sm text-slate-600 mt-1">
                    We noticed some patterns that might indicate stress
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDismissed(true)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Risk Level Badge */}
            <div className="flex items-center justify-between">
              <Badge className={`${config.color} text-white bg-gradient-to-r px-3 py-1`}>
                {burnoutRisk.risk_level.charAt(0).toUpperCase() + burnoutRisk.risk_level.slice(1)} Risk
              </Badge>
              <span className="text-sm text-slate-600">
                Wellness Score: {100 - burnoutRisk.risk_score}/100
              </span>
            </div>

            {/* Top Intervention */}
            {topIntervention && (
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <div className="flex items-start gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-blue-500 mt-0.5" />
                  <p className="text-sm text-slate-900 font-medium">
                    {topIntervention.message}
                  </p>
                </div>
                {topIntervention.action_url && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="w-full mt-2"
                    asChild
                  >
                    <a href={topIntervention.action_url}>
                      Learn More
                    </a>
                  </Button>
                )}
              </div>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3">
              {burnoutRisk.activity_patterns?.late_night_sessions > 2 && (
                <div className="text-center p-2 bg-white rounded-lg">
                  <div className="text-2xl font-bold text-slate-900">
                    {burnoutRisk.activity_patterns.late_night_sessions}
                  </div>
                  <div className="text-xs text-slate-600">Late-night sessions</div>
                </div>
              )}
              {burnoutRisk.activity_patterns?.weekend_activity > 2 && (
                <div className="text-center p-2 bg-white rounded-lg">
                  <div className="text-2xl font-bold text-slate-900">
                    {burnoutRisk.activity_patterns.weekend_activity}
                  </div>
                  <div className="text-xs text-slate-600">Weekend work</div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => setDismissed(true)}
              >
                I'm OK
              </Button>
              <Button
                size="sm"
                className="flex-1"
                asChild
              >
                <a href="/UserProfile?tab=wellness">
                  View Details
                </a>
              </Button>
            </div>

            {/* Refresh Analysis */}
            <button
              onClick={() => analyzeMutation.mutate()}
              disabled={analyzeMutation.isPending}
              className="w-full text-xs text-slate-600 hover:text-slate-900 flex items-center justify-center gap-1"
            >
              {analyzeMutation.isPending ? (
                <>
                  <Activity className="h-3 w-3 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <TrendingUp className="h-3 w-3" />
                  Update Analysis
                </>
              )}
            </button>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}