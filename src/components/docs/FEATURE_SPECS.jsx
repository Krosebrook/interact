
/**
 * TEAM ENGAGE - FEATURE SPECIFICATIONS
 * Detailed Feature Documentation
 * Version: 2.0.0
 * Last Updated: 2025-11-30
 */

export const FEATURE_SPECS = {
  meta: {
    version: "2.0.0",
    lastUpdated: "2025-11-30"
  },

  leaderboardSystem: {
    name: "Leaderboard System",
    status: "Complete",
    description: "Multi-category ranking system with time filtering and social features",
    
    categories: {
      points: {
        field: "total_points / lifetime_points",
        description: "Total points earned",
        icon: "🏆"
      },
      events: {
        field: "events_attended",
        description: "Number of events attended",
        icon: "📅"
      },
      badges: {
        field: "badges_earned.length",
        description: "Number of badges earned",
        icon: "🎖️"
      },
      engagement: {
        calculation: "Weighted score combining multiple metrics",
        weights: {
          events_attended: 10,
          activities_completed: 15,
          feedback_submitted: 5,
          streak_days: 2,
          badges_earned: 20
        },
        icon: "⚡"
      }
    },

    timePeriods: {
      daily: "Today's rankings",
      weekly: "This week's rankings",
      monthly: "This month's rankings",
      all_time: "All-time rankings"
    },

    myRankFeature: {
      display: [
        "Current rank number",
        "Score in selected category",
        "Percentile position",
        "Nearby competitors (2 above, 2 below)"
      ]
    },

    components: [
      "components/leaderboard/Leaderboard.jsx - Main container",
      "components/leaderboard/LeaderboardRow.jsx - Individual ranking row",
      "components/leaderboard/LeaderboardFilters.jsx - Category/period filters",
      "components/leaderboard/MyRankCard.jsx - Current user rank display",
      "components/leaderboard/hooks/useLeaderboard.js - Data and ranking logic"
    ],

    scalabilityNotes: [
      "Currently processes up to 500 users client-side",
      "LeaderboardSnapshot entity supports server-side pre-aggregation",
      "Consider implementing batch updates for large user bases"
    ]
  },

  socialLayer: {
    name: "Social Layer",
    status: "Complete",
    description: "Follow/block relationships and public profiles",

    relationships: {
      follow: {
        status: "active",
        description: "User follows another user"
      },
      block: {
        status: "blocked",
        description: "User blocks another user"
      }
    },

    publicProfile: {
      visibleFields: [
        "Display name and bio",
        "Avatar image",
        "Join date",
        "Total points and level",
        "Events attended",
        "Badges earned",
        "Streak days"
      ],
      privacySettings: [
        "public - Visible to all users",
        "private - Hidden from non-followers"
      ]
    },

    components: [
      "components/profile/PublicProfileCard.jsx - Profile display",
      "components/profile/hooks/useSocialActions.js - Follow/block mutations",
      "pages/PublicProfile.jsx - Profile page"
    ],

    futureExtensions: [
      "Direct messaging between users",
      "Activity feed from followed users",
      "Mutual follows indicator"
    ]
  },

  pointStore: {
    name: "Point Store",
    status: "Complete",
    description: "Avatar customization and power-up marketplace",

    itemCategories: {
      avatar_hat: "Hat accessories",
      avatar_glasses: "Eyewear accessories",
      avatar_background: "Profile backgrounds",
      avatar_frame: "Profile frames",
      avatar_effect: "Special effects",
      power_up: "Time-limited boosts",
      badge_boost: "Badge-related boosts"
    },

    raritySystem: {
      common: { color: "slate", multiplier: 1 },
      uncommon: { color: "green", multiplier: 1.5 },
      rare: { color: "blue", multiplier: 2 },
      epic: { color: "purple", multiplier: 3 },
      legendary: { color: "amber", multiplier: 5 }
    },

    purchaseTypes: {
      points: "Use accumulated points",
      stripe: "Real money via Stripe checkout"
    },

    powerUpEffects: {
      points_multiplier: "Multiply points earned",
      visibility_boost: "Increased profile visibility",
      badge_glow: "Special badge effects",
      streak_freeze: "Protect streak from breaking"
    },

    components: [
      "pages/PointStore.jsx - Main store page",
      "components/store/StoreItemCard.jsx - Item preview",
      "components/store/StoreItemDetail.jsx - Item detail modal",
      "components/store/AvatarCustomizer.jsx - Avatar editor",
      "components/store/AvatarPreview.jsx - Live preview",
      "components/store/InventorySelector.jsx - Owned items",
      "components/store/hooks/useStoreActions.js - Purchase mutations",
      "components/store/hooks/useAvatarCustomization.js - Avatar state"
    ],

    backendFunctions: [
      "functions/purchaseWithPoints.js - Points purchases",
      "functions/createStoreCheckout.js - Stripe checkout",
      "functions/storeWebhook.js - Payment webhooks"
    ]
  },

  moderationSystem: {
    name: "Content Moderation",
    status: "Complete",
    description: "AI-powered content review for user-generated content",

    flagReasons: {
      inappropriate: { severity: "high", description: "Inappropriate content" },
      spam: { severity: "medium", description: "Spam/promotional content" },
      bias: { severity: "medium", description: "Potential bias detected" },
      low_quality: { severity: "low", description: "Low quality content" },
      needs_review: { severity: "medium", description: "Needs human review" }
    },

    workflow: [
      "1. Content submitted (Recognition posts)",
      "2. Optional: AI analysis on submission",
      "3. Flagged content appears in moderation queue",
      "4. Admin reviews with AI suggestions",
      "5. Approve or reject with notes",
      "6. Audit trail maintained"
    ],

    aiAnalysis: {
      checks: [
        "Inappropriate language",
        "Spam/promotional content",
        "Bias detection (gender, racial, age)",
        "Quality assessment",
        "Policy violations"
      ],
      output: {
        is_safe: "boolean",
        flag_reason: "string",
        confidence: "0-1 score",
        explanation: "string",
        suggestion: "string"
      }
    },

    components: [
      "components/moderation/ModerationQueue.jsx - Queue interface",
      "components/moderation/ModerationItem.jsx - Individual item",
      "components/moderation/hooks/useModerationActions.js - Mutations"
    ]
  },

  gamificationSystem: {
    name: "Gamification System",
    status: "Complete",
    description: "Points, levels, badges, and streaks",

    pointsEarning: {
      attendance: { points: 10, trigger: "Event attendance confirmed" },
      activity_completion: { points: 15, trigger: "Activity submission" },
      feedback: { points: 5, trigger: "Post-event feedback" },
      high_engagement: { points: 5, trigger: "Engagement score >= 4" },
      recognition_sent: { points: 5, trigger: "Sending recognition" },
      recognition_received: { points: 10, trigger: "Receiving recognition" }
    },

    levelProgression: {
      formula: "Math.floor(total_points / 100) + 1",
      notifications: "Level-up notification sent automatically"
    },

    badgeSystem: {
      awardTypes: {
        automatic: "Based on criteria thresholds",
        manual: "Admin-awarded special badges"
      },
      criteriaTypes: [
        "events_attended",
        "feedback_submitted",
        "activities_completed",
        "points_total",
        "streak_days",
        "media_uploads",
        "peer_recognitions"
      ],
      categories: [
        "engagement",
        "collaboration",
        "innovation",
        "community",
        "leadership",
        "special",
        "seasonal",
        "challenge"
      ]
    },

    streakTracking: {
      increment: "Daily activity check",
      reset: "No activity for 24 hours",
      freezeOption: "Power-up can prevent reset"
    },

    teamPoints: {
      aggregation: "Sum of member points",
      tracking: "weekly_points, monthly_points, total_points"
    }
  },

  recognitionSystem: {
    name: "Peer Recognition",
    status: "Complete",
    description: "Public shoutouts and appreciation",

    categories: [
      "teamwork",
      "innovation",
      "leadership",
      "going_above",
      "customer_focus",
      "problem_solving",
      "mentorship",
      "culture_champion"
    ],

    features: [
      "AI-powered message suggestions",
      "Company values tagging",
      "Visibility controls",
      "Reactions and comments",
      "Admin featuring",
      "Points awarding"
    ],

    moderationIntegration: [
      "AI flagging on submission",
      "Status workflow (pending → approved/flagged/rejected)",
      "Admin review queue"
    ]
  },

  notificationSystem: {
    name: "Notifications",
    status: "Complete",
    description: "In-app notification management",

    notificationTypes: [
      "badge_alerts - New badge earned",
      "level_up_alerts - Level progression",
      "recognition_alerts - Recognition received",
      "event_reminders - Upcoming events",
      "success - General success messages"
    ],

    features: [
      "Unread count badge",
      "Mark as read (single/all)",
      "Delete notifications",
      "User preference controls",
      "Type-based icons"
    ],

    component: "components/notifications/NotificationBell.jsx"
  }
};

export default FEATURE_SPECS;
