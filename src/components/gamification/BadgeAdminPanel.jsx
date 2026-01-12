import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Award, 
  Plus, 
  Edit, 
  Users,
  Gift,
  Sparkles,
  Target,
  HandHeart,
  Lightbulb,
  Crown
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const BADGE_TYPES = [
  { value: 'milestone', label: 'Milestone', icon: Target },
  { value: 'achievement', label: 'Achievement', icon: Award },
  { value: 'special', label: 'Special', icon: Sparkles },
  { value: 'team', label: 'Team', icon: Users },
  { value: 'collaborator', label: 'Collaborator', icon: HandHeart },
  { value: 'innovator', label: 'Innovator', icon: Lightbulb },
  { value: 'community_builder', label: 'Community Builder', icon: Users },
  { value: 'leadership', label: 'Leadership', icon: Crown },
  { value: 'mentor', label: 'Mentor', icon: Gift }
];

const CRITERIA_TYPES = [
  { value: 'events_attended', label: 'Events Attended' },
  { value: 'feedback_submitted', label: 'Feedback Submitted' },
  { value: 'points_total', label: 'Total Points' },
  { value: 'streak_days', label: 'Streak Days' },
  { value: 'activities_completed', label: 'Activities Completed' },
  { value: 'media_uploads', label: 'Media Uploads' },
  { value: 'peer_recognitions', label: 'Peer Recognitions Given' },
  { value: 'ideas_submitted', label: 'Ideas Submitted' },
  { value: 'manual', label: 'Manual Award Only' }
];

const CATEGORIES = [
  { value: 'engagement', label: 'Engagement' },
  { value: 'collaboration', label: 'Collaboration' },
  { value: 'innovation', label: 'Innovation' },
  { value: 'community', label: 'Community' },
  { value: 'leadership', label: 'Leadership' },
  { value: 'special', label: 'Special' }
];

export default function BadgeAdminPanel() {
  const queryClient = useQueryClient();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showAwardDialog, setShowAwardDialog] = useState(false);
  const [editingBadge, setEditingBadge] = useState(null);
  const [selectedBadgeForAward, setSelectedBadgeForAward] = useState(null);
  const [awardForm, setAwardForm] = useState({ user_email: '', reason: '' });
  
  const [badgeForm, setBadgeForm] = useState({
    badge_name: '',
    badge_description: '',
    badge_icon: '🏆',
    badge_type: 'achievement',
    rarity: 'common',
    points_value: 10,
    category: 'engagement',
    is_manual_award: false,
    award_criteria: { type: 'events_attended', threshold: 5 }
  });

  const { data: badges = [] } = useQuery({
    queryKey: ['badges'],
    queryFn: () => base44.entities.Badge.list()
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list()
  });

  const { data: recentAwards = [] } = useQuery({
    queryKey: ['badge-awards'],
    queryFn: () => base44.entities.BadgeAward.list('-created_date', 20)
  });

  const createBadgeMutation = useMutation({
    mutationFn: (data) => base44.entities.Badge.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['badges']);
      setShowCreateDialog(false);
      resetForm();
      toast.success('Badge created!');
    }
  });

  const updateBadgeMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Badge.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['badges']);
      setShowCreateDialog(false);
      setEditingBadge(null);
      resetForm();
      toast.success('Badge updated!');
    }
  });

  const awardBadgeMutation = useMutation({
    mutationFn: async ({ badge, userEmail, reason, adminUser }) => {
      // Get or create user points
      let userPoints = await base44.entities.UserPoints.filter({ user_email: userEmail });
      if (!userPoints.length) {
        userPoints = [await base44.entities.UserPoints.create({
          user_email: userEmail,
          total_points: 0,
          badges_earned: [],
          level: 1
        })];
      }
      
      const existingBadges = userPoints[0].badges_earned || [];
      if (existingBadges.includes(badge.id)) {
        throw new Error('User already has this badge');
      }

      // Update user points with badge and bonus points
      await base44.entities.UserPoints.update(userPoints[0].id, {
        badges_earned: [...existingBadges, badge.id],
        total_points: (userPoints[0].total_points || 0) + (badge.points_value || 0)
      });

      // Create badge award record
      const targetUser = users.find(u => u.email === userEmail);
      await base44.entities.BadgeAward.create({
        badge_id: badge.id,
        user_email: userEmail,
        user_name: targetUser?.full_name || userEmail,
        awarded_by_email: adminUser.email,
        awarded_by_name: adminUser.full_name,
        award_reason: reason,
        award_type: 'manual',
        points_awarded: badge.points_value || 0
      });

      // Create notification
      await base44.entities.Notification.create({
        user_email: userEmail,
        type: 'badge_earned',
        title: '🎉 New Badge Awarded!',
        message: `You've been awarded the "${badge.badge_name}" badge! ${reason ? `Reason: ${reason}` : ''}`,
        icon: badge.badge_icon,
        badge_id: badge.id
      });

      return { badge, userEmail };
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['badges']);
      queryClient.invalidateQueries(['badge-awards']);
      queryClient.invalidateQueries(['user-points']);
      setShowAwardDialog(false);
      setSelectedBadgeForAward(null);
      setAwardForm({ user_email: '', reason: '' });
      toast.success('Badge awarded successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to award badge');
    }
  });

  const resetForm = () => {
    setBadgeForm({
      badge_name: '',
      badge_description: '',
      badge_icon: '🏆',
      badge_type: 'achievement',
      rarity: 'common',
      points_value: 10,
      category: 'engagement',
      is_manual_award: false,
      award_criteria: { type: 'events_attended', threshold: 5 }
    });
  };

  const handleEdit = (badge) => {
    setEditingBadge(badge);
    setBadgeForm({
      badge_name: badge.badge_name,
      badge_description: badge.badge_description,
      badge_icon: badge.badge_icon,
      badge_type: badge.badge_type || 'achievement',
      rarity: badge.rarity || 'common',
      points_value: badge.points_value || 0,
      category: badge.category || 'engagement',
      is_manual_award: badge.is_manual_award || false,
      award_criteria: badge.award_criteria || { type: 'manual', threshold: 0 }
    });
    setShowCreateDialog(true);
  };

  const handleSave = () => {
    const data = {
      ...badgeForm,
      award_criteria: badgeForm.is_manual_award 
        ? { type: 'manual', threshold: 0 }
        : badgeForm.award_criteria
    };
    
    if (editingBadge) {
      updateBadgeMutation.mutate({ id: editingBadge.id, data });
    } else {
      createBadgeMutation.mutate(data);
    }
  };

  const rarityColors = {
    common: 'border-slate-300 bg-slate-50',
    rare: 'border-blue-300 bg-blue-50',
    epic: 'border-purple-300 bg-purple-50',
    legendary: 'border-yellow-300 bg-gradient-to-br from-yellow-50 to-orange-50'
  };

  return (
    <div data-b44-sync="true" data-feature="gamification" data-component="badgeadminpanel" className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Badge Management</h2>
          <p className="text-slate-600">Create badges and award them to users</p>
        </div>
        <Button onClick={() => { resetForm(); setEditingBadge(null); setShowCreateDialog(true); }} className="bg-int-orange hover:bg-[#C46322]">
          <Plus className="h-4 w-4 mr-2" />
          Create Badge
        </Button>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {badges.map((badge, index) => (
          <motion.div
            key={badge.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className={`border-2 ${rarityColors[badge.rarity] || rarityColors.common}`}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{badge.badge_icon}</span>
                    <div>
                      <CardTitle className="text-base">{badge.badge_name}</CardTitle>
                      <div className="flex gap-1 mt-1">
                        <Badge variant="outline" className="text-xs capitalize">
                          {badge.badge_type?.replace('_', ' ')}
                        </Badge>
                        <Badge variant="outline" className="text-xs capitalize">
                          {badge.rarity}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(badge)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-slate-600">{badge.badge_description}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Points Value:</span>
                  <span className="font-semibold text-int-orange">+{badge.points_value || 0}</span>
                </div>
                {badge.is_manual_award ? (
                  <Badge className="bg-purple-100 text-purple-700 border-purple-200">Manual Award Only</Badge>
                ) : badge.award_criteria && (
                  <div className="text-xs text-slate-500">
                    Auto-award at: {badge.award_criteria.threshold} {badge.award_criteria.type?.replace('_', ' ')}
                  </div>
                )}
                <Button 
                  onClick={() => { setSelectedBadgeForAward(badge); setShowAwardDialog(true); }}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  <Gift className="h-4 w-4 mr-2" />
                  Award to User
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recent Awards */}
      {recentAwards.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Badge Awards</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentAwards.slice(0, 5).map(award => {
                const badge = badges.find(b => b.id === award.badge_id);
                return (
                  <div key={award.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <span className="text-2xl">{badge?.badge_icon || '🏆'}</span>
                    <div className="flex-1">
                      <div className="font-medium">{award.user_name}</div>
                      <div className="text-sm text-slate-600">
                        {badge?.badge_name} • {award.award_type === 'manual' ? `Awarded by ${award.awarded_by_name}` : 'Auto-awarded'}
                      </div>
                    </div>
                    <div className="text-xs text-slate-500">
                      {new Date(award.created_date).toLocaleDateString()}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingBadge ? 'Edit Badge' : 'Create New Badge'}</DialogTitle>
            <DialogDescription>Configure badge details and award criteria</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Badge Name</Label>
                <Input
                  value={badgeForm.badge_name}
                  onChange={(e) => setBadgeForm(prev => ({ ...prev, badge_name: e.target.value }))}
                  placeholder="e.g., Team Champion"
                />
              </div>
              <div>
                <Label>Icon (emoji)</Label>
                <Input
                  value={badgeForm.badge_icon}
                  onChange={(e) => setBadgeForm(prev => ({ ...prev, badge_icon: e.target.value }))}
                  placeholder="🏆"
                />
              </div>
            </div>
            
            <div>
              <Label>Description</Label>
              <Textarea
                value={badgeForm.badge_description}
                onChange={(e) => setBadgeForm(prev => ({ ...prev, badge_description: e.target.value }))}
                placeholder="Describe what this badge represents..."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Type</Label>
                <Select value={badgeForm.badge_type} onValueChange={(v) => setBadgeForm(prev => ({ ...prev, badge_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {BADGE_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Rarity</Label>
                <Select value={badgeForm.rarity} onValueChange={(v) => setBadgeForm(prev => ({ ...prev, rarity: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="common">Common</SelectItem>
                    <SelectItem value="rare">Rare</SelectItem>
                    <SelectItem value="epic">Epic</SelectItem>
                    <SelectItem value="legendary">Legendary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Category</Label>
                <Select value={badgeForm.category} onValueChange={(v) => setBadgeForm(prev => ({ ...prev, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Points Value</Label>
              <Input
                type="number"
                value={badgeForm.points_value}
                onChange={(e) => setBadgeForm(prev => ({ ...prev, points_value: parseInt(e.target.value) || 0 }))}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_manual"
                checked={badgeForm.is_manual_award}
                onChange={(e) => setBadgeForm(prev => ({ ...prev, is_manual_award: e.target.checked }))}
                className="rounded"
              />
              <Label htmlFor="is_manual" className="cursor-pointer">Manual award only (admin must award this badge)</Label>
            </div>

            {!badgeForm.is_manual_award && (
              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
                <div>
                  <Label>Award Criteria Type</Label>
                  <Select 
                    value={badgeForm.award_criteria?.type || 'events_attended'} 
                    onValueChange={(v) => setBadgeForm(prev => ({ 
                      ...prev, 
                      award_criteria: { ...prev.award_criteria, type: v } 
                    }))}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CRITERIA_TYPES.filter(c => c.value !== 'manual').map(criteria => (
                        <SelectItem key={criteria.value} value={criteria.value}>{criteria.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Threshold</Label>
                  <Input
                    type="number"
                    value={badgeForm.award_criteria?.threshold || 0}
                    onChange={(e) => setBadgeForm(prev => ({ 
                      ...prev, 
                      award_criteria: { ...prev.award_criteria, threshold: parseInt(e.target.value) || 0 } 
                    }))}
                  />
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowCreateDialog(false)} className="flex-1">Cancel</Button>
            <Button onClick={handleSave} className="flex-1 bg-int-orange hover:bg-[#C46322]">
              {editingBadge ? 'Update' : 'Create'} Badge
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Award Dialog */}
      <Dialog open={showAwardDialog} onOpenChange={setShowAwardDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-2xl">{selectedBadgeForAward?.badge_icon}</span>
              Award "{selectedBadgeForAward?.badge_name}"
            </DialogTitle>
            <DialogDescription>Select a user to award this badge to</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Select User</Label>
              <Select value={awardForm.user_email} onValueChange={(v) => setAwardForm(prev => ({ ...prev, user_email: v }))}>
                <SelectTrigger><SelectValue placeholder="Choose a user..." /></SelectTrigger>
                <SelectContent>
                  {users.map(user => (
                    <SelectItem key={user.id} value={user.email}>
                      {user.full_name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Reason for Award (optional)</Label>
              <Textarea
                value={awardForm.reason}
                onChange={(e) => setAwardForm(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="e.g., Outstanding contribution to team collaboration..."
                rows={3}
              />
            </div>
            {selectedBadgeForAward?.points_value > 0 && (
              <div className="p-3 bg-orange-50 rounded-lg text-sm">
                <span className="font-medium">Bonus:</span> User will receive +{selectedBadgeForAward.points_value} points
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowAwardDialog(false)} className="flex-1">Cancel</Button>
            <Button 
              onClick={async () => {
                const adminUser = await base44.auth.me();
                awardBadgeMutation.mutate({
                  badge: selectedBadgeForAward,
                  userEmail: awardForm.user_email,
                  reason: awardForm.reason,
                  adminUser
                });
              }}
              disabled={!awardForm.user_email || awardBadgeMutation.isLoading}
              className="flex-1 bg-int-orange hover:bg-[#C46322]"
            >
              {awardBadgeMutation.isLoading ? 'Awarding...' : 'Award Badge'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}