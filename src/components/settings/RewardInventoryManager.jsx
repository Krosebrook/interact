import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Gift, 
  Plus, 
  Edit2, 
  Trash2, 
  Save,
  Package,
  Zap,
  Clock,
  ShoppingBag,
  Star,
  Heart,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

const CATEGORY_CONFIG = {
  badge: { icon: Star, color: 'from-purple-500 to-violet-600', label: 'Badge' },
  swag: { icon: ShoppingBag, color: 'from-pink-500 to-rose-600', label: 'Swag' },
  gift_voucher: { icon: Gift, color: 'from-emerald-500 to-teal-600', label: 'Gift Card' },
  extra_pto: { icon: Clock, color: 'from-blue-500 to-cyan-600', label: 'Time Off' },
  experience: { icon: Sparkles, color: 'from-amber-500 to-orange-600', label: 'Experience' },
  donation: { icon: Heart, color: 'from-red-500 to-pink-600', label: 'Donation' },
  other: { icon: Package, color: 'from-slate-500 to-gray-600', label: 'Other' }
};

export default function RewardInventoryManager() {
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [editingReward, setEditingReward] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({
    reward_name: '',
    description: '',
    points_cost: 100,
    category: 'swag',
    image_url: '',
    stock_quantity: null,
    is_available: true,
    redemption_instructions: '',
    expiry_date: ''
  });

  const { data: rewards = [], isLoading } = useQuery({
    queryKey: ['rewards'],
    queryFn: () => base44.entities.Reward.list('-created_date')
  });

  const { data: redemptions = [] } = useQuery({
    queryKey: ['redemptions'],
    queryFn: () => base44.entities.RewardRedemption.list('-created_date', 100)
  });

  const createRewardMutation = useMutation({
    mutationFn: (data) => base44.entities.Reward.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
      setShowDialog(false);
      resetForm();
      toast.success('Reward created successfully');
    }
  });

  const updateRewardMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Reward.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
      setShowDialog(false);
      resetForm();
      toast.success('Reward updated successfully');
    }
  });

  const deleteRewardMutation = useMutation({
    mutationFn: (id) => base44.entities.Reward.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
      setDeleteConfirm(null);
      toast.success('Reward deleted successfully');
    }
  });

  const resetForm = () => {
    setEditingReward(null);
    setFormData({
      reward_name: '',
      description: '',
      points_cost: 100,
      category: 'swag',
      image_url: '',
      stock_quantity: null,
      is_available: true,
      redemption_instructions: '',
      expiry_date: ''
    });
  };

  const handleEdit = (reward) => {
    setEditingReward(reward);
    setFormData({
      reward_name: reward.reward_name,
      description: reward.description,
      points_cost: reward.points_cost,
      category: reward.category,
      image_url: reward.image_url || '',
      stock_quantity: reward.stock_quantity,
      is_available: reward.is_available !== false,
      redemption_instructions: reward.redemption_instructions || '',
      expiry_date: reward.expiry_date || ''
    });
    setShowDialog(true);
  };

  const handleSave = () => {
    const data = {
      ...formData,
      stock_quantity: formData.stock_quantity === '' ? null : formData.stock_quantity
    };

    if (editingReward) {
      updateRewardMutation.mutate({ id: editingReward.id, data });
    } else {
      createRewardMutation.mutate(data);
    }
  };

  // Calculate stats
  const totalRedemptions = redemptions.length;
  const activeRewards = rewards.filter(r => r.is_available).length;
  const lowStockRewards = rewards.filter(r => r.stock_quantity !== null && r.stock_quantity <= 5).length;

  return (
    <Card className="border-2 border-emerald-200">
      <CardHeader className="bg-gradient-to-r from-emerald-500/10 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-wellness shadow-sm">
              <Gift className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle>Reward Inventory</CardTitle>
              <p className="text-sm text-slate-500 mt-1">
                Manage rewards and redemption costs
              </p>
            </div>
          </div>
          <Button
            onClick={() => { resetForm(); setShowDialog(true); }}
            className="bg-gradient-wellness hover:opacity-90 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Reward
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="p-3 bg-white/80 rounded-lg text-center">
            <div className="text-2xl font-bold text-emerald-600">{activeRewards}</div>
            <div className="text-xs text-slate-500">Active Rewards</div>
          </div>
          <div className="p-3 bg-white/80 rounded-lg text-center">
            <div className="text-2xl font-bold text-int-orange">{totalRedemptions}</div>
            <div className="text-xs text-slate-500">Total Redemptions</div>
          </div>
          <div className="p-3 bg-white/80 rounded-lg text-center">
            <div className={`text-2xl font-bold ${lowStockRewards > 0 ? 'text-red-600' : 'text-slate-600'}`}>
              {lowStockRewards}
            </div>
            <div className="text-xs text-slate-500">Low Stock</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {/* Rewards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {rewards.map((reward, index) => {
              const categoryConfig = CATEGORY_CONFIG[reward.category] || CATEGORY_CONFIG.other;
              const CategoryIcon = categoryConfig.icon;
              const isLowStock = reward.stock_quantity !== null && reward.stock_quantity <= 5;
              const isOutOfStock = reward.stock_quantity === 0;

              return (
                <motion.div
                  key={reward.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className={`relative overflow-hidden border-2 ${
                    !reward.is_available || isOutOfStock 
                      ? 'border-slate-200 opacity-60' 
                      : isLowStock 
                        ? 'border-amber-300' 
                        : 'border-slate-200'
                  }`}>
                    {/* Category header */}
                    <div className={`h-16 bg-gradient-to-br ${categoryConfig.color} flex items-center justify-center`}>
                      {reward.image_url ? (
                        <img src={reward.image_url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <CategoryIcon className="h-8 w-8 text-white/80" />
                      )}
                    </div>

                    {/* Stock warning */}
                    {isLowStock && !isOutOfStock && (
                      <Badge className="absolute top-2 right-2 bg-amber-500 text-white">
                        Low Stock: {reward.stock_quantity}
                      </Badge>
                    )}
                    {isOutOfStock && (
                      <Badge className="absolute top-2 right-2 bg-red-500 text-white">
                        Out of Stock
                      </Badge>
                    )}

                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-slate-900">{reward.reward_name}</h4>
                          <Badge variant="outline">{categoryConfig.label}</Badge>
                        </div>
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleEdit(reward)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => setDeleteConfirm(reward)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>

                      <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                        {reward.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-int-orange font-bold">
                          <Zap className="h-4 w-4" />
                          {reward.points_cost.toLocaleString()} pts
                        </div>
                        <span className="text-xs text-slate-500">
                          {reward.popularity_score || 0} redeemed
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {rewards.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <Gift className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No rewards configured yet. Add your first reward!</p>
          </div>
        )}
      </CardContent>

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingReward ? 'Edit Reward' : 'Create New Reward'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label>Reward Name</Label>
              <Input
                value={formData.reward_name}
                onChange={(e) => setFormData(d => ({ ...d, reward_name: e.target.value }))}
                placeholder="e.g., Company Swag Box"
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(d => ({ ...d, description: e.target.value }))}
                placeholder="Describe the reward..."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Points Cost</Label>
                <Input
                  type="number"
                  value={formData.points_cost}
                  onChange={(e) => setFormData(d => ({ ...d, points_cost: parseInt(e.target.value) || 0 }))}
                  min="0"
                />
              </div>
              <div>
                <Label>Category</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(v) => setFormData(d => ({ ...d, category: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Image URL (Optional)</Label>
              <Input
                value={formData.image_url}
                onChange={(e) => setFormData(d => ({ ...d, image_url: e.target.value }))}
                placeholder="https://..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Stock Quantity (leave empty for unlimited)</Label>
                <Input
                  type="number"
                  value={formData.stock_quantity ?? ''}
                  onChange={(e) => setFormData(d => ({ 
                    ...d, 
                    stock_quantity: e.target.value === '' ? null : parseInt(e.target.value) 
                  }))}
                  min="0"
                  placeholder="Unlimited"
                />
              </div>
              <div>
                <Label>Expiry Date (Optional)</Label>
                <Input
                  type="date"
                  value={formData.expiry_date}
                  onChange={(e) => setFormData(d => ({ ...d, expiry_date: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label>Redemption Instructions</Label>
              <Textarea
                value={formData.redemption_instructions}
                onChange={(e) => setFormData(d => ({ ...d, redemption_instructions: e.target.value }))}
                placeholder="How to claim this reward..."
                rows={2}
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={formData.is_available}
                onCheckedChange={(v) => setFormData(d => ({ ...d, is_available: v }))}
              />
              <Label>Available for Redemption</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={createRewardMutation.isPending || updateRewardMutation.isPending}
              className="bg-gradient-wellness hover:opacity-90 text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              {editingReward ? 'Update Reward' : 'Create Reward'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Reward</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteConfirm?.reward_name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteRewardMutation.mutate(deleteConfirm.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}