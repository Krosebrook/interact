import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUserData } from '../components/hooks/useUserData';
import { useGamificationData } from '../components/hooks/useGamificationData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';

export default function RewardsAdmin() {
  const queryClient = useQueryClient();
  const { user, loading } = useUserData(true, true);
  const { rewards, redemptions } = useGamificationData();
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
      setShowCreateDialog(false);
      resetForm();
      toast.success('Reward created successfully!');
    }
  });

  const updateRewardMutation = useMutation({
    mutationFn: async ({ id, data }) => base44.entities.Reward.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['rewards']);
      setEditingReward(null);
      resetForm();
      toast.success('Reward updated successfully!');
    }
  });

  const updateRedemptionMutation = useMutation({
    mutationFn: async ({ id, status, notes }) => {
      const updateData = { status };
      if (status === 'fulfilled') {
        updateData.fulfilled_date = new Date().toISOString();
      }
      if (notes) {
        updateData.fulfillment_notes = notes;
      }
      return base44.entities.RewardRedemption.update(id, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['all-redemptions']);
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

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-int-orange"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Rewards Administration</h1>
          <p className="text-slate-600">Manage rewards catalog and redemptions</p>
        </div>
        <Button onClick={() => { resetForm(); setShowCreateDialog(true); }} className="bg-int-orange hover:bg-[#C46322] text-white">
          <Plus className="h-4 w-4 mr-2" />
          Add Reward
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Rewards</CardTitle>
            <Gift className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rewards.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingRedemptions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Redemptions</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{redemptions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <Package className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {rewards.filter(r => r.stock_quantity !== null && r.stock_quantity < 10).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="rewards" className="space-y-6">
        <TabsList>
          <TabsTrigger value="rewards">Rewards Catalog</TabsTrigger>
          <TabsTrigger value="redemptions">Redemptions</TabsTrigger>
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
                    <span className="font-semibold">{reward.points_cost}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Stock:</span>
                    <span className="font-semibold">
                      {reward.stock_quantity === null ? 'Unlimited' : reward.stock_quantity}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Redeemed:</span>
                    <span className="font-semibold">{reward.popularity_score || 0} times</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="redemptions" className="space-y-4">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Pending Approval ({pendingRedemptions.length})</h3>
            {pendingRedemptions.map(redemption => (
              <Card key={redemption.id}>
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
                      <div className="text-sm text-slate-600 mt-1 italic">
                        Note: {redemption.redemption_notes}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
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
                      variant="outline"
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
                        status: 'cancelled' 
                      })}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {approvedRedemptions.length > 0 && (
              <>
                <h3 className="text-lg font-semibold mt-8">Approved ({approvedRedemptions.length})</h3>
                {approvedRedemptions.map(redemption => (
                  <Card key={redemption.id}>
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex-1">
                        <div className="font-semibold">{redemption.reward_name}</div>
                        <div className="text-sm text-slate-600">{redemption.user_name}</div>
                      </div>
                      <Button
                        size="sm"
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
              </>
            )}
          </div>
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