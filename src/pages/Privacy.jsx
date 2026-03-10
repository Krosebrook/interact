import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { ArrowLeft, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <div className="mb-8">
          <Link to={createPageUrl('Landing')}>
            <Button variant="ghost" className="gap-2 text-slate-600 mb-6">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 bg-gradient-to-br from-[#FF8A3D] to-[#FFB86C] rounded-xl flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Privacy Policy</h1>
          </div>
          <p className="text-slate-500 text-sm">Last updated: March 2026</p>
        </div>

        <div className="prose prose-slate max-w-none space-y-8 text-slate-700">
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">1. Information We Collect</h2>
            <p>
              INTeract collects information you provide directly, including name, email address, 
              department, and profile information when you create an account or use our services.
              We also collect usage data, engagement metrics, and survey responses to power our 
              analytics features.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">2. How We Use Your Information</h2>
            <p>We use your information to provide, maintain, and improve INTeract, including:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Powering the recognition, challenges, and gamification features</li>
              <li>Generating engagement analytics for HR administrators</li>
              <li>Sending notifications and digests you have opted into</li>
              <li>Improving AI-powered recommendations and coaching features</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">3. Data Retention</h2>
            <p>
              We retain your data for the duration of your organization's subscription and for 
              up to 90 days after account termination, unless a shorter period is required by law 
              or requested by your organization.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">4. Survey Anonymity</h2>
            <p>
              Pulse survey responses are anonymized by default. Individual responses are never 
              shared with managers or administrators. Aggregate results are only shown when a 
              minimum of 5 responses have been collected to prevent de-anonymization.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">5. Data Security</h2>
            <p>
              INTeract implements industry-standard security measures including encryption at 
              rest and in transit, role-based access controls, and audit logging of all 
              administrative actions. We are pursuing SOC 2 Type II certification.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">6. GDPR & Your Rights</h2>
            <p>If you are located in the EU/EEA, you have the right to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Access your personal data</li>
              <li>Request correction or deletion of your data</li>
              <li>Object to processing</li>
              <li>Request data portability</li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, contact us at{' '}
              <a href="mailto:privacy@intinc.com" className="text-[#FF8A3D] hover:underline">
                privacy@intinc.com
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">7. Contact</h2>
            <p>
              For privacy questions or concerns, contact our Data Protection team at{' '}
              <a href="mailto:privacy@intinc.com" className="text-[#FF8A3D] hover:underline">
                privacy@intinc.com
              </a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}