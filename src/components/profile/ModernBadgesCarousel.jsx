import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Trophy, Award, Medal, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';

const badgeIcons = {
  'Event Host': Trophy,
  'Early Bird': Award,
  'Idea Machine': Star,
  'Team Player': Medal,
};

export default function ModernBadgesCarousel({ userEmail }) {
  const { data: badges = [] } = useQuery({
    queryKey: ['user-badges', userEmail],
    queryFn: async () => {
      const awards = await base44.entities.BadgeAward.filter({ user_email: userEmail });
      return awards.slice(0, 6);
    },
    enabled: !!userEmail
  });

  return (
    <section className="mt-6">
      <div className="flex items-center justify-between px-6 mb-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          Recent Badges
        </h3>
        <Link to={createPageUrl('GamificationDashboard')}>
          <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 font-bold">
            VIEW ALL
          </Button>
        </Link>
      </div>

      <div className="flex overflow-x-auto no-scrollbar px-6 gap-4 pb-4 snap-x">
        {badges.map((award, idx) => {
          const IconComponent = badgeIcons[award.badge_name] || Trophy;
          const colors = [
            'bg-yellow-50 border-yellow-200 text-yellow-600',
            'bg-slate-50 border-slate-200 text-slate-600',
            'bg-orange-50 border-orange-200 text-orange-600',
            'bg-blue-50 border-blue-200 text-blue-600',
            'bg-purple-50 border-purple-200 text-purple-600',
            'bg-green-50 border-green-200 text-green-600',
          ];
          
          return (
            <div key={idx} className="flex-none w-20 flex flex-col items-center gap-2 snap-center group">
              <div className={`w-16 h-16 rounded-full ${colors[idx % colors.length]} border-2 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm`}>
                <IconComponent className="w-8 h-8" />
              </div>
              <p className="text-[11px] font-semibold text-center text-slate-700 dark:text-slate-300 leading-tight line-clamp-2">
                {award.badge_name || 'Badge'}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}