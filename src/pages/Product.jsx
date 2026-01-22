import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Heart, BarChart3, MessageSquare, Users, Shield, Plug } from 'lucide-react';
import MarketingHero from '@/components/marketing/MarketingHero';
import PillarCard from '@/components/marketing/PillarCard';
import CTASection from '@/components/marketing/CTASection';
import MarketingFooter from '@/components/marketing/MarketingFooter';
import { motion } from 'framer-motion';

export default function Product() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[var(--mist)]">
      {/* Hero */}
      <MarketingHero
        title="The engagement platform that actually works"
        subtitle="Recognition, insights, and culture-building tools—designed for distributed teams who need more than surveys."
        primaryCTA="Request a Demo"
        secondaryCTA="See Pricing"
        onPrimaryCTA={() => navigate(createPageUrl('ContactDemo'))}
        onSecondaryCTA={() => navigate(createPageUrl('Pricing'))}
        showTrustRow={false}
        showProofCard={false}
      />

      {/* Product Modules */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-[var(--ink)] mb-4">
            Three modules. One seamless experience.
          </h2>
          <p className="text-center text-[var(--slate)] text-lg mb-16 max-w-2xl mx-auto">
            INTINC combines recognition, measurement, and communication into a single platform your team will actually use.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <PillarCard
              icon={Heart}
              title="Engagement Hub"
              outcomes={[
                'Peer-to-peer recognition that scales across departments',
                'Milestone celebrations for birthdays, anniversaries, and achievements',
                'Public shoutouts and private appreciation notes',
              ]}
              learnMoreLink={createPageUrl('HowItWorks')}
              delay={0}
            />
            <PillarCard
              icon={MessageSquare}
              title="Recognition & Channels"
              outcomes={[
                'Team channels organized by department, project, or interest',
                'Direct messaging for 1:1 connections',
                'Gamification with badges, points, and leaderboards',
              ]}
              learnMoreLink={createPageUrl('HowItWorks')}
              delay={0.1}
            />
            <PillarCard
              icon={BarChart3}
              title="Insights Dashboard"
              outcomes={[
                'Real-time engagement scores and participation trends',
                'Anonymous pulse surveys with instant results',
                'AI-powered recommendations for team interventions',
              ]}
              learnMoreLink={createPageUrl('HowItWorks')}
              delay={0.2}
            />
          </div>
        </div>
      </section>

      {/* Role-Based Views */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-[var(--ink)] mb-16">
            Built for every role in your organization
          </h2>

          <div className="space-y-16">
            {/* HR View */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
            >
              <div>
                <div className="inline-block bg-[var(--orb-accent)]/10 rounded-full px-4 py-2 mb-4">
                  <span className="text-sm font-bold text-[var(--orb-accent)]">FOR HR TEAMS</span>
                </div>
                <h3 className="text-3xl font-bold text-[var(--ink)] mb-4">
                  The command center for culture
                </h3>
                <p className="text-[var(--slate)] leading-relaxed mb-6">
                  Manage recognition programs, launch pulse surveys, track engagement metrics, and get AI-powered recommendations—all from one dashboard.
                </p>
                <ul className="space-y-3 text-[var(--slate)]">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--orb-accent)] mt-2 flex-shrink-0" />
                    Survey builder with anonymization controls
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--orb-accent)] mt-2 flex-shrink-0" />
                    Team-level engagement heatmaps
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--orb-accent)] mt-2 flex-shrink-0" />
                    Export-ready reports for leadership
                  </li>
                </ul>
              </div>
              <div className="bg-gradient-to-br from-[var(--orb-accent)]/10 to-[var(--sunrise-glow)]/10 rounded-2xl p-8 border border-[var(--orb-accent)]/20">
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-[var(--slate)]">HR DASHBOARD</span>
                    <Users className="w-4 h-4 text-[var(--orb-accent)]" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[var(--slate)]">Overall Engagement</span>
                      <span className="text-lg font-bold text-[var(--ink)]">78%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[var(--orb-accent)] to-[var(--sunrise-glow)] w-3/4" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Manager View */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
            >
              <div className="order-2 lg:order-1 bg-gradient-to-br from-[var(--int-teal)]/10 to-[var(--success)]/10 rounded-2xl p-8 border border-[var(--int-teal)]/20">
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-[var(--slate)]">TEAM PULSE</span>
                    <BarChart3 className="w-4 h-4 text-[var(--int-teal)]" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-[var(--slate)]">This week</span>
                      <span className="text-[var(--success)] font-bold">+12%</span>
                    </div>
                    <div className="flex gap-1">
                      {[60, 75, 68, 82, 90].map((h, i) => (
                        <div key={i} className="flex-1 bg-slate-100 rounded-sm overflow-hidden">
                          <div className="bg-[var(--int-teal)]" style={{ height: `${h}%` }} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <div className="inline-block bg-[var(--int-teal)]/10 rounded-full px-4 py-2 mb-4">
                  <span className="text-sm font-bold text-[var(--int-teal)]">FOR MANAGERS</span>
                </div>
                <h3 className="text-3xl font-bold text-[var(--ink)] mb-4">
                  See your team's pulse in real time
                </h3>
                <p className="text-[var(--slate)] leading-relaxed mb-6">
                  Get weekly snapshots of your team's engagement, recognize top performers, and spot early warning signs before they become problems.
                </p>
                <ul className="space-y-3 text-[var(--slate)]">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--int-teal)] mt-2 flex-shrink-0" />
                    Quick recognition from your mobile device
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--int-teal)] mt-2 flex-shrink-0" />
                    Team-specific insights without PII exposure
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--int-teal)] mt-2 flex-shrink-0" />
                    Suggested actions based on engagement data
                  </li>
                </ul>
              </div>
            </motion.div>

            {/* Executive View */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
            >
              <div>
                <div className="inline-block bg-[var(--slate)]/10 rounded-full px-4 py-2 mb-4">
                  <span className="text-sm font-bold text-[var(--slate)]">FOR EXECUTIVES</span>
                </div>
                <h3 className="text-3xl font-bold text-[var(--ink)] mb-4">
                  Culture as a strategic KPI
                </h3>
                <p className="text-[var(--slate)] leading-relaxed mb-6">
                  Track engagement trends across departments, measure the ROI of culture initiatives, and make data-driven decisions about your workforce.
                </p>
                <ul className="space-y-3 text-[var(--slate)]">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--slate)] mt-2 flex-shrink-0" />
                    Executive dashboard with key metrics
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--slate)] mt-2 flex-shrink-0" />
                    Correlation between engagement and retention
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--slate)] mt-2 flex-shrink-0" />
                    Board-ready reports
                  </li>
                </ul>
              </div>
              <div className="bg-gradient-to-br from-[var(--slate)]/10 to-[var(--ink)]/10 rounded-2xl p-8 border border-[var(--slate)]/20">
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-[var(--slate)]">EXECUTIVE VIEW</span>
                    <Shield className="w-4 h-4 text-[var(--slate)]" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-[var(--slate)] mb-1">Engagement Score</p>
                      <p className="text-2xl font-bold text-[var(--ink)]">82</p>
                    </div>
                    <div>
                      <p className="text-xs text-[var(--slate)] mb-1">Trend</p>
                      <p className="text-2xl font-bold text-[var(--success)]">+8%</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Integrations & Security */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="text-center">
              <Plug className="w-12 h-12 text-[var(--orb-accent)] mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-[var(--ink)] mb-3">Integrations</h3>
              <p className="text-[var(--slate)] leading-relaxed">
                Connects seamlessly with Slack, Microsoft Teams, Google Workspace, and your HRIS. No manual data entry.
              </p>
            </div>
            <div className="text-center">
              <Shield className="w-12 h-12 text-[var(--success)] mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-[var(--ink)] mb-3">Security First</h3>
              <p className="text-[var(--slate)] leading-relaxed">
                SSO/SAML, RBAC, audit logs, encryption at rest. SOC2-ready architecture. Your data stays yours.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <CTASection
        headline="See how INTINC transforms engagement for your team"
        primaryCTA="Request a Demo"
        secondaryCTA="View Pricing"
        onPrimaryCTA={() => navigate(createPageUrl('ContactDemo'))}
        onSecondaryCTA={() => navigate(createPageUrl('Pricing'))}
      />

      {/* Footer */}
      <MarketingFooter />
    </div>
  );
}