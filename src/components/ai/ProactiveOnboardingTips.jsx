import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, TrendingUp, Target, Lightbulb, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProactiveOnboardingTips({ userEmail }) {
  const [dismissed, setDismissed] = useState(false);
  
  const { data: tips, isLoading } = useQuery({
    queryKey: ['onboardingTips', userEmail],
    queryFn: async () => {
      const response = await base44.functions.invoke('proactiveOnboardingTips', {
        userEmail
      });
      return response.data;
    },
    enabled: !!userEmail && !dismissed,
    refetchInterval: 5 * 60 * 1000,  // Refresh every 5 minutes
    staleTime: 5 * 60 * 1000
  });
  
  if (isLoading || dismissed || !tips?.tips) return null;
  
  const ICON_MAP = {
    'profile': Target,
    'event': TrendingUp,
    'recognition': Lightbulb,
    'default': Sparkles
  };
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed bottom-20 md:bottom-6 right-6 w-80 z-30"
      >
        <Card className="border-2 border-int-orange/30 shadow-2xl">
          <CardHeader className="bg-gradient-to-r from-int-orange/10 to-purple-500/10 pb-3">
            <div className="flex items-start justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <div className="p-1.5 bg-int-orange rounded-lg">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                AI Buddy Tips
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setDismissed(true)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {tips.motivationMessage && (
              <div className="p-3 bg-int-gold/10 rounded-lg">
                <p className="text-sm font-medium text-int-navy">
                  {tips.motivationMessage}
                </p>
              </div>
            )}
            
            {tips.tips.map((tip, index) => {
              const IconComponent = ICON_MAP[tip.icon] || ICON_MAP.default;
              
              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-start gap-2">
                    <IconComponent className="h-4 w-4 text-int-orange mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{tip.title}</p>
                      <p className="text-xs text-slate-600">{tip.message}</p>
                    </div>
                  </div>
                  {tip.action_url && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full text-xs"
                      onClick={() => window.location.href = tip.action_url}
                    >
                      {tip.action}
                    </Button>
                  )}
                </div>
              );
            })}
            
            {tips.priorityAction && (
              <div className="pt-3 border-t">
                <p className="text-xs text-slate-500 mb-1">Recommended Next Step:</p>
                <p className="text-sm font-semibold text-int-orange">{tips.priorityAction}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}