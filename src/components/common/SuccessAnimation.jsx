import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';

/**
 * Checkmark success animation
 */
export function CheckmarkSuccess({ show, size = 'default' }) {
  const sizes = {
    small: { container: 'h-12 w-12', icon: 'h-6 w-6' },
    default: { container: 'h-20 w-20', icon: 'h-10 w-10' },
    large: { container: 'h-28 w-28', icon: 'h-14 w-14' }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className={`${sizes[size].container} rounded-full bg-emerald-500 flex items-center justify-center`}
        >
          <motion.div
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <Check className={`${sizes[size].icon} text-white`} strokeWidth={3} />
          </motion.div>
          
          {/* Sparkles around */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, opacity: 1 }}
              animate={{ 
                scale: [0, 1.5, 0],
                opacity: [1, 1, 0],
                x: Math.cos((i / 6) * Math.PI * 2) * 40,
                y: Math.sin((i / 6) * Math.PI * 2) * 40
              }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="absolute"
            >
              <Sparkles className="h-4 w-4 text-emerald-400" />
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Mini confetti burst for inline celebrations
 */
export function MiniConfetti({ trigger, colors = ['#D97230', '#14294D', '#F5C16A', '#7c3aed'] }) {
  const [particles, setParticles] = React.useState([]);

  React.useEffect(() => {
    if (trigger) {
      const newParticles = Array.from({ length: 20 }, (_, i) => ({
        id: Date.now() + i,
        x: 0,
        y: 0,
        color: colors[Math.floor(Math.random() * colors.length)],
        angle: (i / 20) * 360,
        velocity: 2 + Math.random() * 3
      }));
      setParticles(newParticles);
      
      setTimeout(() => setParticles([]), 1000);
    }
  }, [trigger]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map(p => (
        <motion.div
          key={p.id}
          initial={{ 
            x: '50%', 
            y: '50%', 
            scale: 1, 
            opacity: 1 
          }}
          animate={{ 
            x: `calc(50% + ${Math.cos(p.angle * Math.PI / 180) * p.velocity * 30}px)`,
            y: `calc(50% + ${Math.sin(p.angle * Math.PI / 180) * p.velocity * 30}px)`,
            scale: 0,
            opacity: 0
          }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="absolute w-2 h-2 rounded-full"
          style={{ backgroundColor: p.color }}
        />
      ))}
    </div>
  );
}

/**
 * Points earned animation
 */
export function PointsEarned({ points, show, onComplete }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 0, opacity: 1, scale: 1 }}
          animate={{ y: -50, opacity: 0, scale: 1.2 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          onAnimationComplete={onComplete}
          className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none"
        >
          <span className="text-lg font-bold text-int-orange drop-shadow-lg">
            +{points} pts
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Level up animation
 */
export function LevelUpAnimation({ show, level, onClose }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="text-center"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ duration: 0.5, repeat: 3 }}
              className="text-8xl mb-4"
            >
              🎉
            </motion.div>
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-4xl font-bold text-white mb-2"
            >
              Level Up!
            </motion.h2>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: 'spring' }}
              className="inline-block bg-gradient-to-r from-int-orange to-[#F5C16A] text-white text-2xl font-bold px-8 py-3 rounded-full"
            >
              Level {level}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}