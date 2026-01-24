import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function RecentlyViewedProfiles({ currentUserEmail }) {
  const { data: recentViews = [] } = useQuery({
    queryKey: ['recent-profile-views', currentUserEmail],
    queryFn: async () => {
      const views = await base44.entities.ProfileView.filter(
        { viewer_email: currentUserEmail },
        '-viewed_at',
        10
      );
      
      // Get unique profiles (most recent view per profile)
      const uniqueViews = [];
      const seenEmails = new Set();
      
      for (const view of views) {
        if (!seenEmails.has(view.viewed_profile_email)) {
          seenEmails.add(view.viewed_profile_email);
          uniqueViews.push(view);
        }
      }
      
      return uniqueViews.slice(0, 5);
    },
    enabled: !!currentUserEmail
  });

  // Fetch profile data for recently viewed users
  const { data: profiles = [] } = useQuery({
    queryKey: ['recently-viewed-profiles-data', recentViews.map(v => v.viewed_profile_email)],
    queryFn: async () => {
      const emails = recentViews.map(v => v.viewed_profile_email);
      if (emails.length === 0) return [];
      
      const profiles = await Promise.all(
        emails.map(async (email) => {
          const [profile] = await base44.entities.UserProfile.filter({ user_email: email });
          return profile || { user_email: email };
        })
      );
      
      return profiles;
    },
    enabled: recentViews.length > 0
  });

  if (recentViews.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Clock className="h-5 w-5 text-slate-600" />
          Recently Viewed
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentViews.map((view, index) => {
            const profile = profiles.find(p => p.user_email === view.viewed_profile_email);
            if (!profile) return null;

            return (
              <Link
                key={view.id}
                to={createPageUrl('UserProfile') + `?email=${view.viewed_profile_email}`}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <Avatar className="h-10 w-10 border-2 border-slate-200">
                  <AvatarImage src={profile.profile_picture_url} />
                  <AvatarFallback className="bg-gradient-purple text-white text-sm">
                    {view.viewed_profile_email.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {view.viewed_profile_email}
                  </p>
                  {profile.role && (
                    <p className="text-xs text-slate-500 truncate">{profile.role}</p>
                  )}
                </div>
                
                <span className="text-xs text-slate-400 whitespace-nowrap">
                  {formatDistanceToNow(new Date(view.viewed_at), { addSuffix: true })}
                </span>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}