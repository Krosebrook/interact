import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { FileText, BookOpen, Newspaper, ArrowRight } from 'lucide-react';
import MarketingFooter from '@/components/marketing/MarketingFooter';
import { motion } from 'framer-motion';

export default function Resources() {
  const resourceTypes = [
    {
      title: 'Case Studies',
      icon: FileText,
      description: 'Real results from companies using INTINC to transform their engagement.',
      link: createPageUrl('CaseStudies'),
      count: '12+ stories',
      color: 'from-[var(--orb-accent)] to-[var(--sunrise-glow)]'
    },
    {
      title: 'Whitepapers',
      icon: BookOpen,
      description: 'In-depth research on employee engagement, remote work culture, and People Ops strategy.',
      link: createPageUrl('Whitepapers'),
      count: '8 downloads',
      color: 'from-[var(--int-teal)] to-[var(--success)]'
    },
    {
      title: 'Blog',
      icon: Newspaper,
      description: 'Insights, best practices, and updates from the INTINC team.',
      link: createPageUrl('Blog'),
      count: '50+ articles',
      color: 'from-[var(--slate)] to-[var(--ink)]'
    }
  ];

  return (
    <div className="min-h-screen bg-[var(--mist)]">
      {/* Hero */}
      <section className="relative py-20 px-6 bg-gradient-to-br from-[var(--ink)] to-[var(--slate)] text-white overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--orb-accent)] rounded-full blur-3xl opacity-20" />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold mb-6"
          >
            Resources for building better culture
          </motion.h1>
          <p className="text-xl text-white/80">
            Case studies, research, and practical guides to help you activate engagement.
          </p>
        </div>
      </section>

      {/* Resource Cards */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {resourceTypes.map((resource, idx) => {
            const Icon = resource.icon;
            return (
              <motion.div
                key={resource.title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Link
                  to={resource.link}
                  className="block bg-white rounded-2xl p-8 border border-slate-200 hover:shadow-xl hover:-translate-y-2 transition-all group"
                >
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${resource.color} flex items-center justify-center mb-6`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  <h3 className="text-2xl font-bold text-[var(--ink)] mb-3">{resource.title}</h3>
                  <p className="text-[var(--slate)] leading-relaxed mb-4">
                    {resource.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--slate)]">{resource.count}</span>
                    <ArrowRight className="w-5 h-5 text-[var(--orb-accent)] group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}