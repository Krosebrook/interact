/**
 * TEAM ENGAGE - ARCHITECTURE DOCUMENTATION
 * System Architecture and Code Organization
 * Version: 2.0.0
 * Last Updated: 2025-11-30
 */

export const ARCHITECTURE = {
  meta: {
    version: "2.0.0",
    lastUpdated: "2025-11-30"
  },

  folderStructure: {
    description: "Base44 platform structure with feature-organized components",
    structure: `
    /
    ├── entities/                    # Database schema definitions (JSON)
    │   ├── User.json               # Built-in, extended with custom fields
    │   ├── UserPoints.json         # Gamification points tracking
    │   ├── UserProfile.json        # Extended profile data
    │   ├── UserAvatar.json         # Avatar customization state
    │   ├── UserInventory.json      # Owned store items
    │   ├── UserFollow.json         # Social relationships
    │   ├── Recognition.json        # Peer recognition posts
    │   ├── Activity.json           # Activity templates
    │   ├── Event.json              # Scheduled events
    │   ├── Participation.json      # Event participation records
    │   ├── Badge.json              # Badge definitions
    │   ├── BadgeAward.json         # Badge award records
    │   ├── Team.json               # Team entities
    │   ├── Channel.json            # Communication channels
    │   ├── ChannelMessage.json     # Channel messages
    │   ├── StoreItem.json          # Point store items
    │   ├── StoreTransaction.json   # Purchase records
    │   ├── LeaderboardSnapshot.json # Pre-aggregated rankings
    │   ├── Notification.json       # User notifications
    │   └── ...                     # Additional entities
    │
    ├── pages/                       # Top-level page components (FLAT)
    │   ├── Dashboard.jsx           # Admin dashboard
    │   ├── Leaderboards.jsx        # Rankings page
    │   ├── PublicProfile.jsx       # User profile view
    │   ├── PointStore.jsx          # Store interface
    │   ├── Recognition.jsx         # Recognition feed
    │   ├── Teams.jsx               # Team management
    │   ├── Channels.jsx            # Channel interface
    │   └── ...                     # Additional pages
    │
    ├── components/                  # Reusable components (CAN have subfolders)
    │   ├── common/                 # Shared UI components
    │   │   ├── LoadingSpinner.jsx
    │   │   ├── EmptyState.jsx
    │   │   ├── StatsGrid.jsx
    │   │   └── ...
    │   │
    │   ├── hooks/                  # Shared custom hooks
    │   │   ├── useUserData.js      # User auth and profile
    │   │   ├── useEventData.js     # Event data fetching
    │   │   └── ...
    │   │
    │   ├── utils/                  # Utility functions
    │   │   ├── eventUtils.js       # Event processing
    │   │   ├── constants.js        # App constants
    │   │   └── formatters.js       # Data formatters
    │   │
    │   ├── leaderboard/            # Leaderboard feature
    │   │   ├── hooks/
    │   │   │   └── useLeaderboard.js
    │   │   ├── Leaderboard.jsx
    │   │   ├── LeaderboardRow.jsx
    │   │   ├── LeaderboardFilters.jsx
    │   │   └── MyRankCard.jsx
    │   │
    │   ├── store/                  # Point store feature
    │   │   ├── hooks/
    │   │   │   ├── useStoreActions.js
    │   │   │   └── useAvatarCustomization.js
    │   │   ├── StoreItemCard.jsx
    │   │   ├── StoreItemDetail.jsx
    │   │   ├── AvatarCustomizer.jsx
    │   │   ├── AvatarPreview.jsx
    │   │   └── InventorySelector.jsx
    │   │
    │   ├── moderation/             # Content moderation feature
    │   │   ├── hooks/
    │   │   │   └── useModerationActions.js
    │   │   ├── ModerationQueue.jsx
    │   │   └── ModerationItem.jsx
    │   │
    │   ├── profile/                # User profiles feature
    │   │   ├── hooks/
    │   │   │   └── useSocialActions.js
    │   │   ├── PublicProfileCard.jsx
    │   │   └── ...
    │   │
    │   ├── recognition/            # Recognition feature
    │   │   ├── RecognitionForm.jsx
    │   │   ├── RecognitionCard.jsx
    │   │   └── ...
    │   │
    │   ├── channels/               # Channels feature
    │   │   ├── ChannelList.jsx
    │   │   ├── ChannelChat.jsx
    │   │   └── ...
    │   │
    │   ├── events/                 # Events feature
    │   │   ├── EventCalendarCard.jsx
    │   │   └── ...
    │   │
    │   ├── gamification/           # Gamification components
    │   │   ├── BadgeDisplay.jsx
    │   │   ├── PointsTracker.jsx
    │   │   └── ...
    │   │
    │   ├── ai/                     # AI-powered components
    │   │   ├── AISuggestionsWidget.jsx
    │   │   ├── ActivityGenerator.jsx
    │   │   └── ...
    │   │
    │   ├── notifications/          # Notification components
    │   │   └── NotificationBell.jsx
    │   │
    │   └── docs/                   # Documentation components
    │       ├── PRD_MASTER.jsx
    │       ├── ARCHITECTURE.jsx
    │       ├── API_REFERENCE.jsx
    │       └── FEATURE_SPECS.jsx
    │
    ├── functions/                   # Backend functions (Deno Deploy)
    │   ├── awardPoints.js          # Points awarding logic
    │   ├── purchaseWithPoints.js   # Store purchases
    │   ├── createStoreCheckout.js  # Stripe checkout
    │   ├── storeWebhook.js         # Stripe webhooks
    │   └── ...                     # Additional functions
    │
    ├── agents/                      # AI agents (JSON config)
    │   └── ...
    │
    ├── Layout.js                    # Global layout wrapper
    └── globals.css                  # Global styles + CSS variables
    `
  },

  dataFlow: {
    description: "Data fetching and state management patterns",
    patterns: {
      serverState: {
        library: "@tanstack/react-query",
        usage: [
          "useQuery for data fetching with caching",
          "useMutation for data modifications",
          "queryClient.invalidateQueries for cache updates",
          "staleTime for cache duration control"
        ]
      },
      clientState: {
        library: "React useState/useReducer",
        usage: [
          "UI state (modals, filters, tabs)",
          "Form state",
          "Temporary selections"
        ]
      },
      customHooks: {
        description: "Feature-specific hooks encapsulate data logic",
        examples: [
          "useUserData - Auth, profile, points",
          "useLeaderboard - Rankings with filters",
          "useSocialActions - Follow/block mutations",
          "useModerationActions - Moderation mutations",
          "useStoreActions - Purchase mutations",
          "useAvatarCustomization - Avatar state"
        ]
      }
    }
  },

  backendPatterns: {
    description: "Deno backend function patterns",
    structure: `
    // Standard backend function structure
    import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

    Deno.serve(async (req) => {
      const base44 = createClientFromRequest(req);
      
      try {
        // 1. Authenticate
        const user = await base44.auth.me();
        if (!user) {
          return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Parse and validate input
        const { param } = await req.json();

        // 3. Business logic with service role for privileged ops
        const result = await base44.asServiceRole.entities.Entity.update(...);

        // 4. Return success response
        return Response.json({ success: true, data: result });

      } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
      }
    });
    `,
    serviceRole: {
      description: "base44.asServiceRole for admin-level operations",
      useCases: [
        "Creating records on behalf of users",
        "Updating other users' data",
        "Cross-entity transactions",
        "Notification creation"
      ]
    }
  },

  componentPatterns: {
    description: "React component architecture patterns",
    patterns: {
      containerPresentation: {
        description: "Separate data/logic from rendering",
        example: "AvatarCustomizer (container) → AvatarPreview + InventorySelector (presentation)"
      },
      customHookExtraction: {
        description: "Extract stateful logic into hooks",
        example: "useAvatarCustomization hook handles all state, mutations, callbacks"
      },
      composableComponents: {
        description: "Small, focused components composed together",
        example: "LeaderboardRow, MyRankCard, LeaderboardFilters → Leaderboard"
      }
    }
  },

  entityRelationships: {
    description: "Key entity relationships",
    relationships: [
      {
        entities: ["User", "UserPoints", "UserProfile", "UserAvatar"],
        type: "1:1",
        link: "user_email"
      },
      {
        entities: ["User", "UserInventory"],
        type: "1:N",
        link: "user_email"
      },
      {
        entities: ["User", "UserFollow"],
        type: "N:N (self-referential)",
        link: "follower_email, following_email"
      },
      {
        entities: ["Event", "Participation"],
        type: "1:N",
        link: "event_id"
      },
      {
        entities: ["StoreItem", "UserInventory"],
        type: "1:N",
        link: "item_id"
      },
      {
        entities: ["StoreItem", "StoreTransaction"],
        type: "1:N",
        link: "item_id"
      },
      {
        entities: ["Badge", "BadgeAward"],
        type: "1:N",
        link: "badge_id"
      }
    ]
  },

  securityLayers: {
    frontend: [
      "useUserData hook enforces auth on protected pages",
      "Admin-only routes check user.role === 'admin'",
      "Sensitive data only fetched when authorized"
    ],
    backend: [
      "All functions validate auth via base44.auth.me()",
      "Service role used only after auth validation",
      "Input validation before processing",
      "Stripe signature verification for webhooks"
    ]
  },

  performanceConsiderations: {
    caching: [
      "React Query staleTime (30s-60s typical)",
      "refetchInterval for real-time data (5min)",
      "LeaderboardSnapshot for pre-aggregated rankings"
    ],
    optimization: [
      "Limit queries (e.g., top 100 rankings)",
      "Parallel data fetching where possible",
      "Lazy loading for heavy components (recommended)"
    ]
  }
};

export default ARCHITECTURE;