import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  Mountain, BarChart3, Users, Award, Sparkles, 
  TrendingUp, Calendar, Heart, Menu 
} from 'lucide-react';

const HERO_IMAGE = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/691e3ae3bd4916f2e05ae35e/e27ebfa44_ChatGPTImageJan14202609_44_29PM.png';

export default function MarketingLanding() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#221a10] text-slate-900 dark:text-white font-['Newsreader']">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-white/80 dark:bg-[#221a10]/80 backdrop-blur-md border-b border-slate-200 dark:border-white/10">
        <div className="flex items-center p-4 justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <Mountain className="h-6 w-6 text-[#f49d25]" />
            <h2 className="text-lg font-bold">INTeract</h2>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-[#9c7a49] text-sm font-bold cursor-pointer hidden md:block">Log In</p>
            <Menu className="h-6 w-6 md:hidden" />
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative w-full">
          <div 
            className="relative min-h-[90vh] flex flex-col items-center justify-center p-6 bg-cover bg-center"
            style={{ 
              backgroundImage: `url(${HERO_IMAGE})`,
              backgroundPosition: 'center center'
            }}
          >
            <div className="bg-white/15 backdrop-blur-xl border border-white/20 p-8 rounded-xl max-w-lg w-full text-center space-y-6 shadow-2xl">
              <div className="space-y-3">
                <h1 className="text-white text-4xl md:text-5xl font-bold leading-tight drop-shadow-lg">
                  Elevate Your Workplace.
                </h1>
                <p className="text-white/90 text-base italic drop-shadow-md">
                  Gamified engagement built on the robust Base44 backend.
                </p>
              </div>
              <Link to={createPageUrl('Dashboard')}>
                <Button className="bg-[#D97230] hover:bg-[#C46322] text-white font-bold py-4 px-8 text-lg w-full shadow-lg">
                  Get Started
                </Button>
              </Link>
            </div>
            <div className="absolute bottom-8 animate-bounce text-white/60">
              <TrendingUp className="h-8 w-8" />
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="py-6 bg-white dark:bg-zinc-950/20 border-y border-slate-200 dark:border-white/5">
          <p className="text-center text-[#9c7a49] text-xs font-bold uppercase tracking-widest mb-8">
            Trusted by Industry Leaders
          </p>
          <div className="flex overflow-x-hidden">
            <div className="flex items-center gap-12 animate-scroll">
              {['Base44', 'Stitch', 'Vertex', 'Lumina Energy', 'Core Systems', 'Base44', 'Stitch'].map((company, i) => (
                <span key={i} className="text-2xl font-semibold text-[#9c7a49]/40 whitespace-nowrap">
                  {company}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Section Header */}
        <div className="pt-20 pb-10 flex flex-col items-center px-6">
          <h4 className="text-[#f49d25] text-sm font-bold uppercase tracking-widest mb-2">The Ascent</h4>
          <h2 className="text-3xl md:text-4xl font-bold text-center max-w-xl">
            Studio-grade tools for modern culture.
          </h2>
        </div>

        {/* Features Bento Grid */}
        <section className="px-6 pb-32 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Real-time Analytics */}
            <Card className="p-6 border-white/20 hover:-translate-y-1 transition-all bg-white/90 backdrop-blur-xl shadow-lg">
              <div className="w-full h-48 bg-gradient-to-br from-slate-100 to-[#e2d1c3] rounded-lg mb-6 flex items-center justify-center relative overflow-hidden">
                <BarChart3 className="h-16 w-16 text-[#D97230]/40" />
                <div className="absolute bottom-4 left-4 right-4 h-1 bg-[#D97230]/20 rounded-full overflow-hidden">
                  <div className="h-full bg-[#D97230] w-2/3 rounded-full" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2 text-[#14294D]">Real-time Analytics</h3>
              <p className="text-slate-700">Monitor engagement as it happens with studio-grade data visualization and predictive trends.</p>
            </Card>

            {/* Avatar Upgrades */}
            <Card className="p-6 border-white/20 hover:-translate-y-1 transition-all lg:row-span-2 bg-white/90 backdrop-blur-xl shadow-lg">
              <div className="w-full min-h-[300px] lg:min-h-full bg-gradient-to-t from-[#fff1eb] to-[#ace0f9] rounded-lg flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
                <Sparkles className="h-20 w-20 text-[#D97230] mb-6 drop-shadow-lg" />
                <h3 className="text-xl font-bold mb-2 text-[#14294D]">Avatar Upgrades</h3>
                <p className="text-slate-700 text-sm italic">Unlock premium aesthetic gear as your professional impact grows across the platform.</p>
                <Award className="absolute top-10 right-10 h-10 w-10 text-[#D97230]/30 rotate-12" />
                <Heart className="absolute bottom-20 left-10 h-10 w-10 text-[#D97230]/30 -rotate-12" />
              </div>
            </Card>

            {/* Peer Recognition */}
            <Card className="p-6 border-white/20 hover:-translate-y-1 transition-all bg-white/90 backdrop-blur-xl shadow-lg">
              <div className="w-full h-48 bg-gradient-to-br from-orange-100 to-pink-100 rounded-lg mb-6 flex items-center justify-center">
                <Heart className="h-16 w-16 text-[#D97230]" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-[#14294D]">Peer Recognition</h3>
              <p className="text-slate-700">Social capital powered by genuine appreciation. Make every shoutout count.</p>
            </Card>

            {/* Pulse Surveys */}
            <Card className="p-6 border-white/20 hover:-translate-y-1 transition-all bg-white/90 backdrop-blur-xl shadow-lg">
              <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg mb-6 flex items-center justify-center">
                <BarChart3 className="h-16 w-16 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-[#14294D]">Pulse Surveys</h3>
              <p className="text-slate-700">Anonymous weekly check-ins that give you the sentiment pulse of your entire org.</p>
            </Card>

            {/* Team Challenges */}
            <Card className="p-6 border-white/20 hover:-translate-y-1 transition-all bg-white/90 backdrop-blur-xl shadow-lg">
              <div className="w-full h-48 bg-gradient-to-br from-green-100 to-teal-100 rounded-lg mb-6 flex items-center justify-center">
                <Users className="h-16 w-16 text-green-500" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-[#14294D]">Team Challenges</h3>
              <p className="text-slate-700">Cross-departmental wellness initiatives that build camaraderie at scale.</p>
            </Card>

            {/* Milestone Celebrations */}
            <Card className="p-6 border-white/20 hover:-translate-y-1 transition-all bg-white/90 backdrop-blur-xl shadow-lg">
              <div className="w-full h-48 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg mb-6 flex items-center justify-center">
                <Calendar className="h-16 w-16 text-purple-500" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-[#14294D]">Milestone Celebrations</h3>
              <p className="text-slate-700">Never miss a birthday or work anniversary. Automated celebrations that feel personal.</p>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-6 py-20 bg-gradient-to-br from-[#D97230]/10 to-transparent">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-[#14294D]">Ready to transform your culture?</h2>
            <p className="text-slate-700 text-lg">
              Join forward-thinking companies using INTeract to build thriving remote cultures.
            </p>
            <Link to={createPageUrl('Dashboard')}>
              <Button className="bg-[#D97230] hover:bg-[#C46322] text-white font-bold px-12 py-6 text-lg shadow-xl shadow-[#D97230]/20">
                Start Your Journey
              </Button>
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-slate-900 dark:bg-[#16110a] text-white py-12 px-6">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Mountain className="h-6 w-6 text-[#f49d25]" />
                <span className="font-bold text-lg">INTeract</span>
              </div>
              <p className="text-sm text-slate-400">Elevating workplace culture through gamified engagement.</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>Features</li>
                <li>Pricing</li>
                <li>Integrations</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>About</li>
                <li>Careers</li>
                <li>Contact</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>Documentation</li>
                <li>Support</li>
                <li>Privacy</li>
              </ul>
            </div>
          </div>
          <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/10 text-center text-sm text-slate-400">
            © 2026 INTeract. All rights reserved.
          </div>
        </footer>
      </main>
    </div>
  );
}