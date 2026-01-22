import { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DashboardPreview() {
  const [activeView, setActiveView] = useState('hr');

  return (
    <div className="max-w-6xl mx-auto">
      {/* View Toggles */}
      <div className="flex justify-center gap-2 mb-8">
        {['HR view', 'Exec view', 'Manager view'].map((view, idx) => {
          const viewKey = view.split(' ')[0].toLowerCase();
          return (
            <Button
              key={idx}
              onClick={() => setActiveView(viewKey)}
              variant={activeView === viewKey ? 'default' : 'outline'}
              className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-150 ${
                activeView === viewKey
                  ? 'bg-[var(--orb-accent)] text-white shadow-lg'
                  : 'bg-white text-[var(--slate)] hover:bg-slate-50'
              }`}
            >
              {view}
            </Button>
          );
        })}
      </div>

      {/* Glass Cockpit Dashboard Frame */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/60 shadow-2xl p-8 relative overflow-hidden"
      >
        {/* Subtle Orb Glow Background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--orb-accent)] rounded-full blur-3xl opacity-10 -translate-y-1/2 translate-x-1/2" />

        <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Engagement Feed */}
          <div className="bg-white rounded-xl p-6 shadow-md border border-slate-100">
            <h4 className="text-sm font-bold text-[var(--ink)] mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-[var(--orb-accent)]" />
              Recent Activity
            </h4>
            <div className="space-y-3">
              {['Sarah recognized Tom', 'New pulse survey live', 'Team milestone achieved'].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 pb-3 border-b border-slate-100 last:border-0">
                  <div className="w-2 h-2 rounded-full bg-[var(--success)] mt-1.5 flex-shrink-0" />
                  <p className="text-xs text-[var(--slate)]">{item}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Center: Engagement Score Trend */}
          <div className="bg-white rounded-xl p-6 shadow-md border border-slate-100">
            <h4 className="text-sm font-bold text-[var(--ink)] mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[var(--success)]" />
              Engagement Score
            </h4>
            <div className="relative h-32">
              <svg viewBox="0 0 200 100" className="w-full h-full">
                <polyline
                  fill="none"
                  stroke="var(--orb-accent)"
                  strokeWidth="3"
                  points="0,80 40,65 80,70 120,45 160,50 200,30"
                  className="drop-shadow-lg"
                />
                <circle cx="200" cy="30" r="4" fill="var(--orb-accent)" className="animate-pulse" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-[var(--ink)] mt-4">78<span className="text-sm text-[var(--success)]"> +12%</span></p>
          </div>

          {/* Right: Team Hotspots */}
          <div className="bg-white rounded-xl p-6 shadow-md border border-slate-100">
            <h4 className="text-sm font-bold text-[var(--ink)] mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-[var(--int-teal)]" />
              Recommended Actions
            </h4>
            <div className="space-y-2">
              <div className="bg-[var(--sunrise-glow)]/10 rounded-lg p-3 border border-[var(--sunrise-glow)]/20">
                <p className="text-xs font-semibold text-[var(--ink)]">Follow up: Engineering</p>
                <p className="text-xs text-[var(--slate)] mt-1">Survey scores dipped 8%</p>
              </div>
              <div className="bg-[var(--success)]/10 rounded-lg p-3 border border-[var(--success)]/20">
                <p className="text-xs font-semibold text-[var(--ink)]">Celebrate: Sales team</p>
                <p className="text-xs text-[var(--slate)] mt-1">95% participation this week</p>
              </div>
            </div>
          </div>
        </div>

        {/* Microcopy */}
        <div className="mt-6 text-center">
          <p className="text-sm text-[var(--slate)] italic">No spreadsheets. No guesswork.</p>
        </div>
      </motion.div>
    </div>
  );
}