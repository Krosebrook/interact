import { motion } from 'framer-motion';

export default function SecurityChip({ 
  icon: Icon, 
  label,
  delay = 0 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay }}
      className="bg-white rounded-full px-5 py-3 border border-slate-200 shadow-sm hover:shadow-md hover:border-[var(--success)]/30 transition-all duration-150 flex items-center gap-3"
    >
      <Icon className="w-5 h-5 text-[var(--success)]" />
      <span className="text-sm font-semibold text-[var(--ink)]">{label}</span>
    </motion.div>
  );
}