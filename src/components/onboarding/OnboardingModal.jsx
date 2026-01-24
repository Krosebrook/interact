import { useOnboarding } from './OnboardingProvider';
import AIGuidedOnboarding from './AIGuidedOnboarding';

export default function OnboardingModal() {
  const { 
    showOnboarding, 
    setShowOnboarding, 
    currentStep, 
    completeStep, 
    tutorialMode,
    skipTutorial,
    onboardingSteps 
  } = useOnboarding();

  if (!showOnboarding) return null;

  return (
    <AIGuidedOnboarding
      steps={onboardingSteps}
      onComplete={() => {
        setShowOnboarding(false);
        completeStep(currentStep);
      }}
      onSkip={skipTutorial}
    />
  );
}