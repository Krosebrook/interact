/**
 * Mobile Haptic Feedback Utility
 * Provides vibration feedback on supported mobile devices
 */

// Check if vibration API is supported
export const isHapticSupported = () => {
  return 'vibrate' in navigator;
};

// Light tap feedback (button press)
export const hapticLight = () => {
  if (isHapticSupported()) {
    navigator.vibrate(10);
  }
};

// Medium feedback (action completed)
export const hapticMedium = () => {
  if (isHapticSupported()) {
    navigator.vibrate(25);
  }
};

// Heavy feedback (important action)
export const hapticHeavy = () => {
  if (isHapticSupported()) {
    navigator.vibrate(50);
  }
};

// Success feedback (double tap pattern)
export const hapticSuccess = () => {
  if (isHapticSupported()) {
    navigator.vibrate([20, 50, 20]);
  }
};

// Error feedback (longer vibration)
export const hapticError = () => {
  if (isHapticSupported()) {
    navigator.vibrate([50, 30, 50]);
  }
};

// Warning feedback
export const hapticWarning = () => {
  if (isHapticSupported()) {
    navigator.vibrate([30, 20, 30, 20, 30]);
  }
};

// Selection changed feedback
export const hapticSelection = () => {
  if (isHapticSupported()) {
    navigator.vibrate(5);
  }
};

// Notification feedback
export const hapticNotification = () => {
  if (isHapticSupported()) {
    navigator.vibrate([15, 30, 15, 30, 15]);
  }
};

// Custom pattern
export const hapticPattern = (pattern) => {
  if (isHapticSupported() && Array.isArray(pattern)) {
    navigator.vibrate(pattern);
  }
};

// Stop any ongoing vibration
export const hapticStop = () => {
  if (isHapticSupported()) {
    navigator.vibrate(0);
  }
};

// Hook for using haptic feedback
export const useHaptic = () => {
  return {
    isSupported: isHapticSupported(),
    light: hapticLight,
    medium: hapticMedium,
    heavy: hapticHeavy,
    success: hapticSuccess,
    error: hapticError,
    warning: hapticWarning,
    selection: hapticSelection,
    notification: hapticNotification,
    pattern: hapticPattern,
    stop: hapticStop
  };
};

export default {
  isSupported: isHapticSupported,
  light: hapticLight,
  medium: hapticMedium,
  heavy: hapticHeavy,
  success: hapticSuccess,
  error: hapticError,
  warning: hapticWarning,
  selection: hapticSelection,
  notification: hapticNotification,
  pattern: hapticPattern,
  stop: hapticStop
};