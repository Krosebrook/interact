
/**
 * TEAM ENGAGE - ARCHITECTURE DOCUMENTATION
 * Refactored Architecture v3.0
 * Last Updated: 2025-11-30
 */

export const ARCHITECTURE = {
  meta: { version: "3.0.0", lastUpdated: "2025-11-30" },

  coreLibraries: {
    "components/lib/api.js": {
      description: "Centralized API layer for all entity operations",
      exports: [
        "QUERY_CONFIG - Caching configuration",
        "UserService - Authentication operations",
        "UserPointsService - Points CRUD",
        "UserProfileService - Profile CRUD",
        "RecognitionService - Recognition CRUD",
        "EventService - Event CRUD",
        "ActivityService - Activity CRUD",
        "ParticipationService - Participation CRUD",
        "StoreService - Store + inventory + avatar",
        "SocialService - Follow/block operations",
        "ChannelService - Channel + messaging",
        "TeamService - Team operations",
        "BadgeService - Badge + awards",
        "NotificationService - Notification CRUD",
        "BackendFunctions - Backend function calls",
        "Integrations - Core integrations wrapper"
      ]
    },
    "components/lib/constants.js": {
      description: "All configuration and enums",
      exports: [
        "POINTS_CONFIG - Points per action",
        "LEVEL_THRESHOLDS - Level progression",
        "BADGE_RARITIES - Rarity configuration",
        "LEADERBOARD_CATEGORIES - Ranking categories",
        "TIME_PERIODS - Time filtering",
        "ENGAGEMENT_WEIGHTS - Score calculation",
        "STORE_CATEGORIES - Item categories",
        "AVATAR_SLOTS - Customization slots",
        "RECOGNITION_CATEGORIES - Recognition types",
        "FLAG_REASONS - Moderation flags",
        "EVENT_TYPES - Activity types",
        "CHANNEL_TYPES - Channel types",
        "AI_MODELS - Available AI models"
      ]
    },
    "components/lib/utils.js": {
      description: "Pure utility functions",
      exports: [
        "Date utilities - formatDate, getRelativeTime, isUpcoming",
        "Gamification - calculateLevel, calculateEngagementScore, getPercentile",
        "Events - filterUpcomingEvents, getParticipationStats",
        "Strings - truncate, capitalize, getInitials",
        "Numbers - formatNumber, formatCurrency",
        "Arrays - groupBy, sortBy, uniqueBy",
        "Validation - isValidEmail, validateRequired"
      ]
    }
  },

  hooksArchitecture: {
    "components/hooks/useAuth.js": {
      description: "Authentication hook",
      exports: ["useAuth - Core auth state", "useUserData - Auth + profile + points"]
    },
    "components/hooks/useEntities.js": {
      description: "Entity data fetching hooks",
      exports: [
        "useEvents - Events + activities + participations",
        "useRecognitions - Recognition queries",
        "useRecognitionMutations - CRUD mutations",
        "useLeaderboardData - Raw leaderboard data",
        "useStoreItems - Store catalog",
        "useUserInventory - User inventory",
        "useUserAvatar - Avatar configuration",
        "useStorePurchase - Purchase mutations",
        "useSocial - Follow/block operations",
        "useTeams - Team data",
        "useBadges - Badge data",
        "useChannels - Channel data",
        "useNotifications - Notification management",
        "useAI - AI integration mutations"
      ]
    },
    "components/hooks/useLeaderboard.js": {
      description: "Optimized leaderboard with Map lookup",
      features: [
        "O(1) profile lookup using Map",
        "Memoized score calculations",
        "Tie-handling in rankings",
        "My rank + nearby users"
      ]
    }
  },

  backendFunctions: {
    "functions/awardPoints.js": {
      description: "Points awarding with badges and team updates",
      features: [
        "Duplicate award prevention",
        "Level progression",
        "Automatic badge awards",
        "Team point aggregation",
        "Notification creation"
      ]
    },
    "functions/purchaseWithPoints.js": {
      description: "Store purchase processing",
      features: [
        "Item validation",
        "Points balance check",
        "Stock management",
        "Inventory creation",
        "Power-up activation"
      ]
    },
    "functions/openaiIntegration.js": {
      description: "Full OpenAI integration",
      actions: ["chat", "reasoning", "embedding", "image", "vision", "tts", "transcribe", "moderation"]
    },
    "functions/claudeIntegration.js": {
      description: "Full Claude integration",
      actions: ["chat", "vision", "analyze_document", "extended_thinking", "tool_use"]
    },
    "functions/geminiIntegration.js": {
      description: "Full Gemini integration",
      actions: ["chat", "vision", "video", "thinking", "embedding", "code", "function_calling", "count_tokens"]
    }
  },

  dataFlow: `
    Page/Component
         │
         ├─► useAuth / useUserData (authentication)
         │
         ├─► useEntities hooks (data fetching)
         │         │
         │         └─► Service Layer (components/lib/api.js)
         │                   │
         │                   └─► base44.entities.* / base44.functions.invoke
         │
         └─► Constants + Utils (configuration & transformations)
  `
};

export default ARCHITECTURE;
