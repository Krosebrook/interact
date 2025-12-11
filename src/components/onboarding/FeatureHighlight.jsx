/**
 * FEATURE HIGHLIGHT
 * Spotlight component for highlighting specific features
 */

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function FeatureHighlight({ 
  isVisible,
  targetSelector,
  title,
  description,
  placement = 'bottom',
  onDismiss,
  onNext,
  highlightColor = 'int-orange'
}) {
  const [targetElement, setTargetElement] = React.useState(null);
  const [position, setPosition] = React.useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!isVisible || !targetSelector) return;

    const element = document.querySelector(targetSelector);
    if (element) {
      setTargetElement(element);
      
      // Calculate position
      const rect = element.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
      
      setPosition({
        top: rect.top + scrollTop,
        left: rect.left + scrollLeft,
        width: rect.width,
        height: rect.height
      });

      // Scroll element into view
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isVisible, targetSelector]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50"
        style={{ 
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(2px)'
        }}
        onClick={onDismiss}
      />

      {/* Spotlight */}
      {targetElement && (
        <>
          <div
            className="fixed z-[51] pointer-events-none"
            style={{
              top: position.top - 8,
              left: position.left - 8,
              width: position.width + 16,
              height: position.height + 16,
              boxShadow: `0 0 0 4px rgba(217, 114, 48, 0.5), 0 0 0 9999px rgba(0, 0, 0, 0.5)`,
              borderRadius: '12px'
            }}
          />

          {/* Tooltip */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed z-[52] w-80 max-w-sm"
            style={{
              top: placement === 'bottom' ? position.top + position.height + 20 : position.top - 200,
              left: position.left,
            }}
          >
            <div className="bg-white rounded-xl shadow-2xl border border-slate-200 p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-int-orange/10 flex items-center justify-center">
                    <Lightbulb className="h-4 w-4 text-int-orange" />
                  </div>
                  <h4 className="font-semibold text-slate-900">{title}</h4>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onDismiss}
                  className="h-6 w-6"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>

              <p className="text-sm text-slate-600 mb-4">
                {description}
              </p>

              <Button
                onClick={onNext}
                className="w-full bg-int-orange hover:bg-int-orange/90"
                size="sm"
              >
                Got it!
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}