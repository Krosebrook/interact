import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Zap, Star } from 'lucide-react';

/**
 * Animated XP progress ring with level display
 */
export default function XPProgressRing({ 
  level = 1, 
  currentXP = 0, 
  xpToNextLevel = 100,
  size = 'default',
  showLabel = true 
}) {
  const progress = Math.min((currentXP / xpToNextLevel) * 100, 100);
  
  const sizes = {
    small: { ring: 80, stroke: 6, text: 'text-lg', icon: 16 },
    default: { ring: 120, stroke: 8, text: 'text-2xl', icon: 24 },
    large: { ring: 160, stroke: 10, text: 'text-4xl', icon: 32 }
  };
  
  const config = sizes[size] || sizes.default;
  const radius = (config.ring - config.stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  // Level tier styling
  const getLevelTier = (lvl) => {
    if (lvl >= 50) return { tier: 'legendary', gradient: 'from-amber-400 via-yellow-500 to-orange-500', glow: 'shadow-amber-500/50' };
    if (lvl >= 30) return { tier: 'epic', gradient: 'from-purple-500 via-violet-500 to-purple-600', glow: 'shadow-purple-500/50' };
    if (lvl >= 20) return { tier: 'rare', gradient: 'from-blue-400 via-blue-500 to-cyan-500', glow: 'shadow-blue-500/50' };
    if (lvl >= 10) return { tier: 'uncommon', gradient: 'from-emerald-400 via-green-500 to-teal-500', glow: 'shadow-emerald-500/50' };
    return { tier: 'common', gradient: 'from-int-orange via-orange-500 to-amber-500', glow: 'shadow-orange-500/50' };
  };

  const tierConfig = getLevelTier(level);

  return (
    <div data-b44-sync="true" data-feature="gamification" data-component="xpprogressring" className="relative inline-flex flex-col items-center">
      {/* Ring Container */}
      <div 
        className={`relative shadow-lg ${tierConfig.glow}`}
        style={{ width: config.ring, height: config.ring }}
      >
        <svg 
          className="transform -rotate-90" 
          width={config.ring} 
          height={config.ring}
        >
          {/* Background circle */}
          <circle
            cx={config.ring / 2}
            cy={config.ring / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={config.stroke}
            className="text-slate-200"
          />
          
          {/* Progress circle with gradient */}
          <defs>
            <linearGradient id={`xp-gradient-${level}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--int-orange)" />
              <stop offset="50%" stopColor="#F5C16A" />
              <stop offset="100%" stopColor="var(--int-orange)" />
            </linearGradient>
          </defs>
          
          <motion.circle
            cx={config.ring / 2}
            cy={config.ring / 2}
            r={radius}
            fill="none"
            stroke={`url(#xp-gradient-${level})`}
            strokeWidth={config.stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />
        </svg>
        
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.3 }}
          >
            <span className={`font-bold bg-gradient-to-r ${tierConfig.gradient} bg-clip-text text-transparent ${config.text}`}>
              {level}
            </span>
          </motion.div>
          {size !== 'small' && (
            <span className="text-xs text-slate-500 font-medium">LEVEL</span>
          )}
        </div>
        
        {/* Decorative star for high levels */}
        {level >= 10 && (
          <motion.div
            className="absolute -top-1 -right-1"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', delay: 0.5 }}
          >
            <Star className={`h-${config.icon / 4} w-${config.icon / 4} fill-yellow-400 text-yellow-400`} style={{ width: config.icon / 1.5, height: config.icon / 1.5 }} />
          </motion.div>
        )}
      </div>
      
      {/* XP Label */}
      {showLabel && (
        <motion.div 
          className="mt-3 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <div className="flex items-center gap-1 text-sm font-semibold text-slate-700">
            <Zap className="h-4 w-4 text-int-orange" />
            <span>{currentXP.toLocaleString()}</span>
            <span className="text-slate-400">/</span>
            <span className="text-slate-500">{xpToNextLevel.toLocaleString()} XP</span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {xpToNextLevel - currentXP} XP to next level
          </p>
        </motion.div>
      )}
    </div>
  );
}