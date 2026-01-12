import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Share2, TrendingUp, Users } from 'lucide-react';
import SocialShareCard from './SocialShareCard';
import LoadingSpinner from '../common/LoadingSpinner';

export default function SocialFeedSection({ userEmail, limit = 10 }) {
  const { data: shares = [], isLoading } = useQuery({
    queryKey: ['social-shares', limit],
    queryFn: () => base44.entities.SocialShare.list('-created_date', limit)
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users-social'],
    queryFn: () => base44.entities.User.list()
  });

  const getUserName = (email) => {
    const user = users.find(u => u.email === email);
    return user?.full_name || email?.split('@')[0] || 'Unknown';
  };

  if (isLoading) {
    return <LoadingSpinner data-b44-sync="true" data-feature="gamification" data-component="socialfeedsection" message="Loading social feed..." />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-int-orange" />
          Team Achievements
        </CardTitle>
      </CardHeader>
      <CardContent>
        {shares.length > 0 ? (
          <div className="space-y-4">
            {shares.map((share) => (
              <div key={share.id}>
                <div className="flex items-center gap-2 mb-2 text-sm text-slate-600">
                  <Users className="h-4 w-4" />
                  <span className="font-medium">{getUserName(share.user_email)}</span>
                </div>
                <SocialShareCard 
                  share={share} 
                  currentUserEmail={userEmail}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Share2 className="h-12 w-12 mx-auto mb-4 text-slate-300" />
            <p className="text-slate-500">No achievements shared yet</p>
            <p className="text-sm text-slate-400 mt-1">Be the first to share your success!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}