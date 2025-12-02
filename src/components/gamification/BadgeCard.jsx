import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Lock, Star, Sparkles, Award, Users, Calendar, Zap, Share2 } from 'lucide-react';

const RARITY_CONFIG = {
  common: {
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    gradient: 'from-slate-400 to-slate-500',
    badge: 'bg-slate-100 text-slate-700',
    glow: ''
  },
  uncommon: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-300',
    gradient: 'from-emerald-400 to-teal-500',
    badge: 'bg-emerald-100 text-emerald-700',
    glow: 'hover:shadow-emerald-200'
  },
  rare: {
    bg: 'bg-blue-50',
    border: 'border-blue-300',
    gradient: 'from-blue-400 to-cyan-500',
    badge: 'bg-blue-100 text-blue-700',
    glow: 'hover:shadow-blue-300 hover:shadow-lg'
  },
  epic: {
    bg: 'bg-purple-50',
    border: 'border-purple-300',
    gradient: 'from-purple-500 to-violet-600',
    badge: 'bg-purple-100 text-purple-700',
    glow: 'hover:shadow-purple-400 hover:shadow-xl'
  },
  legendary: {
    bg: 'bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50',
    border: 'border-amber-400',
    gradient: 'from-amber-400 via-yellow-500 to-orange-500',
    badge: 'bg-gradient-to-r from-amber-200 to-yellow-200 text-amber-800',
    glow: 'shadow-amber-300 shadow-lg hover:shadow-amber-400 hover:shadow-xl'
  }
};

const CATEGORY_ICONS = {
  engagement: Zap,
  collaboration: Users,
  achievement: Award,
  event: Calendar,
  special: Sparkles
};

export default function BadgeCard({ 
  badge, 
  isEarned = false, 
  progress = null,
  earnedDate,
  onClick,
  onShare,
  showProgress = true,
  size = 'default'
}) {
  const [isHovered, setIsHovered] = useState(false);
  
  const rarity = badge.rarity || 'common';
  const config = RARITY_CONFIG[rarity];
  const CategoryIcon = CATEGORY_ICONS[badge.category] || Award;

  const sizeStyles = {
    small: { card: 'p-3', icon: 'text-3xl', title: 'text-xs', desc: 'hidden' },
    default: { card: 'p-4', icon: 'text-5xl', title: 'text-sm', desc: 'text-xs' },
    large: { card: 'p-6', icon: 'text-7xl', title: 'text-base', desc: 'text-sm' }
  };
  
  const style = sizeStyles[size] || sizeStyles.default;

  return (
    <motion.div
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card 
        className={`relative cursor-pointer overflow-hidden transition-all duration-300 border-2 ${style.card} ${config.border} ${config.bg} ${config.glow} ${
          !isEarned ? 'grayscale-[50%] opacity-70 hover:grayscale-0 hover:opacity-100' : ''
        }`}
        onClick={() => onClick?.(badge)}
      >
        {/* Legendary shimmer effect */}
        {rarity === 'legendary' && isEarned && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
          />
        )}

        {/* Category indicator */}
        <div className="absolute top-2 left-2">
          <CategoryIcon className={`h-4 w-4 ${isEarned ? 'text-slate-400' : 'text-slate-300'}`} />
        </div>

        {/* Earned star */}
        {isEarned && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            className="absolute top-2 right-2"
          >
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          </motion.div>
        )}

        {/* Lock for unearned */}
        {!isEarned && !badge.is_hidden && (
          <div className="absolute top-2 right-2">
            <Lock className="h-4 w-4 text-slate-400" />
          </div>
        )}

        {/* Badge content */}
        <div className="text-center relative z-10 pt-2">
          <motion.div
            className={style.icon + ' mb-2'}
            animate={isEarned && isHovered ? { 
              rotate: [0, -10, 10, -10, 10, 0],
              scale: [1, 1.1, 1]
            } : {}}
            transition={{ duration: 0.5 }}
          >
            {badge.is_hidden && !isEarned ? '🔒' : badge.badge_icon}
          </motion.div>

          <h4 className={`font-bold truncate ${style.title} ${isEarned ? 'text-slate-900' : 'text-slate-600'}`}>
            {badge.is_hidden && !isEarned ? '???' : badge.badge_name}
          </h4>

          {size !== 'small' && badge.badge_description && (
            <p className={`text-slate-600 mt-1 line-clamp-2 ${style.desc}`}>
              {badge.is_hidden && !isEarned ? 'Hidden badge' : badge.badge_description}
            </p>
          )}

          {/* Rarity badge */}
          <Badge className={`mt-2 text-xs capitalize ${config.badge}`}>
            {rarity}
          </Badge>

          {/* Points value */}
          {badge.points_value > 0 && isEarned && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-2 text-xs font-semibold text-int-orange flex items-center justify-center gap-1"
            >
              <Zap className="h-3 w-3" />
              +{badge.points_value} pts
            </motion.div>
          )}

          {/* Progress bar for unearned badges */}
          {!isEarned && showProgress && progress && (
            <div className="mt-3">
              <Progress value={progress.percentage} className="h-1.5" />
              <p className="text-xs text-slate-600 mt-1">
                {progress.current}/{progress.target}
              </p>
            </div>
          )}

          {/* Earned date */}
          {isEarned && earnedDate && size !== 'small' && (
            <p className="text-xs text-slate-600 mt-2">
              Earned {new Date(earnedDate).toLocaleDateString()}
            </p>
          )}

          {/* Share button for earned badges */}
          {isEarned && onShare && size !== 'small' && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 h-7 text-xs text-slate-500 hover:text-int-orange"
              onClick={(e) => {
                e.stopPropagation();
                onShare(badge);
              }}
            >
              <Share2 className="h-3 w-3 mr-1" />
              Share
            </Button>
          )}
        </div>

        {/* Tier indicator bar */}
        <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${config.gradient}`} />
      </Card>
    </motion.div>
  );
}