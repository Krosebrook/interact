import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { base44 } from '@/api/base44Client';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ErrorBoundary from '../common/ErrorBoundary';

const HEADER_IMAGE = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/691e3ae3bd4916f2e05ae35e/1b2b117bd_ChatGPTImageNov25202503_31_49PM.png';

/**
 * PublicLayout - Minimal marketing shell for public pages
 * Renders identically whether user is logged in or not
 * No sidebar, no authenticated UI chrome, no onboarding
 */
export default function PublicLayout({ children }) {
  const handleSignIn = () => {
    base44.auth.redirectToLogin();
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100" lang="en">
      {/* Skip to main content - WCAG 2.4.1 */}
      <a 
        href="#main-content" 
        className="absolute -top-10 left-0 bg-int-orange text-white px-3 py-2 rounded focus:top-0 transition-all z-50 focus:outline-none focus:ring-2 focus:ring-white"
      >
        Skip to main content
      </a>

      {/* Header with scenic image */}
      <header 
        className="relative h-20 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${HEADER_IMAGE})`, backgroundPosition: 'center top' }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/10" />
        <div className="relative z-10 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Left: Logo */}
          <Link to={createPageUrl('Landing')} className="flex items-center gap-3">
            <div className="h-10 w-10 bg-int-orange rounded-xl flex items-center justify-center shadow-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-white drop-shadow-lg">INTeract</h1>
              <p className="text-xs text-white/80">Employee Engagement</p>
            </div>
          </Link>

          {/* Right: Sign In Button */}
          <Button
            onClick={handleSignIn}
            className="bg-int-orange hover:bg-int-orange-dark text-white shadow-lg"
          >
            Sign In
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </main>

      {/* Footer with scenic image */}
      <footer 
        className="relative h-16 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${HEADER_IMAGE})`, backgroundPosition: 'center bottom' }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-black/10" />
        <div className="relative z-10 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <p className="text-sm text-white/80">© 2025 INTeract</p>
          <div className="flex items-center gap-4 text-sm text-white/80">
            <span>Powered by FlashFusion</span>
          </div>
        </div>
      </footer>
    </div>
  );
}