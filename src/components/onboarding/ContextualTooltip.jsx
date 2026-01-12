import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, HelpCircle, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Contextual tooltip that appears for first-time users
 * Shows helpful tips next to UI elements
 */
export default function ContextualTooltip({
  id,
  content,
  placement = 'top',
  targetElement,
  dismissible = true,
  showOnce = true,
  delay = 500
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    // Check if user has seen this tooltip
    const seenTooltips = JSON.parse(localStorage.getItem('seen-tooltips') || '[]');
    if (showOnce && seenTooltips.includes(id)) {
      return;
    }

    // Find target element and calculate position
    const timer = setTimeout(() => {
      const element = document.querySelector(targetElement);
      if (element) {
        const rect = element.getBoundingClientRect();
        const tooltipWidth = 280;
        const tooltipHeight = 120;

        let top = rect.top;
        let left = rect.left;

        switch (placement) {
          case 'top':
            top = rect.top - tooltipHeight - 10;
            left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
            break;
          case 'bottom':
            top = rect.bottom + 10;
            left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
            break;
          case 'left':
            top = rect.top + (rect.height / 2) - (tooltipHeight / 2);
            left = rect.left - tooltipWidth - 10;
            break;
          case 'right':
            top = rect.top + (rect.height / 2) - (tooltipHeight / 2);
            left = rect.right + 10;
            break;
        }

        setPosition({ top, left });
        setIsVisible(true);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [id, targetElement, placement, showOnce, delay]);

  const handleDismiss = () => {
    setIsVisible(false);
    if (showOnce) {
      const seenTooltips = JSON.parse(localStorage.getItem('seen-tooltips') || '[]');
      localStorage.setItem('seen-tooltips', JSON.stringify([...seenTooltips, id]));
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="fixed z-50 pointer-events-none"
          style={{ top: position.top, left: position.left, width: 280 }}
        >
          <div className="glass-panel-solid pointer-events-auto shadow-2xl border-2 border-int-orange/30">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-int-orange/10 rounded-lg">
                <Lightbulb className="h-5 w-5 text-int-orange" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-700 leading-relaxed">{content}</p>
              </div>
              {dismissible && (
                <button
                  onClick={handleDismiss}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label="Dismiss tooltip"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            {dismissible && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDismiss}
                className="w-full mt-2 text-xs"
              >
                Got it!
              </Button>
            )}
          </div>
          
          {/* Arrow pointer */}
          <div
            className={`absolute w-3 h-3 bg-white border-2 border-int-orange/30 transform rotate-45 ${
              placement === 'top' ? 'bottom-[-8px] left-1/2 -translate-x-1/2' :
              placement === 'bottom' ? 'top-[-8px] left-1/2 -translate-x-1/2' :
              placement === 'left' ? 'right-[-8px] top-1/2 -translate-y-1/2' :
              'left-[-8px] top-1/2 -translate-y-1/2'
            }`}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Manager component to show multiple contextual tooltips
 */
export function TooltipManager({ tooltips = [] }) {
  return (
    <>
      {tooltips.map((tooltip) => (
        <ContextualTooltip key={tooltip.id} {...tooltip} />
      ))}
    </>
  );
}