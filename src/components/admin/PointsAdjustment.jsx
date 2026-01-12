/**
 * POINTS ADJUSTMENT PANEL
 * Admin tool for manual point adjustments with audit trail
 */

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function PointsAdjustment({ userEmail, currentPoints = 0, onSuccess }) {
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('bonus');
  const [reason, setReason] = useState('');
  const queryClient = useQueryClient();

  const adjustMutation = useMutation({
    mutationFn: (data) => base44.functions.invoke('recordPointsTransaction', data),
    onSuccess: (response) => {
      toast.success(`Points ${amount > 0 ? 'added' : 'deducted'} successfully`);
      queryClient.invalidateQueries(['user-points']);
      queryClient.invalidateQueries(['points-ledger']);
      setAmount('');
      setReason('');
      onSuccess?.(response.data);
    },
    onError: (error) => toast.error(error.message || 'Failed to adjust points')
  });

  const handleSubmit = () => {
    const numAmount = parseInt(amount);
    if (isNaN(numAmount) || numAmount === 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (!reason.trim()) {
      toast.error('Please provide a reason');
      return;
    }

    adjustMutation.mutate({
      userEmail,
      amount: type === 'penalty' ? -Math.abs(numAmount) : Math.abs(numAmount),
      transactionType: 'manual_adjustment',
      description: reason
    });
  };

  const projectedBalance = currentPoints + (type === 'penalty' ? -Math.abs(parseInt(amount) || 0) : Math.abs(parseInt(amount) || 0));

  return (
    <Card data-b44-sync="true" data-feature="admin" data-component="pointsadjustment">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="h-5 w-5 text-purple-600" />
          Manual Points Adjustment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-slate-50 rounded-lg">
          <p className="text-sm text-slate-600">Current Balance</p>
          <p className="text-2xl font-bold text-slate-900">{currentPoints.toLocaleString()} pts</p>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">Type</label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bonus">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                  Add Points (Bonus)
                </div>
              </SelectItem>
              <SelectItem value="penalty">
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                  Deduct Points (Penalty)
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">Amount</label>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter points amount"
            className="mt-1"
            min="1"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">Reason (Audit Trail)</label>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Why are you adjusting points?"
            className="mt-1 h-20"
            maxLength={200}
          />
        </div>

        {amount && (
          <div className={`p-3 rounded-lg ${projectedBalance < 0 ? 'bg-red-50 border border-red-200' : 'bg-blue-50 border border-blue-200'}`}>
            <div className="flex items-center gap-2">
              {projectedBalance < 0 && <AlertCircle className="h-4 w-4 text-red-600" />}
              <p className="text-sm font-medium text-slate-900">
                New Balance: <span className={projectedBalance < 0 ? 'text-red-600' : 'text-blue-600'}>
                  {projectedBalance.toLocaleString()} pts
                </span>
              </p>
            </div>
            {projectedBalance < 0 && (
              <p className="text-xs text-red-600 mt-1">
                Warning: This will result in a negative balance
              </p>
            )}
          </div>
        )}

        <Button
          onClick={handleSubmit}
          disabled={adjustMutation.isPending || !amount || !reason.trim()}
          className="w-full bg-int-orange hover:bg-int-orange/90"
        >
          {adjustMutation.isPending ? 'Processing...' : `${type === 'penalty' ? 'Deduct' : 'Add'} Points`}
        </Button>
      </CardContent>
    </Card>
  );
}