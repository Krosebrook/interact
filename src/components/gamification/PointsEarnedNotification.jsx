import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Sparkles, Trophy, Star } from 'lucide-react';

export default function PointsEarnedNotification({ 
  show, 
  points, 
  badges = [], 
  onComplete 
}) {
  React.useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onComplete?.();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.8 }}
          className="fixed bottom-8 right-8 z-50"
        >
          <Card className="p-6 border-0 shadow-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white min-w-[300px]">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-3 mb-4"
            >
              <Sparkles className="h-8 w-8" />
              <div>
                <p className="text-sm opacity-90">You earned</p>
                <p className="text-3xl font-bold">+{points} points!</p>
              </div>
            </motion.div>

            {badges.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-4 pt-4 border-t border-white/20"
              >
                <p className="text-sm opacity-90 mb-2 flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  New Badges Earned!
                </p>
                <div className="space-y-2">
                  {badges.map((badge, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + index * 0.2 }}
                      className="flex items-center gap-2 bg-white/10 rounded-lg p-2"
                    >
                      <span className="text-2xl">{badge.emoji}</span>
                      <div>
                        <p className="font-semibold text-sm">{badge.name}</p>
                        <p className="text-xs opacity-75">{badge.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            <div className="absolute top-0 left-0 w-full h-full overflow-hidden rounded-lg pointer-events-none">
              {[...Array(10)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ y: 0, x: Math.random() * 300 }}
                  animate={{ 
                    y: -300, 
                    rotate: Math.random() * 360,
                    opacity: [1, 0]
                  }}
                  transition={{ 
                    duration: 2 + Math.random(), 
                    delay: Math.random() * 0.5 
                  }}
                  className="absolute bottom-0"
                >
                  <Star className="h-4 w-4 text-yellow-300" />
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}