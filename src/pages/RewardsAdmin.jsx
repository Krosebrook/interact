import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useUserData } from '../components/hooks/useUserData';
import { useGamificationData } from '../components/hooks/useGamificationData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BadgeAdminPanel from '../components/gamification/BadgeAdminPanel';
import LoadingSpinner from '../components/common/LoadingSpinner';
import PageHeader from '../components/common/PageHeader';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Gift, 
  Plus, 
  CheckCircle, 
  XCircle, 
  Clock,
  Edit,
  Package,
  TrendingUp,
  Award,
  Trash2,
  Users,
  Zap,
  Search,
  RotateCcw,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';

export default function RewardsAdmin() {
  const queryClient = useQueryClient();
  const { user, loading } = useUserData(true, true);
  const { allRewards: rewards, allRedemptions: redemptions, userPoints, refetchRewards, refetchAllRedemptions } = useGamificationData();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingReward, setEditingReward] = useState(null);
  const [selectedRedemption, setSelectedRedemption] = useState(null);
  const [rewardForm, setRewardForm] = useState({
    reward_name: '',
    description: '',
    points_cost: 100,
    category: 'badge',
    image_url: '',
    stock_quantity: null,
    redemption_instructions: '',
    expiry_date: ''
  });

  const createRewardMutation = useMutation({
    mutationFn: async (data) => base44.entities.Reward.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['rewards']);
      queryClient.invalidateQueries(['all-rewards']);
      refetchRewards?.();
      setShowCreateDialog(false);
      resetForm();
      toast.success('Reward created successfully!');
    }
  });

  const updateRewardMutation = useMutation({
    mutationFn: async ({ id, data }) => base44.entities.Reward.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['rewards']);
      queryClient.invalidateQueries(['all-rewards']);
      refetchRewards?.();
      setEditingReward(null);
      resetForm();
      toast.success('Reward updated successfully!');
    }
  });

  const deleteRewardMutation = useMutation({
    mutationFn: async (id) => base44.entities.Reward.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['rewards']);
      queryClient.invalidateQueries(['all-rewards']);
      refetchRewards?.();
      toast.success('Reward deleted successfully!');
    }
  });

  const updateRedemptionMutation = useMutation({
    mutationFn: async ({ id, status, notes, refundPoints, userEmail, pointsToRefund }) => {
      const updateData = { status };
      if (status === 'fulfilled') {
        updateData.fulfilled_date = new Date().toISOString();
      }
      if (notes) {
        updateData.fulfillment_notes = notes;
      }
      
      // Refund points if cancelling
      if (refundPoints && userEmail && pointsToRefund) {
        const userPointsRecords = await base44.entities.UserPoints.filter({ user_email: userEmail });
        if (userPointsRecords.length > 0) {
          const currentPoints = userPointsRecords[0];
          await base44.entities.UserPoints.update(currentPoints.id, {
            total_points: (currentPoints.total_points || 0) + pointsToRefund
          });
        }
      }
      
      return base44.entities.RewardRedemption.update(id, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['all-redemptions']);
      queryClient.invalidateQueries(['user-points']);
      refetchAllRedemptions?.();
      setSelectedRedemption(null);
      toast.success('Redemption status updated!');
    }
  });

  const resetForm = () => {
    setRewardForm({
      reward_name: '',
      description: '',
      points_cost: 100,
      category: 'badge',
      image_url: '',
      stock_quantity: null,
      redemption_instructions: '',
      expiry_date: ''
    });
  };

  const handleCreateOrUpdate = () => {
    const data = {
      ...rewardForm,
      is_available: true,
      popularity_score: 0,
      stock_quantity: rewardForm.stock_quantity === '' ? null : parseInt(rewardForm.stock_quantity)
    };

    if (editingReward) {
      updateRewardMutation.mutate({ id: editingReward.id, data });
    } else {
      createRewardMutation.mutate(data);
    }
  };

  const handleEditReward = (reward) => {
    setEditingReward(reward);
    setRewardForm({
      reward_name: reward.reward_name,
      description: reward.description,
      points_cost: reward.points_cost,
      category: reward.category,
      image_url: reward.image_url || '',
      stock_quantity: reward.stock_quantity,
      redemption_instructions: reward.redemption_instructions || '',
      expiry_date: reward.expiry_date || ''
    });
    setShowCreateDialog(true);
  };

  const pendingRedemptions = redemptions.filter(r => r.status === 'pending');
  const approvedRedemptions = redemptions.filter(r => r.status === 'approved');
  const fulfilledRedemptions = redemptions.filter(r => r.status === 'fulfilled');
  const cancelledRedemptions = redemptions.filter(r => r.status === 'cancelled');
  
  // Calculate stats
  const totalPointsDistributed = userPoints.reduce((sum, up) => sum + (up.total_points || 0), 0);
  const totalPointsSpent = redemptions.filter(r => r.status !== 'cancelled').reduce((sum, r) => sum + (r.points_spent || 0), 0);

  if (loading || !user) {
    return <LoadingSpinner className="min-h-[60vh]" />;
  }

  return (
    <div className="space-y-8">
      <PageHeader title="Rewards & Badges Administration" description="Manage rewards catalog, badges, and redemptions">
        <Button onClick={() => { resetForm(); setShowCreateDialog(true); }} className="bg-int-orange hover:bg-[#C46322] text-white">
          <Plus className="h-4 w-4 mr-2" />
          Add Reward
        </Button>
      </PageHeader>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Rewards</CardTitle>
            <Gift className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rewards.length}</div>
            <p className="text-xs text-slate-500">{rewards.filter(r => r.is_available).length} available</p>
          </CardContent>
        </Card>
        <Card className="border-2 border-yellow-200 bg-yellow-50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-700">{pendingRedemptions.length}</div>
            <p className="text-xs text-yellow-600">Needs attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedRedemptions.length}</div>
            <p className="text-xs text-slate-500">Awaiting fulfillment</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Fulfilled</CardTitle>
            <Package className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{fulfilledRedemptions.length}</div>
            <p className="text-xs text-slate-500">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Points Spent</CardTitle>
            <Zap className="h-4 w-4 text-int-orange" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-int-orange">{totalPointsSpent.toLocaleString()}</div>
            <p className="text-xs text-slate-500">On rewards</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <Package className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {rewards.filter(r => r.stock_quantity !== null && r.stock_quantity < 10).length}
            </div>
            <p className="text-xs text-slate-500">Need restocking</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="redemptions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="redemptions" className="relative">
            <Package className="h-4 w-4 mr-1" />
            Redemptions
            {pendingRedemptions.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {pendingRedemptions.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="rewards">
            <Gift className="h-4 w-4 mr-1" />
            Rewards Catalog
          </TabsTrigger>
          <TabsTrigger value="badges">
            <Award className="h-4 w-4 mr-1" />
            Badges
          </TabsTrigger>
          <TabsTrigger value="users">
            <Users className="h-4 w-4 mr-1" />
            User Points
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rewards" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rewards.map(reward => (
              <Card key={reward.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{reward.reward_name}</CardTitle>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline" className="capitalize">
                          {reward.category.replace('_', ' ')}
                        </Badge>
                        <Badge variant={reward.is_available ? 'default' : 'destructive'}>
                          {reward.is_available ? 'Available' : 'Unavailable'}
                        </Badge>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleEditReward(reward)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Points Cost:</span>
                    <span className="font-semibold text-int-orange">{reward.points_cost}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Stock:</span>
                    <span className={`font-semibold ${reward.stock_quantity !== null && reward.stock_quantity < 10 ? 'text-red-600' : ''}`}>
                      {reward.stock_quantity === null ? 'Unlimited' : reward.stock_quantity}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Redeemed:</span>
                    <span className="font-semibold">{reward.popularity_score || 0} times</span>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => updateRewardMutation.mutate({ 
                        id: reward.id, 
                        data: { is_available: !reward.is_available } 
                      })}
                    >
                      {reward.is_available ? 'Disable' : 'Enable'}
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this reward?')) {
                          deleteRewardMutation.mutate(reward.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="badges">
          <BadgeAdminPanel />
        </TabsContent>

        <TabsContent value="redemptions" className="space-y-6">
          {/* Pending Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-500" />
                Pending Approval ({pendingRedemptions.length})
              </h3>
            </div>
            {pendingRedemptions.length === 0 ? (
              <Card className="bg-slate-50 border-dashed">
                <CardContent className="flex items-center justify-center py-8 text-slate-500">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  No pending redemptions
                </CardContent>
              </Card>
            ) : (
              pendingRedemptions.map(redemption => (
                <Card key={redemption.id} className="border-l-4 border-l-yellow-500">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex-1">
                      <div className="font-semibold">{redemption.reward_name}</div>
                      <div className="text-sm text-slate-600">
                        {redemption.user_name} ({redemption.user_email})
                      </div>
                      <div className="text-sm text-slate-500">
                        {redemption.points_spent} points • {new Date(redemption.created_date).toLocaleString()}
                      </div>
                      {redemption.redemption_notes && (
                        <div className="text-sm text-slate-600 mt-1 italic bg-slate-50 p-2 rounded">
                          Note: {redemption.redemption_notes}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-blue-200 text-blue-600 hover:bg-blue-50"
                        onClick={() => updateRedemptionMutation.mutate({ 
                          id: redemption.id, 
                          status: 'approved' 
                        })}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => updateRedemptionMutation.mutate({ 
                          id: redemption.id, 
                          status: 'fulfilled' 
                        })}
                      >
                        <Package className="h-4 w-4 mr-1" />
                        Fulfill
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => updateRedemptionMutation.mutate({ 
                          id: redemption.id, 
                          status: 'cancelled',
                          refundPoints: true,
                          userEmail: redemption.user_email,
                          pointsToRefund: redemption.points_spent
                        })}
                      >
                        <RotateCcw className="h-4 w-4 mr-1" />
                        Cancel & Refund
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Approved Section */}
          {approvedRedemptions.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-blue-500" />
                Approved - Awaiting Fulfillment ({approvedRedemptions.length})
              </h3>
              {approvedRedemptions.map(redemption => (
                <Card key={redemption.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex-1">
                      <div className="font-semibold">{redemption.reward_name}</div>
                      <div className="text-sm text-slate-600">{redemption.user_name} • {redemption.points_spent} points</div>
                      {redemption.redemption_notes && (
                        <div className="text-sm text-slate-500 italic mt-1">{redemption.redemption_notes}</div>
                      )}
                    </div>
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => updateRedemptionMutation.mutate({ 
                        id: redemption.id, 
                        status: 'fulfilled' 
                      })}
                    >
                      <Package className="h-4 w-4 mr-1" />
                      Mark Fulfilled
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Recent Fulfilled */}
          {fulfilledRedemptions.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Package className="h-5 w-5 text-green-500" />
                Recently Fulfilled ({fulfilledRedemptions.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fulfilledRedemptions.slice(0, 10).map(redemption => (
                  <Card key={redemption.id} className="border-l-4 border-l-green-500 bg-green-50/50">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-semibold">{redemption.reward_name}</div>
                          <div className="text-sm text-slate-600">{redemption.user_name}</div>
                          <div className="text-xs text-slate-500">{redemption.points_spent} points</div>
                        </div>
                        <Badge className="bg-green-100 text-green-700">Fulfilled</Badge>
                      </div>
                      {redemption.fulfilled_date && (
                        <div className="text-xs text-slate-500 mt-2">
                          Fulfilled: {new Date(redemption.fulfilled_date).toLocaleDateString()}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        {/* User Points Tab */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Point Balances
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">User</th>
                      <th className="text-left py-3 px-4">Total Points</th>
                      <th className="text-left py-3 px-4">Level</th>
                      <th className="text-left py-3 px-4">Events Attended</th>
                      <th className="text-left py-3 px-4">Streak</th>
                      <th className="text-left py-3 px-4">Badges</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userPoints.slice(0, 50).map((up, index) => (
                      <tr key={up.id} className="border-b hover:bg-slate-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-slate-500 w-6">{index + 1}.</span>
                            <div>
                              <div className="font-medium">{up.user_email}</div>
                              {up.team_name && <div className="text-xs text-slate-500">{up.team_name}</div>}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-int-orange">{up.total_points || 0}</span>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline">Lv. {up.level || 1}</Badge>
                        </td>
                        <td className="py-3 px-4">{up.events_attended || 0}</td>
                        <td className="py-3 px-4">
                          {up.streak_days > 0 ? (
                            <span className="flex items-center gap-1">
                              🔥 {up.streak_days} days
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4">{up.badges_earned?.length || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingReward ? 'Edit Reward' : 'Create New Reward'}</DialogTitle>
            <DialogDescription>Configure reward details and availability</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Reward Name</Label>
              <Input
                value={rewardForm.reward_name}
                onChange={(e) => setRewardForm(prev => ({ ...prev, reward_name: e.target.value }))}
                placeholder="e.g., Premium Badge"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={rewardForm.description}
                onChange={(e) => setRewardForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the reward..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Points Cost</Label>
                <Input
                  type="number"
                  value={rewardForm.points_cost}
                  onChange={(e) => setRewardForm(prev => ({ ...prev, points_cost: parseInt(e.target.value) }))}
                />
              </div>
              <div>
                <Label>Category</Label>
                <Select
                  value={rewardForm.category}
                  onValueChange={(value) => setRewardForm(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="badge">Badge</SelectItem>
                    <SelectItem value="swag">Company Swag</SelectItem>
                    <SelectItem value="gift_voucher">Gift Voucher</SelectItem>
                    <SelectItem value="extra_pto">Extra PTO</SelectItem>
                    <SelectItem value="experience">Experience</SelectItem>
                    <SelectItem value="donation">Donation</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Image URL (optional)</Label>
              <Input
                value={rewardForm.image_url}
                onChange={(e) => setRewardForm(prev => ({ ...prev, image_url: e.target.value }))}
                placeholder="https://..."
              />
            </div>
            <div>
              <Label>Stock Quantity (leave empty for unlimited)</Label>
              <Input
                type="number"
                value={rewardForm.stock_quantity || ''}
                onChange={(e) => setRewardForm(prev => ({ 
                  ...prev, 
                  stock_quantity: e.target.value ? parseInt(e.target.value) : null 
                }))}
                placeholder="Unlimited"
              />
            </div>
            <div>
              <Label>Redemption Instructions</Label>
              <Textarea
                value={rewardForm.redemption_instructions}
                onChange={(e) => setRewardForm(prev => ({ ...prev, redemption_instructions: e.target.value }))}
                placeholder="How users can claim this reward..."
                rows={2}
              />
            </div>
            <div>
              <Label>Expiry Date (optional)</Label>
              <Input
                type="date"
                value={rewardForm.expiry_date}
                onChange={(e) => setRewardForm(prev => ({ ...prev, expiry_date: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => { setShowCreateDialog(false); setEditingReward(null); }} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleCreateOrUpdate} className="flex-1 bg-int-orange hover:bg-[#C46322] text-white">
              {editingReward ? 'Update' : 'Create'} Reward
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}