import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Splash() {
  const navigate = useNavigate();
  const [autoRedirect, setAutoRedirect] = useState(true);

  useEffect(() => {
    if (autoRedirect) {
      const timer = setTimeout(() => {
        navigate(createPageUrl('Landing'));
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [navigate, autoRedirect]);

  const handleEnter = () => {
    navigate(createPageUrl('Landing'));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0F19] via-[#14294D] to-[#1E2638] flex items-center justify-center overflow-hidden relative">
      {/* Animated background orbs */}
      <motion.div
        className="absolute top-20 left-20 w-96 h-96 bg-[#FF8A3D] rounded-full opacity-20 blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 50, 0],
          y: [0, 30, 0],
        }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-20 right-20 w-96 h-96 bg-[#8B5CF6] rounded-full opacity-20 blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          x: [0, -50, 0],
          y: [0, -30, 0],
        }}
        transition={{ duration: 10, repeat: Infinity }}
      />

      {/* Main content */}
      <motion.div
        className="relative z-10 text-center px-6"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Logo */}
        <motion.div
          className="flex justify-center mb-8"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <div className="relative">
            <div className="h-24 w-24 sm:h-32 sm:w-32 bg-gradient-to-br from-[#FF8A3D] to-[#FFB86C] rounded-2xl flex items-center justify-center shadow-2xl">
              <Sparkles className="h-12 w-12 sm:h-16 sm:w-16 text-white" strokeWidth={2} />
            </div>
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-[#FF8A3D] to-[#FFB86C] rounded-2xl opacity-50 blur-xl"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>

        {/* Brand name */}
        <motion.h1
          className="text-5xl sm:text-7xl md:text-8xl font-bold text-white mb-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          INTeract
        </motion.h1>

        {/* Tagline */}
        <motion.p
          className="text-xl sm:text-2xl md:text-3xl text-white/80 mb-12 font-light"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          Where Teams Thrive Together
        </motion.p>

        {/* CTA Button */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <Button
            size="lg"
            onClick={handleEnter}
            onMouseEnter={() => setAutoRedirect(false)}
            className="bg-gradient-to-r from-[#FF8A3D] to-[#FFB86C] hover:from-[#FFB86C] hover:to-[#FF8A3D] text-white text-lg px-8 py-6 rounded-full shadow-2xl hover:shadow-[#FF8A3D]/50 transition-all duration-300 group"
          >
            Enter Platform
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>

        {/* Loading indicator */}
        {autoRedirect && (
          <motion.div
            className="mt-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <div className="flex justify-center gap-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-white/60 rounded-full"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Bottom branding */}
      <motion.div
        className="absolute bottom-8 left-0 right-0 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <p className="text-white/40 text-sm">Powered by FlashFusion</p>
      </motion.div>
    </div>
  );
}