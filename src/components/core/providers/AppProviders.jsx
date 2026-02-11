/**
 * APP PROVIDERS
 * Centralized provider composition
 */

import { QueryProvider } from './QueryProvider';
import { OnboardingProvider } from '../../onboarding/OnboardingProvider';
import { AuthProvider } from '../../auth/AuthProvider';
import RedirectLoopDetector from '../../auth/RedirectLoopDetector';
import { Toaster } from '@/components/ui/sonner';
import ErrorBoundary from '../../common/ErrorBoundary';

export function AppProviders({ children }) {
  return (
    <ErrorBoundary>
      <QueryProvider>
        <AuthProvider>
          <RedirectLoopDetector />
          <OnboardingProvider>
            {children}
            <Toaster position="top-right" />
          </OnboardingProvider>
        </AuthProvider>
      </QueryProvider>
    </ErrorBoundary>
  );
}

export default AppProviders;