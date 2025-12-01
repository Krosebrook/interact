/**
 * CENTRALIZED CONFIGURATION
 * Environment-specific settings and app configuration
 */

// ============================================================================
// APP CONFIGURATION
// ============================================================================

export const APP_CONFIG = {
  name: 'Team Engage',
  description: 'Employee Engagement Platform',
  version: '3.0.0',
  company: 'Intinc',
  supportEmail: 'support@teamengage.com'
};

// ============================================================================
// FEATURE FLAGS
// ============================================================================

export const FEATURES = {
  gamification: true,
  recognition: true,
  pulseSurveys: true,
  teamChannels: true,
  aiRecommendations: true,
  stripePayments: true,
  slackIntegration: true,
  teamsIntegration: true
};

// ============================================================================
// API CONFIGURATION
// ============================================================================

export const API_CONFIG = {
  defaultPageSize: 50,
  maxPageSize: 100,
  cacheTime: {
    short: 30000,     // 30 seconds
    medium: 60000,    // 1 minute
    long: 300000,     // 5 minutes
    static: 3600000   // 1 hour
  },
  retryAttempts: 3,
  retryDelay: 1000
};

// ============================================================================
// AUTHENTICATION CONFIGURATION
// ============================================================================

export const AUTH_CONFIG = {
  sessionTimeout: 8 * 60 * 60 * 1000, // 8 hours in ms
  redirectAfterLogin: 'Dashboard',
  redirectAfterLogout: 'Login',
  publicPages: ['ParticipantEvent', 'RoleSelection']
};

// ============================================================================
// FILE UPLOAD CONFIGURATION
// ============================================================================

export const UPLOAD_CONFIG = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.pdf']
};

// ============================================================================
// UI CONFIGURATION
// ============================================================================

export const UI_CONFIG = {
  animationDuration: 300,
  toastDuration: 5000,
  debounceDelay: 300,
  infiniteScrollThreshold: 100
};

// ============================================================================
// VALIDATION RULES
// ============================================================================

export const VALIDATION = {
  teamName: {
    minLength: 2,
    maxLength: 50
  },
  description: {
    maxLength: 500
  },
  message: {
    minLength: 5,
    maxLength: 1000
  },
  password: {
    minLength: 8,
    requireUppercase: true,
    requireNumber: true,
    requireSpecial: true
  }
};

// ============================================================================
// ROLE PERMISSIONS
// ============================================================================

export const PERMISSIONS = {
  admin: {
    canManageUsers: true,
    canViewAnalytics: true,
    canManageSettings: true,
    canModerateContent: true,
    canCreateEvents: true,
    canDeleteEvents: true
  },
  facilitator: {
    canManageUsers: false,
    canViewAnalytics: true,
    canManageSettings: false,
    canModerateContent: false,
    canCreateEvents: true,
    canDeleteEvents: true
  },
  participant: {
    canManageUsers: false,
    canViewAnalytics: false,
    canManageSettings: false,
    canModerateContent: false,
    canCreateEvents: false,
    canDeleteEvents: false
  }
};

// ============================================================================
// EXTERNAL SERVICE URLS
// ============================================================================

export const EXTERNAL_URLS = {
  documentation: 'https://docs.teamengage.com',
  support: 'https://support.teamengage.com',
  privacyPolicy: 'https://teamengage.com/privacy',
  termsOfService: 'https://teamengage.com/terms'
};