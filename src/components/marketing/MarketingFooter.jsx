import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Sparkles, Mail, Linkedin, Twitter } from 'lucide-react';

export default function MarketingFooter() {
  const navigation = {
    product: [
      { name: 'Features', href: createPageUrl('Product') },
      { name: 'How It Works', href: createPageUrl('HowItWorks') },
      { name: 'Pricing', href: createPageUrl('Pricing') },
      { name: 'Security', href: createPageUrl('SecurityPrivacy') },
    ],
    solutions: [
      { name: 'For HR Teams', href: createPageUrl('SolutionsHR') },
      { name: 'For Managers', href: createPageUrl('SolutionsManagers') },
      { name: 'For Executives', href: createPageUrl('SolutionsExecutives') },
    ],
    resources: [
      { name: 'Case Studies', href: createPageUrl('Resources') },
      { name: 'Documentation', href: createPageUrl('Documentation') },
      { name: 'Blog', href: createPageUrl('Resources') },
    ],
    company: [
      { name: 'About', href: createPageUrl('MarketingHome') },
      { name: 'Contact', href: createPageUrl('ContactDemo') },
      { name: 'Careers', href: '#' },
    ],
    legal: [
      { name: 'Privacy Policy', href: '#' },
      { name: 'Terms of Service', href: '#' },
      { name: 'Cookie Policy', href: '#' },
      { name: 'Status', href: '#' },
    ],
  };

  return (
    <footer className="bg-[var(--ink)] text-white border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
          {/* Logo & Tagline */}
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-[var(--orb-accent)] rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">INTeract</span>
            </div>
            <p className="text-sm text-white/70 leading-relaxed max-w-xs">
              Enterprise employee engagement built for modern, distributed teams.
            </p>
          </div>

          {/* Navigation Columns */}
          <div>
            <h3 className="text-sm font-bold mb-3">Product</h3>
            <ul className="space-y-2">
              {navigation.product.map((item) => (
                <li key={item.name}>
                  <Link to={item.href} className="text-sm text-white/70 hover:text-white transition-colors">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold mb-3">Solutions</h3>
            <ul className="space-y-2">
              {navigation.solutions.map((item) => (
                <li key={item.name}>
                  <Link to={item.href} className="text-sm text-white/70 hover:text-white transition-colors">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold mb-3">Resources</h3>
            <ul className="space-y-2">
              {navigation.resources.map((item) => (
                <li key={item.name}>
                  <Link to={item.href} className="text-sm text-white/70 hover:text-white transition-colors">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold mb-3">Company</h3>
            <ul className="space-y-2">
              {navigation.company.map((item) => (
                <li key={item.name}>
                  <Link to={item.href} className="text-sm text-white/70 hover:text-white transition-colors">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-white/60">© 2026 INTeract. All rights reserved.</p>
          
          <div className="flex gap-4">
            {navigation.legal.map((item) => (
              <Link key={item.name} to={item.href} className="text-xs text-white/60 hover:text-white transition-colors">
                {item.name}
              </Link>
            ))}
          </div>

          <div className="flex gap-4">
            <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
              <Linkedin className="w-4 h-4" />
            </a>
            <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
              <Twitter className="w-4 h-4" />
            </a>
            <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
              <Mail className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}