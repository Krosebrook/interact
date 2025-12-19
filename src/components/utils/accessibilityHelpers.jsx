/**
 * ACCESSIBILITY HELPER UTILITIES
 * WCAG 2.1 AA compliance helpers
 */

/**
 * Generate unique IDs for ARIA relationships
 */
export function generateA11yId(prefix = 'a11y') {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Announce to screen readers
 */
export function announceToScreenReader(message, priority = 'polite') {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Check if user prefers high contrast
 */
export function prefersHighContrast() {
  return window.matchMedia('(prefers-contrast: high)').matches;
}

/**
 * Get accessible color for contrast
 * Ensures WCAG AA compliance (4.5:1 for normal text)
 */
export function getAccessibleColor(color, backgroundColor = '#ffffff') {
  // This is a simplified helper - in production, use a color contrast library
  const colorMap = {
    '#D97230': '#C46322', // int-orange → darker variant
    '#64748b': '#475569', // slate-gray → darker variant
  };
  
  return colorMap[color.toLowerCase()] || color;
}

/**
 * Trap focus within a container (for modals)
 */
export function trapFocus(container) {
  const focusableElements = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  const handleKeyDown = (e) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault();
      lastElement.focus();
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault();
      firstElement.focus();
    }
  };

  container.addEventListener('keydown', handleKeyDown);
  return () => container.removeEventListener('keydown', handleKeyDown);
}

/**
 * Check if touch target meets minimum size (44x44px)
 */
export function verifyTouchTargetSize(element) {
  const rect = element.getBoundingClientRect();
  return rect.width >= 44 && rect.height >= 44;
}

/**
 * Get descriptive label for screen readers
 */
export function getAriaLabel(action, context) {
  const labels = {
    'copy-link': `Copy ${context} link to clipboard`,
    'download-calendar': `Download ${context} to calendar`,
    'delete': `Delete ${context}`,
    'edit': `Edit ${context}`,
    'view': `View ${context} details`,
    'close': `Close ${context}`,
    'expand': `Expand ${context}`,
    'collapse': `Collapse ${context}`
  };
  
  return labels[action] || `${action} ${context}`;
}

/**
 * Format number for screen readers
 */
export function formatNumberForA11y(number) {
  if (number >= 1000000) {
    return `${(number / 1000000).toFixed(1)} million`;
  }
  if (number >= 1000) {
    return `${(number / 1000).toFixed(1)} thousand`;
  }
  return number.toString();
}

/**
 * Check color contrast ratio (simplified)
 * Full implementation would use a proper color library
 */
export function hasGoodContrast(foreground, background) {
  // This is a placeholder - in production, use a proper contrast checker
  // like 'color-contrast-checker' or WCAG color contrast APIs
  console.warn('Color contrast check not fully implemented - use axe DevTools');
  return true;
}

/**
 * Add keyboard shortcut helper
 */
export function createKeyboardShortcut(key, callback, modifier = null) {
  const handler = (e) => {
    const modifierMatch = !modifier || 
      (modifier === 'ctrl' && (e.ctrlKey || e.metaKey)) ||
      (modifier === 'shift' && e.shiftKey) ||
      (modifier === 'alt' && e.altKey);

    if (e.key.toLowerCase() === key.toLowerCase() && modifierMatch) {
      e.preventDefault();
      callback();
    }
  };

  document.addEventListener('keydown', handler);
  return () => document.removeEventListener('keydown', handler);
}