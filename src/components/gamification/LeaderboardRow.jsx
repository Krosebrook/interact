import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, TrendingUp, TrendingDown, Minus, Flame, Star, Award } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const RANK_CONFIG = {
  1: { 
    bg: 'bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50',
    border: 'border-amber-400 border-2',
    icon: Trophy,
    iconColor: 'text-amber-500',
    ringColor: 'bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500',
    crown: true
  },
  2: {
    bg: 'bg-gradient-to-r from-slate-50 to-gray-100',
    border: 'border-slate-400 border-2',
    icon: Medal,
    iconColor: 'text-slate-500',
    ringColor: 'bg-gradient-to-br from-slate-400 to-gray-500',
    crown: false
  },
  3: {
    bg: 'bg-gradient-to-r from-orange-50 to-amber-50',
    border: 'border-amber-600 border-2',
    icon: Medal,
    iconColor: 'text-amber-700',
    ringColor: 'bg-gradient-to-br from-amber-600 to-orange-700',
    crown: false
  }
};

export default function LeaderboardRow({ 
  rank,
  name,
  email,
  avatarUrl,
  points,
  level,
  badges = 0,
  streak = 0,
  rankChange = 0,
  isCurrentUser = false,
  onClick,
  delay = 0
}) {
  const isTopThree = rank <= 3;
  const config = RANK_CONFIG[rank];

  const RankIcon = config?.icon || null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.3 }}
      whileHover={{ x: 4, scale: 1.01 }}
      onClick={onClick}
      className={`relative flex items-center gap-4 p-4 rounded-xl transition-all cursor-pointer ${
        isTopThree 
          ? `${config.bg} ${config.border}` 
          : isCurrentUser 
            ? 'bg-int-orange/10 border-2 border-int-orange'
            : 'bg-white border border-slate-200 hover:border-int-orange/50 hover:shadow-md'
      }`}
    >
      {/* Crown for #1 */}
      {config?.crown && (
        <motion.span
          className="absolute -top-3 left-1/2 -translate-x-1/2 text-2xl"
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          👑
        </motion.span>
      )}

      {/* Rank indicator */}
      <div className={`flex items-center justify-center w-12 h-12 rounded-full font-bold text-lg shrink-0 ${
        isTopThree 
          ? `${config.ringColor} text-white shadow-lg` 
          : 'bg-int-navy text-white'
      }`}>
        {isTopThree && RankIcon ? (
          <RankIcon className="h-6 w-6" />
        ) : (
          rank
        )}
      </div>

      {/* User info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className={`font-semibold truncate ${isTopThree ? 'text-lg' : ''}`}>
            {name}
          </h3>
          {isCurrentUser && (
            <Badge className="bg-int-orange text-white text-xs">You</Badge>
          )}
        </div>
        <div className="flex items-center gap-3 text-sm text-slate-600 mt-0.5">
          <span className="flex items-center gap-1">
            <Star className="h-3 w-3" />
            Level {level}
          </span>
          {badges > 0 && (
            <span className="flex items-center gap-1">
              <Award className="h-3 w-3" />
              {badges}
            </span>
          )}
          {streak > 0 && (
            <span className="flex items-center gap-1 text-orange-600">
              <Flame className="h-3 w-3" />
              {streak}
            </span>
          )}
        </div>
      </div>

      {/* Points */}
      <div className="text-right shrink-0">
        <motion.div 
          className={`text-2xl font-bold ${isTopThree ? 'text-int-orange' : 'text-int-navy'}`}
          key={points}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
        >
          {points.toLocaleString()}
        </motion.div>
        <span className="text-xs text-slate-600 font-medium">points</span>
      </div>

      {/* Rank change indicator */}
      {rankChange !== 0 && (
        <div className={`absolute -right-2 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded-full text-xs font-bold shadow-sm ${
          rankChange > 0 
            ? 'bg-emerald-100 text-emerald-700' 
            : 'bg-red-100 text-red-700'
        }`}>
          {rankChange > 0 ? (
            <span className="flex items-center gap-0.5">
              <TrendingUp className="h-3 w-3" />
              {rankChange}
            </span>
          ) : (
            <span className="flex items-center gap-0.5">
              <TrendingDown className="h-3 w-3" />
              {Math.abs(rankChange)}
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
}