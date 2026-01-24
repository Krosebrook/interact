import { createContext, useContext, useState, useEffect } from 'react';
import { useUserData } from '../hooks/useUserData';
import { useOnboardingSteps } from './useOnboardingSteps';

const OnboardingContext = createContext();

export function OnboardingProvider({ children }) {
  const { user, loading: userLoading } = useUserData(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [tutorialMode, setTutorialMode] = useState(false);
  
  const userRole = user?.role === 'admin' ? 'admin' : user?.user_type || 'participant';
  const onboardingSteps = useOnboardingSteps(userRole);

  useEffect(() => {
    // Only trigger for authenticated users
    if (userLoading || !user) return;
    
    // Check if onboarding already completed
    if (localStorage.getItem(`onboarding_completed_${user.email}`)) return;
    
    // Check if user has previously skipped onboarding
    const hasSkipped = localStorage.getItem(`onboarding_skipped_${user.email}`);
    if (hasSkipped) return;
    
    // Check if this is a new user (created within last 10 minutes)
    const userCreatedDate = new Date(user.created_date);
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const isNewUser = userCreatedDate > tenMinutesAgo;
    
    // Only auto-trigger for brand new users
    if (isNewUser) {
      // Delay to ensure smooth post-login transition
      const timer = setTimeout(() => {
        setShowOnboarding(true);
        setTutorialMode(true);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [user, userLoading]);

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