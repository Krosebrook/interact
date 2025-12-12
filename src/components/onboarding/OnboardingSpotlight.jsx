/**
 * ONBOARDING SPOTLIGHT
 * Cross-page UI element highlighter with persistent state
 */

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, ChevronRight } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export function OnboardingSpotlight({ 
  targetSelector,
  title,
  description,
  placement = 'bottom',
  isVisible,
  onNext,
  onDismiss
}) {
  const [targetRect, setTargetRect] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const location = useLocation();

  useEffect(() => {
    if (!isVisible || !targetSelector) {
      setTargetRect(null);
      return;
    }

    // Function to find and highlight target
    const findAndHighlight = () => {
      const element = document.querySelector(targetSelector);
      if (element) {
        const rect = element.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
        
        setTargetRect({
          top: rect.top + scrollTop,
          left: rect.left + scrollLeft,
          width: rect.width,
          height: rect.height
        });

        // Scroll into view
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Calculate tooltip position
        calculateTooltipPosition(rect, scrollTop, scrollLeft);
      }
    };

    // Try immediately
    findAndHighlight();

    // Retry with delays for dynamic content
    const timeout1 = setTimeout(findAndHighlight, 100);
    const timeout2 = setTimeout(findAndHighlight, 500);
    const timeout3 = setTimeout(findAndHighlight, 1000);

    // Observer for DOM changes
    const observer = new MutationObserver(findAndHighlight);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true
    });

    return () => {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
      clearTimeout(timeout3);
      observer.disconnect();
    };
  }, [isVisible, targetSelector, location]);

  const calculateTooltipPosition = (rect, scrollTop, scrollLeft) => {
    const tooltipWidth = 320;
    const tooltipHeight = 200;
    const padding = 20;

    let top, left;

    switch (placement) {
      case 'bottom':
        top = rect.bottom + scrollTop + padding;
        left = rect.left + scrollLeft + (rect.width / 2) - (tooltipWidth / 2);
        break;
      case 'top':
        top = rect.top + scrollTop - tooltipHeight - padding;
        left = rect.left + scrollLeft + (rect.width / 2) - (tooltipWidth / 2);
        break;
      case 'left':
        top = rect.top + scrollTop + (rect.height / 2) - (tooltipHeight / 2);
        left = rect.left + scrollLeft - tooltipWidth - padding;
        break;
      case 'right':
        top = rect.top + scrollTop + (rect.height / 2) - (tooltipHeight / 2);
        left = rect.right + scrollLeft + padding;
        break;
      default:
        top = rect.bottom + scrollTop + padding;
        left = rect.left + scrollLeft;
    }

    // Keep within viewport
    left = Math.max(padding, Math.min(left, window.innerWidth - tooltipWidth - padding));
    top = Math.max(padding, top);

    setTooltipPosition({ top, left });
  };

  if (!isVisible || !targetRect) return null;

  return createPortal(
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100]"
        style={{ 
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(3px)'
        }}
        onClick={onDismiss}
      />

      {/* Spotlight cutout */}
      <div
        className="fixed z-[101] pointer-events-none"
        style={{
          top: targetRect.top - 8,
          left: targetRect.left - 8,
          width: targetRect.width + 16,
          height: targetRect.height + 16,
          boxShadow: `0 0 0 4px rgba(217, 114, 48, 0.5), 0 0 0 9999px rgba(0, 0, 0, 0.6)`,
          borderRadius: '12px'
        }}
      />

      {/* Tooltip */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed z-[102] w-80 max-w-sm"
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left
        }}
      >
        <div className="bg-white rounded-xl shadow-2xl border-2 border-int-orange p-5">
          <div className="flex items-start justify-between mb-3">
            <h4 className="font-bold text-slate-900 text-lg pr-8">{title}</h4>
            <Button
              variant="ghost"
              size="icon"
              onClick={onDismiss}
              className="h-6 w-6 absolute top-3 right-3"
            >
              <X className="h-4 w-4" />
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
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}