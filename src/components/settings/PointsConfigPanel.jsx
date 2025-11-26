import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  Zap, 
  Save, 
  RotateCcw, 
  HelpCircle,
  Calendar,
  MessageSquare,
  Target,
  Flame,
  Award,
  Users,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';

// Default point values
const DEFAULT_POINT_CONFIG = {
  event_attendance: { points: 10, enabled: true, label: 'Event Attendance', icon: Calendar, description: 'Points for attending an event' },
  activity_completion: { points: 15, enabled: true, label: 'Activity Completion', icon: Target, description: 'Points for completing an activity' },
  feedback_submission: { points: 5, enabled: true, label: 'Feedback Submission', icon: MessageSquare, description: 'Points for submitting feedback' },
  streak_bonus_3day: { points: 10, enabled: true, label: '3-Day Streak Bonus', icon: Flame, description: 'Bonus for 3-day participation streak' },
  streak_bonus_7day: { points: 25, enabled: true, label: '7-Day Streak Bonus', icon: Flame, description: 'Bonus for 7-day participation streak' },
  streak_bonus_30day: { points: 100, enabled: true, label: '30-Day Streak Bonus', icon: Flame, description: 'Bonus for 30-day participation streak' },
  badge_earned: { points: 20, enabled: true, label: 'Badge Earned', icon: Award, description: 'Points when earning a badge' },
  team_challenge_contribution: { points: 15, enabled: true, label: 'Team Challenge Contribution', icon: Users, description: 'Points for contributing to team challenges' },
  first_event_bonus: { points: 50, enabled: true, label: 'First Event Bonus', icon: TrendingUp, description: 'One-time bonus for attending first event' },
  referral_bonus: { points: 30, enabled: true, label: 'Referral Bonus', icon: Users, description: 'Points for referring a new team member' }
};

export default function PointsConfigPanel({ config = {}, onSave }) {
  const queryClient = useQueryClient();
  const [pointConfig, setPointConfig] = useState(() => ({
    ...DEFAULT_POINT_CONFIG,
    ...config
  }));
  const [hasChanges, setHasChanges] = useState(false);

  const handlePointChange = (key, value) => {
    setPointConfig(prev => ({
      ...prev,
      [key]: { ...prev[key], points: parseInt(value) || 0 }
    }));
    setHasChanges(true);
  };

  const handleToggle = (key) => {
    setPointConfig(prev => ({
      ...prev,
      [key]: { ...prev[key], enabled: !prev[key].enabled }
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      await onSave?.(pointConfig);
      setHasChanges(false);
      toast.success('Point configuration saved successfully');
    } catch (error) {
      toast.error('Failed to save configuration');
    }
  };

  const handleReset = () => {
    setPointConfig(DEFAULT_POINT_CONFIG);
    setHasChanges(true);
  };

  // Calculate total possible points
  const totalPossiblePoints = Object.values(pointConfig)
    .filter(c => c.enabled)
    .reduce((sum, c) => sum + c.points, 0);

  return (
    <TooltipProvider>
      <Card className="border-2 border-int-orange/20">
        <CardHeader className="bg-gradient-to-r from-int-orange/10 to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-orange shadow-sm">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle>Points Configuration</CardTitle>
                <p className="text-sm text-slate-500 mt-1">
                  Configure point values for user activities
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-int-orange text-int-orange">
                Max: {totalPossiblePoints} pts
              </Badge>
              {hasChanges && (
                <Badge className="bg-amber-100 text-amber-700">Unsaved</Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {Object.entries(pointConfig).map(([key, config], index) => {
              const Icon = config.icon || Zap;
              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
                    config.enabled 
                      ? 'bg-white border-slate-200 hover:border-int-orange/50' 
                      : 'bg-slate-50 border-slate-200 opacity-60'
                  }`}
                >
                  {/* Icon */}
                  <div className={`p-2 rounded-lg ${config.enabled ? 'bg-int-orange/10' : 'bg-slate-100'}`}>
                    <Icon className={`h-5 w-5 ${config.enabled ? 'text-int-orange' : 'text-slate-400'}`} />
                  </div>

                  {/* Label & Description */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-900">{config.label}</span>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="h-4 w-4 text-slate-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{config.description}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <p className="text-xs text-slate-500">{config.description}</p>
                  </div>

                  {/* Points Input */}
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="0"
                      max="1000"
                      value={config.points}
                      onChange={(e) => handlePointChange(key, e.target.value)}
                      className="w-20 text-center"
                      disabled={!config.enabled}
                    />
                    <span className="text-sm text-slate-500">pts</span>
                  </div>

                  {/* Toggle */}
                  <Switch
                    checked={config.enabled}
                    onCheckedChange={() => handleToggle(key)}
                  />
                </motion.div>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between mt-6 pt-6 border-t">
            <Button 
              variant="outline" 
              onClick={handleReset}
              className="text-slate-600"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset to Defaults
            </Button>
            <Button 
              onClick={handleSave}
              disabled={!hasChanges}
              className="bg-gradient-orange hover:opacity-90 text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Configuration
            </Button>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}