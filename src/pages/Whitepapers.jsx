import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Download, FileText, Tag } from 'lucide-react';
import MarketingFooter from '@/components/marketing/MarketingFooter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

export default function Whitepapers() {
  const { data: whitepapers = [] } = useQuery({
    queryKey: ['whitepapers'],
    queryFn: () => base44.entities.Whitepaper.filter({ status: 'published' }, '-published_date')
  });

  return (
    <div className="min-h-screen bg-[var(--mist)]">
      <section className="relative py-20 px-6 bg-gradient-to-br from-[var(--ink)] to-[var(--slate)] text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">Whitepapers & Research</h1>
          <p className="text-xl text-white/80">
            In-depth guides on employee engagement, remote culture, and People Ops strategy.
          </p>
        </div>
      </section>

      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {whitepapers.map((wp, idx) => (
            <motion.div
              key={wp.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-all"
            >
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[var(--int-teal)] to-[var(--success)] flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-white" />
              </div>

              <h3 className="text-xl font-bold text-[var(--ink)] mb-2">{wp.title}</h3>
              
              {wp.ai_summary && (
                <p className="text-sm text-[var(--slate)] leading-relaxed mb-4">
                  {wp.ai_summary}
                </p>
              )}

              {wp.tags && wp.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {wp.tags.map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <span className="text-xs text-[var(--slate)]">{wp.page_count} pages</span>
                <Button
                  size="sm"
                  className="bg-[var(--orb-accent)] hover:bg-[var(--orb-accent)]/90"
                  onClick={() => window.open(wp.file_url, '_blank')}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}