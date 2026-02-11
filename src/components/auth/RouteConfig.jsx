/**
 * ROUTE ACCESS CONTROL - SINGLE SOURCE OF TRUTH
 * 
 * This file defines which roles can access which routes.
 * Implements least-privilege principle: deny by default.
 */

export const PUBLIC_ROUTES = [
  'Landing',
  'Splash',
  'MarketingHome',
  'Product',
  'ProductShowcase',
  'Blog',
  'CaseStudies',
  'Whitepapers',
  'Resources',
  'Documentation',
];

export const ADMIN_ONLY_ROUTES = [
  'AdminPanel',
  'AdminHub',
  'AdminAnalyticsDashboard',
  'AIAdminDashboard',
  'IntegrationsAdmin',
  'RewardsAdmin',
  'RoleManagement',
  'UserRoleAssignment',
  'GamificationAdmin',
  'GamificationRulesAdmin',
  'FeedbackAdmin',
  'WellnessAdmin',
  'AuditLog',
  'ContentModerationAdmin',
  'RedemptionAdmin',
  'UserTypeManager',
  'RoleManagementSetup',
  'TeamAutomation',
  'TeamAutomations',
  'AdvancedReportingSuite',
  'ReportBuilder',
  'CustomReportBuilder',
  'PredictiveAnalytics',
  'PredictiveAnalyticsDashboard',
  'LifecycleAnalyticsDashboard',
  'LifecycleIntelligenceDashboard',
  'ABTestingDashboard',
  'SegmentationDashboard',
  'UserSegmentation',
  'RealTimeAnalytics',
  'AdvancedAnalytics',
  'AdvancedGamificationAnalytics',
  'CustomAnalytics',
  'CustomizableAnalyticsDashboard',
  'PRDGenerator',
  'ProjectPlan',
];

export const FACILITATOR_ROUTES = [
  'FacilitatorDashboard',
  'FacilitatorView',
  'TeamLeaderDashboard',
  'AIEnhancedCoaching',
  'EventTemplates',
  'EventWizard',
  'AIEventPlanner',
];

export const PARTICIPANT_ROUTES = [
  'ParticipantHub',
  'ParticipantPortal',
  'ParticipantEvent',
  'GamifiedOnboarding',
  'HorizonHub',
  'DawnHub',
  'AvatarShopHub',
];

// Routes accessible to all authenticated users (regardless of role)
export const SHARED_AUTHENTICATED_ROUTES = [
  'Dashboard',
  'AIPersonalization',
  'AICoaching',
  'Activities',
  'Calendar',
  'EmployeeDirectory',
  'LearningDashboard',
  'LearningPath',
  'Teams',
  'TeamDashboard',
  'TeamChallenges',
  'TeamCompetition',
  'Channels',
  'Recognition',
  'RecognitionEngine',
  'RecognitionFeed',
  'PointStore',
  'RewardsStore',
  'Leaderboards',
  'LeaderboardRankCelebration',
  'TeamLeaderboard',
  'UserProfile',
  'ExpandedUserProfile',
  'ComprehensiveProfile',
  'PublicProfile',
  'ProfileCustomization',
  'Settings',
  'Gamification',
  'GamificationDashboard',
  'GamificationSettings',
  'GamificationAnalytics',
  'Milestones',
  'Surveys',
  'WellnessDashboard',
  'WellnessAnalyticsReport',
  'Analytics',
  'AnalyticsDashboard',
  'EventAnalyticsDashboard',
  'TeamAnalyticsDashboard',
  'TeamPerformanceDashboard',
  'SkillsDashboard',
  'SkillsMatrix',
  'KnowledgeBase',
  'KnowledgeHub',
  'SocialGamification',
  'SocialHub',
  'EngagementHub',
  'PowerUserHub',
  'OnboardingHub',
  'OnboardingDashboard',
  'NewEmployeeOnboarding',
  'NewHireOnboarding',
  'ManagerOnboardingDashboard',
  'MentorshipHub',
  'IntegrationsHub',
  'Integrations',
  'Home',
];

// Special routes that don't require layout
export const NO_LAYOUT_ROUTES = ['ParticipantEvent', 'RoleSelection'];

/**
 * Check if a route is accessible to a given role
 * @param {string} pageName - The page being accessed
 * @param {string} normalizedRole - The user's normalized role (admin/facilitator/participant)
 * @returns {boolean} - Whether the user can access this route
 */
export function canAccessRoute(pageName, normalizedRole) {
  // Public routes are accessible to everyone (even unauthenticated)
  if (PUBLIC_ROUTES.includes(pageName)) {
    return true;
  }

  // Unauthenticated users can only access public routes
  if (!normalizedRole) {
    return false;
  }

  // Admin can access everything
  if (normalizedRole === 'admin') {
    return true;
  }

  // Admin-only routes
  if (ADMIN_ONLY_ROUTES.includes(pageName)) {
    return false; // Not admin
  }

  // Facilitator routes (facilitators only, participants cannot access)
  if (FACILITATOR_ROUTES.includes(pageName)) {
    return normalizedRole === 'facilitator';
  }

  // Participant routes (participants only)
  if (PARTICIPANT_ROUTES.includes(pageName)) {
    return normalizedRole === 'participant';
  }

  // Shared authenticated routes (all authenticated users)
  if (SHARED_AUTHENTICATED_ROUTES.includes(pageName)) {
    return true;
  }

  // Default: deny (least privilege)
  return false;
}

/**
 * Get the default redirect target for a given role
 */
export function getDefaultRoute(normalizedRole) {
  switch (normalizedRole) {
    case 'admin':
      return 'Dashboard';
    case 'facilitator':
      return 'FacilitatorDashboard';
    case 'participant':
      return 'ParticipantHub';
    default:
      return 'Landing';
  }
}

/**
 * Check if a route requires authentication
 */
export function requiresAuth(pageName) {
  return !PUBLIC_ROUTES.includes(pageName);
}