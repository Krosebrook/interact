import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Crown, Star, Lock, ChevronRight, Sparkles, Gift } from 'lucide-react';

const TIER_STYLES = {
  1: { name: 'Bronze', color: 'from-amber-600 to-amber-800', bg: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-700' },
  2: { name: 'Silver', color: 'from-slate-400 to-slate-600', bg: 'bg-slate-50', border: 'border-slate-300', text: 'text-slate-600' },
  3: { name: 'Gold', color: 'from-yellow-400 to-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-400', text: 'text-yellow-700' },
  4: { name: 'Platinum', color: 'from-cyan-400 to-teal-500', bg: 'bg-cyan-50', border: 'border-cyan-400', text: 'text-cyan-700' },
  5: { name: 'Diamond', color: 'from-blue-400 to-indigo-500', bg: 'bg-blue-50', border: 'border-blue-400', text: 'text-blue-700' },
  6: { name: 'Master', color: 'from-purple-500 to-violet-600', bg: 'bg-purple-50', border: 'border-purple-400', text: 'text-purple-700' },
  7: { name: 'Grandmaster', color: 'from-red-500 to-rose-600', bg: 'bg-red-50', border: 'border-red-400', text: 'text-red-700' },
  8: { name: 'Legend', color: 'from-orange-500 via-amber-500 to-yellow-500', bg: 'bg-gradient-to-br from-orange-50 to-yellow-50', border: 'border-orange-400', text: 'text-orange-700' },
};

export default function AchievementTierCard({ 
  tier, 
  currentPoints = 0, 
  isCurrentTier = false,
  isUnlocked = false,
  nextTier = null,
  compact = false 
}) {
  const style = TIER_STYLES[tier.tier_level] || TIER_STYLES[1];
  const progress = nextTier 
    ? Math.min(100, ((currentPoints - tier.points_required) / (nextTier.points_required - tier.points_required)) * 100)
    : 100;

  if (compact) {
    return (
      <div data-b44-sync="true" data-feature="gamification" data-component="achievementtiercard" className={`flex items-center gap-3 p-3 rounded-xl ${isCurrentTier ? style.bg : 'bg-slate-50'} ${style.border} border ${!isUnlocked && 'opacity-50'}`}>
        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${style.color} flex items-center justify-center text-white shadow-md`}>
          <span className="text-lg">{tier.tier_icon}</span>
        </div>
        <div className="flex-1">
          <p className={`font-bold ${style.text}`}>{tier.tier_name}</p>
          <p className="text-xs text-slate-500">{tier.points_required.toLocaleString()}+ pts</p>
        </div>
        {isCurrentTier && <Crown className="h-5 w-5 text-amber-500" />}
        {!isUnlocked && <Lock className="h-4 w-4 text-slate-400" />}
      </div>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="relative"
    >
      <Card className={`overflow-hidden border-2 ${style.border} ${isCurrentTier ? 'ring-2 ring-int-orange ring-offset-2' : ''} ${!isUnlocked && 'opacity-60 grayscale-[30%]'}`}>
        {/* Gradient header */}
        <div className={`h-2 bg-gradient-to-r ${style.color}`} />
        
        <CardContent className={`p-5 ${style.bg}`}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <motion.div 
                className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${style.color} flex items-center justify-center text-white shadow-lg`}
                animate={isCurrentTier ? { scale: [1, 1.05, 1] } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="text-2xl">{tier.tier_icon}</span>
              </motion.div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className={`font-bold text-lg ${style.text}`}>{tier.tier_name}</h3>
                  {isCurrentTier && (
                    <Badge className="bg-int-orange text-white text-xs">Current</Badge>
                  )}
                </div>
                <p className="text-sm text-slate-600">Level {tier.tier_level}</p>
              </div>
            </div>
            {!isUnlocked && <Lock className="h-5 w-5 text-slate-400" />}
            {isUnlocked && !isCurrentTier && <Star className="h-5 w-5 text-amber-400 fill-amber-400" />}
          </div>

          {/* Points requirement */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-600">Required Points</span>
              <span className={`font-bold ${style.text}`}>{tier.points_required.toLocaleString()}</span>
            </div>
            {isCurrentTier && nextTier && (
              <>
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-slate-500 mt-1">
                  {(nextTier.points_required - currentPoints).toLocaleString()} pts to {nextTier.tier_name}
                </p>
              </>
            )}
          </div>

          {/* Perks */}
          {tier.perks && tier.perks.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-500 uppercase">Perks</h4>
              <div className="space-y-1">
                {tier.perks.slice(0, 3).map((perk, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm text-slate-700">
                    <Sparkles className={`h-3 w-3 ${style.text}`} />
                    <span>{perk}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Multiplier */}
          {tier.multiplier > 1 && (
            <div className={`mt-3 p-2 rounded-lg ${style.bg} border ${style.border}`}>
              <div className="flex items-center gap-2">
                <Gift className={`h-4 w-4 ${style.text}`} />
                <span className={`text-sm font-semibold ${style.text}`}>
                  {tier.multiplier}x Points Multiplier
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}