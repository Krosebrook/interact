import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Award, Zap, Gift, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

export default function ManualAwardsPanel() {
  const [awardType, setAwardType] = useState('points');
  const [selectedUser, setSelectedUser] = useState('');
  const [points, setPoints] = useState('');
  const [selectedBadge, setSelectedBadge] = useState('');
  const [reason, setReason] = useState('');
  
  const queryClient = useQueryClient();

  // Fetch users
  const { data: users } = useQuery({
    queryKey: ['all-users-awards'],
    queryFn: () => base44.entities.User.list()
  });

  // Fetch badges
  const { data: badges } = useQuery({
    queryKey: ['all-badges-awards'],
    queryFn: () => base44.entities.Badge.filter({ is_active: true })
  });

  // Award points mutation
  const awardPointsMutation = useMutation({
    mutationFn: async () => {
      if (!selectedUser || !points || parseInt(points) <= 0) {
        throw new Error('Invalid input');
      }
      await base44.functions.invoke('recordPointsTransaction', {
        user_email: selectedUser,
        amount: parseInt(points),
        transaction_type: 'manual_adjustment',
        description: reason || 'Manual points award by admin'
      });
    },
    onSuccess: () => {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      toast.success(`Successfully awarded ${points} points!`);
      queryClient.invalidateQueries(['all-user-points']);
      queryClient.invalidateQueries(['recent-manual-awards']);
      setSelectedUser('');
      setPoints('');
      setReason('');
    },
    onError: (error) => {
      toast.error('Failed to award points: ' + error.message);
    }
  });

  // Award badge mutation
  const awardBadgeMutation = useMutation({
    mutationFn: async () => {
      if (!selectedUser || !selectedBadge) {
        throw new Error('Invalid input');
      }
      
      const user = users?.find(u => u.email === selectedUser);
      if (!user) {
        throw new Error('User not found');
      }

      // Check if badge already awarded to prevent duplicates
      const existingAward = await base44.entities.BadgeAward.filter({
        user_email: selectedUser,
        badge_id: selectedBadge
      });

      if (existingAward.length > 0) {
        throw new Error('Badge already awarded to this user');
      }

      await base44.entities.BadgeAward.create({
        user_email: selectedUser,
        badge_id: selectedBadge,
        awarded_by: 'admin',
        reason: reason || 'Exceptional contribution recognized by admin'
      });

      // Also award points if badge has point value
      const badge = badges?.find(b => b.id === selectedBadge);
      if (badge?.points_value > 0) {
        await base44.functions.invoke('recordPointsTransaction', {
          user_email: selectedUser,
          amount: badge.points_value,
          transaction_type: 'badge_earned',
          reference_type: 'Badge',
          reference_id: selectedBadge,
          description: `Earned badge: ${badge.badge_name}`
        });
      }

      return { user, badge };
    },
    onSuccess: (data) => {
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 }
      });
      toast.success(`Badge awarded to ${data.user.full_name}!`);
      queryClient.invalidateQueries(['all-badge-awards']);
      queryClient.invalidateQueries(['all-user-points']);
      queryClient.invalidateQueries(['recent-manual-awards']);
      queryClient.invalidateQueries(['recent-badge-awards-admin']);
      setSelectedUser('');
      setSelectedBadge('');
      setReason('');
    },
    onError: (error) => {
      toast.error('Failed to award badge: ' + error.message);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedUser) {
      toast.error('Please select a user');
      return;
    }

    if (awardType === 'points') {
      if (!points || parseInt(points) <= 0) {
        toast.error('Please enter a valid point amount');
        return;
      }
      awardPointsMutation.mutate();
    } else {
      if (!selectedBadge) {
        toast.error('Please select a badge');
        return;
      }
      awardBadgeMutation.mutate();
    }
  };

  const isPending = awardPointsMutation.isPending || awardBadgeMutation.isPending;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Award Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-purple-600" />
            Manual Award System
          </CardTitle>
          <CardDescription>
            Recognize exceptional contributions with points or badges
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Award Type */}
            <div className="space-y-2">
              <Label>Award Type</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={awardType === 'points' ? 'default' : 'outline'}
                  onClick={() => setAwardType('points')}
                  className={awardType === 'points' ? 'bg-amber-600 hover:bg-amber-700' : ''}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Points
                </Button>
                <Button
                  type="button"
                  variant={awardType === 'badge' ? 'default' : 'outline'}
                  onClick={() => setAwardType('badge')}
                  className={awardType === 'badge' ? 'bg-purple-600 hover:bg-purple-700' : ''}
                >
                  <Award className="h-4 w-4 mr-2" />
                  Badge
                </Button>
              </div>
            </div>

            {/* User Selection */}
            <div className="space-y-2">
              <Label>Select User</Label>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a user..." />
                </SelectTrigger>
                <SelectContent>
                  {users?.map(user => (
                    <SelectItem key={user.id} value={user.email}>
                      {user.full_name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Points Amount (if points) */}
            {awardType === 'points' && (
              <div className="space-y-2">
                <Label>Points Amount</Label>
                <Input
                  type="number"
                  min="1"
                  value={points}
                  onChange={(e) => setPoints(e.target.value)}
                  placeholder="Enter point amount..."
                />
              </div>
            )}

            {/* Badge Selection (if badge) */}
            {awardType === 'badge' && (
              <div className="space-y-2">
                <Label>Select Badge</Label>
                <Select value={selectedBadge} onValueChange={setSelectedBadge}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a badge..." />
                  </SelectTrigger>
                  <SelectContent>
                    {badges?.map(badge => (
                      <SelectItem key={badge.id} value={badge.id}>
                        {badge.badge_name} {badge.points_value > 0 && `(+${badge.points_value} pts)`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Reason */}
            <div className="space-y-2">
              <Label>Reason (Optional)</Label>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Describe why you're awarding this..."
                rows={3}
              />
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={isPending}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Awarding...
                </>
              ) : (
                <>
                  <Gift className="h-4 w-4 mr-2" />
                  Award {awardType === 'points' ? 'Points' : 'Badge'}
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Recent Awards */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Manual Awards</CardTitle>
          <CardDescription>Latest awards given by administrators</CardDescription>
        </CardHeader>
        <CardContent>
          <RecentAwardsList />
        </CardContent>
      </Card>
    </div>
  );
}

function RecentAwardsList() {
  const { data: recentTransactions } = useQuery({
    queryKey: ['recent-manual-awards'],
    queryFn: async () => {
      const transactions = await base44.entities.PointsLedger.filter(
        { transaction_type: 'manual_adjustment' },
        '-created_date',
        10
      );
      return transactions;
    }
  });

  const { data: recentBadges } = useQuery({
    queryKey: ['recent-badge-awards-admin'],
    queryFn: async () => {
      const awards = await base44.entities.BadgeAward.filter(
        { awarded_by: 'admin' },
        '-awarded_date',
        10
      );
      return awards;
    }
  });

  const allAwards = [
    ...(recentTransactions?.map(t => ({ ...t, type: 'points', date: t.created_date })) || []),
    ...(recentBadges?.map(b => ({ ...b, type: 'badge', date: b.awarded_date })) || [])
  ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);

  return (
    <div className="space-y-3">
      {allAwards.length === 0 ? (
        <div className="text-center py-8 text-slate-500 text-sm">
          No recent awards
        </div>
      ) : (
        allAwards.map((award, idx) => (
          <div key={idx} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
            <div className="flex items-center gap-3">
              {award.type === 'points' ? (
                <Zap className="h-5 w-5 text-amber-600" />
              ) : (
                <Award className="h-5 w-5 text-purple-600" />
              )}
              <div>
                <p className="text-sm font-medium text-slate-900">
                  {award.user_email}
                </p>
                <p className="text-xs text-slate-600">
                  {award.type === 'points' 
                    ? `${award.amount > 0 ? '+' : ''}${award.amount} points`
                    : 'Badge awarded'}
                </p>
              </div>
            </div>
            <span className="text-xs text-slate-500">
              {new Date(award.date).toLocaleDateString()}
            </span>
          </div>
        ))
      )}
    </div>
  );
}