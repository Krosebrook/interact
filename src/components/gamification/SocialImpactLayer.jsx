import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Heart, TrendingUp, Users, Award, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

export default function SocialImpactLayer({ userEmail }) {
  const [donationAmount, setDonationAmount] = useState('');
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const queryClient = useQueryClient();

  const { data: campaigns = [] } = useQuery({
    queryKey: ['charitable-campaigns'],
    queryFn: () => base44.entities.CharitableImpact.filter({ is_active: true })
  });

  const { data: userPoints } = useQuery({
    queryKey: ['user-points', userEmail],
    queryFn: () => base44.entities.UserPoints.filter({ user_email: userEmail })
  });

  const { data: myDonations = [] } = useQuery({
    queryKey: ['my-donations', userEmail],
    queryFn: () => base44.entities.CharitableDonation.filter({ user_email: userEmail })
  });

  const donateMutation = useMutation({
    mutationFn: async ({ campaignId, points }) => {
      const campaign = campaigns.find(c => c.id === campaignId);
      const dollarAmount = points / campaign.point_conversion_rate;
      const companyMatch = campaign.matching_enabled ? dollarAmount * campaign.matching_multiplier : 0;
      
      // Create donation
      const donation = await base44.entities.CharitableDonation.create({
        user_email: userEmail,
        campaign_id: campaignId,
        points_donated: points,
        dollar_amount: dollarAmount,
        company_match_amount: companyMatch,
        total_impact: dollarAmount + companyMatch,
        donation_date: new Date().toISOString(),
        message,
        is_anonymous: isAnonymous
      });

      // Update campaign totals
      await base44.entities.CharitableImpact.update(campaignId, {
        current_amount: campaign.current_amount + dollarAmount + companyMatch,
        total_points_converted: campaign.total_points_converted + points,
        participant_count: campaign.participant_count + 1
      });

      // Deduct points
      const userPointsData = userPoints[0];
      await base44.entities.UserPoints.update(userPointsData.id, {
        total_points: userPointsData.total_points - points
      });

      // Record transaction
      await base44.entities.PointsLedger.create({
        user_email: userEmail,
        amount: -points,
        transaction_type: 'charitable_donation',
        reference_type: 'CharitableDonation',
        reference_id: donation.id,
        description: `Donated to ${campaign.campaign_name}`,
        balance_after: userPointsData.total_points - points
      });

      return { donation, dollarAmount, companyMatch };
    },
    onSuccess: ({ dollarAmount, companyMatch }) => {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 }
      });
      toast.success(`Donated $${dollarAmount.toFixed(2)}${companyMatch > 0 ? ` + $${companyMatch.toFixed(2)} company match` : ''}!`);
      queryClient.invalidateQueries(['charitable-campaigns']);
      queryClient.invalidateQueries(['user-points']);
      queryClient.invalidateQueries(['my-donations']);
      setDonationAmount('');
      setMessage('');
    }
  });

  const activeCampaign = campaigns[0];
  const myTotalDonations = myDonations.reduce((sum, d) => sum + d.total_impact, 0);
  const availablePoints = userPoints?.[0]?.total_points || 0;

  return (
    <div data-b44-sync="true" data-feature="gamification" data-component="socialimpactlayer" className="space-y-6">
      {/* My Impact Summary */}
      <Card className="bg-gradient-to-br from-pink-50 to-rose-50 border-pink-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Heart className="h-5 w-5 text-pink-600" />
                <h4 className="text-sm font-medium text-pink-900">Your Total Impact</h4>
              </div>
              <div className="text-3xl font-bold text-pink-700">${myTotalDonations.toFixed(2)}</div>
              <p className="text-xs text-pink-600 mt-1">{myDonations.length} donations made</p>
            </div>
            <Award className="h-12 w-12 text-pink-400 opacity-50" />
          </div>
        </CardContent>
      </Card>

      {/* Active Campaign */}
      {activeCampaign && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              {activeCampaign.campaign_name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-600">{activeCampaign.description}</p>
            
            <div className="p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-slate-600">Progress</span>
                <span className="font-medium">
                  ${activeCampaign.current_amount.toFixed(2)} / ${activeCampaign.goal_amount.toFixed(2)}
                </span>
              </div>
              <Progress 
                value={(activeCampaign.current_amount / activeCampaign.goal_amount) * 100} 
                className="h-2 mb-2"
              />
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>{activeCampaign.participant_count} participants</span>
                <span>{Math.round((activeCampaign.current_amount / activeCampaign.goal_amount) * 100)}% funded</span>
              </div>
            </div>

            {activeCampaign.matching_enabled && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-700">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    Company matching {activeCampaign.matching_multiplier}x your donation!
                  </span>
                </div>
              </div>
            )}

            {/* Donation Form */}
            <div className="space-y-3 p-4 bg-slate-50 rounded-lg">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">
                  Donate Points
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="Enter points"
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(e.target.value)}
                    max={availablePoints}
                  />
                  <div className="text-sm text-slate-500 whitespace-nowrap">
                    = ${(donationAmount / activeCampaign.point_conversion_rate).toFixed(2)}
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Available: {availablePoints} points
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">
                  Message (optional)
                </label>
                <Textarea
                  placeholder="Add a message of support..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={2}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="anonymous"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="anonymous" className="text-sm text-slate-700">
                  Donate anonymously
                </label>
              </div>

              <Button
                onClick={() => donateMutation.mutate({ 
                  campaignId: activeCampaign.id, 
                  points: parseInt(donationAmount) 
                })}
                disabled={!donationAmount || parseInt(donationAmount) > availablePoints || donateMutation.isPending}
                className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700"
              >
                <Heart className="h-4 w-4 mr-2" />
                Donate {donationAmount && `${donationAmount} Points`}
              </Button>
            </div>

            {/* Impact Stories */}
            {activeCampaign.impact_stories && activeCampaign.impact_stories.length > 0 && (
              <div className="space-y-2">
                <h5 className="text-sm font-medium text-slate-900">Impact Stories</h5>
                {activeCampaign.impact_stories.map((story, idx) => (
                  <div key={idx} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-slate-700">{story.story}</p>
                    <p className="text-xs text-blue-600 mt-1">{story.impact_metric}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}