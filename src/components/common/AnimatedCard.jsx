import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * Card with entrance animation and hover effects
 */
export default function AnimatedCard({
  children,
  className,
  delay = 0,
  onClick,
  hoverable = true,
  glowColor = 'orange'
}) {
  const glowColors = {
    orange: 'hover:shadow-int-orange/20',
    navy: 'hover:shadow-int-navy/20',
    purple: 'hover:shadow-purple-500/20',
    green: 'hover:shadow-emerald-500/20'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ 
        duration: 0.4, 
        delay,
        ease: [0.25, 0.1, 0.25, 1]
      }}
      whileHover={hoverable ? { 
        y: -4,
        transition: { duration: 0.2 }
      } : undefined}
      onClick={onClick}
      className={cn(
        'glass-card-solid transition-shadow duration-300',
        hoverable && `cursor-pointer hover:shadow-xl ${glowColors[glowColor]}`,
        className
      )}
    >
      {children}
    </motion.div>
  );
}

/**
 * Staggered animation container for card grids
 */
export function AnimatedCardGrid({ children, className }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.08
          }
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedCardItem({ children, className }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20, scale: 0.95 },
        visible: { 
          opacity: 1, 
          y: 0, 
          scale: 1,
          transition: {
            duration: 0.4,
            ease: [0.25, 0.1, 0.25, 1]
          }
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}