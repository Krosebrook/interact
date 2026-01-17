import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Heart, 
  MessageSquare, 
  Award, 
  TrendingUp,
  Filter,
  ArrowUp,
  Sparkles,
  Trophy
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import moment from 'moment';

const TIER_BADGES = {
  bronze: '🥉',
  silver: '🥈', 
  gold: '🥇',
  platinum: '💎'
};

export default function RecognitionFeed() {
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('recent');
  const queryClient = useQueryClient();

  // Fetch recognitions
  const { data: recognitions = [], isLoading: recognitionsLoading } = useQuery({
    queryKey: ['recognitions-feed', filter],
    queryFn: async () => {
      const allRecognitions = await base44.entities.Recognition.filter(
        filter === 'all' ? {} : { visibility: filter }
      );
      return allRecognitions.filter(r => r.status === 'approved');
    }
  });

  // Fetch badge awards
  const { data: badgeAwards = [], isLoading: badgesLoading } = useQuery({
    queryKey: ['badge-awards-feed'],
    queryFn: async () => {
      const awards = await base44.entities.BadgeAward.list('-earned_date', 50);
      return awards;
    }
  });

  // Fetch user points for tier changes
  const { data: userPoints = [] } = useQuery({
    queryKey: ['user-points-feed'],
    queryFn: async () => {
      return await base44.entities.UserPoints.list('-updated_date', 50);
    }
  });

  // Subscribe to real-time updates
  useEffect(() => {
    const unsubscribe1 = base44.entities.Recognition.subscribe((event) => {
      queryClient.invalidateQueries({ queryKey: ['recognitions-feed'] });
    });
    
    const unsubscribe2 = base44.entities.BadgeAward.subscribe((event) => {
      queryClient.invalidateQueries({ queryKey: ['badge-awards-feed'] });
    });

    return () => {
      unsubscribe1();
      unsubscribe2();
    };
  }, [queryClient]);

  // Kudos mutation
  const kudosMutation = useMutation({
    mutationFn: async (recognitionId) => {
      const recognition = recognitions.find(r => r.id === recognitionId);
      const currentReactions = recognition.reactions || [];
      const userEmail = (await base44.auth.me()).email;
      
      const hasReacted = currentReactions.some(r => r.user_email === userEmail && r.emoji === '❤️');
      
      if (hasReacted) {
        // Remove reaction
        await base44.entities.Recognition.update(recognitionId, {
          reactions: currentReactions.filter(r => !(r.user_email === userEmail && r.emoji === '❤️'))
        });
      } else {
        // Add reaction
        await base44.entities.Recognition.update(recognitionId, {
          reactions: [...currentReactions, { emoji: '❤️', user_email: userEmail }]
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recognitions-feed'] });
    }
  });

  // Combine and sort feed items
  const feedItems = [
    ...recognitions.map(r => ({ ...r, type: 'recognition', timestamp: r.created_date })),
    ...badgeAwards.map(b => ({ ...b, type: 'badge', timestamp: b.earned_date })),
    ...userPoints.filter(p => p.tier && p.tier !== 'bronze').map(p => ({ 
      ...p, 
      type: 'tier_change', 
      timestamp: p.updated_date 
    }))
  ].sort((a, b) => {
    if (sort === 'recent') {
      return new Date(b.timestamp) - new Date(a.timestamp);
    }
    // Sort by reactions/engagement
    const aEngagement = (a.reactions?.length || 0) + (a.comments_count || 0);
    const bEngagement = (b.reactions?.length || 0) + (b.comments_count || 0);
    return bEngagement - aEngagement;
  });

  if (recognitionsLoading || badgesLoading) {
    return <div className="text-center py-8">Loading feed...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center">
            <Filter className="h-5 w-5 text-slate-500" />
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Posts</SelectItem>
                <SelectItem value="public">Public Only</SelectItem>
                <SelectItem value="team_only">Team Only</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Feed */}
      <AnimatePresence>
        {feedItems.map((item) => (
          <motion.div
            key={`${item.type}-${item.id}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {item.type === 'recognition' && (
              <RecognitionCard 
                recognition={item} 
                onKudos={() => kudosMutation.mutate(item.id)}
                kudosLoading={kudosMutation.isPending}
              />
            )}
            {item.type === 'badge' && <BadgeCard badge={item} />}
            {item.type === 'tier_change' && <TierChangeCard tierData={item} />}
          </motion.div>
        ))}
      </AnimatePresence>

      {feedItems.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          <Sparkles className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>No activity yet. Be the first to recognize someone!</p>
        </div>
      )}
    </div>
  );
}

function RecognitionCard({ recognition, onKudos, kudosLoading }) {
  const currentUserEmail = base44.auth.me().then(u => u.email);
  const reactions = recognition.reactions || [];
  const heartCount = reactions.filter(r => r.emoji === '❤️').length;
  
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-int-orange to-int-orange-dark flex items-center justify-center text-white font-bold">
            {recognition.sender_name?.charAt(0) || '?'}
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-semibold text-slate-900">
                  {recognition.sender_name} 
                  <span className="text-slate-600 font-normal"> recognized </span>
                  {recognition.recipient_name}
                </p>
                <p className="text-xs text-slate-500">{moment(recognition.created_date).fromNow()}</p>
              </div>
              <Badge className="capitalize">{recognition.category}</Badge>
            </div>
            <p className="text-slate-700 mb-3">{recognition.message}</p>
            {recognition.company_values?.length > 0 && (
              <div className="flex gap-2 mb-3">
                {recognition.company_values.map((value, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">{value}</Badge>
                ))}
              </div>
            )}
            <div className="flex items-center gap-4 text-sm">
              <Button
                size="sm"
                variant="ghost"
                onClick={onKudos}
                disabled={kudosLoading}
                className="gap-2 text-pink-600 hover:text-pink-700 hover:bg-pink-50"
              >
                <Heart className={`h-4 w-4 ${heartCount > 0 ? 'fill-pink-600' : ''}`} />
                {heartCount > 0 && heartCount}
              </Button>
              <div className="flex items-center gap-1 text-slate-500">
                <MessageSquare className="h-4 w-4" />
                {recognition.comments_count || 0}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function BadgeCard({ badge }) {
  return (
    <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl">
            {badge.badge_icon}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Award className="h-4 w-4 text-purple-600" />
              <p className="font-semibold text-slate-900">New Badge Unlocked!</p>
            </div>
            <p className="text-sm text-slate-700">
              <strong>{badge.user_email.split('@')[0]}</strong> earned the <strong>{badge.badge_name}</strong> badge
            </p>
            <p className="text-xs text-slate-500 mt-1">{moment(badge.earned_date).fromNow()}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TierChangeCard({ tierData }) {
  return (
    <Card className="bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200">
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center text-2xl">
            {TIER_BADGES[tierData.tier]}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-amber-600" />
              <p className="font-semibold text-slate-900">Tier Advancement!</p>
            </div>
            <p className="text-sm text-slate-700">
              <strong>{tierData.user_email.split('@')[0]}</strong> reached <strong className="capitalize">{tierData.tier}</strong> tier
            </p>
            <p className="text-xs text-slate-500 mt-1">{moment(tierData.updated_date).fromNow()}</p>
          </div>
          <Trophy className="h-8 w-8 text-amber-600" />
        </div>
      </CardContent>
    </Card>
  );
}