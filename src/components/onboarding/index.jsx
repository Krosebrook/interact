/**
 * ONBOARDING EXPORTS
 * Centralized export for onboarding system
 */

export { OnboardingProvider, useOnboarding } from './OnboardingProvider';
export { default as OnboardingModal } from './OnboardingModal';
export { default as OnboardingTrigger } from './OnboardingTrigger';
export { default as OnboardingProgress } from './OnboardingProgress';
export { default as OnboardingChecklist } from './OnboardingChecklist';
export { default as WelcomeWizard } from './WelcomeWizard';
export { default as FeatureHighlight } from './FeatureHighlight';
export { getOnboardingSteps, calculateTotalTime } from './onboardingConfig';