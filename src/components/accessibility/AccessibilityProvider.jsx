/**
 * ACCESSIBILITY PROVIDER
 * WCAG 2.1 AA Compliance Layer
 * Manages user accessibility preferences globally
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useUserData } from '../hooks/useUserData';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const AccessibilityContext = createContext(null);

export function AccessibilityProvider({ children }) {
  const { user } = useUserData(false);
  const [settings, setSettings] = useState({
    reduced_motion: false,
    high_contrast: false,
    font_size: 'medium',
    screen_reader_optimized: false
  });

  // Fetch user's accessibility settings
  const { data: profile } = useQuery({
    queryKey: ['user-profile-a11y', user?.email],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.filter({ user_email: user?.email });
      return profiles[0] || null;
    },
    enabled: !!user?.email
  });

  useEffect(() => {
    if (profile?.accessibility_settings) {
      setSettings(profile.accessibility_settings);
    }
  }, [profile]);

  // Apply settings to DOM
  useEffect(() => {
    const root = document.documentElement;

    // Reduced motion
    if (settings.reduced_motion) {
      root.style.setProperty('--animation-duration', '0.01ms');
      document.body.classList.add('reduce-motion');
    } else {
      root.style.removeProperty('--animation-duration');
      document.body.classList.remove('reduce-motion');
    }

    // High contrast
    if (settings.high_contrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }

    // Font size
    const fontSizeMap = {
      small: '14px',
      medium: '16px',
      large: '18px',
      'x-large': '20px'
    };
    root.style.setProperty('--base-font-size', fontSizeMap[settings.font_size] || '16px');

    // Screen reader optimizations
    if (settings.screen_reader_optimized) {
      document.body.classList.add('sr-optimized');
    } else {
      document.body.classList.remove('sr-optimized');
    }
  }, [settings]);

  // Detect system preferences
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const prefersContrast = window.matchMedia('(prefers-contrast: high)');

    const handleMotionChange = (e) => {
      if (e.matches && !profile?.accessibility_settings?.reduced_motion) {
        setSettings(prev => ({ ...prev, reduced_motion: true }));
      }
    };

    const handleContrastChange = (e) => {
      if (e.matches && !profile?.accessibility_settings?.high_contrast) {
        setSettings(prev => ({ ...prev, high_contrast: true }));
      }
    };

    prefersReducedMotion.addEventListener('change', handleMotionChange);
    prefersContrast.addEventListener('change', handleContrastChange);

    // Initial check
    if (prefersReducedMotion.matches && !profile?.accessibility_settings) {
      setSettings(prev => ({ ...prev, reduced_motion: true }));
    }

    return () => {
      prefersReducedMotion.removeEventListener('change', handleMotionChange);
      prefersContrast.removeEventListener('change', handleContrastChange);
    };
  }, [profile]);

  return (
    <AccessibilityContext.Provider value={{ settings, setSettings }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
}