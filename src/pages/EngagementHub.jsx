import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Activity, TrendingUp, Users, Zap, BarChart3, Award, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function EngagementHub() {
  return (
    <div className="min-h-screen bg-black text-white pb-20">
      {/* Header */}
      <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur-md p-4 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-2">
          <Activity className="h-6 w-6 text-[#ee8c2b]" />
          <h2 className="text-lg font-bold">Engagement Hub</h2>
        </div>
        <div className="flex items-center gap-4">
          <Button size="icon" variant="ghost" className="rounded-full bg-white/5">
            <Search className="h-5 w-5" />
          </Button>
        </div>
      </nav>

      <main className="max-w-md mx-auto px-4 pb-20">
        {/* Hero Section */}
        <section className="py-12 text-center space-y-6">
          <Badge className="bg-[#ee8c2b]/10 text-[#ee8c2b] border-[#ee8c2b]/20 uppercase tracking-widest">
            Enterprise Grade
          </Badge>
          <h1 className="text-4xl font-black leading-tight tracking-tight">
            The Gravity Well for Workplace Participation
          </h1>
          <p className="text-slate-400 text-base leading-relaxed">
            Frictionless, human-centric engagement designed for the modern enterprise.
          </p>
          <Button className="bg-[#ee8c2b] hover:bg-[#d97c1f] text-black font-bold px-8 py-6 text-lg shadow-lg shadow-[#ee8c2b]/20">
            Launch Demo
          </Button>
        </section>

        {/* Module Tabs */}
        <section className="mb-10">
          <div className="flex h-12 items-center justify-center rounded-xl bg-zinc-900 p-1 border border-white/5">
            <button className="h-full flex-1 rounded-lg bg-zinc-950 text-[#ee8c2b] text-sm font-semibold transition-all">
              Engagement
            </button>
            <button className="h-full flex-1 rounded-lg text-slate-400 text-sm font-semibold hover:text-white transition-all">
              Recognition
            </button>
            <button className="h-full flex-1 rounded-lg text-slate-400 text-sm font-semibold hover:text-white transition-all">
              Insights
            </button>
          </div>
        </section>

        {/* Feature Cards */}
        <section className="space-y-4 mb-12">
          <div className="grid grid-cols-2 gap-4">
            {/* Unified Feed */}
            <Card className="col-span-2 bg-white/5 backdrop-blur-md border-white/10">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 rounded-lg bg-[#ee8c2b]/20">
                    <Activity className="h-5 w-5 text-[#ee8c2b]" />
                  </div>
                  <span className="text-[10px] font-bold text-[#ee8c2b]/60 uppercase">AI-Sorted</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Unified Feed</h3>
                <p className="text-sm text-slate-400">Contextual prompts sorted by AI relevance to ensure high impact across every department.</p>
              </CardContent>
            </Card>

            {/* Micro-Feedback */}
            <Card className="bg-white/5 backdrop-blur-md border-white/10">
              <CardContent className="p-5 space-y-3">
                <div className="p-2 rounded-lg bg-blue-500/20 w-fit">
                  <Zap className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold mb-1">Micro-Feedback</h3>
                  <p className="text-xs text-slate-400">1-tap pulses for instant organizational sentiment.</p>
                </div>
              </CardContent>
            </Card>

            {/* Challenge Engine */}
            <Card className="bg-white/5 backdrop-blur-md border-white/10">
              <CardContent className="p-5 space-y-3">
                <div className="p-2 rounded-lg bg-green-500/20 w-fit">
                  <Award className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold mb-1">Challenge Engine</h3>
                  <p className="text-xs text-slate-400">Multi-departmental streaks and rewards.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Real-time Preview */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-4">Real-time Preview</h2>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Participant Velocity</span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-[#ee8c2b]">+84%</span>
                    <TrendingUp className="h-5 w-5 text-green-400" />
                  </div>
                </div>
                <div className="h-32 bg-zinc-950 rounded-lg flex items-end gap-1 p-4">
                  {[40, 60, 50, 80, 90].map((height, i) => (
                    <div 
                      key={i}
                      className="flex-1 bg-[#ee8c2b]/60 rounded-t"
                      style={{ height: `${height}%` }}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Metrics */}
        <section>
          <h2 className="text-xl font-bold mb-4">Measure What Matters</h2>
          <div className="space-y-3">
            {[
              { icon: Users, title: 'Participation Velocity', desc: 'Track the speed of team response times.' },
              { icon: BarChart3, title: 'Sentiment Floor', desc: 'Understand the low-engagement early 60s.' },
              { icon: TrendingUp, title: 'Intervention Latency', desc: 'When to re-engage disengaged cohorts.' }
            ].map((metric, i) => (
              <Card key={i} className="bg-zinc-900 border-zinc-800">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#ee8c2b]/20 flex items-center justify-center">
                    <metric.icon className="h-5 w-5 text-[#ee8c2b]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{metric.title}</h3>
                    <p className="text-xs text-slate-400">{metric.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="mt-12 text-center space-y-4">
          <h3 className="text-2xl font-bold">Ready to reach critical mass?</h3>
          <Button className="bg-[#ee8c2b] hover:bg-[#d97c1f] text-black font-bold px-8 py-6 text-lg w-full shadow-xl shadow-[#ee8c2b]/20">
            Request Enterprise Demo
          </Button>
        </div>
      </main>
    </div>
  );
}