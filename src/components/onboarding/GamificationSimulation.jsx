/**
 * GAMIFICATION SIMULATION
 * Shows simulated badge/point rewards during onboarding
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Trophy, Star, Sparkles, Plus } from 'lucide-react';
import confetti from 'canvas-confetti';

export function BadgeAwardSimulation({ show, badgeName = "First Steps", onComplete }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      
      // Confetti effect
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      // Auto-hide after 3 seconds
      const timeout = setTimeout(() => {
        setIsVisible(false);
        onComplete?.();
      }, 3000);

      return () => clearTimeout(timeout);
    }
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 100 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: -100 }}
          transition={{ type: 'spring', duration: 0.6 }}
          className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none"
        >
          <Card className="w-80 shadow-2xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-yellow-50">
            <CardContent className="pt-6 text-center">
              <motion.div
                initial={{ rotate: -180, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center mx-auto mb-4"
              >
                <Trophy className="h-10 w-10 text-white" />
              </motion.div>
              
              <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-xl font-bold text-slate-900 mb-2"
              >
                Badge Unlocked! 🎉
              </motion.h3>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-sm text-slate-600 mb-1"
              >
                {badgeName}
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex items-center justify-center gap-1 text-amber-600"
              >
                <Plus className="h-4 w-4" />
                <Star className="h-4 w-4" />
                <span className="text-sm font-semibold">50 Points</span>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function PointsIncrementAnimation({ show, points = 10, reason = "Tutorial Step" }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      
      const timeout = setTimeout(() => {
        setIsVisible(false);
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [show]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.8 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className="fixed top-20 right-6 z-[200]"
        >
          <div className="bg-gradient-to-r from-int-orange to-int-gold p-4 rounded-xl shadow-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Star className="h-6 w-6 text-white" />
            </div>
            <div className="text-white">
              <p className="font-bold text-lg">+{points} Points</p>
              <p className="text-xs opacity-90">{reason}</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function LevelUpAnimation({ show, level = 2 }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#D97230', '#F5C16A', '#10B981']
      });

      const timeout = setTimeout(() => {
        setIsVisible(false);
      }, 3500);

      return () => clearTimeout(timeout);
    }
  }, [show]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.3 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.3 }}
          className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none"
        >
          <div className="text-center">
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 360]
              }}
              transition={{ 
                duration: 1,
                repeat: 2,
                ease: 'easeInOut'
              }}
              className="text-8xl mb-4"
            >
              🎊
            </motion.div>
            
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-5xl font-bold text-white drop-shadow-lg mb-2"
            >
              Level {level}!
            </motion.h2>
            
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-xl text-white drop-shadow-lg"
            >
              You're on fire! 🔥
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}