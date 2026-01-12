import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { HelpCircle, BookOpen, Video, MessageCircle } from 'lucide-react';

/**
 * Contextual help button that appears on pages
 * Provides quick access to tutorials and documentation
 */
export default function HelpButton({ pageContext, tooltips = [] }) {
  const [open, setOpen] = useState(false);

  const getHelpContent = () => {
    const helpContent = {
      Dashboard: {
        title: 'Dashboard Overview',
        description: 'Your central hub for team engagement and upcoming events',
        tips: [
          'Check upcoming events to stay connected',
          'View your points and achievements',
          'Access quick actions for common tasks'
        ]
      },
      Activities: {
        title: 'Activity Library',
        description: 'Browse and create engaging team activities',
        tips: [
          'Use filters to find activities by type',
          'Preview activities before scheduling',
          'Create custom activities for your team'
        ]
      },
      Calendar: {
        title: 'Event Calendar',
        description: 'Schedule and manage team events',
        tips: [
          'Pick an activity template to get started',
          'Set recurring events for regular team meetings',
          'Use AI suggestions for optimal scheduling'
        ]
      },
      Teams: {
        title: 'Team Management',
        description: 'Organize and collaborate with your teams',
        tips: [
          'Join teams to access team channels',
          'Track team goals and challenges',
          'View team analytics and engagement'
        ]
      },
      Recognition: {
        title: 'Recognition Wall',
        description: 'Give and receive peer recognition',
        tips: [
          'Public recognition boosts team morale',
          'Tag colleagues to spread appreciation',
          'Earn points for giving recognition'
        ]
      },
      GamificationDashboard: {
        title: 'Gamification',
        description: 'Track your points, badges, and achievements',
        tips: [
          'Earn points by attending events and participating',
          'Unlock badges for milestones',
          'Redeem points in the rewards store'
        ]
      }
    };

    return helpContent[pageContext] || {
      title: 'Help & Tips',
      description: 'Learn how to use this feature',
      tips: ['Explore the interface to discover features']
    };
  };

  const content = getHelpContent();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-int-orange text-white shadow-lg hover:bg-int-orange/90 hover:scale-110 transition-all z-50"
          aria-label="Help and tips"
        >
          <HelpCircle className="h-6 w-6" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 mr-4" align="end">
        <div className="space-y-4">
          <div>
            <h3 className="font-bold text-slate-900 mb-1">{content.title}</h3>
            <p className="text-sm text-slate-600">{content.description}</p>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-700 uppercase">Quick Tips</p>
            {content.tips.map((tip, idx) => (
              <div key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                <div className="w-1.5 h-1.5 rounded-full bg-int-orange mt-2 flex-shrink-0" />
                <p>{tip}</p>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t space-y-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => {
                window.open('https://docs.example.com', '_blank');
              }}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Documentation
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => setOpen(false)}
            >
              <Video className="h-4 w-4 mr-2" />
              Watch Tutorial
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}