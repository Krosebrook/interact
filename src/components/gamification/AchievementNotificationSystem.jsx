import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Award, 
  Trophy, 
  Zap, 
  Flame, 
  Star, 
  Crown, 
  Gift,
  TrendingUp,
  Target,
  X,
  Sparkles,
  PartyPopper
} from 'lucide-react';
import confetti from 'canvas-confetti';

const ACHIEVEMENT_TYPES = {
  badge_earned: {
    icon: Award,
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-300',
    title: 'Badge Earned!'
  },
  level_up: {
    icon: Crown,
    color: 'from-amber-400 to-orange-500',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-300',
    title: 'Level Up!'
  },
  streak_milestone: {
    icon: Flame,
    color: 'from-orange-500 to-red-500',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-300',
    title: 'Streak Milestone!'
  },
  points_milestone: {
    icon: Zap,
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-300',
    title: 'Points Milestone!'
  },
  challenge_won: {
    icon: Trophy,
    color: 'from-yellow-400 to-amber-500',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-300',
    title: 'Challenge Won!'
  },
  reward_unlocked: {
    icon: Gift,
    color: 'from-emerald-500 to-teal-500',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-300',
    title: 'Reward Unlocked!'
  },
  first_event: {
    icon: Star,
    color: 'from-pink-500 to-rose-500',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-300',
    title: 'First Event!'
  },
  team_achievement: {
    icon: Target,
    color: 'from-indigo-500 to-purple-500',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-300',
    title: 'Team Achievement!'
  }
};

const RARITY_EFFECTS = {
  common: { particles: 20, spread: 40 },
  uncommon: { particles: 40, spread: 60 },
  rare: { particles: 60, spread: 80 },
  epic: { particles: 100, spread: 100 },
  legendary: { particles: 150, spread: 120 }
};

export function triggerConfetti(rarity = 'common') {
  const effect = RARITY_EFFECTS[rarity] || RARITY_EFFECTS.common;
  
  const colors = rarity === 'legendary' 
    ? ['#FFD700', '#FFA500', '#FF4500', '#FFFF00']
    : rarity === 'epic'
    ? ['#A855F7', '#EC4899', '#8B5CF6', '#D946EF']
    : rarity === 'rare'
    ? ['#3B82F6', '#06B6D4', '#0EA5E9', '#2563EB']
    : ['#D97230', '#F59E0B', '#EF4444', '#10B981'];

  confetti({
    particleCount: effect.particles,
    spread: effect.spread,
    origin: { y: 0.6 },
    colors
  });

  if (rarity === 'legendary' || rarity === 'epic') {
    setTimeout(() => {
      confetti({
        particleCount: effect.particles / 2,
        angle: 60,
        spread: effect.spread / 2,
        origin: { x: 0 },
        colors
      });
      confetti({
        particleCount: effect.particles / 2,
        angle: 120,
        spread: effect.spread / 2,
        origin: { x: 1 },
        colors
      });
    }, 200);
  }
}

export function AchievementToast({ 
  achievement, 
  onDismiss, 
  duration = 5000 
}) {
  const [isVisible, setIsVisible] = useState(true);
  const config = ACHIEVEMENT_TYPES[achievement.type] || ACHIEVEMENT_TYPES.badge_earned;
  const Icon = config.icon;

  useEffect(() => {
    if (achievement.rarity) {
      triggerConfetti(achievement.rarity);
    }

    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onDismiss?.(), 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [achievement, duration, onDismiss]);

  return (
    <AnimatePresence data-b44-sync="true" data-feature="gamification" data-component="achievementnotificationsystem">
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.8 }}
          transition={{ type: 'spring', damping: 15 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md px-4"
        >
          <Card className={`${config.bgColor} ${config.borderColor} border-2 shadow-2xl overflow-hidden`}>
            {/* Shimmer effect */}
            <div className="absolute inset-0 animate-shimmer opacity-30" />
            
            <div className="relative p-4">
              <button
                onClick={() => {
                  setIsVisible(false);
                  setTimeout(() => onDismiss?.(), 300);
                }}
                className="absolute top-2 right-2 p-1 rounded-full hover:bg-black/10 transition-colors"
              >
                <X className="h-4 w-4 text-slate-500" />
              </button>

              <div className="flex items-center gap-4">
                {/* Icon */}
                <motion.div
                  animate={{ 
                    rotate: [0, -10, 10, -10, 10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ duration: 0.5 }}
                  className={`p-4 rounded-2xl bg-gradient-to-br ${config.color} shadow-lg`}
                >
                  <Icon className="h-8 w-8 text-white" />
                </motion.div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg text-slate-900">{config.title}</h3>
                    <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" />
                  </div>
                  <p className="text-slate-700 font-medium">{achievement.title}</p>
                  {achievement.description && (
                    <p className="text-sm text-slate-500 mt-1">{achievement.description}</p>
                  )}
                  
                  {/* Reward display */}
                  {achievement.pointsAwarded && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3, type: 'spring' }}
                      className="mt-2"
                    >
                      <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-white">
                        <Zap className="h-3 w-3 mr-1" />
                        +{achievement.pointsAwarded} points
                      </Badge>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <motion.div
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: duration / 1000, ease: 'linear' }}
              className={`h-1 bg-gradient-to-r ${config.color}`}
            />
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function AchievementCelebration({
  achievement,
  onClose
}) {
  const config = ACHIEVEMENT_TYPES[achievement.type] || ACHIEVEMENT_TYPES.badge_earned;
  const Icon = config.icon;

  useEffect(() => {
    triggerConfetti(achievement.rarity || 'epic');
    
    // Second burst
    setTimeout(() => {
      triggerConfetti(achievement.rarity || 'rare');
    }, 500);
  }, [achievement.rarity]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        exit={{ scale: 0, rotate: 10 }}
        transition={{ type: 'spring', damping: 12 }}
        className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`relative p-8 bg-gradient-to-br ${config.color} text-white text-center overflow-hidden`}>
          {/* Floating particles */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.3, 0.8, 0.3]
              }}
              transition={{
                duration: 2 + Math.random(),
                repeat: Infinity,
                delay: Math.random()
              }}
            />
          ))}
          
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ duration: 1, repeat: Infinity }}
            className="inline-block p-6 bg-white/20 rounded-full backdrop-blur-sm mb-4"
          >
            <Icon className="h-16 w-16" />
          </motion.div>
          
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-bold"
          >
            {config.title}
          </motion.h2>
        </div>

        {/* Content */}
        <div className="p-6 text-center">
          <h3 className="text-xl font-bold text-slate-900 mb-2">{achievement.title}</h3>
          {achievement.description && (
            <p className="text-slate-600 mb-4">{achievement.description}</p>
          )}
          
          {/* Stats */}
          {(achievement.pointsAwarded || achievement.badgeIcon) && (
            <div className="flex items-center justify-center gap-4 mb-6">
              {achievement.pointsAwarded && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, type: 'spring' }}
                  className="px-4 py-2 bg-amber-100 rounded-full"
                >
                  <span className="flex items-center gap-1 text-amber-700 font-bold">
                    <Zap className="h-5 w-5" />
                    +{achievement.pointsAwarded}
                  </span>
                </motion.div>
              )}
              {achievement.badgeIcon && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: 'spring' }}
                  className="text-4xl"
                >
                  {achievement.badgeIcon}
                </motion.div>
              )}
            </div>
          )}

          <Button
            onClick={onClose}
            className={`w-full bg-gradient-to-r ${config.color} hover:opacity-90 text-white font-semibold py-6`}
          >
            <PartyPopper className="h-5 w-5 mr-2" />
            Awesome!
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function AchievementNotificationSystem({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [celebration, setCelebration] = useState(null);

  const showAchievement = useCallback((achievement) => {
    const id = Date.now();
    const newNotification = { ...achievement, id };
    
    if (achievement.celebrate) {
      setCelebration(newNotification);
    } else {
      setNotifications(prev => [...prev, newNotification]);
    }
  }, []);

  const dismissNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Expose the showAchievement function globally for easy access
  useEffect(() => {
    window.showAchievement = showAchievement;
    return () => {
      delete window.showAchievement;
    };
  }, [showAchievement]);

  return (
    <>
      {children}
      
      {/* Notification toasts */}
      <AnimatePresence>
        {notifications.map((notification, index) => (
          <div
            key={notification.id}
            style={{ transform: `translateY(${index * 120}px)` }}
          >
            <AchievementToast
              achievement={notification}
              onDismiss={() => dismissNotification(notification.id)}
            />
          </div>
        ))}
      </AnimatePresence>

      {/* Full celebration modal */}
      <AnimatePresence>
        {celebration && (
          <AchievementCelebration
            achievement={celebration}
            onClose={() => setCelebration(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}