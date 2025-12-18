/**
 * ONBOARDING CONFIGURATION
 * Role-based onboarding flows with steps, actions, and validations
 */

export const ONBOARDING_STEPS = {
  // Administrator/Facilitator Onboarding
  admin: [
    {
      id: 'admin-welcome',
      title: 'Welcome to INTeract Admin',
      description: 'Your command center for employee engagement',
      target: null, // Full-screen modal
      content: {
        type: 'animated-intro',
        highlights: [
          '📅 Schedule engaging team events in minutes',
          '🏆 Configure gamification & rewards to motivate employees',
          '📊 Track engagement analytics and measure ROI',
          '🎯 Build stronger team culture and connections'
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
      id: 'admin-profile-setup',
      title: 'Complete Your Admin Profile',
      description: 'Add your photo and bio so your team recognizes you',
      target: '[data-onboarding="profile-header"]',
      placement: 'bottom',
      content: {
        type: 'guided-form',
        fields: ['avatar_url', 'bio']
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
        type: 'interactive-tour',
        highlights: [
          { selector: '[data-onboarding="activity-filters"]', text: 'Filter by type, duration, and energy level' },
          { selector: '[data-onboarding="activity-card"]', text: 'Preview activities with detailed descriptions' },
          { selector: '[data-onboarding="duplicate-activity"]', text: 'Duplicate and customize activities' }
        ]
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
      description: 'Create a team-building event using AI recommendations',
      target: '[data-onboarding="calendar-page"]',
      placement: 'center',
      content: {
        type: 'step-by-step',
        steps: [
          'Click "Schedule Event" button',
          'Choose an activity from the library',
          'Set date, time, and participants',
          'Enable notifications',
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
        type: 'feature-overview',
        features: [
          {
            title: 'Badges',
            description: 'Award achievements for participation',
            icon: 'Trophy'
          },
          {
            title: 'Challenges',
            description: 'Set personal and team goals',
            icon: 'Target'
          },
          {
            title: 'Points',
            description: 'Reward engagement actions',
            icon: 'Star'
          },
          {
            title: 'Leaderboards',
            description: 'Foster friendly competition',
            icon: 'TrendingUp'
          }
        ]
      },
      actions: [
        {
          label: 'Configure Gamification',
          type: 'navigate',
          target: '/GamificationSettings'
        },
        {
          label: 'Create First Badge',
          type: 'modal',
          target: 'create-badge-modal'
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
        type: 'guided-action',
        action: 'create-team',
        guidance: 'Teams help organize employees by department, project, or interest'
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
        type: 'dashboard-tour',
        metrics: [
          'Event attendance rates',
          'Activity type popularity',
          'Engagement trends over time',
          'Feedback sentiment analysis',
          'Skill development tracking'
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
      id: 'admin-rbac-overview',
      title: 'Understand Permissions & Privacy',
      description: 'Learn about data access and employee privacy',
      target: null,
      placement: 'center',
      content: {
        type: 'info-modal',
        sections: [
          {
            title: 'Role-Based Access Control',
            content: 'Admins can view all data. Team Leads see their team. Employees see only their own data and public content.'
          },
          {
            title: 'Employee Privacy',
            content: 'Salary, PII, and sensitive data are never exposed to non-HR roles. Users control visibility of their profiles.'
          },
          {
            title: 'Recognition & Surveys',
            content: 'Recognition is public by default. Survey responses are anonymous (min 5 responses).'
          }
        ]
      },
      actions: [
        {
          label: 'Review My Permissions',
          type: 'navigate',
          target: '/Settings'
        }
      ],
      validation: null,
      estimatedTime: '3 min'
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
          'First event scheduled',
          'Gamification configured',
          'Analytics dashboard explored'
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

  // Regular User/Participant Onboarding
  participant: [
    {
      id: 'user-welcome',
      title: 'Welcome to INTeract!',
      description: 'Your hub for team connection and growth',
      target: null,
      placement: 'center',
      content: {
        type: 'animated-intro',
        animation: 'celebration',
        highlights: [
          '🎉 Join fun team events',
          '🏆 Earn points & badges',
          '💬 Give & receive recognition',
          '🎁 Redeem rewards'
        ]
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
        type: 'preference-selector',
        categories: [
          {
            field: 'preferred_types',
            label: 'What activities do you enjoy?',
            options: ['icebreaker', 'creative', 'competitive', 'wellness', 'learning', 'social'],
            min_selections: 3
          },
          {
            field: 'preferred_duration',
            label: 'How much time do you have?',
            options: ['5-15min', '15-30min', '30+min']
          },
          {
            field: 'energy_preference',
            label: 'What\'s your energy level?',
            options: ['low', 'medium', 'high']
          }
        ]
      },
      actions: [
        {
          label: 'Set Preferences',
          type: 'navigate',
          target: '/UserProfile?tab=settings&subtab=personalization'
        }
      ],
      validation: {
        check: 'profile.activity_preferences.preferred_types.length >= 3',
        message: 'Choose at least 3 activity types you enjoy'
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
        type: 'settings-guide',
        settings: [
          {
            key: 'enabled_channels',
            label: 'Notification Channels',
            options: ['email', 'in_app', 'teams', 'slack']
          },
          {
            key: 'event_reminders',
            label: 'Event Reminders',
            options: ['1h', '24h', 'both']
          }
        ]
      },
      actions: [
        {
          label: 'Configure Notifications',
          type: 'navigate',
          target: '/UserProfile?tab=settings&subtab=notifications'
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
        type: 'feature-demo',
        demo_actions: [
          'Filter events by type',
          'View event details',
          'RSVP to join',
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
        type: 'gamification-intro',
        elements: [
          {
            type: 'points',
            earn_by: ['Attending events', 'Giving feedback', 'Sending recognition'],
            icon: 'Star'
          },
          {
            type: 'badges',
            earn_by: ['Completing milestones', 'Consistent participation', 'Team contributions'],
            icon: 'Award'
          },
          {
            type: 'challenges',
            earn_by: ['Accepting personal goals', 'Completing streaks'],
            icon: 'Target'
          }
        ]
      },
      actions: [
        {
          label: 'View My Progress',
          type: 'navigate',
          target: '/UserProfile?tab=badges'
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
        type: 'action-guide',
        steps: [
          'Click "Give Recognition"',
          'Select a colleague',
          'Choose a category (teamwork, innovation, etc.)',
          'Write a personal message',
          'Share publicly or keep private'
        ]
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
        type: 'channel-preview',
        channels: [
          { name: 'General', description: 'Company-wide announcements' },
          { name: 'Your Department', description: 'Team-specific discussions' },
          { name: 'Water Cooler', description: 'Casual chats and fun' }
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
        type: 'store-preview',
        featured_items: [
          { name: 'Coffee Gift Card', points: 500 },
          { name: 'Extra PTO Day', points: 2000 },
          { name: 'Team Lunch', points: 1500 }
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
        type: 'completion-summary',
        achievements: [
          'Profile personalized ✓',
          'First event discovered ✓',
          'Gamification unlocked ✓',
          'Team channels joined ✓'
        ],
        quickTips: [
          '💡 Check events weekly for new opportunities',
          '💡 Recognition boosts team morale',
          '💡 Complete challenges for bonus points',
          '💡 Your preferences help AI recommend better events'
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
export const getOnboardingSteps = (role) => {
  const roleKey = role === 'admin' || role === 'facilitator' ? 'admin' : 'participant';
  return ONBOARDING_STEPS[roleKey] || ONBOARDING_STEPS.participant;
};

// Calculate total estimated time
export const calculateTotalTime = (steps) => {
  const totalMinutes = steps.reduce((sum, step) => {
    const time = parseInt(step.estimatedTime) || 0;
    return sum + time;
  }, 0);
  return `${totalMinutes} min`;
};