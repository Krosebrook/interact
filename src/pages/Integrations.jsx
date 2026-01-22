import { Check, ExternalLink } from 'lucide-react';
import MarketingFooter from '@/components/marketing/MarketingFooter';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

const integrations = [
  {
    name: 'Slack',
    logo: '💬',
    category: 'Communication',
    description: 'Get engagement notifications, recognition alerts, and pulse survey reminders directly in Slack.',
    features: ['Real-time notifications', 'Slash commands', 'Channel integrations'],
    setupSteps: [
      'Navigate to Settings > Integrations',
      'Click "Connect Slack"',
      'Authorize workspace access',
      'Select default notification channel'
    ],
    status: 'available'
  },
  {
    name: 'Microsoft Teams',
    logo: '🎯',
    category: 'Communication',
    description: 'Seamless integration with Teams for notifications, recognition, and team channels.',
    features: ['Teams notifications', 'Bot commands', 'Adaptive cards'],
    setupSteps: [
      'Go to Settings > Integrations',
      'Click "Connect Microsoft Teams"',
      'Sign in with Microsoft 365',
      'Configure notification preferences'
    ],
    status: 'available'
  },
  {
    name: 'Google Workspace',
    logo: '📧',
    category: 'Productivity',
    description: 'Sync calendars, import employee directory, and enable SSO with Google.',
    features: ['Calendar sync', 'SSO authentication', 'Directory import'],
    setupSteps: [
      'Access Settings > Integrations',
      'Select "Google Workspace"',
      'Authorize admin consent',
      'Map employee attributes'
    ],
    status: 'available'
  },
  {
    name: 'BambooHR',
    logo: '🌿',
    category: 'HRIS',
    description: 'Automatically sync employee data, track milestones, and update org charts.',
    features: ['Employee sync', 'Milestone tracking', 'Org chart updates'],
    setupSteps: [
      'Navigate to Settings > HRIS',
      'Choose BambooHR',
      'Enter API key',
      'Configure sync frequency'
    ],
    status: 'available'
  },
  {
    name: 'Workday',
    logo: '💼',
    category: 'HRIS',
    description: 'Enterprise-grade HRIS integration for large organizations.',
    features: ['Bulk employee import', 'Role mapping', 'Automated updates'],
    setupSteps: [
      'Contact support for enterprise setup',
      'Provide Workday tenant details',
      'Configure field mappings',
      'Test sync in staging'
    ],
    status: 'enterprise'
  },
  {
    name: 'Okta',
    logo: '🔐',
    category: 'Security',
    description: 'Single Sign-On (SSO) and identity management via Okta.',
    features: ['SAML 2.0', 'SCIM provisioning', 'MFA support'],
    setupSteps: [
      'Access Settings > Security',
      'Enable SSO',
      'Enter Okta metadata URL',
      'Test SSO flow'
    ],
    status: 'available'
  },
  {
    name: 'Azure AD',
    logo: '🔷',
    category: 'Security',
    description: 'Microsoft Azure Active Directory for enterprise authentication.',
    features: ['SSO/SAML', 'User provisioning', 'Conditional access'],
    setupSteps: [
      'Go to Settings > Security',
      'Select Azure AD',
      'Configure app registration',
      'Set redirect URIs'
    ],
    status: 'available'
  },
  {
    name: 'Zapier',
    logo: '⚡',
    category: 'Automation',
    description: 'Connect INTINC to 5,000+ apps for custom workflows.',
    features: ['Custom triggers', 'Multi-step zaps', 'Webhook support'],
    setupSteps: [
      'Search for INTINC in Zapier',
      'Authenticate your account',
      'Create triggers and actions',
      'Test your zap'
    ],
    status: 'beta'
  }
];

export default function Integrations() {
  const categories = [...new Set(integrations.map(i => i.category))];

  return (
    <div className="min-h-screen bg-[var(--mist)]">
      {/* Header */}
      <section className="relative py-20 px-6 bg-gradient-to-br from-[var(--ink)] to-[var(--slate)] text-white overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--orb-accent)] rounded-full blur-3xl opacity-20" />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold mb-6"
          >
            Integrations that work out of the box
          </motion.h1>
          <p className="text-xl text-white/80">
            Connect INTINC to your existing tools. No custom development required.
          </p>
        </div>
      </section>

      {/* Integration Categories */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          {categories.map((category, idx) => (
            <div key={category} className="mb-16">
              <h2 className="text-2xl font-bold text-[var(--ink)] mb-6">{category}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {integrations
                  .filter(i => i.category === category)
                  .map((integration, i) => (
                    <motion.div
                      key={integration.name}
                      initial={{ opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-all"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <span className="text-4xl">{integration.logo}</span>
                          <div>
                            <h3 className="text-lg font-bold text-[var(--ink)]">{integration.name}</h3>
                            {integration.status === 'beta' && (
                              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">Beta</span>
                            )}
                            {integration.status === 'enterprise' && (
                              <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">Enterprise</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <p className="text-sm text-[var(--slate)] mb-4 leading-relaxed">
                        {integration.description}
                      </p>

                      <div className="mb-4">
                        <p className="text-xs font-bold text-[var(--ink)] mb-2">Key Features:</p>
                        <ul className="space-y-1">
                          {integration.features.map(f => (
                            <li key={f} className="flex items-center gap-2 text-xs text-[var(--slate)]">
                              <Check className="w-3 h-3 text-[var(--success)]" />
                              {f}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <details className="text-xs">
                        <summary className="cursor-pointer text-[var(--orb-accent)] font-semibold mb-2">
                          Setup Guide
                        </summary>
                        <ol className="list-decimal list-inside space-y-1 text-[var(--slate)] pl-2">
                          {integration.setupSteps.map((step, idx) => (
                            <li key={idx}>{step}</li>
                          ))}
                        </ol>
                      </details>
                    </motion.div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-[var(--ink)] mb-4">
            Need a custom integration?
          </h2>
          <p className="text-[var(--slate)] mb-6">
            Our enterprise plan includes custom API development and dedicated integration support.
          </p>
          <Button className="bg-[var(--orb-accent)] hover:bg-[var(--orb-accent)]/90 text-white">
            Contact Sales <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}