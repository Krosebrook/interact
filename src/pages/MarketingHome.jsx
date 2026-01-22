import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { FileQuestion, UserX, BarChart3, Zap, Eye, Building2, Target, Activity, Shield, Lock, Key, FileSearch } from 'lucide-react';
import MarketingHero from '@/components/marketing/MarketingHero';
import PainCard from '@/components/marketing/PainCard';
import PillarCard from '@/components/marketing/PillarCard';
import DashboardPreview from '@/components/marketing/DashboardPreview';
import TimelineStep from '@/components/marketing/TimelineStep';
import TestimonialCard from '@/components/marketing/TestimonialCard';
import StatTile from '@/components/marketing/StatTile';
import SecurityChip from '@/components/marketing/SecurityChip';
import CTASection from '@/components/marketing/CTASection';
import MarketingFooter from '@/components/marketing/MarketingFooter';

export default function MarketingHome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[var(--mist)]">
      {/* Hero Section */}
      <MarketingHero
        title="A Brighter Way to Engage Your Workforce"
        subtitle="INTINC activates culture, participation, and performance—turning engagement into a living system."
        primaryCTA="Request a Demo"
        secondaryCTA="See How It Works"
        onPrimaryCTA={() => navigate(createPageUrl('ContactDemo'))}
        onSecondaryCTA={() => navigate(createPageUrl('HowItWorks'))}
      />

      {/* Pain Points Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-[var(--ink)] mb-4">
            Why engagement platforms fail
          </h2>
          <p className="text-center text-[var(--slate)] text-lg mb-12 max-w-2xl mx-auto">
            Most tools measure—but don't activate. They survey—but don't solve.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <PainCard
              icon={FileQuestion}
              title="Survey fatigue"
              description="Employees are tired of answering questions that lead nowhere. Forms pile up. Insights collect dust."
              delay={0}
            />
            <PainCard
              icon={UserX}
              title="Low adoption"
              description="Clunky interfaces and disconnected workflows mean low usage. The platform becomes shelf-ware within months."
              delay={0.1}
            />
            <PainCard
              icon={BarChart3}
              title="No actionability"
              description="Dashboards full of metrics, but no clear next steps. Leaders are left guessing what to fix first."
              delay={0.2}
            />
          </div>

          <p className="text-center text-2xl font-bold text-[var(--ink)] italic">
            Engagement isn't a report. It's an operating system.
          </p>
        </div>
      </section>

      {/* Value Proposition Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-[var(--ink)] mb-4">
            What INTINC delivers
          </h2>
          <p className="text-center text-[var(--slate)] text-lg mb-12 max-w-2xl mx-auto">
            A platform that doesn't just measure engagement—it creates it.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <PillarCard
              icon={Zap}
              title="Participation that scales"
              outcomes={[
                'Peer recognition, pulse surveys, and milestone celebrations in one seamless flow',
                'Mobile-first design that works wherever your team is',
              ]}
              learnMoreLink={createPageUrl('Product')}
              delay={0}
            />
            <PillarCard
              icon={Eye}
              title="Leadership-grade visibility"
              outcomes={[
                'Real-time dashboards showing engagement trends, team hotspots, and recommended actions',
                'No spreadsheets, no manual reports—just clarity',
              ]}
              learnMoreLink={createPageUrl('Product')}
              delay={0.1}
            />
            <PillarCard
              icon={Building2}
              title="Built for real orgs"
              outcomes={[
                'SSO/SAML, RBAC, audit logs, and enterprise-grade security out of the box',
                'Integrates with Slack, Teams, and your HRIS',
              ]}
              learnMoreLink={createPageUrl('SecurityPrivacy')}
              delay={0.2}
            />
          </div>
        </div>
      </section>

      {/* Product Preview Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto text-center mb-12">
          <h2 className="text-4xl font-bold text-[var(--ink)] mb-4">
            See engagement in action
          </h2>
          <p className="text-[var(--slate)] text-lg max-w-2xl mx-auto">
            Whether you're in HR, leading a team, or running the company—INTINC gives you the view you need.
          </p>
        </div>

        <DashboardPreview />
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-[var(--ink)] mb-16">
            How it works
          </h2>

          <TimelineStep
            number={1}
            title="Activate"
            description="Launch recognition, pulse surveys, and team channels. Your culture starts moving from day one—no training manuals required."
            icon={Target}
            delay={0}
          />
          <TimelineStep
            number={2}
            title="Measure"
            description="Track participation, sentiment, and engagement trends in real time. See which teams are thriving and which need support."
            icon={Activity}
            delay={0.1}
          />
          <TimelineStep
            number={3}
            title="Adapt"
            description="Get AI-powered recommendations on where to focus. Iterate on what's working. Build a culture that evolves with your organization."
            icon={Zap}
            isLast={true}
            delay={0.2}
          />
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-[var(--ink)] mb-12">
            Trusted by growing organizations
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <TestimonialCard
              quote="INTINC gave us something our old platform never did: clarity. We can see engagement trends in real time and actually do something about them."
              author="Sarah Chen"
              role="VP of People Operations"
              company="TechCorp"
              delay={0}
            />
            <TestimonialCard
              quote="We rolled out INTINC to 200 employees in under a week. The adoption was immediate—our teams actually wanted to use it."
              author="Marcus Rodriguez"
              role="Chief People Officer"
              company="GlobalSync"
              delay={0.1}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatTile
              value="92%"
              label="Average adoption rate"
              icon={Zap}
              trend="+18% vs industry avg"
              delay={0}
            />
            <StatTile
              value="3.2x"
              label="Weekly participation frequency"
              icon={Activity}
              trend="2x higher engagement"
              delay={0.1}
            />
            <StatTile
              value="<24h"
              label="Time-to-insight"
              icon={BarChart3}
              trend="Real-time dashboards"
              delay={0.2}
            />
          </div>
        </div>
      </section>

      {/* Security & Trust Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-[var(--ink)] mb-4">
            Enterprise-grade security & privacy
          </h2>
          <p className="text-[var(--slate)] text-lg mb-12 max-w-2xl mx-auto">
            Respectful analytics. No surveillance. Built for organizations that take data seriously.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <SecurityChip icon={Shield} label="SSO/SAML" delay={0} />
            <SecurityChip icon={Lock} label="RBAC" delay={0.05} />
            <SecurityChip icon={FileSearch} label="Audit Logs" delay={0.1} />
            <SecurityChip icon={Key} label="Encryption at Rest" delay={0.15} />
          </div>

          <p className="text-sm text-[var(--slate)] italic">
            SOC2-ready. GDPR-compliant. Your data stays yours.
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <CTASection
        headline="Culture doesn't happen by accident. Build it deliberately."
        primaryCTA="Request a Demo"
        secondaryCTA="Talk to Sales"
        onPrimaryCTA={() => navigate(createPageUrl('ContactDemo'))}
        onSecondaryCTA={() => navigate(createPageUrl('ContactDemo'))}
      />

      {/* Footer */}
      <MarketingFooter />
    </div>
  );
}