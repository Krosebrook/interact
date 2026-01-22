import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Shield, Zap, Users, TrendingUp } from 'lucide-react';

export default function MarketingHero({
  title,
  subtitle,
  primaryCTA,
  secondaryCTA,
  onPrimaryCTA,
  onSecondaryCTA,
  showTrustRow = true,
  showProofCard = true,
  backgroundImage = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/691e3ae3bd4916f2e05ae35e/612f41293_ChatGPTImageJan14202609_44_29PM.png'
}) {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
      </div>

      {/* Floating Orb Parallax Animation */}
      <motion.div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-[var(--orb-accent)] blur-3xl opacity-30"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.4, 0.3],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-20 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight"
          style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700 }}
        >
          {title}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-xl sm:text-2xl text-white/90 mb-10 max-w-3xl mx-auto leading-relaxed"
          style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 400 }}
        >
          {subtitle}
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
        >
          <Button
            onClick={onPrimaryCTA}
            size="lg"
            className="bg-[var(--orb-accent)] hover:bg-[var(--orb-accent)]/90 text-white px-8 py-6 text-lg font-semibold rounded-lg shadow-lg hover:shadow-[0_0_30px_rgba(242,140,40,0.4)] transition-all duration-150"
          >
            {primaryCTA}
          </Button>
          <Button
            onClick={onSecondaryCTA}
            size="lg"
            variant="outline"
            className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 px-8 py-6 text-lg font-semibold rounded-lg transition-all duration-150"
          >
            {secondaryCTA}
          </Button>
        </motion.div>

        {/* Trust Row */}
        {showTrustRow && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-wrap justify-center gap-4 mb-8"
          >
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 flex items-center gap-2">
              <Shield className="w-4 h-4 text-[var(--success)]" />
              <span className="text-sm text-white font-medium">SOC2-Ready</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 flex items-center gap-2">
              <Zap className="w-4 h-4 text-[var(--sunrise-glow)]" />
              <span className="text-sm text-white font-medium">SSO/SAML</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 flex items-center gap-2">
              <Users className="w-4 h-4 text-[var(--int-teal)]" />
              <span className="text-sm text-white font-medium">Teams/Slack</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[var(--orb-accent)]" />
              <span className="text-sm text-white font-medium">HRIS Integrations</span>
            </div>
          </motion.div>
        )}

        {/* Proof Micro Card */}
        {showProofCard && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="inline-block bg-white/95 backdrop-blur-lg rounded-xl px-6 py-3 border border-white/30 shadow-xl"
          >
            <p className="text-[var(--ink)] font-semibold text-sm sm:text-base">
              Participation <span className="text-[var(--success)]">↑</span>, 
              Attrition risk <span className="text-[var(--success)]">↓</span>, 
              Faster insights
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
}