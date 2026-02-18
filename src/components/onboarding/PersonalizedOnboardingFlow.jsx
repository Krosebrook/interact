import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import {
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Users,
  Target,
  Calendar,
  Award,
  User,
  Brain,
  Rocket
} from 'lucide-react';
import { toast } from 'sonner';

const ICON_MAP = {
  Users, Target, Calendar, Award, User, Brain, Rocket
};

export default function PersonalizedOnboardingFlow({ userEmail, userRole }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [expandedAction, setExpandedAction] = useState(0);

  const { data: guidance, isLoading } = useQuery({
    queryKey: ['onboarding-guidance', userEmail],
    queryFn: async () => {
      const response = await base44.functions.invoke('aiOnboardingAssistant', {});
      return response.data;
    },
    enabled: !!userEmail,
    staleTime: 300000 // 5 minutes
  });

  const completeMilestoneMutation = useMutation({
    mutationFn: async (milestone) => {
      const existing = await base44.entities.OnboardingMilestone.filter({
        user_email: userEmail,
        milestone_name: milestone
      });

      if (existing.length > 0) {
        return base44.entities.OnboardingMilestone.update(existing[0].id, {
          completed: true,
          completed_at: new Date().toISOString()
        });
      } else {
        return base44.entities.OnboardingMilestone.create({
          user_email: userEmail,
          milestone_name: milestone,
          completed: true,
          completed_at: new Date().toISOString()
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['onboarding-guidance']);
      toast.success('Great job! Keep going! 🎉');
    }
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-slate-200 rounded w-3/4" />
            <div className="h-4 bg-slate-200 rounded w-full" />
            <div className="h-4 bg-slate-200 rounded w-5/6" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const { guidance: aiData, user_context } = guidance || {};

  if (!aiData) return null;

  const completionPercent = user_context?.completion_percentage || 0;

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <Card className="bg-gradient-to-br from-int-orange/10 via-purple-500/10 to-blue-500/10 border-2 border-int-orange/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-int-orange to-purple-500 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-int-navy">AI Onboarding Assistant</div>
              <div className="text-sm text-slate-600 font-normal">Personalized for your role</div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-slate-700 leading-relaxed">{aiData.welcome_message}</p>
          
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Onboarding Progress</span>
              <span className="font-bold text-int-orange">{Math.round(completionPercent)}%</span>
            </div>
            <Progress value={completionPercent} className="h-2" />
          </div>

          <div className="bg-white/60 rounded-lg p-3 border border-int-orange/20">
            <p className="text-sm text-slate-700 italic">
              💡 {aiData.personalized_encouragement}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Priority Actions */}
      {aiData.priority_actions?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-int-orange" />
              Quick Start Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {aiData.priority_actions.map((action, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card 
                  className="border-2 border-int-navy/10 hover:border-int-orange/50 transition-all cursor-pointer"
                  onClick={() => setExpandedAction(expandedAction === idx ? -1 : idx)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="text-xl">{idx + 1}.</div>
                          <h4 className="font-bold text-int-navy">{action.action}</h4>
                          <Badge variant="outline" className="text-xs">
                            {action.estimated_time}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 mb-3">{action.reason}</p>
                        
                        <AnimatePresence>
                          {expandedAction === idx && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                            >
                              <Button
                                onClick={() => {
                                  navigate(createPageUrl(action.feature_path));
                                  completeMilestoneMutation.mutate(action.action);
                                }}
                                className="w-full bg-int-orange hover:bg-[#C46322] mt-2"
                              >
                                {action.cta_text} <ArrowRight className="h-4 w-4 ml-2" />
                              </Button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      <ArrowRight className={`h-5 w-5 text-int-orange transition-transform ${expandedAction === idx ? 'rotate-90' : ''}`} />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Recommended Features */}
      {aiData.recommended_features?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-500" />
              Features You'll Love
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {aiData.recommended_features.map((feature, idx) => {
                const Icon = ICON_MAP[feature.icon] || Sparkles;
                const priorityColor = 
                  feature.priority === 'high' ? 'border-int-orange bg-orange-50' :
                  feature.priority === 'medium' ? 'border-blue-500 bg-blue-50' :
                  'border-slate-300 bg-slate-50';

                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card className={`border-2 ${priorityColor} hover:shadow-md transition-all`}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="h-10 w-10 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
                            <Icon className="h-5 w-5 text-int-orange" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-slate-900 mb-1">{feature.feature_name}</h4>
                            <p className="text-xs text-slate-600 mb-2">{feature.description}</p>
                            <p className="text-xs text-int-orange font-medium">
                              💡 {feature.benefit}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Wins */}
      {aiData.quick_wins?.length > 0 && (
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Rocket className="h-5 w-5 text-green-600" />
              Quick Wins (30 seconds each!)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {aiData.quick_wins.map((win, idx) => (
                <li key={idx} className="flex items-center gap-2 text-sm text-slate-700">
                  <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                  {win}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Next Milestones */}
      {aiData.next_milestones?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-int-orange" />
              Upcoming Milestones
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {aiData.next_milestones.map((milestone, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900 mb-1">{milestone.milestone}</h4>
                    <p className="text-sm text-slate-600 mb-2">{milestone.description}</p>
                    <Badge className="bg-int-orange text-white">
                      🎁 {milestone.reward}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Profile Setup Tips */}
      {aiData.profile_setup_tips?.length > 0 && (
        <Card className="border-2 border-blue-200 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Profile Setup Checklist
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {aiData.profile_setup_tips.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                  <div className="h-5 w-5 rounded-full border-2 border-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                  </div>
                  {tip}
                </li>
              ))}
            </ul>
            <Button
              onClick={() => navigate(createPageUrl('UserProfile'))}
              className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
            >
              Complete Your Profile <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}