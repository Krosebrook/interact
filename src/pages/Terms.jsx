import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { ArrowLeft, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Terms() {
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
              <FileText className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Terms of Service</h1>
          </div>
          <p className="text-slate-500 text-sm">Last updated: March 2026</p>
        </div>

        <div className="prose prose-slate max-w-none space-y-8 text-slate-700">
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing or using INTeract ("the Service"), you agree to be bound by these 
              Terms of Service. If you are using the Service on behalf of an organization, you 
              represent that you have authority to bind that organization to these terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">2. Description of Service</h2>
            <p>
              INTeract is an employee engagement platform providing pulse surveys, peer recognition, 
              gamification, wellness challenges, team channels, virtual events, and HR analytics. 
              The Service is provided on a subscription basis to organizations.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">3. Subscription & Payment</h2>
            <p>
              Subscriptions are billed on a per-seat, per-month basis. All fees are non-refundable 
              except as required by law. We reserve the right to modify pricing with 30 days' 
              written notice to existing customers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">4. Acceptable Use</h2>
            <p>You agree not to use the Service to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Harass, bully, or discriminate against other users</li>
              <li>Upload or transmit malicious code</li>
              <li>Attempt to gain unauthorized access to other accounts or systems</li>
              <li>Use recognition or messaging features for spam or unsolicited communications</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">5. Data Ownership</h2>
            <p>
              Your organization retains ownership of all data submitted to INTeract. 
              Upon subscription termination, we will provide a data export and delete your 
              data within 90 days. INTeract may use anonymized, aggregated data to improve 
              our platform and publish benchmarking reports.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">6. Service Level Agreement</h2>
            <p>
              INTeract targets 99.9% monthly uptime. Scheduled maintenance will be communicated 
              with 48 hours' notice. In the event of downtime exceeding our SLA, service credits 
              will be applied to your next billing cycle.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">7. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, INTeract shall not be liable for indirect, 
              incidental, or consequential damages. Our aggregate liability shall not exceed the 
              fees paid by you in the twelve months preceding the claim.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">8. Contact</h2>
            <p>
              For legal questions, contact us at{' '}
              <a href="mailto:legal@intinc.com" className="text-[#FF8A3D] hover:underline">
                legal@intinc.com
              </a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}