import { motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PillarCard({ 
  icon: Icon, 
  title, 
  outcomes = [], 
  learnMoreLink,
  delay = 0 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="bg-white rounded-2xl p-8 border border-slate-200 hover:border-[var(--orb-accent)]/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-150 group"
    >
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--orb-accent)] to-[var(--sunrise-glow)] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-150">
        <Icon className="w-7 h-7 text-white" />
      </div>
      
      <h3 className="text-2xl font-bold text-[var(--ink)] mb-4">{title}</h3>
      
      <ul className="space-y-3 mb-6">
        {outcomes.map((outcome, idx) => (
          <li key={idx} className="flex items-start gap-2 text-[var(--slate)]">
            <Check className="w-5 h-5 text-[var(--success)] flex-shrink-0 mt-0.5" />
            <span className="text-sm leading-relaxed">{outcome}</span>
          </li>
        ))}
      </ul>
      
      {learnMoreLink && (
        <Link 
          to={learnMoreLink}
          className="inline-flex items-center gap-2 text-[var(--orb-accent)] font-semibold text-sm hover:gap-3 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[var(--orb-accent)] focus:ring-offset-2 rounded"
        >
          Learn more <ArrowRight className="w-4 h-4" />
        </Link>
      )}
    </motion.div>
  );
}