
/**
 * TEAM ENGAGE - PRODUCT REQUIREMENTS DOCUMENT (PRD)
 * Employee Engagement Platform for Intinc
 * Version: 2.0.0
 * Last Updated: 2025-11-30
 */

export const PRD_MASTER = {
  meta: {
    version: "2.0.0",
    lastUpdated: "2025-11-30",
    status: "Active Development",
    platform: "Base44"
  },

  overview: {
    name: "Team Engage",
    tagline: "AI-Powered Employee Engagement Platform",
    description: `
      Team Engage is a comprehensive employee engagement platform designed for 
      remote-first tech companies (50-200 employees). It combines gamification, 
      social features, AI-powered recommendations, and analytics to foster 
      team connection and recognition.
    `,
    primaryUsers: [
      "Remote Employees",
      "Team Leads", 
      "HR/People Ops",
      "Facilitators"
    ],
    keyObjectives: [
      "Increase employee engagement and retention",
      "Foster peer-to-peer recognition culture",
      "Enable data-driven HR decisions",
      "Build team cohesion in remote environments"
    ]
  },

  featureModules: {
    // CORE MODULES
    authentication: {
      status: "Complete",
      features: [
        "SSO integration (Azure AD, Google Workspace, Okta)",
        "Role-based access control (admin, user)",
        "8-hour session timeout",
        "Secure token management"
      ]
    },

    recognition: {
      status: "Complete",
      features: [
        "Peer-to-peer public shoutouts",
        "Category-based recognition (teamwork, innovation, leadership, etc.)",
        "Company values tagging",
        "AI-powered message suggestions",
        "Visibility controls (public, private, team_only)",
        "Reactions and comments",
        "Admin featuring capability",
        "Points awarded for giving/receiving recognition"
      ]
    },

    moderation: {
      status: "Complete",
      features: [
        "AI-powered content flagging",
        "Moderation queue with tabs (Flagged, Pending, Recent)",
        "Approve/Reject with notes",
        "Bulk AI scanning",
        "Confidence scoring",
        "Audit trail for moderation actions"
      ]
    },

    gamification: {
      status: "Complete",
      features: [
        "Points system (attendance, activities, feedback, engagement)",
        "Level progression (every 100 points)",
        "Badge system with automatic and manual awards",
        "Streak tracking",
        "Team points aggregation",
        "Leaderboards (points, events, badges, engagement)",
        "Time-period filtering (daily, weekly, monthly, all-time)"
      ]
    },

    pointStore: {
      status: "Complete",
      features: [
        "Avatar customization items (hats, glasses, backgrounds, frames, effects)",
        "Power-ups with time-limited effects",
        "Points-based purchases",
        "Stripe integration for premium items",
        "Inventory management",
        "Rarity system (common, uncommon, rare, epic, legendary)",
        "Stock tracking and purchase history"
      ]
    },

    leaderboards: {
      status: "Complete",
      features: [
        "Multi-category rankings (points, events, badges, engagement)",
        "Time-period filters",
        "My Rank card with percentile",
        "Nearby competitors display",
        "Profile navigation from rankings",
        "Following filter support"
      ]
    },

    socialLayer: {
      status: "Complete",
      features: [
        "Follow/unfollow users",
        "Block functionality",
        "Public profile pages",
        "Privacy settings (public/private)",
        "Follower/following counts",
        "Profile stats display"
      ]
    },

    avatarSystem: {
      status: "Complete",
      features: [
        "Layered avatar preview (background, frame, hat, glasses, effect)",
        "Inventory-based item selection",
        "Real-time preview",
        "Save/reset functionality",
        "Rarity-based styling"
      ]
    },

    events: {
      status: "Complete",
      features: [
        "Activity templates library",
        "Event scheduling with calendar",
        "Recurring events",
        "RSVP and attendance tracking",
        "Magic links for participants",
        "Facilitator dashboard",
        "Live event tools (polls, announcements, timer)",
        "Post-event feedback and recaps",
        "Points awarded for participation"
      ]
    },

    teams: {
      status: "Complete",
      features: [
        "Team creation and management",
        "Member roles (leader, co-leader, organizer, member)",
        "Team points and statistics",
        "Team badges",
        "Team challenges",
        "Join requests and approvals"
      ]
    },

    channels: {
      status: "Complete",
      features: [
        "Team/project/interest-based channels",
        "Public, private, invite-only visibility",
        "Real-time messaging",
        "Reactions and replies",
        "File attachments",
        "Channel settings and member management"
      ]
    },

    analytics: {
      status: "Complete",
      features: [
        "Engagement metrics dashboard",
        "Activity type analytics",
        "Attendance tracking",
        "Skill development correlation",
        "AI-powered insights",
        "Export capabilities"
      ]
    },

    notifications: {
      status: "Complete",
      features: [
        "In-app notification bell",
        "Unread count badges",
        "Mark as read/delete",
        "User preference controls",
        "Type-based filtering"
      ]
    },

    integrations: {
      status: "Partial",
      features: [
        "Microsoft Teams notifications",
        "Slack notifications",
        "Google Calendar sync",
        "Email notifications",
        "Stripe payments"
      ]
    }
  },

  technicalStack: {
    frontend: {
      framework: "React",
      styling: "Tailwind CSS + shadcn/ui",
      stateManagement: "@tanstack/react-query",
      routing: "react-router-dom",
      animations: "framer-motion (available)",
      icons: "lucide-react"
    },
    backend: {
      runtime: "Deno Deploy",
      sdk: "@base44/sdk@0.8.4",
      database: "Base44 Entities",
      payments: "Stripe"
    },
    integrations: [
      "OpenAI (LLM)",
      "Stripe (Payments)",
      "Microsoft Teams",
      "Slack",
      "Google Calendar"
    ]
  },

  securityRequirements: {
    authentication: [
      "All API endpoints require authentication",
      "Service role for privileged operations",
      "User context validation"
    ],
    dataProtection: [
      "RBAC for all user data",
      "PII protection (salary never exposed to non-HR)",
      "Anonymous survey responses (min 5 before showing)",
      "Input validation on all endpoints"
    ],
    fileHandling: [
      "Max 10MB uploads",
      "Image/PDF only",
      "Signed URLs for private files"
    ]
  },

  designPrinciples: {
    aesthetic: "Modern SaaS with glassmorphism",
    responsiveness: "Mobile-first, touch-friendly",
    accessibility: "WCAG 2.1 AA compliance target",
    colorScheme: "Energetic but professional (int-navy, int-orange)"
  }
};

export default PRD_MASTER;
