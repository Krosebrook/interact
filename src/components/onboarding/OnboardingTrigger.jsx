import { useOnboarding } from './OnboardingProvider';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { HelpCircle, Sparkles, BookOpen } from 'lucide-react';

export default function OnboardingTrigger() {
  // Call hook unconditionally at the top level (Rules of Hooks)
  const onboardingContext = useOnboarding();

  // Handle case where context is not available
  if (!onboardingContext) {
    console.warn('OnboardingTrigger rendered outside OnboardingProvider');
    return null;
  }

  const { resetOnboarding, setShowOnboarding, startTutorial } = onboardingContext;

  const handleClick = () => {
    resetOnboarding();
    setShowOnboarding(true);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
          <HelpCircle className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={() => startTutorial()}>
          <Sparkles className="h-4 w-4 mr-2" />
          Start AI-Guided Tutorial
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleClick}>
          <BookOpen className="h-4 w-4 mr-2" />
          Quick Onboarding
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}