import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// ONBOARDING FLOW DEFINITIONS
const ONBOARDING_FLOWS = {
  full_onboarding: [
    {
      step: 0,
      name: "Welcome & Role",
      description: "Let's set up your INTeract profile",
      fields: ["role"],
      estimatedTime: 2,
      skippable: false
    },
    {
      step: 1,
      name: "Interest Areas",
      description: "What topics interest you?",
      fields: ["industry_interests"],
      estimatedTime: 3,
      skippable: false
    },
    {
      step: 2,
      name: "Engagement Style",
      description: "How do you like to engage?",
      fields: ["engagement_style"],
      estimatedTime: 2,
      skippable: false
    },
    {
      step: 3,
      name: "Communication Preferences",
      description: "How should we keep you updated?",
      fields: ["communication_prefs"],
      estimatedTime: 2,
      skippable: true
    },
    {
      step: 4,
      name: "Growth Goals",
      description: "What are you looking to achieve?",
      fields: ["portfolio_goals"],
      estimatedTime: 3,
      skippable: true
    },
    {
      step: 5,
      name: "Community & Groups",
      description: "Which communities interest you?",
      fields: ["community_interests"],
      estimatedTime: 3,
      skippable: true
    },
    {
      step: 6,
      name: "Review & Confirm",
      description: "Review your preferences",
      fields: [],
      estimatedTime: 2,
      skippable: false
    }
  ],
  quick_start: [
    {
      step: 0,
      name: "Quick Setup",
      description: "Just 3 quick questions",
      fields: ["role", "engagement_style", "communication_email"],
      estimatedTime: 2,
      skippable: false
    },
    {
      step: 1,
      name: "You're In!",
      description: "Welcome to INTeract",
      fields: [],
      estimatedTime: 1,
      skippable: false
    }
  ]
};

// TUTORIAL DEFINITIONS
const TUTORIALS = {
  first_event: {
    id: "first_event",
    name: "Creating & Attending Events",
    description: "Learn how to discover and join events",
    highlights: [
      { element: "calendar_nav", text: "Find events in the Calendar" },
      { element: "event_card", text: "Click to see details" },
      { element: "rsvp_button", text: "RSVP to reserve your spot" },
      { element: "event_reminder", text: "You'll get reminders" }
    ],
    estimatedTime: 4
  },
  recognition_basics: {
    id: "recognition_basics",
    name: "Giving Recognition",
    description: "Celebrate your teammates",
    highlights: [
      { element: "recognition_nav", text: "Open the Recognition page" },
      { element: "recognition_form", text: "Fill out who and why" },
      { element: "visibility_toggle", text: "Choose visibility" },
      { element: "submit_recognition", text: "Post to celebrate!" }
    ],
    estimatedTime: 3
  },
  teams_and_channels: {
    id: "teams_and_channels",
    name: "Joining Teams & Channels",
    description: "Connect with your team",
    highlights: [
      { element: "teams_nav", text: "Browse teams" },
      { element: "team_card", text: "See team details" },
      { element: "join_button", text: "Join teams you're interested in" },
      { element: "channels", text: "Chat with your team" }
    ],
    estimatedTime: 4
  },
  leaderboards: {
    id: "leaderboards",
    name: "Exploring Leaderboards",
    description: "See where you stand",
    highlights: [
      { element: "leaderboard_nav", text: "View different leaderboards" },
      { element: "tabs", text: "Switch between categories" },
      { element: "your_rank", text: "See your rank" },
      { element: "tier_badge", text: "Earn tier badges" }
    ],
    estimatedTime: 3
  }
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, flowType = 'full_onboarding', stepData = {} } = await req.json();

    // GET FLOW DEFINITION
    if (action === 'get_flow') {
      const flow = ONBOARDING_FLOWS[flowType];
      return Response.json({
        success: true,
        flow,
        totalSteps: flow.length,
        estimatedTotalTime: flow.reduce((sum, s) => sum + s.estimatedTime, 0)
      });
    }

    // SAVE STEP PROGRESS
    if (action === 'save_step') {
      const existing = await base44.entities.OnboardingFlow.filter({
        user_email: user.email
      });

      const flowData = {
        user_email: user.email,
        flow_type: flowType,
        current_step: stepData.stepIndex,
        completed_steps: [...(existing[0]?.completed_steps || []), stepData.stepIndex],
        step_data: { ...existing[0]?.step_data, ...stepData.data },
        quick_start_mode: flowType === 'quick_start',
        started_at: existing[0]?.started_at || new Date().toISOString()
      };

      if (existing.length > 0) {
        await base44.entities.OnboardingFlow.update(existing[0].id, flowData);
      } else {
        await base44.entities.OnboardingFlow.create(flowData);
      }

      return Response.json({ success: true, step: stepData.stepIndex });
    }

    // COMPLETE ONBOARDING
    if (action === 'complete_onboarding') {
      const existing = await base44.entities.OnboardingFlow.filter({
        user_email: user.email
      });

      if (existing.length > 0) {
        await base44.entities.OnboardingFlow.update(existing[0].id, {
          is_complete: true,
          completion_date: new Date().toISOString(),
          time_to_complete_minutes: Math.round(
            (new Date() - new Date(existing[0].started_at)) / 60000
          )
        });

        // Generate initial nudges based on preferences
        await generateInitialNudges(base44, user, existing[0].step_data);
      }

      return Response.json({ success: true, message: 'Onboarding completed!' });
    }

    // GET TUTORIAL
    if (action === 'get_tutorial') {
      const { tutorialId } = await req.json();
      const tutorial = TUTORIALS[tutorialId];

      if (!tutorial) {
        return Response.json({ error: 'Tutorial not found' }, { status: 404 });
      }

      return Response.json({
        success: true,
        tutorial,
        highlights: tutorial.highlights
      });
    }

    // SKIP STEP
    if (action === 'skip_step') {
      const { stepIndex } = await req.json();
      const existing = await base44.entities.OnboardingFlow.filter({
        user_email: user.email
      });

      if (existing.length > 0) {
        await base44.entities.OnboardingFlow.update(existing[0].id, {
          skipped_steps: [...(existing[0]?.skipped_steps || []), stepIndex]
        });
      }

      return Response.json({ success: true });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Onboarding flow error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function generateInitialNudges(base44, user, preferences) {
  const nudges = [];

  // Nudge 1: Portfolio goals not set
  if (!preferences?.portfolio_goals) {
    nudges.push({
      user_email: user.email,
      nudge_type: 'setup_incomplete',
      nudge_category: 'portfolio_missing',
      message: "Set your growth goals to get personalized activity recommendations",
      suggested_action: 'complete_setup',
      priority: 'medium',
      display_location: 'banner',
      ai_generated: true
    });
  }

  // Nudge 2: Community interests not set
  if (!preferences?.community_interests || preferences.community_interests.length === 0) {
    nudges.push({
      user_email: user.email,
      nudge_type: 'community_discovery',
      nudge_category: 'no_communities',
      message: "Discover teams and channels where you can connect with peers",
      suggested_action: 'join_team',
      priority: 'medium',
      display_location: 'sidebar',
      ai_generated: true
    });
  }

  // Create nudges
  for (const nudge of nudges) {
    await base44.entities.OnboardingNudge.create({
      ...nudge,
      created_at: new Date().toISOString()
    });
  }

  return nudges;
}