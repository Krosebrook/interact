import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Calendar, Clock, Tag, Search } from 'lucide-react';
import MarketingFooter from '@/components/marketing/MarketingFooter';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

export default function Blog() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const perPage = 12;

  const { data: posts = [] } = useQuery({
    queryKey: ['blogPosts'],
    queryFn: () => base44.entities.BlogPost.filter({ status: 'published' }, '-published_date')
  });

  const filtered = posts.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.excerpt?.toLowerCase().includes(search.toLowerCase()) ||
    p.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  const paginated = filtered.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  return (
    <div className="min-h-screen bg-[var(--mist)]">
      <section className="relative py-20 px-6 bg-gradient-to-br from-[var(--ink)] to-[var(--slate)] text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">INTINC Blog</h1>
          <p className="text-xl text-white/80 mb-8">
            Insights on engagement, culture, and the future of work.
          </p>

          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search articles..."
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60"
            />
          </div>
        </div>
      </section>

      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {paginated.map((post, idx) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-xl overflow-hidden border border-slate-200 hover:shadow-lg transition-all group cursor-pointer"
              >
                {post.cover_image_url && (
                  <div
                    className="h-48 bg-cover bg-center"
                    style={{ backgroundImage: `url(${post.cover_image_url})` }}
                  />
                )}

                <div className="p-6">
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {post.tags.slice(0, 2).map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <h3 className="text-xl font-bold text-[var(--ink)] mb-2 group-hover:text-[var(--orb-accent)] transition-colors">
                    {post.title}
                  </h3>

                  {post.ai_summary || post.excerpt ? (
                    <p className="text-sm text-[var(--slate)] leading-relaxed mb-4 line-clamp-3">
                      {post.ai_summary || post.excerpt}
                    </p>
                  ) : null}

                  <div className="flex items-center justify-between text-xs text-[var(--slate)] pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-4">
                      {post.published_date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(post.published_date), 'MMM d, yyyy')}
                        </span>
                      )}
                      {post.read_time_minutes && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {post.read_time_minutes} min
                        </span>
                      )}
                    </div>
                  </div>

                  {post.author && (
                    <p className="text-xs text-[var(--slate)] mt-3">
                      By {post.author}
                    </p>
                  )}
                </div>
              </motion.article>
            ))}
          </div>

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
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}