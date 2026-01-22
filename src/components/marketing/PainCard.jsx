import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

export default function PainCard({ title, description, icon: Icon = AlertCircle, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="bg-white rounded-xl p-6 border border-slate-200 hover:border-[var(--orb-accent)]/30 hover:shadow-lg transition-all duration-150"
    >
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-red-500" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-[var(--ink)] mb-2">{title}</h3>
          <p className="text-[var(--slate)] text-sm leading-relaxed">{description}</p>
        </div>
      </div>
    </motion.div>
  );
}