import { motion } from 'framer-motion';

export default function TimelineStep({ 
  number, 
  title, 
  description, 
  icon: Icon,
  isLast = false,
  delay = 0 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="relative flex gap-6"
    >
      {/* Vertical Line */}
      {!isLast && (
        <div className="absolute left-6 top-14 w-0.5 h-full bg-gradient-to-b from-[var(--orb-accent)] to-transparent" />
      )}

      {/* Number Circle */}
      <div className="relative z-10 w-12 h-12 rounded-full bg-gradient-to-br from-[var(--orb-accent)] to-[var(--sunrise-glow)] flex items-center justify-center flex-shrink-0 shadow-lg">
        <span className="text-white font-bold text-lg">{number}</span>
      </div>

      {/* Content */}
      <div className="flex-1 pb-12">
        <h3 className="text-2xl font-bold text-[var(--ink)] mb-2">{title}</h3>
        <p className="text-[var(--slate)] leading-relaxed mb-4">{description}</p>
        
        {Icon && (
          <div className="w-20 h-20 rounded-xl bg-[var(--mist)] flex items-center justify-center">
            <Icon className="w-10 h-10 text-[var(--orb-accent)]" />
          </div>
        )}
      </div>
    </motion.div>
  );
}