import React, { useState, useEffect, useRef } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { Zap, TrendingUp, Sparkles } from 'lucide-react';

/**
 * Animated points counter with celebration effects
 */
export default function AnimatedPointsCounter({ 
  points = 0, 
  previousPoints = 0,
  label = 'Total Points',
  size = 'default',
  showChange = true,
  onAnimationComplete
}) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  
  const springValue = useSpring(previousPoints, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const displayValue = useTransform(springValue, (val) => Math.round(val).toLocaleString());
  
  useEffect(() => {
    if (points !== previousPoints) {
      setIsAnimating(true);
      springValue.set(points);
      
      // Show celebration for point gains
      if (points > previousPoints) {
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 2000);
      }
      
      setTimeout(() => {
        setIsAnimating(false);
        onAnimationComplete?.();
      }, 1500);
    }
  }, [points, previousPoints, springValue, onAnimationComplete]);

  const sizeStyles = {
    small: { container: 'p-3', value: 'text-2xl', label: 'text-xs', icon: 'h-5 w-5' },
    default: { container: 'p-4', value: 'text-4xl', label: 'text-sm', icon: 'h-6 w-6' },
    large: { container: 'p-6', value: 'text-6xl', label: 'text-base', icon: 'h-8 w-8' }
  };
  
  const style = sizeStyles[size] || sizeStyles.default;
  const pointChange = points - previousPoints;

  return (
    <div data-b44-sync="true" data-feature="gamification" data-component="animatedpointscounter" className={`relative ${style.container}`}>
      {/* Main counter */}
      <div className="flex items-center gap-3">
        <motion.div
          animate={isAnimating ? { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] } : {}}
          transition={{ duration: 0.5 }}
          className={`p-3 rounded-xl bg-gradient-orange shadow-lg`}
        >
          <Zap className={`${style.icon} text-white`} />
        </motion.div>
        
        <div>
          <motion.div 
            className={`${style.value} font-bold text-int-navy font-display`}
          >
            <motion.span>{displayValue}</motion.span>
          </motion.div>
          <p className={`${style.label} text-slate-500 font-medium`}>{label}</p>
        </div>
      </div>

      {/* Point change indicator */}
      {showChange && pointChange !== 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.5 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20 }}
          className={`absolute -top-2 -right-2 px-3 py-1 rounded-full font-bold text-sm shadow-lg ${
            pointChange > 0 
              ? 'bg-gradient-wellness text-white' 
              : 'bg-red-500 text-white'
          }`}
        >
          <span className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            {pointChange > 0 ? '+' : ''}{pointChange}
          </span>
        </motion.div>
      )}

      {/* Celebration particles */}
      {showCelebration && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              initial={{ 
                x: '50%', 
                y: '50%', 
                scale: 0,
                opacity: 1 
              }}
              animate={{ 
                x: `${50 + (Math.random() - 0.5) * 200}%`,
                y: `${50 + (Math.random() - 0.5) * 200}%`,
                scale: [0, 1, 0],
                opacity: [1, 1, 0]
              }}
              transition={{ 
                duration: 1 + Math.random() * 0.5,
                ease: 'easeOut'
              }}
            >
              <Sparkles className={`h-4 w-4 ${
                ['text-yellow-400', 'text-orange-400', 'text-amber-400', 'text-int-orange'][i % 4]
              }`} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}