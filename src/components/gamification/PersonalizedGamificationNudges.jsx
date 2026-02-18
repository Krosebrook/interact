import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, TrendingUp, Target, Award, Calendar, Users, X } from 'lucide-react';
import { useState } from 'react';

const NUDGE_ICONS = {
  level_progress: TrendingUp,
  streak: Zap,
  challenge: Target,
  badge: Award,
  event: Calendar,
  goal: Target,
  social: Users
};

const PRIORITY_COLORS = {
  high: 'border-red-300 bg-gradient-to-br from-red-50 to-orange-50',
  medium: 'border-yellow-300 bg-gradient-to-br from-yellow-50 to-amber-50',
  low: 'border-blue-300 bg-gradient-to-br from-blue-50 to-cyan-50'
};

export default function PersonalizedGamificationNudges({ userEmail }) {
  const [dismissedNudges, setDismissedNudges] = useState([]);

  const { data: nudgesData } = useQuery({
    queryKey: ['gamification-nudges', userEmail],
    queryFn: async () => {
      const response = await base44.functions.invoke('generateGamificationNudges', {});
      return response.data;
    },
    enabled: !!userEmail,
    staleTime: 1000 * 60 * 30, // 30 minutes
    refetchInterval: 1000 * 60 * 60 // 1 hour
  });

  if (!nudgesData?.success || !nudgesData?.nudges?.length) return null;

  const visibleNudges = nudgesData.nudges
    .filter(nudge => !dismissedNudges.includes(nudge.message))
    .slice(0, 3); // Show max 3 at a time

  if (visibleNudges.length === 0) return null;

  const handleDismiss = (nudge) => {
    setDismissedNudges(prev => [...prev, nudge.message]);
  };

  return (
    <div className="space-y-3">
      <AnimatePresence>
        {visibleNudges.map((nudge, idx) => {
          const Icon = NUDGE_ICONS[nudge.nudge_type] || Zap;
          
          return (
            <motion.div
              key={nudge.message}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.9 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className={`relative overflow-hidden border-2 ${PRIORITY_COLORS[nudge.priority]}`}>
                <CardContent className="p-4">
                  <button
                    onClick={() => handleDismiss(nudge)}
                    className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>

                  <div className="flex items-start gap-3">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      nudge.priority === 'high' ? 'bg-red-500' :
                      nudge.priority === 'medium' ? 'bg-yellow-500' :
                      'bg-blue-500'
                    }`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs capitalize">
                          {nudge.nudge_type.replace('_', ' ')}
                        </Badge>
                        {nudge.expected_points > 0 && (
                          <Badge className="bg-int-orange text-white text-xs">
                            +{nudge.expected_points} pts
                          </Badge>
                        )}
                      </div>

                      <p className="font-semibold text-slate-900 mb-2">{nudge.message}</p>
                      <p className="text-sm text-slate-600 mb-3">{nudge.motivation_hook}</p>

                      <Link to={nudge.action_url}>
                        <Button 
                          size="sm" 
                          className={`${
                            nudge.priority === 'high' ? 'bg-red-500 hover:bg-red-600' :
                            nudge.priority === 'medium' ? 'bg-yellow-500 hover:bg-yellow-600' :
                            'bg-blue-500 hover:bg-blue-600'
                          } text-white`}
                        >
                          <Zap className="h-3 w-3 mr-1" />
                          {nudge.action_text}
                        </Button>
                      </Link>

                      {nudge.expires_in_hours && (
                        <p className="text-xs text-slate-500 mt-2">
                          ⏰ Expires in {nudge.expires_in_hours}h
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}