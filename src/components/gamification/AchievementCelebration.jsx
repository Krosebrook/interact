import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Sparkles, Trophy, Zap } from 'lucide-react';

/**
 * Celebratory animation component for achievements
 * Shows confetti and badge animation when triggered
 */
export default function AchievementCelebration({ 
  show, 
  onClose, 
  achievement 
}) {
  const [confetti, setConfetti] = useState([]);

  useEffect(() => {
    if (show) {
      // Generate confetti particles
      const particles = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: -10,
        rotation: Math.random() * 360,
        color: ['#0A1C39', '#F47C20', '#F5C16A', '#C46322', '#4A6070'][Math.floor(Math.random() * 5)],
        size: Math.random() * 10 + 5
      }));
      setConfetti(particles);

      // Auto close after 4 seconds
      const timer = setTimeout(() => {
        onClose?.();
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  return (
    <AnimatePresence data-b44-sync="true" data-feature="gamification" data-component="achievementcelebration">
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          {/* Confetti */}
          {confetti.map(particle => (
            <motion.div
              key={particle.id}
              initial={{ 
                x: `${particle.x}vw`, 
                y: '-10vh',
                rotate: 0,
                scale: 1
              }}
              animate={{ 
                y: '110vh',
                rotate: particle.rotation * 4,
                scale: [1, 1.2, 0.8]
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                ease: 'easeIn'
              }}
              style={{
                position: 'absolute',
                width: particle.size,
                height: particle.size,
                backgroundColor: particle.color,
                borderRadius: Math.random() > 0.5 ? '50%' : '0%'
              }}
            />
          ))}

          {/* Achievement Card */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ 
              type: "spring", 
              stiffness: 200, 
              damping: 15 
            }}
            className="bg-white rounded-2xl p-8 shadow-2xl max-w-md mx-4 relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Animated background */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute inset-0 bg-gradient-to-br from-int-orange/20 to-int-navy/20 opacity-50"
            />

            {/* Content */}
            <div className="relative z-10 text-center">
              {/* Icon */}
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{
                  duration: 0.5,
                  repeat: 3
                }}
                className="mb-4"
              >
                <div className="inline-block p-4 bg-gradient-to-br from-int-orange to-[#C46322] rounded-full">
                  {achievement?.type === 'badge' ? (
                    <Award className="h-12 w-12 text-white" />
                  ) : achievement?.type === 'level' ? (
                    <Trophy className="h-12 w-12 text-white" />
                  ) : (
                    <Zap className="h-12 w-12 text-white" />
                  )}
                </div>
              </motion.div>

              {/* Title */}
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-3xl font-bold text-int-navy mb-2"
              >
                {achievement?.title || 'Achievement Unlocked!'}
              </motion.h2>

              {/* Description */}
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-slate-600 mb-4"
              >
                {achievement?.description || 'You\'ve earned a new achievement!'}
              </motion.p>

              {/* Points/Reward */}
              {achievement?.points && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring" }}
                  className="inline-block bg-gradient-to-r from-int-orange to-[#F5C16A] text-white px-6 py-2 rounded-full font-bold text-lg"
                >
                  +{achievement.points} Points
                </motion.div>
              )}

              {/* Sparkles */}
              <div className="absolute top-0 left-0 right-0">
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, y: 20 }}
                    animate={{
                      scale: [0, 1, 0],
                      y: [-20, -60],
                      x: [0, (i - 4) * 20]
                    }}
                    transition={{
                      duration: 1.5,
                      delay: i * 0.1,
                      repeat: Infinity
                    }}
                    className="absolute top-0 left-1/2"
                  >
                    <Sparkles className="h-4 w-4 text-int-orange" />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}