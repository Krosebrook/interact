
/**
 * TEAM ENGAGE - FEATURE SPECIFICATIONS
 * Refactored Feature Documentation v3.0
 * Last Updated: 2025-11-30
 */

export const FEATURE_SPECS = {
  meta: { version: "3.0.0", lastUpdated: "2025-11-30" },

  aiIntegrations: {
    status: "✅ Complete - Max Depth",
    
    openai: {
      models: {
        chat: "gpt-4o (latest GPT-4o)",
        reasoning: "o1 (reasoning model)",
        mini: "gpt-4o-mini (fast/cheap)",
        embedding: "text-embedding-3-large",
        image: "dall-e-3",
        tts: "tts-1-hd",
        stt: "whisper-1"
      },
      capabilities: [
        "Chat completion with JSON mode",
        "o1 reasoning for complex problems",
        "Large embeddings (3072 dimensions)",
        "HD image generation",
        "Vision analysis (images)",
        "HD text-to-speech",
        "Speech-to-text transcription",
        "Content moderation"
      ]
    },
    
    claude: {
      models: {
        sonnet: "claude-sonnet-4-20250514 (Claude 4)",
        haiku: "claude-3-5-haiku-20241022 (fast)"
      },
      capabilities: [
        "Chat with system prompts",
        "Vision (image analysis)",
        "Document analysis (PDF)",
        "Extended thinking mode",
        "Tool/function calling"
      ]
    },
    
    gemini: {
      models: {
        pro: "gemini-2.0-flash",
        thinking: "gemini-2.0-flash-thinking-exp-01-21",
        embedding: "text-embedding-004"
      },
      capabilities: [
        "Chat completion",
        "Vision (image analysis)",
        "Video analysis",
        "Thinking mode for complex reasoning",
        "Code generation",
        "Function calling",
        "Token counting",
        "Embeddings"
      ]
    }
  },

  refactoredFeatures: {
    leaderboard: {
      description: "Multi-category ranking with optimized lookups",
      improvements: [
        "O(1) profile lookup using Map instead of O(N*M) array.find()",
        "Memoized score calculations",
        "Centralized engagement score formula",
        "Proper tie handling in rankings"
      ],
      hook: "useLeaderboard(category, period, currentUserEmail)"
    },
    
    store: {
      description: "Points and Stripe purchases with inventory management",
      improvements: [
        "Parallel data fetching for performance",
        "Unified purchase hook",
        "Centralized validation logic",
        "Power-up activation system"
      ],
      hooks: ["useStoreItems", "useUserInventory", "useStorePurchase"]
    },
    
    social: {
      description: "Follow/block system with public profiles",
      improvements: [
        "Centralized SocialService for all operations",
        "Optimistic updates for better UX",
        "Helper functions for relationship checks"
      ],
      hook: "useSocial(currentUserEmail)"
    },
    
    gamification: {
      description: "Points, levels, badges, streaks",
      improvements: [
        "Centralized POINTS_CONFIG",
        "Level calculation utilities",
        "Automatic badge checking",
        "Team point aggregation"
      ],
      backendFunction: "awardPoints.js"
    }
  },

  codeOrganization: {
    before: {
      issues: [
        "Direct base44 calls scattered across components",
        "Duplicate constants in multiple files",
        "Utility functions mixed with component code",
        "O(N*M) lookups in leaderboard",
        "Inconsistent error handling"
      ]
    },
    after: {
      improvements: [
        "Centralized API layer (components/lib/api.js)",
        "Single source of truth for constants (components/lib/constants.js)",
        "Pure utility functions (components/lib/utils.js)",
        "O(1) Map-based lookups",
        "Consistent error handling with toast notifications"
      ]
    }
  },

  existingFeatures: {
    recognition: {
      status: "✅ Complete",
      features: ["AI suggestions", "Categories", "Company values", "Moderation", "Reactions"]
    },
    events: {
      status: "✅ Complete",
      features: ["Activity templates", "Scheduling", "RSVP", "Facilitator tools", "Points awarding"]
    },
    teams: {
      status: "✅ Complete",
      features: ["Team management", "Roles", "Team points", "Challenges"]
    },
    channels: {
      status: "✅ Complete",
      features: ["Public/private", "Messaging", "Reactions", "File attachments"]
    },
    notifications: {
      status: "✅ Complete",
      features: ["In-app bell", "Unread count", "Type filtering", "Preferences"]
    }
  }
};

export default FEATURE_SPECS;
