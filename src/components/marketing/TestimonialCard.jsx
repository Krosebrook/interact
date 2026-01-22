import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';

export default function TestimonialCard({ 
  quote, 
  author, 
  role, 
  company,
  delay = 0 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="bg-white rounded-2xl p-8 border border-slate-200 shadow-lg hover:shadow-xl transition-shadow duration-150 relative"
    >
      {/* Quote Icon */}
      <div className="absolute top-6 right-6 w-12 h-12 rounded-full bg-[var(--orb-accent)]/10 flex items-center justify-center">
        <Quote className="w-6 h-6 text-[var(--orb-accent)]" />
      </div>

      {/* Quote */}
      <p className="text-lg text-[var(--ink)] leading-relaxed mb-6 italic pr-12">
        "{quote}"
      </p>

      {/* Author */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--orb-accent)] to-[var(--sunrise-glow)] flex items-center justify-center text-white font-bold">
          {author.charAt(0)}
        </div>
        <div>
          <p className="font-bold text-[var(--ink)]">{author}</p>
          <p className="text-sm text-[var(--slate)]">{role}, {company}</p>
        </div>
      </div>
    </motion.div>
  );
}