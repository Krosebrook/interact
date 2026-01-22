import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Search, TrendingUp, Building2 } from 'lucide-react';
import MarketingFooter from '@/components/marketing/MarketingFooter';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function CaseStudies() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const perPage = 9;

  const { data: caseStudies = [], isLoading } = useQuery({
    queryKey: ['caseStudies', page],
    queryFn: async () => {
      const all = await base44.entities.CaseStudy.filter(
        { status: 'published' },
        '-published_date'
      );
      return all;
    }
  });

  const filtered = caseStudies.filter(cs =>
    cs.title.toLowerCase().includes(search.toLowerCase()) ||
    cs.company_name.toLowerCase().includes(search.toLowerCase()) ||
    cs.industry?.toLowerCase().includes(search.toLowerCase())
  );

  const paginated = filtered.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  return (
    <div className="min-h-screen bg-[var(--mist)]">
      {/* Header */}
      <section className="relative py-20 px-6 bg-gradient-to-br from-[var(--ink)] to-[var(--slate)] text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">Customer Success Stories</h1>
          <p className="text-xl text-white/80 mb-8">
            See how organizations like yours transformed engagement with INTINC.
          </p>

          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by company, industry..."
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60"
            />
          </div>
        </div>
      </section>

      {/* Case Studies Grid */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-[var(--orb-accent)] border-t-transparent rounded-full mx-auto" />
            </div>
          ) : paginated.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[var(--slate)]">No case studies found. Check back soon!</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {paginated.map((cs, idx) => (
                  <motion.div
                    key={cs.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white rounded-xl overflow-hidden border border-slate-200 hover:shadow-lg transition-all group"
                  >
                    {cs.cover_image_url && (
                      <div className="h-48 bg-gradient-to-br from-[var(--orb-accent)]/10 to-[var(--sunrise-glow)]/10 flex items-center justify-center">
                        <Building2 className="w-12 h-12 text-[var(--orb-accent)]" />
                      </div>
                    )}

                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        {cs.industry && (
                          <Badge variant="outline" className="text-xs">{cs.industry}</Badge>
                        )}
                        {cs.company_size && (
                          <Badge variant="outline" className="text-xs">{cs.company_size}</Badge>
                        )}
                      </div>

                      <h3 className="text-xl font-bold text-[var(--ink)] mb-2 group-hover:text-[var(--orb-accent)] transition-colors">
                        {cs.title}
                      </h3>
                      <p className="text-sm text-[var(--slate)] font-semibold mb-3">{cs.company_name}</p>

                      {cs.ai_summary && (
                        <p className="text-sm text-[var(--slate)] leading-relaxed mb-4 line-clamp-3">
                          {cs.ai_summary}
                        </p>
                      )}

                      {cs.results && cs.results.length > 0 && (
                        <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
                          {cs.results.slice(0, 2).map((result, i) => (
                            <div key={i} className="flex items-center gap-1 text-xs">
                              <TrendingUp className="w-3 h-3 text-[var(--success)]" />
                              <span className="font-bold text-[var(--ink)]">{result.value}</span>
                              <span className="text-[var(--slate)]">{result.metric}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  {[...Array(totalPages)].map((_, i) => (
                    <Button
                      key={i}
                      variant={page === i + 1 ? 'default' : 'outline'}
                      onClick={() => setPage(i + 1)}
                      className={page === i + 1 ? 'bg-[var(--orb-accent)]' : ''}
                    >
                      {i + 1}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}