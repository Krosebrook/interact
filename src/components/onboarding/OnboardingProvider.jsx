import { createContext, useContext, useState, useEffect } from 'react';
import { useUserData } from '../hooks/useUserData';
import { useOnboardingSteps } from './useOnboardingSteps';

const OnboardingContext = createContext();

export function OnboardingProvider({ children }) {
  const { user } = useUserData();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [tutorialMode, setTutorialMode] = useState(false);
  
  const userRole = user?.role === 'admin' ? 'admin' : user?.user_type || 'participant';
  const onboardingSteps = useOnboardingSteps(userRole);

  useEffect(() => {
    if (user && !localStorage.getItem(`onboarding_completed_${user.email}`)) {
      // Check if this is a new user (created within last 5 minutes)
      const userCreatedDate = new Date(user.created_date);
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const isNewUser = userCreatedDate > fiveMinutesAgo;
      
      // Auto-start onboarding for new users or if not previously skipped
      const hasSkipped = localStorage.getItem(`onboarding_skipped_${user.email}`);
      if (isNewUser || !hasSkipped) {
        // Delay to ensure smooth transition from auth
        setTimeout(() => {
          setShowOnboarding(true);
          setTutorialMode(true);
        }, 800);
      }
    }
  }, [user]);

  const completeStep = (stepIndex) => {
    setCompletedSteps([...completedSteps, stepIndex]);
    if (stepIndex === onboardingSteps.length - 1) {
      localStorage.setItem(`onboarding_completed_${user?.email}`, 'true');
      setShowOnboarding(false);
    }
  };

  const resetOnboarding = () => {
    setCurrentStep(0);
    setCompletedSteps([]);
    if (user?.email) {
      localStorage.removeItem(`onboarding_completed_${user.email}`);
    }
  };

  const startTutorial = () => {
    setTutorialMode(true);
    setShowOnboarding(true);
    setCurrentStep(0);
  };

  const skipTutorial = () => {
    setTutorialMode(false);
    setShowOnboarding(false);
    if (user?.email) {
      localStorage.setItem(`onboarding_skipped_${user.email}`, 'true');
    }
  };

  return (
    <OnboardingContext.Provider
      value={{
        showOnboarding,
        setShowOnboarding,
        currentStep,
        setCurrentStep,
        completedSteps,
        completeStep,
        resetOnboarding,
        tutorialMode,
        startTutorial,
        skipTutorial,
        onboardingSteps,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
}