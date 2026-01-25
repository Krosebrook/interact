import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, TrendingUp, Users, Target, BarChart3, ArrowLeft, Award, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function RecognitionEngine() {
  return (
    <div className="min-h-screen bg-black text-white pb-20">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-md">
        <div className="flex items-center p-4 pb-2 justify-between">
          <Link to={createPageUrl('Dashboard')}>
            <Button size="icon" variant="ghost" className="text-[#ee8c2b]">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h2 className="text-lg font-bold flex-1 text-center">INTInc Recognition</h2>
          <Button size="icon" variant="ghost">
            <span className="text-xl">⋮</span>
          </Button>
        </div>

        {/* Tabs */}
        <div className="px-4">
          <div className="flex border-b border-white/10 gap-6 overflow-x-auto">
            <button className="pb-3 pt-2 text-sm font-semibold text-slate-400 whitespace-nowrap">
              Overview
            </button>
            <button className="pb-3 pt-2 text-sm font-semibold text-[#ee8c2b] border-b-2 border-[#ee8c2b] whitespace-nowrap">
              Recognition
            </button>
            <button className="pb-3 pt-2 text-sm font-semibold text-slate-400 whitespace-nowrap">
              Leaderboard
            </button>
            <button className="pb-3 pt-2 text-sm font-semibold text-slate-400 whitespace-nowrap">
              Analytics
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-md mx-auto px-4 pt-6 space-y-8">
        {/* Hero Section */}
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#ee8c2b]/20 to-transparent p-6 min-h-[320px] flex flex-col justify-end">
          <div className="absolute inset-0 z-0 opacity-40 mix-blend-overlay bg-cover bg-center"
            style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1552664730-d307ca884978?w=800)' }}
          />
          <div className="relative z-10 space-y-4">
            <h1 className="text-4xl font-black leading-tight tracking-tighter">
              Validate Impact <br/><span className="text-[#ee8c2b]">at Scale</span>
            </h1>
            <p className="text-slate-300 text-base font-medium max-w-[280px]">
              Drive cultural ROI with peer-to-peer recognition velocity and social capital movement.
            </p>
            <Button className="bg-[#ee8c2b] hover:bg-[#d97c1f] text-black font-bold px-6 h-12 rounded-xl shadow-lg shadow-[#ee8c2b]/20">
              View My Velocity
            </Button>
          </div>
        </div>

        {/* Role Toggle */}
        <div className="flex bg-white/5 p-1 rounded-xl">
          <button className="flex-1 py-2 text-sm font-bold rounded-lg bg-white/10 text-white shadow-sm">
            Employee
          </button>
          <button className="flex-1 py-2 text-sm font-bold text-slate-400">
            Manager
          </button>
        </div>

        {/* Feature Bento */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Feature Bento</h2>
            <span className="text-[#ee8c2b] text-sm font-bold cursor-pointer">Explore All</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Social Wall */}
            <Card className="col-span-2 bg-white/[0.03] backdrop-blur-md border-white/[0.08]">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-[#ee8c2b]" />
                    <h3 className="font-bold text-sm">Social Wall</h3>
                  </div>
                  <Badge className="text-[10px] bg-[#ee8c2b]/20 text-[#ee8c2b] border-[#ee8c2b]/30">Live</Badge>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-2 bg-white/5 rounded-lg border border-white/5">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-violet-600 text-white text-xs">
                        ST
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-[12px]"><span className="font-bold">Sarah T.</span> shouted out <span className="font-bold">Design</span></p>
                      <p className="text-[10px] text-slate-400">Nailed the new UX lift</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-2 bg-white/5 rounded-lg border border-white/5">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-gradient-to-br from-green-500 to-teal-600 text-white text-xs">
                        ML
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-[12px]"><span className="font-bold">Marcus L.</span> earned <span className="font-bold">Inspiration Badge</span></p>
                      <p className="text-[10px] text-slate-400">For mentoring 3+ team members</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Micro-Feedback */}
            <Card className="bg-white/[0.03] backdrop-blur-md border-white/[0.08]">
              <CardContent className="p-4 space-y-3">
                <div className="p-2 rounded-lg bg-blue-500/20 w-fit">
                  <Zap className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold mb-1">Micro-Feedback</h3>
                  <p className="text-xs text-slate-400">One-tap pulses for instant sentiment.</p>
                </div>
              </CardContent>
            </Card>

            {/* Challenge Engine */}
            <Card className="bg-white/[0.03] backdrop-blur-md border-white/[0.08]">
              <CardContent className="p-4 space-y-3">
                <div className="p-2 rounded-lg bg-green-500/20 w-fit">
                  <Award className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold mb-1">Challenge Engine</h3>
                  <p className="text-xs text-slate-400">Multi-team streaks and rewards.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Plan Status */}
        <Card className="bg-white/[0.03] backdrop-blur-md border-white/[0.08]">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Plan Status</p>
                <p className="text-2xl font-bold">Enterprise</p>
              </div>
              <Button className="bg-[#ee8c2b] hover:bg-[#d97c1f] text-black font-bold rounded-lg">
                Give Shoutout →
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-slate-400">Sent Today</p>
                <p className="text-xl font-bold">5 <span className="text-sm text-slate-500">/ Unlimited</span></p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-400">Points Left</p>
                <div className="flex items-center gap-2">
                  <p className="text-xl font-bold text-[#ee8c2b]">1,240</p>
                  <span className="text-xs text-green-400">+VEL</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Anatomy of Recognition */}
        <section>
          <h2 className="text-xl font-bold mb-4">Anatomy of Recognition</h2>
          <Card className="bg-white/[0.03] backdrop-blur-md border-white/[0.08]">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-center gap-4">
                <Avatar className="h-10 w-10 border border-white/20">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-violet-600 text-white">
                    U
                  </AvatarFallback>
                </Avatar>
                <div className="text-2xl font-bold text-slate-500">→</div>
                <Avatar className="h-10 w-10 border-2 border-[#ee8c2b]">
                  <AvatarFallback className="bg-gradient-to-br from-[#ee8c2b] to-orange-600 text-white">
                    R
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Trigger Action</p>
                    <p className="font-bold">Public Appreciation</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Gain</p>
                    <p className="font-bold text-[#ee8c2b]">+50 XP</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div>
                    <p className="text-slate-500 mb-1">VELOCITY</p>
                    <Badge variant="outline" className="text-white border-white/20">Base44</Badge>
                  </div>
                  <div>
                    <p className="text-slate-500 mb-1">MULTIPLIER</p>
                    <Badge variant="outline" className="text-white border-white/20">x1.5</Badge>
                  </div>
                  <div>
                    <p className="text-slate-500 mb-1">STATUS</p>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Active</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Strategic Outcomes */}
        <section>
          <h2 className="text-xl font-bold mb-4">Strategic Outcomes</h2>
          <div className="space-y-3">
            {[
              { icon: Target, title: 'Cultural Alignment', desc: 'Sync peer behaviors with core company values.' },
              { icon: TrendingUp, title: 'Retention Lift', desc: 'Reduce turnover through continuous appreciation.' },
              { icon: Users, title: 'Recognition Equity', desc: 'Data-backed fairness in close-org rewards.' }
            ].map((outcome, i) => (
              <Card key={i} className="bg-white/[0.03] backdrop-blur-md border-white/[0.08]">
                <CardContent className="p-4 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#ee8c2b]/20 flex items-center justify-center shrink-0">
                    <outcome.icon className="h-5 w-5 text-[#ee8c2b]" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">{outcome.title}</h3>
                    <p className="text-xs text-slate-400">{outcome.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="text-center space-y-4 pt-6">
          <h3 className="text-2xl font-bold">Drive Recognition Velocity</h3>
          <Link to={createPageUrl('Recognition')}>
            <Button className="bg-[#ee8c2b] hover:bg-[#d97c1f] text-black font-bold px-8 py-6 text-lg w-full shadow-xl shadow-[#ee8c2b]/20">
              Launch Recognition Wall
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}