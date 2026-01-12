import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Target, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';

export default function GoalsCustomizer({ userEmail, currentGoals = {}, userPoints, onSave, isSaving }) {
  const [weeklyTarget, setWeeklyTarget] = useState(currentGoals.weekly_points_target || 100);
  const [tierGoal, setTierGoal] = useState(currentGoals.tier_goal || 'silver');

  const validateMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('gamificationPersonalizationAI', {
        action: 'validate_goals',
        context: {
          weekly_points_target: weeklyTarget,
          tier_goal: tierGoal
        }
      });
      return response.data.validation;
    }
  });

  const handleSave = () => {
    onSave({
      weekly_points_target: weeklyTarget,
      tier_goal: tierGoal,
      set_date: new Date().toISOString()
    });
  };

  const currentWeeklyAvg = Math.round((userPoints?.total_points || 0) / 12);
  const tierProgress = {
    bronze: 0,
    silver: 1000,
    gold: 2500,
    platinum: 5000
  };

  return (
    <div className="space-y-6" data-b44-sync="true" data-feature="profile" data-component="goalscustomizer">
      {/* Current Progress */}
      <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
        <CardContent className="py-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-emerald-700">{userPoints?.total_points || 0}</p>
              <p className="text-sm text-slate-600">Current Points</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-teal-700">{currentWeeklyAvg}</p>
              <p className="text-sm text-slate-600">Weekly Average</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Set Goals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-int-orange" />
            Set Your Goals
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Weekly Points Target */}
          <div className="space-y-2">
            <Label htmlFor="weekly-target">Weekly Points Target</Label>
            <div className="flex gap-2">
              <Input
                id="weekly-target"
                type="number"
                value={weeklyTarget}
                onChange={(e) => setWeeklyTarget(Number(e.target.value))}
                min={0}
                step={10}
                className="flex-1"
              />
              <Button
                variant="outline"
                onClick={() => setWeeklyTarget(Math.max(50, currentWeeklyAvg + 20))}
              >
                Suggest
              </Button>
            </div>
            <p className="text-xs text-slate-600">
              Your current average: {currentWeeklyAvg} points/week
            </p>
          </div>

          {/* Tier Goal */}
          <div className="space-y-2">
            <Label htmlFor="tier-goal">Target Tier</Label>
            <Select value={tierGoal} onValueChange={setTierGoal}>
              <SelectTrigger id="tier-goal">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bronze">🥉 Bronze</SelectItem>
                <SelectItem value="silver">🥈 Silver (1,000 pts)</SelectItem>
                <SelectItem value="gold">🥇 Gold (2,500 pts)</SelectItem>
                <SelectItem value="platinum">💎 Platinum (5,000 pts)</SelectItem>
              </SelectContent>
            </Select>
            {tierGoal !== userPoints?.tier && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span>Progress to {tierGoal}</span>
                  <span className="font-medium">
                    {Math.max(0, tierProgress[tierGoal] - (userPoints?.total_points || 0))} pts needed
                  </span>
                </div>
                <Progress 
                  value={Math.min(100, ((userPoints?.total_points || 0) / tierProgress[tierGoal]) * 100)} 
                  className="h-2"
                />
              </div>
            )}
          </div>

          {/* Validate Goals */}
          <Button
            variant="outline"
            onClick={() => validateMutation.mutate()}
            disabled={validateMutation.isPending}
            className="w-full"
          >
            {validateMutation.isPending ? 'Validating...' : 'Validate Goals with AI'}
          </Button>

          {/* Validation Result */}
          {validateMutation.data && (
            <div className={`p-4 rounded-lg border ${
              validateMutation.data.feasibility === 'realistic' ? 'bg-emerald-50 border-emerald-200' :
              validateMutation.data.feasibility === 'ambitious' ? 'bg-yellow-50 border-yellow-200' :
              'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-start gap-2 mb-2">
                {validateMutation.data.feasibility === 'realistic' ? (
                  <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5" />
                ) : (
                  <AlertCircle className={`h-5 w-5 mt-0.5 ${
                    validateMutation.data.feasibility === 'ambitious' ? 'text-yellow-600' : 'text-red-600'
                  }`} />
                )}
                <div className="flex-1">
                  <p className="font-semibold text-sm capitalize mb-1">
                    {validateMutation.data.feasibility} Goals
                  </p>
                  <p className="text-xs text-slate-600 mb-3">{validateMutation.data.feedback}</p>
                  
                  {(validateMutation.data.adjusted_weekly_target !== weeklyTarget || 
                    validateMutation.data.adjusted_tier_goal !== tierGoal) && (
                    <div className="bg-white rounded p-3 mb-3">
                      <p className="text-xs font-medium mb-2">Recommended Adjustments:</p>
                      <div className="space-y-1 text-xs">
                        <p>• Weekly Target: {validateMutation.data.adjusted_weekly_target} points</p>
                        <p>• Tier Goal: {validateMutation.data.adjusted_tier_goal}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-1">
                    <p className="text-xs font-medium">Action Steps:</p>
                    {validateMutation.data.action_steps?.map((step, idx) => (
                      <p key={idx} className="text-xs text-slate-600">• {step}</p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <Button onClick={handleSave} disabled={isSaving} className="w-full">
            {isSaving ? 'Saving...' : 'Save Goals'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}