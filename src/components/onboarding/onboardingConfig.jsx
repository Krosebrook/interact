/**
 * ONBOARDING CONFIGURATION
 * Role-based onboarding flows with steps, actions, and validations
 */

import { AdminWelcomeContent, ActivityLibraryGuide, GamificationSetupGuide } from './AdminOnboardingSteps';
import { ParticipantWelcomeContent, GamificationExplainerContent, RecognitionGuideContent } from './ParticipantOnboardingSteps';

export const ONBOARDING_STEPS = {
  // Administrator/Facilitator Onboarding
  admin: [
    {
      id: 'admin-welcome',
      title: 'Welcome to INTeract Admin',
      description: 'Your command center for employee engagement',
      target: null,
      placement: 'center',
      content: {
        type: 'custom-component',
        component: AdminWelcomeContent
      },
      actions: [
        {
          label: 'Get Started',
          type: 'next'
        }
      ],
      validation: null,
      estimatedTime: '2 min'
    },
    {
      id: 'admin-profile-setup',
      title: 'Complete Your Admin Profile',
      description: 'Add your photo and bio so your team recognizes you',
      target: '[data-onboarding="profile-header"]',
      placement: 'bottom',
      content: {
        type: 'step-by-step',
        steps: [
          'Click your name in the top-right corner',
          'Go to "My Profile"',
          'Upload a profile photo',
          'Add a brief bio about yourself',
          'Save your changes'
        ]
      },
      actions: [
        {
          label: 'Set Up Profile',
          type: 'navigate',
          target: '/UserProfile'
        }
      ],
      validation: {
        check: 'profile.avatar_url && profile.bio',
        message: 'Complete your profile to help your team recognize you',
        optional: true
      },
      estimatedTime: '3 min'
    },
    {
      id: 'admin-activity-library',
      title: 'Explore the Activity Library',
      description: 'Browse 50+ pre-built activities for team engagement',
      target: '[data-onboarding="activities-page"]',
      placement: 'center',
      content: {
        type: 'custom-component',
        component: ActivityLibraryGuide
      },
      actions: [
        {
          label: 'Browse Activities',
          type: 'navigate',
          target: '/Activities'
        }
      ],
      validation: null,
      estimatedTime: '5 min'
    },
    {
      id: 'admin-schedule-event',
      title: 'Schedule Your First Event',
      description: 'Create a team-building event in minutes',
      target: '[data-onboarding="calendar-page"]',
      placement: 'center',
      content: {
        type: 'step-by-step',
        steps: [
          'Click "Schedule Event" button',
          'Choose an activity from the library',
          'Set date, time, and participants',
          'Enable notifications (Teams/Email)',
          'Publish your event'
        ]
      },
      actions: [
        {
          label: 'Open Calendar',
          type: 'navigate',
          target: '/Calendar'
        },
        {
          label: 'Try AI Event Planner',
          type: 'navigate',
          target: '/AIEventPlanner'
        }
      ],
      validation: {
        check: 'events.length > 0',
        message: 'Try scheduling an event to see how easy it is',
        optional: true
      },
      estimatedTime: '7 min'
    },
    {
      id: 'admin-gamification-setup',
      title: 'Configure Gamification',
      description: 'Set up badges, challenges, and rewards',
      target: '[data-onboarding="gamification-settings"]',
      placement: 'center',
      content: {
        type: 'custom-component',
        component: GamificationSetupGuide
      },
      actions: [
        {
          label: 'Configure Gamification',
          type: 'navigate',
          target: '/GamificationSettings'
        }
      ],
      validation: null,
      estimatedTime: '10 min'
    },
    {
      id: 'admin-teams-setup',
      title: 'Organize Your Teams',
      description: 'Create teams and communication channels',
      target: '[data-onboarding="teams-page"]',
      placement: 'right',
      content: {
        type: 'step-by-step',
        steps: [
          'Navigate to Teams page',
          'Click "Create Team"',
          'Add team name and description',
          'Invite team members',
          'Create channels for communication'
        ]
      },
      actions: [
        {
          label: 'Create a Team',
          type: 'navigate',
          target: '/Teams'
        },
        {
          label: 'Set Up Channels',
          type: 'navigate',
          target: '/Channels'
        }
      ],
      validation: {
        check: 'teams.length > 0',
        message: 'Teams help organize employees - try creating one',
        optional: true
      },
      estimatedTime: '5 min'
    },
    {
      id: 'admin-analytics-overview',
      title: 'Monitor Engagement Analytics',
      description: 'Track participation, trends, and ROI',
      target: '[data-onboarding="analytics-page"]',
      placement: 'center',
      content: {
        type: 'feature-overview',
        features: [
          {
            title: 'Attendance Rates',
            description: 'Track who attends which events',
            icon: 'Trophy'
          },
          {
            title: 'Activity Popularity',
            description: 'See what types engage most',
            icon: 'Star'
          },
          {
            title: 'Engagement Trends',
            description: 'Monitor participation over time',
            icon: 'TrendingUp'
          },
          {
            title: 'Feedback Analysis',
            description: 'Understand sentiment and satisfaction',
            icon: 'Star'
          }
        ]
      },
      actions: [
        {
          label: 'View Analytics',
          type: 'navigate',
          target: '/Analytics'
        }
      ],
      validation: null,
      estimatedTime: '5 min'
    },
    {
      id: 'admin-complete',
      title: 'You\'re All Set!',
      description: 'Start building an engaged, connected team',
      target: null,
      placement: 'center',
      content: {
        type: 'completion-celebration',
        achievements: [
          'Profile setup complete',
          'Activity library explored',
          'Event scheduling mastered',
          'Gamification configured'
        ],
        nextSteps: [
          'Invite team members to first event',
          'Monitor engagement metrics weekly',
          'Adjust gamification based on feedback',
          'Schedule recurring team activities'
        ]
      },
      actions: [
        {
          label: 'Go to Dashboard',
          type: 'navigate',
          target: '/Dashboard'
        },
        {
          label: 'Restart Tutorial',
          type: 'restart'
        }
      ],
      validation: null,
      estimatedTime: '1 min'
    }
  ],

  // Facilitator Onboarding (shares admin steps with minor differences)
  facilitator: [
    {
      id: 'facilitator-welcome',
      title: 'Welcome, Event Facilitator!',
      description: 'Lead engaging team experiences',
      target: null,
      placement: 'center',
      content: {
        type: 'animated-intro',
        highlights: [
          '🎯 Host interactive team events',
          '📊 Track real-time participation',
          '💡 Get AI-powered facilitation tips',
          '🎉 Build memorable team moments'
        ]
      },
      actions: [
        {
          label: 'Get Started',
          type: 'next'
        }
      ],
      validation: null,
      estimatedTime: '2 min'
    },
    {
      id: 'facilitator-dashboard',
      title: 'Your Facilitator Dashboard',
      description: 'Everything you need to run great events',
      target: '[data-onboarding="facilitator-dashboard"]',
      placement: 'center',
      content: {
        type: 'step-by-step',
        steps: [
          'View your upcoming events',
          'Access pre-event preparation checklist',
          'Monitor live event participation',
          'Review post-event feedback'
        ]
      },
      actions: [
        {
          label: 'Open Dashboard',
          type: 'navigate',
          target: '/FacilitatorDashboard'
        }
      ],
      validation: null,
      estimatedTime: '4 min'
    },
    {
      id: 'facilitator-activity-browse',
      title: 'Browse Activity Library',
      description: 'Find the perfect activity for your event',
      target: '[data-onboarding="activities-page"]',
      placement: 'center',
      content: {
        type: 'custom-component',
        component: ActivityLibraryGuide
      },
      actions: [
        {
          label: 'Browse Activities',
          type: 'navigate',
          target: '/Activities'
        }
      ],
      validation: null,
      estimatedTime: '5 min'
    },
    {
      id: 'facilitator-event-schedule',
      title: 'Schedule Your First Event',
      description: 'Set up and invite participants',
      target: '[data-onboarding="calendar-page"]',
      placement: 'center',
      content: {
        type: 'step-by-step',
        steps: [
          'Navigate to Calendar',
          'Click "Schedule Event"',
          'Select activity and customize',
          'Set date/time and add participants',
          'Publish and send invitations'
        ]
      },
      actions: [
        {
          label: 'Schedule Event',
          type: 'navigate',
          target: '/Calendar'
        }
      ],
      validation: {
        check: 'events.length > 0',
        message: 'Schedule your first event',
        optional: true
      },
      estimatedTime: '6 min'
    },
    {
      id: 'facilitator-complete',
      title: 'Ready to Facilitate!',
      description: 'You\'re equipped to run amazing events',
      target: null,
      placement: 'center',
      content: {
        type: 'completion-celebration',
        achievements: [
          'Dashboard explored',
          'Activity library browsed',
          'First event scheduled',
          'Facilitation tools ready'
        ],
        nextSteps: [
          'Review pre-event checklist before your event',
          'Use AI assistant for live facilitation tips',
          'Collect feedback after each event',
          'Share highlights with your team'
        ]
      },
      actions: [
        {
          label: 'Go to Dashboard',
          type: 'navigate',
          target: '/FacilitatorDashboard'
        },
        {
          label: 'Restart Tutorial',
          type: 'restart'
        }
      ],
      validation: null,
      estimatedTime: '1 min'
    }
  ],

  // Participant Onboarding
  participant: [
    {
      id: 'user-welcome',
      title: 'Welcome to INTeract!',
      description: 'Your hub for team connection and growth',
      target: null,
      placement: 'center',
      content: {
        type: 'custom-component',
        component: ParticipantWelcomeContent
      },
      actions: [
        {
          label: 'Let\'s Get Started!',
          type: 'next'
        }
      ],
      validation: null,
      estimatedTime: '1 min'
    },
    {
      id: 'user-profile-personalize',
      title: 'Personalize Your Experience',
      description: 'Tell us your preferences so we can recommend events you\'ll love',
      target: '[data-onboarding="personalization-settings"]',
      placement: 'center',
      content: {
        type: 'step-by-step',
        steps: [
          'Go to your profile settings',
          'Choose your favorite activity types (pick at least 3)',
          'Set your preferred event duration',
          'Select your energy level preference',
          'Save your preferences'
        ]
      },
      actions: [
        {
          label: 'Set Preferences',
          type: 'navigate',
          target: '/UserProfile'
        }
      ],
      validation: {
        check: 'profile.activity_preferences.preferred_types.length >= 3',
        message: 'Choose at least 3 activity types you enjoy',
        optional: true
      },
      estimatedTime: '3 min'
    },
    {
      id: 'user-notifications',
      title: 'Stay in the Loop',
      description: 'Choose how you want to hear about events and updates',
      target: '[data-onboarding="notification-settings"]',
      placement: 'right',
      content: {
        type: 'step-by-step',
        steps: [
          'Open notification settings',
          'Choose your notification channels (Email, Teams, Slack)',
          'Set event reminder preferences (1h, 24h, or both)',
          'Enable milestone celebrations',
          'Save your preferences'
        ]
      },
      actions: [
        {
          label: 'Configure Notifications',
          type: 'navigate',
          target: '/UserProfile'
        }
      ],
      validation: null,
      estimatedTime: '2 min'
    },
    {
      id: 'user-events-discover',
      title: 'Discover Your Next Event',
      description: 'Browse upcoming events tailored to your interests',
      target: '[data-onboarding="participant-portal"]',
      placement: 'center',
      content: {
        type: 'step-by-step',
        steps: [
          'Browse upcoming events on your portal',
          'Filter by activity type or date',
          'Click an event to see details',
          'Click "Join Event" to RSVP',
          'Add to your calendar'
        ]
      },
      actions: [
        {
          label: 'Browse Events',
          type: 'navigate',
          target: '/ParticipantPortal'
        }
      ],
      validation: {
        check: 'participations.length > 0',
        message: 'RSVP to your first event',
        optional: true
      },
      estimatedTime: '4 min'
    },
    {
      id: 'user-gamification',
      title: 'Earn Rewards for Engagement',
      description: 'Collect points, unlock badges, and climb the leaderboard',
      target: '[data-onboarding="gamification-overview"]',
      placement: 'center',
      content: {
        type: 'custom-component',
        component: GamificationExplainerContent
      },
      actions: [
        {
          label: 'View My Progress',
          type: 'navigate',
          target: '/UserProfile'
        },
        {
          label: 'Check Leaderboard',
          type: 'navigate',
          target: '/Leaderboards'
        }
      ],
      validation: null,
      estimatedTime: '3 min'
    },
    {
      id: 'user-recognition',
      title: 'Celebrate Your Teammates',
      description: 'Send recognition to acknowledge great work',
      target: '[data-onboarding="recognition-page"]',
      placement: 'center',
      content: {
        type: 'custom-component',
        component: RecognitionGuideContent
      },
      actions: [
        {
          label: 'Give Recognition',
          type: 'navigate',
          target: '/Recognition'
        }
      ],
      validation: {
        check: 'recognitionsSent.length > 0',
        message: 'Send your first recognition',
        optional: true
      },
      estimatedTime: '2 min'
    },
    {
      id: 'user-teams-channels',
      title: 'Join Your Team Channels',
      description: 'Connect with your department and interest groups',
      target: '[data-onboarding="channels-page"]',
      placement: 'left',
      content: {
        type: 'step-by-step',
        steps: [
          'Navigate to Channels page',
          'Browse available channels',
          'Join channels relevant to you',
          'Start conversations with your team'
        ]
      },
      actions: [
        {
          label: 'Explore Channels',
          type: 'navigate',
          target: '/Channels'
        }
      ],
      validation: null,
      estimatedTime: '2 min'
    },
    {
      id: 'user-rewards-store',
      title: 'Redeem Your Points',
      description: 'Browse rewards and treats you can unlock',
      target: '[data-onboarding="rewards-store"]',
      placement: 'center',
      content: {
        type: 'step-by-step',
        steps: [
          'Browse available rewards',
          'Check your points balance',
          'Redeem rewards when you have enough points',
          'Track your redemption history'
        ]
      },
      actions: [
        {
          label: 'Browse Rewards',
          type: 'navigate',
          target: '/RewardsStore'
        }
      ],
      validation: null,
      estimatedTime: '2 min'
    },
    {
      id: 'user-complete',
      title: 'You\'re Ready to Rock!',
      description: 'Start connecting, growing, and earning rewards',
      target: null,
      placement: 'center',
      content: {
        type: 'completion-celebration',
        achievements: [
          'Profile personalized ✓',
          'First event discovered ✓',
          'Gamification unlocked ✓',
          'Team channels joined ✓'
        ],
        nextSteps: [
          'Check events weekly for new opportunities',
          'Recognition boosts team morale',
          'Complete challenges for bonus points',
          'Your preferences help AI recommend better events'
        ]
      },
      actions: [
        {
          label: 'Explore My Portal',
          type: 'navigate',
          target: '/ParticipantPortal'
        },
        {
          label: 'Restart Tutorial',
          type: 'restart'
        }
      ],
      validation: null,
      estimatedTime: '1 min'
    }
  ]
};

// Helper to get steps for a role
export const getOnboardingSteps = (role, userType) => {
  // Admin role takes precedence
  if (role === 'admin') return ONBOARDING_STEPS.admin;
  // Then check user_type
  if (userType === 'facilitator') return ONBOARDING_STEPS.facilitator;
  if (userType === 'participant') return ONBOARDING_STEPS.participant;
  // Default to participant for non-specified users
  return ONBOARDING_STEPS.participant;
};

// Calculate total estimated time
export const calculateTotalTime = (steps) => {
  const totalMinutes = steps.reduce((sum, step) => {
    const time = parseInt(step.estimatedTime) || 0;
    return sum + time;
  }, 0);
  return `${totalMinutes} min`;
};