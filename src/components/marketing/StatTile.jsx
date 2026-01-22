import { motion } from 'framer-motion';

export default function StatTile({ 
  value, 
  label, 
  icon: Icon,
  trend,
  delay = 0 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="bg-white rounded-xl p-6 border border-slate-200 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-150 text-center"
    >
      {Icon && (
        <div className="w-12 h-12 rounded-full bg-[var(--orb-accent)]/10 flex items-center justify-center mx-auto mb-4">
          <Icon className="w-6 h-6 text-[var(--orb-accent)]" />
        </div>
      )}
      
      <p className="text-4xl font-bold text-[var(--ink)] mb-2" style={{ fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </p>
      
      <p className="text-sm text-[var(--slate)] font-medium">{label}</p>
      
      {trend && (
        <p className="text-xs text-[var(--success)] mt-2 font-semibold">↑ {trend}</p>
      )}
    </motion.div>
  );
}