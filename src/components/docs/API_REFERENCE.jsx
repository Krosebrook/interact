
/**
 * TEAM ENGAGE - API REFERENCE
 * Refactored API Documentation v3.0
 * Last Updated: 2025-11-30
 */

export const API_REFERENCE = {
  meta: { version: "3.0.0", lastUpdated: "2025-11-30" },

  serviceLayer: {
    description: "All entity operations go through centralized services in components/lib/api.js",
    
    example: `
    // Instead of direct base44 calls:
    // const data = await base44.entities.UserPoints.filter({ user_email: email });
    
    // Use service layer:
    import { UserPointsService } from '@/components/lib/api';
    const data = await UserPointsService.getByEmail(email);
    
    // Or use hooks for React components:
    import { useUserData } from '@/components/hooks/useAuth';
    const { user, userPoints, profile } = useUserData();
    `
  },

  hookPatterns: {
    authentication: `
    // Simple auth check
    import { useAuth } from '@/components/hooks/useAuth';
    const { user, isAuthenticated, isAdmin, logout } = useAuth();
    
    // Full user data with profile and points
    import { useUserData } from '@/components/hooks/useAuth';
    const { user, userPoints, profile, loading, refreshUserData } = useUserData();
    `,

    entities: `
    // Events with activities and participations
    import { useEvents } from '@/components/hooks/useEntities';
    const { events, activities, participations, isLoading } = useEvents();
    
    // Leaderboard with optimized lookups
    import { useLeaderboard } from '@/components/hooks/useLeaderboard';
    const { rankings, myRank, nearby, totalParticipants } = useLeaderboard('points', 'weekly', userEmail);
    
    // Store purchases
    import { useStorePurchase } from '@/components/hooks/useEntities';
    const { purchaseWithPoints, purchaseWithStripe, isPurchasing } = useStorePurchase();
    
    // Social actions
    import { useSocial } from '@/components/hooks/useEntities';
    const { follow, unfollow, block, isFollowing, followingCount } = useSocial(userEmail);
    `
  },

  backendFunctions: {
    awardPoints: {
      path: "functions/awardPoints.js",
      input: "{ participationId, actionType } OR { userEmail, actionType }",
      actionTypes: ["attendance", "activity_completion", "feedback", "high_engagement", "recognition_sent", "recognition_received"],
      output: "{ success, pointsAwarded, newTotal, newLevel, badgesEarned }"
    },
    
    purchaseWithPoints: {
      path: "functions/purchaseWithPoints.js",
      input: "{ itemId, quantity? }",
      output: "{ success, item, points_spent, remaining_points, expires_at? }"
    },
    
    openaiIntegration: {
      path: "functions/openaiIntegration.js",
      actions: {
        chat: "{ action: 'chat', prompt, model?, system?, json_schema?, tools? }",
        reasoning: "{ action: 'reasoning', prompt } - Uses o1 model",
        embedding: "{ action: 'embedding', prompt }",
        image: "{ action: 'image', prompt, options?: { size, quality, style } }",
        vision: "{ action: 'vision', prompt, options: { image_url, detail? } }",
        tts: "{ action: 'tts', prompt, options?: { voice, speed, hd } }",
        transcribe: "{ action: 'transcribe', options: { file_url, language? } }",
        moderation: "{ action: 'moderation', prompt }"
      }
    },
    
    claudeIntegration: {
      path: "functions/claudeIntegration.js",
      actions: {
        chat: "{ action: 'chat', prompt, system?, tools? }",
        vision: "{ action: 'vision', prompt, messages: [{ image_url }] }",
        analyze_document: "{ action: 'analyze_document', prompt, messages: [{ document_url }] }",
        extended_thinking: "{ action: 'extended_thinking', prompt }",
        tool_use: "{ action: 'tool_use', prompt, tools }"
      }
    },
    
    geminiIntegration: {
      path: "functions/geminiIntegration.js",
      actions: {
        chat: "{ action: 'chat', prompt, system?, tools? }",
        vision: "{ action: 'vision', prompt, messages: [{ image_url }] }",
        video: "{ action: 'video', prompt, messages: [{ video_url }] }",
        thinking: "{ action: 'thinking', prompt }",
        embedding: "{ action: 'embedding', prompt }",
        code: "{ action: 'code', prompt }",
        function_calling: "{ action: 'function_calling', prompt, tools }",
        count_tokens: "{ action: 'count_tokens', prompt }"
      }
    }
  },

  constants: {
    location: "components/lib/constants.js",
    categories: [
      "POINTS_CONFIG - Points per action type",
      "LEVEL_THRESHOLDS - Level progression config",
      "BADGE_RARITIES - Badge rarity styling",
      "LEADERBOARD_CATEGORIES - Ranking categories",
      "TIME_PERIODS - Time filtering options",
      "ENGAGEMENT_WEIGHTS - Score calculation weights",
      "STORE_CATEGORIES - Store item categories",
      "AVATAR_SLOTS - Avatar customization slots",
      "RECOGNITION_CATEGORIES - Recognition types",
      "FLAG_REASONS - Content moderation flags",
      "EVENT_TYPES - Activity type configuration",
      "AI_MODELS - Available AI models"
    ]
  },

  utilities: {
    location: "components/lib/utils.js",
    categories: {
      dates: ["formatDate", "getRelativeTime", "isToday", "isUpcoming", "isPast"],
      gamification: ["calculateLevel", "getPointsToNextLevel", "getLevelProgress", "calculateEngagementScore", "getPercentile"],
      events: ["filterUpcomingEvents", "filterPastEvents", "getActivityForEvent", "getParticipationStats", "calculateDashboardStats"],
      strings: ["truncate", "capitalize", "getInitials", "slugify"],
      numbers: ["formatNumber", "formatCurrency", "formatPercentage"],
      arrays: ["groupBy", "sortBy", "uniqueBy"],
      validation: ["isValidEmail", "isNotEmpty", "validateRequired"]
    }
  }
};

export default API_REFERENCE;
