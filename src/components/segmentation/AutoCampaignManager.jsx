import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Zap, Play, Users, CheckCircle, AlertCircle } from 'lucide-react';

export default function AutoCampaignManager() {
  const queryClient = useQueryClient();
  const [dryRun, setDryRun] = useState(true);

  const { data: highPotential, isLoading } = useQuery({
    queryKey: ['high-potential-segments'],
    queryFn: async () => {
      const response = await base44.functions.invoke('aiSegmentationEngine', {
        action: 'identify_high_potential'
      });
      return response.data;
    },
    refetchInterval: 60000 // Refresh every minute
  });

  const triggerCampaignsMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('aiSegmentationEngine', {
        action: 'auto_trigger_campaigns',
        minConversionRate: 15,
        minSegmentSize: 20,
        dryRun
      });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['high-potential-segments']);
      queryClient.invalidateQueries(['intervention-logs']);
      
      if (data.dry_run) {
        alert(`Dry run complete: ${data.eligible_segments.length} campaigns would be triggered`);
      } else {
        alert(`Successfully triggered ${data.count} automated campaigns!`);
      }
    }
  });

  const segments = highPotential?.high_potential_segments || [];
  const eligibleCount = segments.filter(s => s.auto_campaign_eligible).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-600" />
            <CardTitle>Auto-Campaign Manager</CardTitle>
          </div>
          <Badge variant="outline" className="text-xs">
            {eligibleCount} eligible
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Dry Run Toggle */}
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
          <div>
            <Label htmlFor="dry-run" className="text-sm font-semibold">Dry Run Mode</Label>
            <p className="text-xs text-slate-600">Preview without sending campaigns</p>
          </div>
          <Switch
            id="dry-run"
            checked={dryRun}
            onCheckedChange={setDryRun}
          />
        </div>

        {/* Trigger Button */}
        <Button
          className="w-full"
          onClick={() => triggerCampaignsMutation.mutate()}
          disabled={triggerCampaignsMutation.isPending || isLoading}
        >
          <Play className="w-4 h-4 mr-2" />
          {dryRun ? 'Preview Auto-Campaigns' : 'Trigger Auto-Campaigns'}
        </Button>

        {/* High Potential Segments */}
        <div className="space-y-2">
          <p className="text-sm font-semibold text-slate-700">High-Potential Segments</p>
          {segments.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-4">
              No high-potential segments identified
            </p>
          ) : (
            segments.map((segment, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg border ${
                  segment.auto_campaign_eligible 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-slate-200 bg-white'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-slate-900">
                        {segment.display_name || segment.segment_name}
                      </p>
                      {segment.auto_campaign_eligible && (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-600">
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {segment.user_count} users
                      </div>
                      {segment.conversion_rate > 0 && (
                        <div>
                          {segment.conversion_rate.toFixed(1)}% conversion
                        </div>
                      )}
                      <div>
                        {segment.campaign_count} campaigns
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{segment.reason}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Info */}
        <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
          <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-blue-900">Auto-Campaign Criteria</p>
            <p className="text-xs text-blue-700 mt-1">
              Segments with 15%+ conversion rate or untapped with 20+ users are eligible
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}