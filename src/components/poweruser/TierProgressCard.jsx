import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { CheckCircle, Lock, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const TIER_INFO = {
  tier1_discovery: {
    name: 'Advanced Discovery',
    description: 'Deeper deal analysis',
    icon: Zap,
    color: 'from-blue-500 to-cyan-500'
  },
  tier2_intelligence: {
    name: 'Portfolio Intelligence',
    description: 'Scenario modeling & projections',
    icon: Zap,
    color: 'from-amber-500 to-orange-500'
  },
  tier3_network: {
    name: 'Network & Signals',
    description: 'Expert access & signal boosting',
    icon: Zap,
    color: 'from-purple-500 to-pink-500'
  }
};

export default function TierProgressCard() {
  const { data: powerUser } = useQuery({
    queryKey: ['power-user-state'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const response = await base44.functions.invoke('powerUserDetection', {
        action: 'get_or_create_state',
        userEmail: user.email
      });
      return response.data.state;
    }
  });

  const { data: progress } = useQuery({
    queryKey: ['tier-progress'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const response = await base44.functions.invoke('powerUserDetection', {
        action: 'calculate_tier_progress',
        userEmail: user.email
      });
      return response.data.tier_progress;
    },
    enabled: !!powerUser
  });

  if (!powerUser || !progress) return null;

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-slate-900">Tier Progress</h3>
      
      {progress.map((tier, idx) => {
        const info = TIER_INFO[tier.tier_name];
        const isUnlocked = powerUser.unlocked_tiers?.includes(tier.tier_name);

        return (
          <Card key={tier.tier_name} className={isUnlocked ? 'bg-green-50 border-green-200' : ''}>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {isUnlocked ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <Lock className="w-5 h-5 text-slate-400" />
                  )}
                  <div>
                    <p className="font-medium text-slate-900">{info.name}</p>
                    <p className="text-xs text-slate-600">{info.description}</p>
                  </div>
                </div>
              </div>

              {!isUnlocked && (
                <>
                  <Progress value={tier.progress_percentage} className="h-2 mb-2" />
                  <p className="text-xs text-slate-600 text-right">
                    {Math.round(tier.progress_percentage)}% to unlock
                  </p>
                </>
              )}

              {isUnlocked && (
                <p className="text-xs text-green-700 font-medium">✓ Unlocked & Active</p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}