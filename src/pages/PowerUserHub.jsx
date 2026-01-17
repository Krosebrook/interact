import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, Lock } from 'lucide-react';
import TierProgressCard from '../components/poweruser/TierProgressCard';
import ValueMetricsCard from '../components/poweruser/ValueMetricsCard';
import TierUnlockAlert from '../components/poweruser/TierUnlockAlert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function PowerUserHub() {
  const [unlockedTierToShow, setUnlockedTierToShow] = useState(null);

  const { data: powerUser, isLoading: powerUserLoading } = useQuery({
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

  const { data: signals } = useQuery({
    queryKey: ['power-user-signals'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const response = await base44.functions.invoke('powerUserDetection', {
        action: 'detect_signals',
        userEmail: user.email
      });
      return response.data.signals;
    },
    enabled: !!powerUser
  });

  const { data: eligibleTiers } = useQuery({
    queryKey: ['eligible-tiers'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const response = await base44.functions.invoke('powerUserDetection', {
        action: 'check_unlock_eligibility',
        userEmail: user.email
      });
      return response.data.eligible_tiers;
    },
    enabled: !!powerUser
  });

  if (powerUserLoading) return null;

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2 mb-2">
          <Sparkles className="w-8 h-8 text-int-orange" />
          Power User Hub
        </h1>
        <p className="text-slate-600">
          {powerUser?.power_user_tier === 'free'
            ? 'Keep engaging—unlock advanced capabilities as you grow.'
            : 'You're unlocking premium capabilities based on how you work.'}
        </p>
      </div>

      {/* TIER UNLOCK ALERTS */}
      {eligibleTiers && eligibleTiers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {eligibleTiers.map(tier => (
            <TierUnlockAlert
              key={tier}
              tier={tier}
              onDismiss={() => {
                setUnlockedTierToShow(null);
              }}
            />
          ))}
        </motion.div>
      )}

      {/* GRID: TIER PROGRESS + VALUE METRICS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TierProgressCard />
        <ValueMetricsCard />
      </div>

      {/* SIGNALS BREAKDOWN */}
      {signals && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-int-orange" />
              Your Power-User Signals
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-3">
              {/* DEAL MOMENTUM */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-slate-900">Deal Momentum</h4>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    signals.deal_momentum.threshold_met
                      ? 'bg-green-100 text-green-800 font-semibold'
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    {Math.round(signals.deal_momentum.score * 100)}%
                  </span>
                </div>
                <p className="text-sm text-slate-700">
                  {signals.deal_momentum.details.savedDeals} deals saved
                  {signals.deal_momentum.details.compared > 0 && ` • ${signals.deal_momentum.details.compared} compared`}
                </p>
                {signals.deal_momentum.threshold_met && (
                  <p className="text-xs text-green-700 font-medium mt-2">✓ Ready for Advanced Discovery</p>
                )}
              </div>

              {/* PORTFOLIO ENGAGEMENT */}
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-slate-900">Portfolio Engagement</h4>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    signals.portfolio_engagement.threshold_met
                      ? 'bg-green-100 text-green-800 font-semibold'
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    {Math.round(signals.portfolio_engagement.score * 100)}%
                  </span>
                </div>
                <p className="text-sm text-slate-700">
                  {signals.portfolio_engagement.details.goalsViewed} analytics sessions
                  {signals.portfolio_engagement.details.goalsAdjusted > 0 && ` • ${signals.portfolio_engagement.details.goalsAdjusted} adjustments`}
                </p>
                {signals.portfolio_engagement.threshold_met && (
                  <p className="text-xs text-green-700 font-medium mt-2">✓ Ready for Portfolio Intelligence</p>
                )}
              </div>

              {/* COMMUNITY ENGAGEMENT */}
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-slate-900">Community Engagement</h4>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    signals.community_engagement.threshold_met
                      ? 'bg-green-100 text-green-800 font-semibold'
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    {Math.round(signals.community_engagement.score * 100)}%
                  </span>
                </div>
                <p className="text-sm text-slate-700">
                  {signals.community_engagement.details.expertsFollowed} experts followed
                  {signals.community_engagement.details.socialInteractions > 0 && ` • ${signals.community_engagement.details.socialInteractions} interactions`}
                </p>
                {signals.community_engagement.threshold_met && (
                  <p className="text-xs text-green-700 font-medium mt-2">✓ Ready for Network Access</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* FEATURE ROADMAP */}
      <Card>
        <CardHeader>
          <CardTitle>What's Ahead</CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-slate-900">Available Now</h4>
            {powerUser?.unlocked_tiers?.map(tier => (
              <div key={tier} className="flex items-center gap-2 text-sm text-slate-700">
                <span className="w-2 h-2 bg-green-600 rounded-full" />
                {tier === 'tier1_discovery' && 'Advanced Deal Discovery'}
                {tier === 'tier2_intelligence' && 'Portfolio Intelligence'}
                {tier === 'tier3_network' && 'Expert Network Access'}
              </div>
            ))}
          </div>

          {powerUser?.power_user_tier !== 'free' && (
            <div className="bg-gradient-to-r from-int-orange/10 to-transparent p-3 rounded-lg">
              <p className="text-sm text-slate-700">
                <strong>💡 Upgrade Tip:</strong> Explore our premium plans to unlock even more—
                scenario modeling, signal boosting, and exclusive deal flows.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}