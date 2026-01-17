import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Sparkles, 
  CheckCircle, 
  ArrowRight,
  Target,
  Award,
  Lightbulb,
  Clock,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

const ICON_MAP = {
  calendar: '📅',
  users: '👥',
  award: '🏆',
  message: '💬',
  profile: '👤',
  settings: '⚙️',
  chart: '📊'
};

export default function AIOnboardingAssistant({ onDismiss }) {
  const [dismissed, setDismissed] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['ai-onboarding'],
    queryFn: async () => {
      const response = await base44.functions.invoke('aiOnboardingAssistant');
      return response.data;
    },
    staleTime: 5 * 60 * 1000
  });

  const markMilestoneMutation = useMutation({
    mutationFn: async (milestoneName) => {
      const existing = await base44.entities.OnboardingMilestone.filter({ 
        user_email: (await base44.auth.me()).email,
        milestone_type: milestoneName
      });
      
      if (existing.length === 0) {
        await base44.entities.OnboardingMilestone.create({
          user_email: (await base44.auth.me()).email,
          milestone_type: milestoneName,
          completed: true,
          completed_date: new Date().toISOString()
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-onboarding'] });
      refetch();
    }
  });

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('seen_ai_onboarding');
    if (hasSeenOnboarding) {
      setDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('seen_ai_onboarding', 'true');
    onDismiss?.();
  };

  if (dismissed || isLoading || !data) return null;

  const guidance = data.guidance;
  const userContext = data.user_context;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed bottom-6 right-6 z-50 max-w-md"
      >
        <Card className="shadow-2xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
          <CardHeader className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-6 w-6"
              onClick={handleDismiss}
            >
              <X className="h-4 w-4" />
            </Button>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              Your AI Guide
            </CardTitle>
            <Progress value={userContext.completion_percentage} className="mt-2" />
            <p className="text-xs text-slate-600 mt-1">
              {userContext.completion_percentage.toFixed(0)}% Complete
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Welcome Message */}
            <p className="text-sm text-slate-700">{guidance.welcome_message}</p>

            {/* Priority Actions */}
            {guidance.priority_actions?.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <Target className="h-4 w-4 text-red-600" />
                  Next Steps
                </h4>
                {guidance.priority_actions.slice(0, 2).map((action, idx) => (
                  <div key={idx} className="p-3 bg-white rounded-lg border border-purple-200">
                    <div className="flex items-start justify-between mb-2">
                      <h5 className="font-medium text-sm">{action.action}</h5>
                      <Badge variant="outline" className="text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        {action.estimated_time}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-600 mb-2">{action.reason}</p>
                    <Link to={createPageUrl(action.feature_path)}>
                      <Button 
                        size="sm" 
                        className="w-full bg-purple-600 hover:bg-purple-700"
                        onClick={() => markMilestoneMutation.mutate(action.feature_path)}
                      >
                        {action.cta_text}
                        <ArrowRight className="h-3 w-3 ml-2" />
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}

            {/* Quick Wins */}
            {guidance.quick_wins?.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Quick Wins
                </h4>
                <ul className="space-y-1">
                  {guidance.quick_wins.slice(0, 3).map((win, idx) => (
                    <li key={idx} className="text-xs text-slate-700 flex items-start gap-2">
                      <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                      {win}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommended Features */}
            {guidance.recommended_features?.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-amber-600" />
                  Explore
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {guidance.recommended_features.filter(f => f.priority === 'high').slice(0, 4).map((feature, idx) => (
                    <div key={idx} className="p-2 bg-white rounded border border-slate-200 text-center">
                      <div className="text-2xl mb-1">{ICON_MAP[feature.icon] || '✨'}</div>
                      <div className="text-xs font-medium">{feature.feature_name}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Encouragement */}
            <div className="p-3 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg border border-purple-200">
              <p className="text-xs text-purple-900 font-medium">{guidance.personalized_encouragement}</p>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => refetch()} className="flex-1">
                Refresh Tips
              </Button>
              <Button variant="outline" size="sm" onClick={handleDismiss} className="flex-1">
                Got It!
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}