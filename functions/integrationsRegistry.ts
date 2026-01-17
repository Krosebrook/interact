// Central registry of all 25 integrations
export const INTEGRATIONS_REGISTRY = {
  // Communication (5)
  slack: {
    id: 'slack',
    name: 'Slack',
    category: 'communication',
    description: 'Send notifications, create channels, manage messages',
    features: ['notifications', 'channels', 'direct_messages', 'file_sharing'],
    authType: 'oauth',
    scopes: ['chat:write', 'chat:write.public', 'channels:manage', 'users:read'],
    icon: '💬'
  },
  teams: {
    id: 'teams',
    name: 'Microsoft Teams',
    category: 'communication',
    description: 'Send notifications to Teams channels and chats',
    features: ['notifications', 'channels', 'adaptive_cards'],
    authType: 'oauth',
    scopes: ['ChannelMessage.Send', 'Chat.Create'],
    icon: '👥'
  },
  twilio: {
    id: 'twilio',
    name: 'Twilio',
    category: 'communication',
    description: 'Send SMS notifications and manage phone communications',
    features: ['sms', 'voice', 'whatsapp'],
    authType: 'api_key',
    apiKeyEnv: 'TWILIO_API_KEY',
    icon: '📱'
  },
  sendgrid: {
    id: 'sendgrid',
    name: 'SendGrid',
    category: 'communication',
    description: 'Transactional email service for notifications',
    features: ['transactional_email', 'templates', 'analytics'],
    authType: 'api_key',
    apiKeyEnv: 'SENDGRID_API_KEY',
    icon: '✉️'
  },
  mailchimp: {
    id: 'mailchimp',
    name: 'Mailchimp',
    category: 'communication',
    description: 'Email marketing and campaign management',
    features: ['campaigns', 'newsletters', 'segmentation', 'automation'],
    authType: 'api_key',
    apiKeyEnv: 'MAILCHIMP_API_KEY',
    icon: '📧'
  },

  // Productivity (7)
  google_calendar: {
    id: 'google_calendar',
    name: 'Google Calendar',
    category: 'productivity',
    description: 'Sync events and schedule management',
    features: ['event_sync', 'scheduling', 'reminders'],
    authType: 'oauth',
    scopes: ['calendar'],
    icon: '📅'
  },
  google_sheets: {
    id: 'google_sheets',
    name: 'Google Sheets',
    category: 'productivity',
    description: 'Export data, create reports and dashboards',
    features: ['data_export', 'reporting', 'automation'],
    authType: 'oauth',
    scopes: ['spreadsheets'],
    icon: '📊'
  },
  google_docs: {
    id: 'google_docs',
    name: 'Google Docs',
    category: 'productivity',
    description: 'Create documents and collaborative content',
    features: ['document_creation', 'collaboration', 'export'],
    authType: 'oauth',
    scopes: ['documents'],
    icon: '📝'
  },
  google_drive: {
    id: 'google_drive',
    name: 'Google Drive',
    category: 'productivity',
    description: 'File storage and content management (Already authorized)',
    features: ['file_storage', 'sharing', 'search'],
    authType: 'oauth',
    scopes: ['drive.file'],
    icon: '☁️'
  },
  notion: {
    id: 'notion',
    name: 'Notion',
    category: 'productivity',
    description: 'Documentation, wikis, and knowledge base',
    features: ['pages', 'databases', 'content_management'],
    authType: 'api_key',
    apiKeyEnv: 'NOTION_API_KEY',
    icon: '📖'
  },
  airtable: {
    id: 'airtable',
    name: 'Airtable',
    category: 'productivity',
    description: 'Database and content management',
    features: ['database', 'forms', 'automation'],
    authType: 'api_key',
    apiKeyEnv: 'AIRTABLE_API_KEY',
    icon: '🗄️'
  },
  zoom: {
    id: 'zoom',
    name: 'Zoom',
    category: 'productivity',
    description: 'Video conferencing and webinar integration',
    features: ['meeting_creation', 'webinars', 'recordings'],
    authType: 'oauth',
    scopes: ['meeting:write', 'meeting:read'],
    icon: '🎥'
  },

  // Analytics (5)
  google_analytics: {
    id: 'google_analytics',
    name: 'Google Analytics',
    category: 'analytics',
    description: 'Track engagement metrics and user behavior',
    features: ['event_tracking', 'dashboards', 'reporting'],
    authType: 'oauth',
    scopes: ['analytics'],
    icon: '📈'
  },
  mixpanel: {
    id: 'mixpanel',
    name: 'Mixpanel',
    category: 'analytics',
    description: 'Product analytics and user insights',
    features: ['event_tracking', 'cohorts', 'funnels'],
    authType: 'api_key',
    apiKeyEnv: 'MIXPANEL_API_KEY',
    icon: '🔍'
  },
  amplitude: {
    id: 'amplitude',
    name: 'Amplitude',
    category: 'analytics',
    description: 'Digital analytics and feature tracking',
    features: ['event_tracking', 'retention', 'insights'],
    authType: 'api_key',
    apiKeyEnv: 'AMPLITUDE_API_KEY',
    icon: '📊'
  },
  segment: {
    id: 'segment',
    name: 'Segment',
    category: 'analytics',
    description: 'Customer data platform and analytics hub',
    features: ['data_collection', 'routing', 'identity'],
    authType: 'api_key',
    apiKeyEnv: 'SEGMENT_API_KEY',
    icon: '🎯'
  },
  datadog: {
    id: 'datadog',
    name: 'Datadog',
    category: 'monitoring',
    description: 'Application monitoring and insights',
    features: ['monitoring', 'logs', 'apm'],
    authType: 'api_key',
    apiKeyEnv: 'DATADOG_API_KEY',
    icon: '🔔'
  },

  // Automation (3)
  zapier: {
    id: 'zapier',
    name: 'Zapier',
    category: 'automation',
    description: 'Workflow automation and integrations',
    features: ['workflow_automation', 'multi_app_automation', 'triggers'],
    authType: 'api_key',
    apiKeyEnv: 'ZAPIER_API_KEY',
    icon: '⚡'
  },
  ifttt: {
    id: 'ifttt',
    name: 'IFTTT',
    category: 'automation',
    description: 'Simple automation and integrations',
    features: ['automation', 'webhooks', 'triggers'],
    authType: 'api_key',
    apiKeyEnv: 'IFTTT_API_KEY',
    icon: '🤖'
  },
  n8n: {
    id: 'n8n',
    name: 'n8n',
    category: 'automation',
    description: 'Open-source workflow automation',
    features: ['workflows', 'integrations', 'webhooks'],
    authType: 'api_key',
    apiKeyEnv: 'N8N_API_KEY',
    icon: '🔄'
  },

  // Authentication (3)
  okta: {
    id: 'okta',
    name: 'Okta',
    category: 'authentication',
    description: 'Identity and SSO management',
    features: ['sso', 'mfa', 'user_management'],
    authType: 'service_account',
    icon: '🔐'
  },
  azure_ad: {
    id: 'azure_ad',
    name: 'Azure AD',
    category: 'authentication',
    description: 'Microsoft identity and SSO',
    features: ['sso', 'mfa', 'conditional_access'],
    authType: 'service_account',
    icon: '🔷'
  },
  auth0: {
    id: 'auth0',
    name: 'Auth0',
    category: 'authentication',
    description: 'Authentication and authorization platform',
    features: ['sso', 'mfa', 'social_login'],
    authType: 'service_account',
    icon: '🛡️'
  },

  // CRM & Business (2)
  hubspot: {
    id: 'hubspot',
    name: 'HubSpot',
    category: 'crm',
    description: 'CRM, contacts, and company management',
    features: ['contacts', 'deals', 'workflows'],
    authType: 'api_key',
    apiKeyEnv: 'HUBSPOT_API_KEY',
    icon: '🎫'
  },
  linkedin: {
    id: 'linkedin',
    name: 'LinkedIn',
    category: 'crm',
    description: 'Employee profiles and professional network',
    features: ['profile_data', 'sharing', 'insights'],
    authType: 'oauth',
    scopes: ['r_liteprofile', 'w_member_social'],
    icon: '💼'
  },

  // Payments (1)
  stripe: {
    id: 'stripe',
    name: 'Stripe',
    category: 'payments',
    description: 'Payment processing for rewards store',
    features: ['payments', 'subscriptions', 'payouts'],
    authType: 'api_key',
    apiKeyEnv: 'STRIPE_API_KEY',
    icon: '💳'
  },

  // Development Tools (1)
  github: {
    id: 'github',
    name: 'GitHub',
    category: 'productivity',
    description: 'Code repository and project management',
    features: ['repo_access', 'issues', 'prs'],
    authType: 'oauth',
    scopes: ['repo', 'read:user'],
    icon: '🐙'
  }
};

export default INTEGRATIONS_REGISTRY;