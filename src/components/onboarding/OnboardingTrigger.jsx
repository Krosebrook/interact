/**
 * ONBOARDING TRIGGER
 * Button to manually start/restart onboarding
 */

import React from 'react';
import { useOnboarding } from './OnboardingProvider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, RefreshCw, CheckCircle2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

export default function OnboardingTrigger() {
  const {
    isComplete,
    isDismissed,
    progress,
    startOnboarding,
    restartOnboarding,
    onboardingState
  } = useOnboarding();

  const getStatus = () => {
    if (isComplete) return { text: 'Completed', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 };
    if (isDismissed) return { text: 'Dismissed', color: 'bg-slate-100 text-slate-700', icon: BookOpen };
    if (progress > 0) return { text: `${progress}% Done`, color: 'bg-blue-100 text-blue-700', icon: BookOpen };
    return { text: 'Not Started', color: 'bg-slate-100 text-slate-700', icon: BookOpen };
  };

  const status = getStatus();
  const StatusIcon = status.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="gap-2"
          aria-label="Onboarding tutorial menu"
        >
          <StatusIcon className="h-4 w-4" />
          <span className="hidden sm:inline">Tutorial</span>
          {!isComplete && (
            <Badge className={status.color}>
              {status.text}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <div className="p-2">
          <p className="text-sm font-medium text-slate-900 mb-1">Onboarding Tutorial</p>
          <p className="text-xs text-slate-500">
            {isComplete 
              ? 'You\'ve completed the onboarding tutorial!' 
              : 'Learn how to use INTeract effectively'}
          </p>
        </div>
        
        <DropdownMenuSeparator />
        
        {isComplete ? (
          <DropdownMenuItem onClick={restartOnboarding} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Restart Tutorial
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={startOnboarding} className="gap-2">
            <BookOpen className="h-4 w-4" />
            {progress > 0 ? 'Continue Tutorial' : 'Start Tutorial'}
          </DropdownMenuItem>
        )}
        
        {onboardingState && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2 text-xs text-slate-500">
              <div className="flex justify-between mb-1">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-int-orange transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}