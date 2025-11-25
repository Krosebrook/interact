import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useUserData } from '../components/hooks/useUserData';
import { useGamificationData } from '../components/hooks/useGamificationData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RewardCard from '../components/gamification/RewardCard';
import BadgeDisplay from '../components/gamification/BadgeDisplay';
import LoadingSpinner from '../components/common/LoadingSpinner';
import PageHeader from '../components/common/PageHeader';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Gift, 
  ShoppingCart, 
  Sparkles, 
  Award, 
  Clock,
  Package,
  TrendingUp,
  Search
} from 'lucide-react';
import { toast } from 'sonner';

export default function RewardsStore() {
  const queryClient = useQueryClient();
  const { user, loading, userPoints } = useUserData(true);
  const { rewards, redemptions: myRedemptions } = useGamificationData(user?.email);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReward, setSelectedReward] = useState(null);
  const [redemptionNotes, setRedemptionNotes] = useState('');

  const redeemMutation = useMutation({
    mutationFn: async ({ reward_id, redemption_notes }) => {
      const response = await base44.functions.invoke('redeemReward', {
        reward_id,
        redemption_notes
      });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['rewards']);
      queryClient.invalidateQueries(['user-points']);
      queryClient.invalidateQueries(['my-redemptions']);
      setSelectedReward(null);
      setRedemptionNotes('');
      toast.success(`Reward redeemed! ${data.remaining_points} points remaining 🎉`);
    },
    onError: (error) => {
      const errorMsg = error.response?.data?.error || 'Failed to redeem reward';
      toast.error(errorMsg);
    }
  });

  const categories = [
    { value: 'all', label: 'All Rewards', icon: Gift },
    { value: 'badge', label: 'Badges', icon: Award },
    { value: 'swag', label: 'Company Swag', icon: Package },
    { value: 'gift_voucher', label: 'Gift Vouchers', icon: ShoppingCart },
    { value: 'extra_pto', label: 'Extra PTO', icon: Clock },
    { value: 'experience', label: 'Experiences', icon: Sparkles },
    { value: 'donation', label: 'Donations', icon: TrendingUp }
  ];

  const filteredRewards = rewards.filter(reward => {
    const matchesCategory = selectedCategory === 'all' || reward.category === selectedCategory;
    const matchesSearch = reward.reward_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         reward.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch && reward.is_available;
  });

  const handleRedeem = () => {
    if (currentPoints < selectedReward.points_cost) {
      toast.error('Not enough points!');
      return;
    }
    redeemMutation.mutate({
      reward_id: selectedReward.id,
      redemption_notes: redemptionNotes
    });
  };



  if (loading || !user) {
    return <LoadingSpinner className="min-h-[60vh]" />;
  }

  const currentPoints = userPoints?.total_points || 0;

  return (
    <div className="space-y-8">
      {/* Header with Points Balance */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <PageHeader title="Rewards Store" description="Redeem your points for awesome rewards" />
        <Card className="bg-int-navy text-white border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Your Points</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{currentPoints}</div>
            <p className="text-slate-300 text-sm mt-1">Available to spend</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="rewards" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="rewards">
            <Gift className="h-4 w-4 mr-2" />
            Rewards Store
          </TabsTrigger>
          <TabsTrigger value="badges">
            <Award className="h-4 w-4 mr-2" />
            My Badges
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rewards" className="space-y-6">

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search rewards..."
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map(cat => {
                const Icon = cat.icon;
                return (
                  <Button
                    key={cat.value}
                    variant={selectedCategory === cat.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(cat.value)}
                    className="whitespace-nowrap"
                  >
                    <Icon className="h-3 w-3 mr-1" />
                    {cat.label}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Rewards Grid */}
          {!rewards.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-80 bg-slate-100 animate-pulse rounded-xl" />
              ))}
            </div>
          ) : filteredRewards.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-slate-300">
              <Gift className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No rewards found</h3>
              <p className="text-slate-600">Try adjusting your filters or search query</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRewards.map((reward, index) => (
                <RewardCard
                  key={reward.id}
                  reward={reward}
                  userPoints={currentPoints}
                  onRedeem={setSelectedReward}
                  isRedeeming={redeemMutation.isLoading}
                  index={index}
                />
              ))}
            </div>
          )}

          {/* My Redemptions Section */}
          {myRedemptions.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4">My Redemptions</h2>
              <div className="space-y-3">
                {myRedemptions.slice(0, 5).map(redemption => (
                  <Card key={redemption.id}>
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex-1">
                        <h3 className="font-semibold">{redemption.reward_name}</h3>
                        <p className="text-sm text-slate-600">
                          {redemption.points_spent} points • {new Date(redemption.created_date).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge
                        variant={
                          redemption.status === 'fulfilled' ? 'default' :
                          redemption.status === 'approved' ? 'secondary' :
                          redemption.status === 'cancelled' ? 'destructive' : 'outline'
                        }
                        className="capitalize"
                      >
                        {redemption.status}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="badges">
          <BadgeDisplay userEmail={user?.email} />
        </TabsContent>
      </Tabs>

      {/* Redemption Confirmation Dialog */}
      <Dialog open={!!selectedReward} onOpenChange={() => setSelectedReward(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Redeem {selectedReward?.reward_name}?</DialogTitle>
            <DialogDescription>
              This will cost {selectedReward?.points_cost} points
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-slate-50 p-4 rounded-lg">
              <p className="text-sm text-slate-700 mb-2">{selectedReward?.description}</p>
              {selectedReward?.redemption_instructions && (
                <div className="mt-3 pt-3 border-t border-slate-200">
                  <p className="text-xs font-semibold text-slate-900 mb-1">How to claim:</p>
                  <p className="text-xs text-slate-600">{selectedReward.redemption_instructions}</p>
                </div>
              )}
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Additional notes (optional)
              </label>
              <Textarea
                value={redemptionNotes}
                onChange={(e) => setRedemptionNotes(e.target.value)}
                placeholder="e.g., size preference, delivery address, etc."
                rows={3}
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border-2 border-int-orange">
              <div>
                <p className="text-sm font-semibold text-slate-900">Your Points</p>
                <p className="text-xs text-slate-600">After redemption</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-int-orange">
                  {currentPoints - (selectedReward?.points_cost || 0)}
                </p>
                <p className="text-xs text-slate-500">
                  (was {currentPoints})
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setSelectedReward(null);
                setRedemptionNotes('');
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRedeem}
              disabled={redeemMutation.isLoading}
              className="flex-1 bg-int-orange hover:bg-[#C46322] text-white"
            >
              {redeemMutation.isLoading ? 'Redeeming...' : 'Confirm Redemption'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}