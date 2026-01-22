import { Star } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StarRating({ value, onChange, size = 'md', readonly = false }) {
  const sizes = {
    sm: 'w-5 h-5',
    md: 'w-7 h-7',
    lg: 'w-10 h-10'
  };

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <motion.button
          key={star}
          type="button"
          onClick={() => !readonly && onChange?.(star)}
          disabled={readonly}
          whileHover={!readonly ? { scale: 1.1 } : {}}
          whileTap={!readonly ? { scale: 0.95 } : {}}
          className={`${readonly ? 'cursor-default' : 'cursor-pointer'}`}
        >
          <Star
            className={`${sizes[size]} ${
              star <= value
                ? 'fill-[var(--orb-accent)] text-[var(--orb-accent)]'
                : 'text-slate-300'
            } transition-colors`}
          />
        </motion.button>
      ))}
    </div>
  );
}