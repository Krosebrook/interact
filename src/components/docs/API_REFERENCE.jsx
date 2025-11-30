/**
 * TEAM ENGAGE - API REFERENCE
 * Backend Functions and Entity Operations
 * Version: 2.0.0
 * Last Updated: 2025-11-30
 */

export const API_REFERENCE = {
  meta: {
    version: "2.0.0",
    lastUpdated: "2025-11-30"
  },

  backendFunctions: {
    awardPoints: {
      path: "functions/awardPoints.js",
      description: "Award points for user actions (attendance, activity, feedback)",
      authentication: "Required",
      input: {
        participationId: "string - Participation record ID",
        actionType: "string - 'attendance' | 'activity_completion' | 'feedback' | 'high_engagement'"
      },
      output: {
        success: "boolean",
        pointsAwarded: "number",
        newTotal: "number",
        newLevel: "number",
        badgesEarned: "Badge[]"
      },
      sideEffects: [
        "Updates UserPoints record",
        "Updates Participation record (marks points awarded)",
        "Updates Team points if user has team",
        "Creates notifications for level-up and badges",
        "Automatically awards badges based on criteria"
      ],
      pointsConfig: {
        attendance: 10,
        activity_completion: 15,
        feedback: 5,
        high_engagement: 5
      }
    },

    purchaseWithPoints: {
      path: "functions/purchaseWithPoints.js",
      description: "Purchase store items using points",
      authentication: "Required",
      input: {
        itemId: "string - StoreItem ID",
        quantity: "number (optional, default: 1)"
      },
      output: {
        success: "boolean",
        item: "{ id, name, category }",
        points_spent: "number",
        remaining_points: "number",
        expires_at: "string | null (for power-ups)"
      },
      validations: [
        "Item exists and is available",
        "User has sufficient points",
        "Stock available (if limited)",
        "User doesn't already own (non-consumables)"
      ],
      sideEffects: [
        "Creates StoreTransaction record",
        "Deducts from UserPoints.available_points",
        "Creates UserInventory record",
        "Updates StoreItem stock and purchase_count",
        "Activates power-up on UserAvatar (if applicable)",
        "Creates purchase notification"
      ]
    },

    createStoreCheckout: {
      path: "functions/createStoreCheckout.js",
      description: "Create Stripe checkout session for premium items",
      authentication: "Required",
      input: {
        itemId: "string - StoreItem ID"
      },
      output: {
        checkoutUrl: "string - Stripe checkout URL"
      },
      flow: [
        "Validate item exists and is premium",
        "Check stock availability",
        "Create pending StoreTransaction",
        "Create Stripe checkout session",
        "Return checkout URL for redirect"
      ]
    },

    storeWebhook: {
      path: "functions/storeWebhook.js",
      description: "Handle Stripe webhook events",
      authentication: "Stripe signature verification",
      events: {
        "checkout.session.completed": [
          "Update transaction to completed",
          "Add item to user inventory",
          "Deduct stock",
          "Activate power-ups",
          "Send notification"
        ],
        "payment_intent.payment_failed": [
          "Update transaction to failed",
          "Log error"
        ]
      }
    }
  },

  entityOperations: {
    description: "Standard entity operations via Base44 SDK",
    
    frontendUsage: `
    import { base44 } from '@/api/base44Client';

    // List with sorting
    await base44.entities.EntityName.list('-created_date', 50);

    // Filter with query
    await base44.entities.EntityName.filter({ status: 'active' }, '-created_date', 10);

    // Create
    await base44.entities.EntityName.create({ field: 'value' });

    // Update
    await base44.entities.EntityName.update(id, { field: 'newValue' });

    // Delete
    await base44.entities.EntityName.delete(id);

    // Get schema
    await base44.entities.EntityName.schema();
    `,

    backendUsage: `
    import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

    const base44 = createClientFromRequest(req);

    // User-scoped (respects auth)
    await base44.entities.EntityName.list();

    // Service role (admin privileges)
    await base44.asServiceRole.entities.EntityName.create({...});
    `
  },

  keyEntities: {
    UserPoints: {
      description: "User gamification stats",
      keyFields: [
        "user_email (unique identifier)",
        "total_points, available_points, lifetime_points",
        "events_attended, activities_completed, feedback_submitted",
        "badges_earned (array of badge IDs)",
        "level, streak_days",
        "team_id (optional)",
        "points_history (array, last 50)"
      ]
    },

    UserFollow: {
      description: "Social relationships",
      keyFields: [
        "follower_email (who is following)",
        "following_email (who is being followed)",
        "status ('active' | 'blocked')"
      ]
    },

    StoreItem: {
      description: "Store catalog items",
      keyFields: [
        "name, description, category",
        "rarity (common → legendary)",
        "points_cost, money_cost_cents",
        "is_premium, is_available",
        "stock_quantity (null = unlimited)",
        "effect_config (for power-ups)"
      ]
    },

    UserInventory: {
      description: "User-owned items",
      keyFields: [
        "user_email, item_id",
        "item_name, item_category, item_rarity",
        "is_equipped, equipped_slot",
        "acquisition_type, transaction_id",
        "expires_at (for power-ups)"
      ]
    },

    Recognition: {
      description: "Peer recognition posts",
      keyFields: [
        "sender_email, recipient_email",
        "message, category, company_values",
        "points_awarded, visibility",
        "status (pending, approved, flagged, rejected)",
        "ai_flag_reason, ai_flag_confidence",
        "moderated_by, moderated_at"
      ]
    },

    LeaderboardSnapshot: {
      description: "Pre-aggregated rankings",
      keyFields: [
        "period (daily, weekly, monthly, all_time)",
        "category (points, events, badges, engagement)",
        "rankings (array of ranked users)",
        "total_participants",
        "last_calculated"
      ]
    }
  },

  integrations: {
    Core: {
      InvokeLLM: {
        description: "Generate AI responses",
        params: [
          "prompt (required)",
          "add_context_from_internet (boolean)",
          "response_json_schema (object)",
          "file_urls (array)"
        ]
      },
      SendEmail: {
        description: "Send emails",
        params: ["to", "subject", "body", "from_name (optional)"]
      },
      UploadFile: {
        description: "Upload public files",
        returns: "{ file_url: string }"
      },
      GenerateImage: {
        description: "AI image generation",
        params: ["prompt"],
        returns: "{ url: string }"
      }
    }
  },

  authenticationPatterns: {
    frontend: `
    import { base44 } from '@/api/base44Client';

    // Get current user
    const user = await base44.auth.me();

    // Check if authenticated
    const isAuth = await base44.auth.isAuthenticated();

    // Update current user
    await base44.auth.updateMe({ field: 'value' });

    // Logout
    base44.auth.logout(redirectUrl);

    // Redirect to login
    base44.auth.redirectToLogin(nextUrl);
    `,

    backend: `
    import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

    Deno.serve(async (req) => {
      const base44 = createClientFromRequest(req);
      
      const user = await base44.auth.me();
      if (!user) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
      }

      // User is authenticated, proceed...
    });
    `
  }
};

export default API_REFERENCE;