import { useMemo } from 'react';

export function useOnboardingSteps(userRole = 'participant') {
  const steps = useMemo(() => {
    const stepsByRole = {

      admin: [
        {
          title: 'Welcome to INTeract Admin',
          description: 'As an admin, you have full control over the platform. Let\'s get you started with the key features.',
          targetElement: null,
          cardPosition: null
        },
        {
          title: 'Admin Dashboard',
          description: 'Navigate to your admin panel to manage users, configure settings, and view platform analytics.',
          targetElement: { top: 80, left: 20, width: 200, height: 50 },
          cardPosition: { top: 150, left: 240 }
        },
        {
          title: 'User Management',
          description: 'Invite team members, assign roles, and manage permissions from the Admin Hub.',
          targetElement: { top: 140, left: 20, width: 200, height: 50 },
          cardPosition: { top: 210, left: 240 }
        },
        {
          title: 'Gamification Settings',
          description: 'Configure points, badges, and challenges to drive engagement across your organization.',
          targetElement: { top: 200, left: 20, width: 200, height: 50 },
          cardPosition: { top: 270, left: 240 }
        },
        {
          title: 'Analytics & Reports',
          description: 'Access real-time engagement metrics and export custom reports for leadership.',
          targetElement: { top: 260, left: 20, width: 200, height: 50 },
          cardPosition: { top: 330, left: 240 }
        }
      ],
      facilitator: [
        {
          title: 'Welcome, Team Leader!',
          description: 'You\'ll be creating activities, managing events, and tracking team engagement. Let\'s explore your tools.',
          targetElement: null,
          cardPosition: null
        },
        {
          title: 'Activities Hub',
          description: 'Browse and schedule team activities. You can create custom activities or use templates.',
          targetElement: { top: 140, left: 20, width: 200, height: 50 },
          cardPosition: { top: 210, left: 240 }
        },
        {
          title: 'Event Calendar',
          description: 'Schedule events, send invites, and track RSVPs. All your team events in one place.',
          targetElement: { top: 200, left: 20, width: 200, height: 50 },
          cardPosition: { top: 270, left: 240 }
        },
        {
          title: 'Team Analytics',
          description: 'Monitor your team\'s participation rates and engagement trends.',
          targetElement: { top: 260, left: 20, width: 200, height: 50 },
          cardPosition: { top: 330, left: 240 }
        }
      ],
      participant: [
        {
          title: 'Welcome to INTeract!',
          description: 'Get ready to connect with your team, celebrate wins, and make work more engaging. Let\'s show you around.',
          targetElement: null,
          cardPosition: null
        },
        {
          title: 'Your Dashboard',
          description: 'This is your home base. See upcoming events, recent recognition, and your activity feed.',
          targetElement: { top: 140, left: 20, width: 200, height: 50 },
          cardPosition: { top: 210, left: 240 }
        },
        {
          title: 'Join Events',
          description: 'Check out the calendar to RSVP for team activities and social events.',
          targetElement: { top: 200, left: 20, width: 200, height: 50 },
          cardPosition: { top: 270, left: 240 }
        },
        {
          title: 'Give Recognition',
          description: 'Celebrate your teammates! Send public shoutouts or private thank-you notes.',
          targetElement: { top: 260, left: 20, width: 200, height: 50 },
          cardPosition: { top: 330, left: 240 },
          actionButton: {
            label: 'Try Recognition',
            onClick: () => window.location.href = '/Recognition'
          }
        },
        {
          title: 'Earn Points & Badges',
          description: 'Participate in activities, complete challenges, and unlock achievements!',
          targetElement: { top: 320, left: 20, width: 200, height: 50 },
          cardPosition: { top: 390, left: 240 }
        },
        {
          title: 'Customize Your Profile',
          description: 'Add your bio, skills, and interests so teammates can get to know you better.',
          targetElement: { top: 380, left: 20, width: 200, height: 50 },
          cardPosition: { top: 450, left: 240 },
          actionButton: {
            label: 'Go to Profile',
            onClick: () => window.location.href = '/UserProfile'
          }
        }
      ]
    };

    return stepsByRole[userRole] || stepsByRole.participant;
  }, [userRole]);

  return steps;
}