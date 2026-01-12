import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { History, Package, CheckCircle, Clock, XCircle } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';
import EmptyState from '../common/EmptyState';

export default function RedemptionHistory({ userEmail }) {
  const { data: redemptions, isLoading, error } = useQuery({
    queryKey: ['redemption-history', userEmail],
    queryFn: async () => {
      if (!userEmail) return [];
      
      const redemptions = await base44.entities.RewardRedemption.filter({
        user_email: userEmail
      });
      
      if (redemptions.length === 0) return [];
      
      // Get reward details for each redemption
      const rewardIds = [...new Set(redemptions.map(r => r.reward_id).filter(Boolean))];
      
      if (rewardIds.length === 0) return redemptions;
      
      const rewards = await Promise.all(
        rewardIds.map(id => 
          base44.entities.Reward.filter({ id }).catch(() => [])
        )
      );
      const rewardsMap = Object.fromEntries(
        rewards.flat().filter(Boolean).map(r => [r.id, r])
      );
      
      return redemptions.map(r => ({
        ...r,
        reward: rewardsMap[r.reward_id] || null
      })).sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    },
    enabled: !!userEmail
  });

  if (isLoading) {
    return (
      <Card data-b44-sync="true" data-feature="gamification" data-component="redemptionhistory">
        <CardContent className="py-12">
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-slate-600" />
            Redemption History
          </CardTitle>
        </CardHeader>
        <CardContent className="py-6 text-center text-slate-500">
          <p className="text-sm">Unable to load redemption history</p>
        </CardContent>
      </Card>
    );
  }

  if (!redemptions || redemptions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-slate-600" />
            Redemption History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={Package}
            title="No Redemptions Yet"
            description="Start earning points and redeem rewards to see your history here"
          />
        </CardContent>
      </Card>
    );
  }

  const statusConfig = {
    pending: { icon: Clock, color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
    approved: { icon: CheckCircle, color: 'bg-green-100 text-green-800', label: 'Approved' },
    fulfilled: { icon: CheckCircle, color: 'bg-emerald-100 text-emerald-800', label: 'Fulfilled' },
    cancelled: { icon: XCircle, color: 'bg-red-100 text-red-800', label: 'Cancelled' }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5 text-slate-600" />
          Redemption History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {redemptions.map((redemption) => {
            const config = statusConfig[redemption.status] || statusConfig.pending;
            const StatusIcon = config.icon;
            
            return (
              <div key={redemption.id} className="p-4 rounded-lg border bg-slate-50 hover:bg-slate-100 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-int-orange to-int-gold flex items-center justify-center flex-shrink-0">
                    <Package className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h5 className="font-semibold text-slate-900">{redemption.reward?.reward_name || 'Reward'}</h5>
                      <Badge className={config.color}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {config.label}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">
                      {redemption.reward?.description || 'No description'}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span>-{redemption.points_spent} points</span>
                      <span>•</span>
                      <span>{new Date(redemption.created_date).toLocaleDateString()}</span>
                    </div>
                    {redemption.fulfillment_notes && (
                      <div className="mt-2 bg-blue-50 border border-blue-200 rounded p-2">
                        <p className="text-xs text-blue-800">
                          <strong>Note:</strong> {redemption.fulfillment_notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}