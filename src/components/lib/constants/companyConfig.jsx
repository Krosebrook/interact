/**
 * MULTI-TENANT COMPANY CONFIGURATION
 * Support for Intinc, Edgewater, and other clients
 */

export const COMPANY_CONFIGS = {
  intinc: {
    id: 'intinc',
    name: 'INTeract',
    displayName: 'INTeract Employee Engagement',
    domain: 'intinc.com',
    
    // Branding
    brandColor: '#D97230', // Orange
    secondaryColor: '#14294D', // Navy
    logo: '/logos/intinc-logo.png',
    favicon: '/favicons/intinc-favicon.ico',
    
    // Features enabled
    features: {
      gamification: true,
      aiRecommendations: true,
      teamsIntegration: true,
      slackIntegration: false,
      customBranding: true,
      advancedAnalytics: true,
      pulseSurveys: true,
      wellnessChallenges: true
    },
    
    // Email settings
    email: {
      fromName: 'INTeract Team',
      supportEmail: 'support@intinc.com'
    },
    
    // Custom content
    welcomeMessage: 'Welcome to INTeract! Let\'s build a more engaged team together.',
    tagline: 'Employee Engagement Platform'
  },
  
  edgewater: {
    id: 'edgewater',
    name: 'Edgewater Engage',
    displayName: 'Edgewater Employee Platform',
    domain: 'edgewater.com',
    
    // Branding
    brandColor: '#0066CC', // Blue
    secondaryColor: '#003366', // Dark Blue
    logo: '/logos/edgewater-logo.png',
    favicon: '/favicons/edgewater-favicon.ico',
    
    // Features enabled
    features: {
      gamification: true,
      aiRecommendations: false, // Disabled for Edgewater
      teamsIntegration: true,
      slackIntegration: true,
      customBranding: true,
      advancedAnalytics: false,
      pulseSurveys: true,
      wellnessChallenges: false
    },
    
    // Email settings
    email: {
      fromName: 'Edgewater Team',
      supportEmail: 'help@edgewater.com'
    },
    
    // Custom content
    welcomeMessage: 'Welcome to Edgewater Engage! Your voice matters.',
    tagline: 'Connect. Engage. Grow.'
  }
};

/**
 * Get company config by domain
 * Falls back to Intinc if not found
 */
export function getCompanyConfig(emailOrDomain) {
  const domain = emailOrDomain?.split('@')[1] || emailOrDomain;
  
  for (const [key, config] of Object.entries(COMPANY_CONFIGS)) {
    if (domain?.includes(config.domain)) {
      return config;
    }
  }
  
  // Default to Intinc
  return COMPANY_CONFIGS.intinc;
}

/**
 * Get current company from environment or user
 */
export function getCurrentCompany(user) {
  // Try environment variable first
  const envCompany = import.meta.env.VITE_COMPANY_ID;
  if (envCompany && COMPANY_CONFIGS[envCompany]) {
    return COMPANY_CONFIGS[envCompany];
  }
  
  // Fallback to user email domain
  if (user?.email) {
    return getCompanyConfig(user.email);
  }
  
  // Ultimate fallback
  return COMPANY_CONFIGS.intinc;
}

/**
 * Check if feature is enabled for company
 */
export function hasFeature(companyId, featureName) {
  const config = COMPANY_CONFIGS[companyId];
  return config?.features?.[featureName] ?? false;
}

/**
 * Get all companies (for admin selection)
 */
export function getAllCompanies() {
  return Object.values(COMPANY_CONFIGS);
}

export default COMPANY_CONFIGS;