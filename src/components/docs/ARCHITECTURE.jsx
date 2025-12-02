/**
 * INTERACT - ARCHITECTURE DOCUMENTATION
 * Refactored Architecture v4.0
 * Last Updated: 2025-12-02
 */

export const ARCHITECTURE = {
  meta: { 
    version: "4.0.0", 
    lastUpdated: "2025-12-02",
    description: "Clean architecture with AI-powered features, advanced analytics, and modular design"
  },

  // ============================================================================
  // DIRECTORY STRUCTURE
  // ============================================================================
  directoryStructure: `
├── components/
│   ├── activities/           # Activity management
│   │   ├── ActivityCard.jsx
│   │   ├── ActivitiesFilters.jsx
│   │   ├── ActivitiesHeader.jsx
│   │   ├── ActivityDetailDialog.jsx
│   │   ├── AIActivitySuggester.jsx
│   │   ├── ModuleBuilder.jsx
│   │   └── useActivityFilters.jsx
│   │
│   ├── admin/                # Admin configuration panels
│   │   ├── GamificationConfigPanel.jsx    [NEW v4]
│   │   └── RoleManagement.jsx
│   │
│   ├── ai/                   # AI-powered features
│   │   ├── ActivityGenerator.jsx
│   │   ├── AISuggestionsWidget.jsx
│   │   ├── AIActivityPlanner.jsx
│   │   ├── AIEventThemeGenerator.jsx
│   │   └── SmartSchedulingAssistant.jsx
│   │
│   ├── analytics/            # Analytics dashboards
│   │   ├── gamification/     [NEW v4]
│   │   │   ├── AIInsightsGenerator.jsx
│   │   │   ├── EngagementTrendsChart.jsx
│   │   │   ├── BadgeDistributionAnalysis.jsx
│   │   │   ├── ChallengePerformanceMetrics.jsx
│   │   │   ├── LeaderboardDynamicsAnalysis.jsx
│   │   │   └── ABTestingFramework.jsx
│   │   ├── EngagementAnalytics.jsx
│   │   ├── FeedbackAnalyzer.jsx
│   │   └── useAnalyticsData.jsx
│   │
│   ├── channels/             # Team communication
│   │   ├── ChannelList.jsx
│   │   ├── ChannelChat.jsx
│   │   └── CreateChannelDialog.jsx
│   │
│   ├── common/               # Shared UI components
│   │   ├── LoadingSpinner.jsx
│   │   ├── EmptyState.jsx
│   │   ├── ErrorBoundary.jsx
│   │   ├── PageHeader.jsx
│   │   ├── StatsGrid.jsx
│   │   ├── FilterChip.jsx
│   │   ├── AnimatedButton.jsx
│   │   ├── AnimatedCard.jsx
│   │   └── ProtectedRoute.jsx
│   │
│   ├── docs/                 # Documentation
│   │   ├── PRD_MASTER.jsx
│   │   ├── ARCHITECTURE.jsx
│   │   ├── README.jsx
│   │   └── FEATURE_SPECS/
│   │
│   ├── events/               # Event management
│   │   ├── EventCalendarCard.jsx
│   │   ├── EventsList.jsx
│   │   ├── ScheduleEventDialog.jsx
│   │   ├── EventSeriesCreator.jsx
│   │   ├── BulkEventScheduler.jsx
│   │   └── useEventActions.jsx
│   │
│   ├── facilitator/          # Facilitator tools
│   │   ├── FacilitatorDashboard.jsx
│   │   ├── FacilitatorAgentChat.jsx
│   │   ├── LiveCoachingWidget.jsx
│   │   └── PostEventRecap.jsx
│   │
│   ├── gamification/         # Core gamification
│   │   ├── BadgeCard.jsx
│   │   ├── BadgeShowcase.jsx
│   │   ├── ChallengeCard.jsx
│   │   ├── LeaderboardRow.jsx
│   │   ├── XPProgressRing.jsx
│   │   ├── AnimatedPointsCounter.jsx
│   │   ├── StreakFlame.jsx
│   │   ├── RewardCard.jsx
│   │   ├── PersonalChallengeCard.jsx    [NEW v4]
│   │   ├── PersonalChallengesSection.jsx [NEW v4]
│   │   ├── AchievementTierCard.jsx       [NEW v4]
│   │   ├── AchievementTiersSection.jsx   [NEW v4]
│   │   ├── SocialShareCard.jsx           [NEW v4]
│   │   ├── SocialFeedSection.jsx         [NEW v4]
│   │   ├── TailoredLeaderboardFormats.jsx [NEW v4]
│   │   ├── PersonalizedRecommendationsEngine.jsx [NEW v4]
│   │   └── GamificationAnalyticsDashboard.jsx
│   │
│   ├── hooks/                # Shared React hooks
│   │   ├── index.jsx         # Barrel export
│   │   ├── useAuth.jsx
│   │   ├── useUserData.jsx
│   │   ├── useUserProfile.jsx
│   │   ├── useEventData.jsx
│   │   ├── useEventScheduling.jsx
│   │   ├── useActivities.jsx
│   │   ├── useTeamData.jsx
│   │   ├── useGamificationData.jsx
│   │   ├── useLeaderboard.jsx
│   │   ├── useEntities.jsx
│   │   ├── useFormState.jsx
│   │   └── usePermissions.jsx
│   │
│   ├── leaderboard/          # Leaderboard components
│   │   ├── Leaderboard.jsx
│   │   ├── LeaderboardRow.jsx
│   │   ├── MyRankCard.jsx
│   │   ├── LeaderboardFilters.jsx
│   │   └── hooks/useLeaderboard.jsx
│   │
│   ├── lib/                  # Core utilities
│   │   ├── api.js            # Entity services, backend calls
│   │   ├── constants.js      # All enums and config
│   │   ├── utils.js          # Pure utility functions
│   │   ├── queryKeys.js      # React Query key factory
│   │   ├── cacheConfig.js    # Cache timing
│   │   ├── config.js         # Feature flags
│   │   └── index.js          # Barrel export
│   │
│   ├── moderation/           # Content moderation
│   │   ├── ModerationQueue.jsx
│   │   ├── ModerationItem.jsx
│   │   └── hooks/useModerationActions.jsx
│   │
│   ├── notifications/        # Notification system
│   │   └── NotificationBell.jsx
│   │
│   ├── participant/          # Participant features
│   │   ├── ParticipantEventCard.jsx
│   │   ├── PersonalizedRecommendations.jsx
│   │   ├── UserStatsCards.jsx
│   │   └── FeedbackForm.jsx
│   │
│   ├── profile/              # User profiles
│   │   ├── ProfileHeader.jsx
│   │   ├── ProfileBadgesShowcase.jsx
│   │   ├── ActivityHistoryTimeline.jsx
│   │   ├── SkillsInterestsManager.jsx
│   │   ├── ContributionsShowcase.jsx
│   │   └── hooks/useSocialActions.jsx
│   │
│   ├── pwa/                  # Progressive Web App
│   │   ├── PWAInstallPrompt.jsx
│   │   └── ServiceWorkerInit.jsx
│   │
│   ├── recognition/          # Peer recognition
│   │   ├── RecognitionCard.jsx
│   │   ├── RecognitionForm.jsx
│   │   └── ModerationQueue.jsx
│   │
│   ├── settings/             # Settings panels
│   │   ├── PointsConfigPanel.jsx
│   │   ├── BadgeCriteriaManager.jsx
│   │   └── TeamStructureManager.jsx
│   │
│   ├── skills/               # Skill tracking
│   │   ├── SkillProgressCard.jsx
│   │   ├── UserSkillDashboard.jsx
│   │   └── AISkillAnalyzer.jsx
│   │
│   ├── store/                # Point store
│   │   ├── StoreItemCard.jsx
│   │   ├── StoreItemDetail.jsx
│   │   ├── AvatarCustomizer.jsx
│   │   ├── AvatarPreview.jsx
│   │   └── hooks/
│   │       ├── useStoreActions.jsx
│   │       └── useAvatarCustomization.jsx
│   │
│   ├── teams/                # Team management
│   │   ├── TeamCard.jsx
│   │   ├── MyTeamCard.jsx
│   │   ├── CreateTeamDialog.jsx
│   │   ├── TeamVsTeamLeaderboard.jsx
│   │   ├── TeamChallengeCard.jsx
│   │   └── useTeamActions.jsx
│   │
│   └── utils/                # Domain utilities
│       ├── eventUtils.js
│       ├── formatters.js
│       ├── validators.js
│       └── constants.js
│
├── entities/                 # JSON schemas (50+ entities)
│
├── functions/                # Backend serverless functions
│   ├── awardPoints.js
│   ├── purchaseWithPoints.js
│   ├── openaiIntegration.js
│   ├── claudeIntegration.js
│   ├── geminiIntegration.js
│   ├── sendTeamsNotification.js
│   ├── generateCalendarFile.js
│   ├── createNotification.js
│   └── lib/
│       ├── types.js
│       └── middleware.js
│
├── pages/                    # Page components (flat)
│   ├── Dashboard.jsx
│   ├── FacilitatorDashboard.jsx
│   ├── ParticipantPortal.jsx
│   ├── Activities.jsx
│   ├── Calendar.jsx
│   ├── Teams.jsx
│   ├── Channels.jsx
│   ├── Recognition.jsx
│   ├── Leaderboards.jsx
│   ├── GamificationDashboard.jsx
│   ├── AdvancedGamificationAnalytics.jsx  [NEW v4]
│   ├── GamificationSettings.jsx
│   ├── Analytics.jsx
│   ├── UserProfile.jsx
│   ├── PublicProfile.jsx
│   ├── PointStore.jsx
│   ├── RewardsStore.jsx
│   ├── Settings.jsx
│   ├── Integrations.jsx
│   ├── Documentation.jsx
│   ├── ProjectPlan.jsx
│   ├── ParticipantEvent.jsx
│   ├── FacilitatorView.jsx
│   └── RoleSelection.jsx
│
├── agents/                   # AI agent configs
│   ├── EventManagerAgent.json
│   ├── FacilitatorAssistant.json
│   ├── GamificationAssistant.json
│   └── PersonalizedGamificationCoach.json
│
├── Layout.jsx                # App layout with navigation
└── globals.css               # Tailwind + CSS variables
  `,

  // ============================================================================
  // CORE LIBRARIES
  // ============================================================================
  coreLibraries: {
    "components/lib/api.js": {
      description: "Centralized API layer for all entity operations and backend calls",
      exports: [
        "QUERY_CONFIG - Caching configuration",
        "UserService - Authentication operations",
        "UserPointsService - Points CRUD + mutations",
        "UserProfileService - Profile CRUD",
        "RecognitionService - Recognition CRUD",
        "EventService - Event CRUD + scheduling",
        "ActivityService - Activity CRUD",
        "ParticipationService - Participation CRUD",
        "StoreService - Store + inventory + avatar",
        "SocialService - Follow/block operations",
        "ChannelService - Channel + messaging",
        "TeamService - Team operations",
        "BadgeService - Badge + awards",
        "ChallengeService - Personal + team challenges",
        "TierService - Achievement tier operations",
        "ABTestService - A/B testing operations",
        "ConfigService - Gamification config",
        "NotificationService - Notification CRUD",
        "BackendFunctions - Backend function calls",
        "Integrations - Core integrations wrapper"
      ]
    },
    "components/lib/constants.js": {
      description: "All configuration, enums, and static data",
      exports: [
        "POINTS_CONFIG - Points per action",
        "LEVEL_THRESHOLDS - Level progression",
        "BADGE_RARITIES - Rarity configuration",
        "BADGE_CATEGORIES - Badge categorization",
        "LEADERBOARD_CATEGORIES - Ranking categories",
        "TIME_PERIODS - Time filtering options",
        "ENGAGEMENT_WEIGHTS - Score calculation weights",
        "STORE_CATEGORIES - Item categories",
        "AVATAR_SLOTS - Customization slots",
        "POWER_UP_TYPES - Power-up definitions",
        "RECOGNITION_CATEGORIES - Recognition types",
        "RECOGNITION_VISIBILITY - Visibility options",
        "MODERATION_STATUS - Moderation states",
        "FLAG_REASONS - Flag reasons",
        "EVENT_TYPES - Activity types",
        "EVENT_STATUS - Event states",
        "EVENT_FORMATS - Online/offline/hybrid",
        "DURATION_OPTIONS - Event durations",
        "CHANNEL_TYPES - Channel categories",
        "CHANNEL_VISIBILITY - Channel access",
        "BRAND_COLORS - Theme colors",
        "GRADIENT_CLASSES - Tailwind gradients",
        "NOTIFICATION_TYPES - Notification categories",
        "AI_MODELS - Available AI models",
        "INTEGRATION_KEYS - API key names"
      ]
    },
    "components/lib/utils.js": {
      description: "Pure utility functions",
      categories: {
        date: ["formatDate", "getRelativeTime", "isUpcoming", "isToday", "getDateRange"],
        gamification: ["calculateLevel", "calculateEngagementScore", "getPercentile", "getLevelTitle"],
        events: ["filterUpcomingEvents", "filterPastEvents", "getParticipationStats", "getEventActivity"],
        strings: ["truncate", "capitalize", "getInitials", "slugify"],
        numbers: ["formatNumber", "formatCurrency", "formatPercent"],
        arrays: ["groupBy", "sortBy", "uniqueBy", "chunk"],
        validation: ["isValidEmail", "validateRequired", "validateLength"]
      }
    },
    "components/lib/queryKeys.js": {
      description: "React Query key factory for consistent caching",
      pattern: "queryKeys.entity.action(params)"
    },
    "components/lib/cacheConfig.js": {
      description: "Cache timing presets for different data types",
      presets: ["realTime", "frequent", "standard", "stable", "static"]
    }
  },

  // ============================================================================
  // HOOKS ARCHITECTURE
  // ============================================================================
  hooksArchitecture: {
    authentication: {
      "useAuth": "Core auth state and methods",
      "useUserData": "Auth + profile + points + role routing",
      "usePermissions": "Role-based permission checking"
    },
    data: {
      "useEventData": "Events + activities + participations",
      "useActivities": "Activity list + mutations",
      "useTeamData": "Teams + memberships",
      "useGamificationData": "Points + badges + challenges",
      "useLeaderboard": "Optimized leaderboard with O(1) lookup",
      "useUserProfile": "User profile + avatar + social"
    },
    actions: {
      "useEventScheduling": "Event creation with recurrence",
      "useEventActions": "Event mutations (cancel, remind, recap)",
      "useTeamActions": "Team mutations",
      "useStoreActions": "Purchase mutations",
      "useSocialActions": "Follow/block mutations",
      "useModerationActions": "Moderation mutations"
    },
    forms: {
      "useFormState": "Generic form state management",
      "useDialogForm": "Form + dialog state combined"
    }
  },

  // ============================================================================
  // BACKEND FUNCTIONS
  // ============================================================================
  backendFunctions: {
    gamification: {
      "awardPoints": {
        description: "Award points with badges and team updates",
        features: ["Duplicate prevention", "Level progression", "Auto badges", "Team aggregation"]
      },
      "purchaseWithPoints": {
        description: "Store purchase processing",
        features: ["Validation", "Balance check", "Stock management", "Inventory creation"]
      }
    },
    ai: {
      "openaiIntegration": {
        actions: ["chat", "reasoning", "embedding", "image", "vision", "tts", "transcribe", "moderation"]
      },
      "claudeIntegration": {
        actions: ["chat", "vision", "analyze_document", "extended_thinking", "tool_use"]
      },
      "geminiIntegration": {
        actions: ["chat", "vision", "video", "thinking", "embedding", "code", "function_calling", "count_tokens"]
      }
    },
    notifications: {
      "sendTeamsNotification": "Teams webhook integration",
      "slackNotifications": "Slack integration",
      "createNotification": "In-app notifications"
    },
    calendar: {
      "generateCalendarFile": "ICS file generation",
      "googleCalendarSync": "Google Calendar integration"
    }
  },

  // ============================================================================
  // DATA FLOW
  // ============================================================================
  dataFlow: `
    ┌─────────────────────────────────────────────────────────────────────────┐
    │                           USER INTERFACE                                 │
    ├─────────────────────────────────────────────────────────────────────────┤
    │  Pages (Dashboard, Calendar, Gamification, etc.)                        │
    │     │                                                                   │
    │     ├─► Components (Cards, Forms, Dialogs, Charts)                      │
    │     │                                                                   │
    │     └─► Layout (Navigation, Header, Footer)                             │
    └─────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
    ┌─────────────────────────────────────────────────────────────────────────┐
    │                          STATE MANAGEMENT                                │
    ├─────────────────────────────────────────────────────────────────────────┤
    │  Custom Hooks                                                           │
    │     ├─► useUserData (auth + profile + points)                           │
    │     ├─► useEventData (events + activities + participations)             │
    │     ├─► useGamificationData (badges + challenges + leaderboard)         │
    │     └─► useFormState (form management)                                  │
    │                                                                         │
    │  React Query                                                            │
    │     ├─► queryKeys.js (consistent key management)                        │
    │     ├─► cacheConfig.js (timing presets)                                 │
    │     └─► Optimistic updates + background refetch                         │
    └─────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
    ┌─────────────────────────────────────────────────────────────────────────┐
    │                           API LAYER                                      │
    ├─────────────────────────────────────────────────────────────────────────┤
    │  Service Layer (components/lib/api.js)                                  │
    │     ├─► Entity Services (CRUD operations)                               │
    │     ├─► Backend Functions (complex operations)                          │
    │     └─► Integrations (AI, Stripe, etc.)                                 │
    └─────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
    ┌─────────────────────────────────────────────────────────────────────────┐
    │                           BACKEND                                        │
    ├─────────────────────────────────────────────────────────────────────────┤
    │  Base44 Platform                                                        │
    │     ├─► Entities (NoSQL database)                                       │
    │     ├─► Functions (Deno Deploy serverless)                              │
    │     ├─► Auth (SSO-ready authentication)                                 │
    │     └─► Integrations (Core.*, custom functions)                         │
    └─────────────────────────────────────────────────────────────────────────┘
  `,

  // ============================================================================
  // DESIGN PATTERNS
  // ============================================================================
  patterns: {
    composition: "Large pages decomposed into focused components",
    barrelExports: "index.js files for clean imports",
    serviceLayer: "Centralized entity operations in api.js",
    hookExtraction: "Complex logic extracted into custom hooks",
    constantsCentralization: "All config in constants.js for type safety",
    queryKeyFactory: "Consistent caching with queryKeys.js",
    protectedRoutes: "Role-based access with ProtectedRoute component",
    optimisticUpdates: "React Query mutations with optimistic UI",
    errorBoundaries: "Graceful error handling at component level"
  },

  // ============================================================================
  // PERFORMANCE OPTIMIZATIONS
  // ============================================================================
  performance: {
    caching: "React Query with appropriate stale times per data type",
    memoization: "useMemo for expensive calculations (leaderboard, filters)",
    lazyLoading: "Dynamic imports for large components",
    virtualization: "Virtual lists for long leaderboards (future)",
    mapLookup: "O(1) profile lookup in leaderboard using Map",
    parallelQueries: "Batch independent queries with useQueries"
  }
};

export default ARCHITECTURE;