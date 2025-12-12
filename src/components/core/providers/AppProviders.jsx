/**
 * APP PROVIDERS
 * Centralized provider composition
 */

import React from 'react';
import { QueryProvider } from './QueryProvider';
import { OnboardingProvider } from '../../onboarding/OnboardingProvider';
import { Toaster } from '@/components/ui/sonner';
import ErrorBoundary from '../../common/ErrorBoundary';

export function AppProviders({ children }) {
  return (
    <ErrorBoundary>
      <QueryProvider>
        <OnboardingProvider>
          {children}
          <Toaster position="top-right" />
        </OnboardingProvider>
      </QueryProvider>
    </ErrorBoundary>
  );
}

export default AppProviders;