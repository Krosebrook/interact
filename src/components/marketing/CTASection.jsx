import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

export default function CTASection({
  headline,
  primaryCTA,
  secondaryCTA,
  onPrimaryCTA,
  onSecondaryCTA
}) {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background with orb glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--slate)] to-[var(--ink)]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[var(--orb-accent)] rounded-full blur-3xl opacity-20" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-4xl sm:text-5xl font-bold text-white mb-10 leading-tight"
        >
          {headline}
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button
            onClick={onPrimaryCTA}
            size="lg"
            className="bg-[var(--orb-accent)] hover:bg-[var(--orb-accent)]/90 text-white px-10 py-6 text-lg font-semibold rounded-lg shadow-lg hover:shadow-[0_0_30px_rgba(242,140,40,0.5)] transition-all duration-150"
          >
            {primaryCTA}
          </Button>
          <Button
            onClick={onSecondaryCTA}
            size="lg"
            variant="outline"
            className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 px-10 py-6 text-lg font-semibold rounded-lg transition-all duration-150"
          >
            {secondaryCTA}
          </Button>
        </motion.div>
      </div>
    </section>
  );
}