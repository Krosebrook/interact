import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import FeedbackModal from './FeedbackModal';
import { motion } from 'framer-motion';

export default function FeedbackButton({ currentPageName }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed bottom-6 left-6 z-40"
      >
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-14 h-14 shadow-lg bg-[var(--orb-accent)] hover:bg-[var(--orb-accent)]/90"
          size="icon"
          title="Share Feedback"
        >
          <MessageSquare className="w-6 h-6" />
        </Button>
      </motion.div>

      <FeedbackModal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        pageName={currentPageName} 
      />
    </>
  );
}