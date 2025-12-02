/**
 * INTERACT - PRODUCT REQUIREMENTS DOCUMENT (PRD)
 * Employee Engagement Platform for Intinc
 * Version: 3.0.0 (Post-Refactor)
 * Last Updated: 2025-11-30
 */

export const PRD_MASTER = {
  meta: {
    version: "3.0.0",
    lastUpdated: "2025-11-30",
    status: "Production Ready",
    platform: "Base44"
  },

  overview: {
    name: "INTeract",
    tagline: "AI-Powered Employee Engagement Platform",
    description: `
      INTeract is a comprehensive employee engagement platform designed for 
      remote-first tech companies (50-200 employees). It combines gamification, 
      social features, AI-powered recommendations, and analytics to foster 
      team connection and recognition.
    `,
    primaryUsers: ["Remote Employees", "Team Leads", "HR/People Ops", "Facilitators"],
    keyObjectives: [
      "Increase employee engagement and retention",
      "Foster peer-to-peer recognition culture",
      "Enable data-driven HR decisions",
      "Build team cohesion in remote environments"
    ]
  },

  architecture: {
    summary: "Clean architecture with centralized API layer, custom hooks, and modular components",
    keyFiles: {
      api: "components/lib/api.js - Centralized entity services and backend function calls",
      constants: "components/lib/constants.js - All configuration and enums",
      utils: "components/lib/utils.js - Pure utility functions",
      hooks: "components/hooks/useEntities.js - Reusable data fetching hooks"
    },
    patterns: [
      "Service layer pattern for entity operations",
      "Custom hooks for data fetching with React Query",
      "Constants centralization for type safety",
      "Pure utility functions for calculations"
    ]
  },

  featureModules: {
    authentication: { status: "✅ Complete", refactored: true },
    recognition: { status: "✅ Complete", refactored: true },
    moderation: { status: "✅ Complete", refactored: true },
    gamification: { status: "✅ Complete", refactored: true },
    pointStore: { status: "✅ Complete", refactored: true },
    leaderboards: { status: "✅ Complete", refactored: true },
    socialLayer: { status: "✅ Complete", refactored: true },
    avatarSystem: { status: "✅ Complete", refactored: true },
    events: { status: "✅ Complete", refactored: true },
    teams: { status: "✅ Complete" },
    channels: { status: "✅ Complete" },
    analytics: { status: "✅ Complete" },
    notifications: { status: "✅ Complete" },
    integrations: {
      status: "✅ Complete",
      ai: {
        openai: "GPT-4o, o1, vision, embeddings, TTS, Whisper, moderation",
        claude: "Claude 4 Sonnet, vision, documents, extended thinking, tools",
        gemini: "Gemini 2.0 Flash, vision, video, thinking, code, embeddings"
      },
      payments: "Stripe checkout + webhooks",
      notifications: "Slack, Teams, Email"
    }
  },

  technicalStack: {
    frontend: {
      framework: "React",
      styling: "Tailwind CSS + shadcn/ui",
      stateManagement: "@tanstack/react-query",
      routing: "react-router-dom",
      animations: "framer-motion",
      icons: "lucide-react"
    },
    backend: {
      runtime: "Deno Deploy",
      sdk: "@base44/sdk@0.8.4",
      database: "Base44 Entities",
      payments: "Stripe"
    }
  },

  refactoringChanges: {
    version: "3.0.0",
    date: "2025-11-30",
    changes: [
      "Created centralized API layer (components/lib/api.js)",
      "Created centralized constants (components/lib/constants.js)",
      "Created centralized utilities (components/lib/utils.js)",
      "Refactored hooks to use centralized services (useAuth, useEntities, useLeaderboard)",
      "Optimized leaderboard with O(1) profile Map lookup",
      "Refactored backend functions (awardPoints, purchaseWithPoints)",
      "Added full OpenAI, Claude, Gemini integrations at max depth"
    ]
  }
};

export default PRD_MASTER;