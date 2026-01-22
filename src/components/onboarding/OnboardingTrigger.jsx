import { Button } from '@/components/ui/button';
import { HelpCircle, Sparkles } from 'lucide-react';
import { useOnboarding } from './OnboardingProvider';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function OnboardingTrigger() {
  const { setShowOnboarding, resetOnboarding, startTutorial } = useOnboarding();

  const handleClick = () => {
    resetOnboarding();
    setShowOnboarding(true);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20"
          title="Help & Tutorials"
        >
          <HelpCircle className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={startTutorial} className="gap-2">
          <Sparkles className="w-4 h-4 text-[var(--orb-accent)]" />
          Start AI-Guided Tutorial
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleClick} className="gap-2">
          <HelpCircle className="w-4 h-4" />
          Quick Onboarding
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}