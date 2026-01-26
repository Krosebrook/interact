import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  Activity, TrendingUp, Code, BarChart3, 
  Users, Award, Check, Menu 
} from 'lucide-react';

const BG_IMAGE = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/691e3ae3bd4916f2e05ae35e/e27ebfa44_ChatGPTImageJan14202609_44_29PM.png';

export default function ProductShowcase() {
  return (
    <div className="min-h-screen bg-cover bg-center bg-fixed text-[#1e293b] dark:text-white" style={{ backgroundImage: `url(${BG_IMAGE})` }}>
      {/* Header */}
      <nav className="sticky top-0 z-50 bg-white/15 backdrop-blur-xl border-b border-white/20">
        <div className="flex items-center p-4 justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-[#D97230]" />
            <h2 className="text-lg font-extrabold text-white drop-shadow-md">INTeract</h2>
          </div>
          <div className="flex items-center gap-4">
            <Button className="bg-[#D97230] hover:bg-[#C46322] text-white px-4 py-2 text-sm font-bold shadow-lg">
              Demo
            </Button>
            <Menu className="h-6 w-6 text-white" />
          </div>
        </div>
      </nav>

      <main>
        {/* Hero with Dashboard Preview */}
        <header className="py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6 bg-white/15 backdrop-blur-xl border border-white/20 p-8 rounded-xl shadow-2xl">
                <Badge className="bg-[#D97230]/20 text-white border-white/30 uppercase tracking-widest backdrop-blur-md">
                  Aspirational Growth V2
                </Badge>
                <h1 className="text-4xl md:text-5xl font-black leading-tight text-white drop-shadow-lg">
                  Engagement <br/><span className="text-[#F4A460]">Reimagined</span>
                </h1>
                <p className="text-white/90 text-lg drop-shadow-md">
                  Turn cultural sentiment into measurable growth with our enterprise-grade gamification engine.
                </p>
                <div className="space-y-3">
                  <Button className="w-full bg-[#D97230] hover:bg-[#C46322] text-white py-4 font-bold text-lg shadow-lg flex items-center justify-center gap-2">
                    Schedule Demo →
                  </Button>
                  <p className="text-center text-xs text-white/70">Trusted by Fortune 500 decision-makers</p>
                </div>
              </div>

              {/* Dashboard Mockup */}
              <Card className="shadow-2xl overflow-hidden bg-white/90 backdrop-blur-xl border-white/30">
                <div className="p-4 bg-slate-50/80 backdrop-blur-md border-b border-slate-200/50 flex justify-between items-center">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-400" />
                    <div className="w-2 h-2 rounded-full bg-yellow-400" />
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                  </div>
                  <div className="h-4 w-32 bg-slate-200 rounded-full" />
                </div>
                <CardContent className="p-4 space-y-3 bg-white/95 backdrop-blur-md">
                  <div className="col-span-2 h-24 bg-gradient-to-br from-[#D97230]/10 to-transparent rounded-xl p-3 border border-[#D97230]/20">
                    <p className="text-xs font-bold text-[#D97230] uppercase">Sentiment Score</p>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-2xl font-black">84.2%</span>
                      <span className="text-xs text-green-500 font-bold">▲ 12.4%</span>
                    </div>
                    <div className="w-full h-8 mt-1 bg-[#D97230]/5 rounded flex items-end gap-1 px-1">
                      {[40, 60, 50, 80, 90].map((height, i) => (
                        <div key={i} className="w-full bg-[#D97230] rounded-t-sm" style={{ height: `${height}%`, opacity: 0.2 + (i * 0.2) }} />
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="h-20 bg-slate-50 dark:bg-slate-800 rounded-xl p-2 border">
                      <div className="w-8 h-8 rounded bg-[#fbbf24]/20 flex items-center justify-center mb-1">
                        <Award className="h-4 w-4 text-[#f97316]" />
                      </div>
                      <div className="h-2 w-10 bg-slate-300 rounded mb-1" />
                      <div className="h-3 w-14 bg-slate-900 dark:bg-white rounded" />
                    </div>
                    <div className="h-20 bg-slate-50 rounded-xl p-2 border border-slate-200">
                      <div className="w-8 h-8 rounded bg-[#2C5F7C]/20 flex items-center justify-center mb-1">
                        <Users className="h-4 w-4 text-[#2C5F7C]" />
                      </div>
                      <div className="h-2 w-10 bg-slate-300 rounded mb-1" />
                      <div className="h-3 w-14 bg-slate-900 dark:bg-white rounded" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </header>

        {/* Trusted By Section */}
        <section className="px-6 py-16 bg-white/10 backdrop-blur-xl border-y border-white/20">
          <div className="max-w-7xl mx-auto">
            <p className="text-center text-white/80 text-xs font-bold uppercase tracking-widest mb-12 drop-shadow-md">
              Trusted by the world's most innovative teams
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center opacity-60">
              {['BASE44', 'STITCH', 'CORE SYS', 'LUMINA'].map((name) => (
                <div key={name} className="text-xl font-bold text-white drop-shadow-sm">{name}</div>
              ))}
            </div>
          </div>
        </section>

        {/* Integration Section */}
        <section className="px-6 py-20">
          <div className="max-w-5xl mx-auto">
            <h3 className="text-2xl font-bold mb-2 text-center text-white drop-shadow-lg">Base44 Integration</h3>
            <p className="text-center text-white/80 mb-8 drop-shadow-md">
              The backbone framework powering your culture data lake.
            </p>
            <Card className="bg-[#14294D]/85 backdrop-blur-xl border-white/20 shadow-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Code className="h-5 w-5 text-emerald-400" />
                    <span className="text-emerald-400 text-sm font-mono">example.js</span>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-xs text-slate-500">Live</span>
                  </div>
                </div>
                <pre className="text-xs md:text-sm font-mono text-slate-300 overflow-x-auto">
{`import { base44 } from '@/api/base44Client';

// Award recognition points
await base44.entities.Recognition.create({
  sender_email: user.email,
  recipient_email: "teammate@company.com",
  message: "Great work on the project!",
  points_awarded: 50,
  recognition_type: "peer_shoutout"
});

// Track engagement
await base44.analytics.track({
  eventName: "recognition_sent",
  properties: { points: 50 }
});`}
                </pre>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Stats Section */}
        <section className="px-6 py-20">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-[#D97230]/90 backdrop-blur-xl text-white p-8 text-center border-white/20 shadow-xl">
              <p className="text-5xl font-black mb-2">98%</p>
              <p className="text-sm">Employee Satisfaction</p>
            </Card>
            <Card className="bg-white/90 backdrop-blur-xl p-8 text-center border-white/30 shadow-xl">
              <p className="text-5xl font-black mb-2 text-[#14294D]">14min</p>
              <p className="text-sm text-slate-700">Avg. Daily Active Time</p>
            </Card>
            <Card className="bg-[#14294D]/85 backdrop-blur-xl text-white p-8 text-center border-white/20 shadow-xl">
              <p className="text-5xl font-black mb-2">3.2x</p>
              <p className="text-sm">Recognition Velocity</p>
            </Card>
          </div>
        </section>

        {/* Final CTA */}
        <section className="px-6 py-20 bg-[#14294D]/85 backdrop-blur-xl text-white text-center border-y border-white/20">
          <h2 className="text-3xl font-bold mb-6 drop-shadow-lg">Ready to scale?</h2>
          <Link to={createPageUrl('Dashboard')}>
            <Button className="bg-[#D97230] hover:bg-[#C46322] text-white font-bold px-12 py-6 text-lg shadow-xl">
              Book Trial
            </Button>
          </Link>
        </section>
      </main>
    </div>
  );
}