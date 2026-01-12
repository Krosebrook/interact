import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Award, Lock, Star, Trophy, Target, Flame, Users, Lightbulb, Heart, Zap, Share2 } from 'lucide-react';
import { SocialShareDialog } from './SocialShareCard';

const BADGE_ICONS = {
  milestone: Trophy,
  achievement: Award,
  special: Star,
  team: Users,
  collaborator: Users,
  innovator: Lightbulb,
  community_builder: Heart,
  leadership: Zap,
  mentor: Heart,
  streak: Flame,
  engagement: Target,
  early_adopter: Star,
  champion: Trophy
};

const RARITY_STYLES = {
  common: { bg: 'bg-slate-100', border: 'border-slate-300', text: 'text-slate-700' },
  uncommon: { bg: 'bg-green-100', border: 'border-green-300', text: 'text-green-700' },
  rare: { bg: 'bg-blue-100', border: 'border-blue-400', text: 'text-blue-700' },
  epic: { bg: 'bg-purple-100', border: 'border-purple-400', text: 'text-purple-700' },
  legendary: { bg: 'bg-gradient-to-br from-yellow-100 to-orange-100', border: 'border-yellow-400', text: 'text-yellow-700' }
};

export default function BadgeShowcase({ userEmail, earnedBadgeIds = [] }) {
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [badgeToShare, setBadgeToShare] = useState(null);

  const { data: allBadges = [] } = useQuery({
    queryKey: ['all-badges'],
    queryFn: () => base44.entities.Badge.list()
  });

  const { data: userPoints } = useQuery({
    queryKey: ['user-points-badges', userEmail],
    queryFn: async () => {
      const points = await base44.entities.UserPoints.filter({ user_email: userEmail });
      return points[0];
    },
    enabled: !!userEmail
  });

  const earnedBadges = allBadges.filter(b => 
    earnedBadgeIds.includes(b.id) || userPoints?.badges_earned?.includes(b.id)
  );
  
  const lockedBadges = allBadges.filter(b => 
    !earnedBadgeIds.includes(b.id) && !userPoints?.badges_earned?.includes(b.id) && !b.is_hidden
  );

  const getProgress = (badge) => {
    if (!userPoints || !badge.award_criteria) return 0;
    
    const criteria = badge.award_criteria;
    let current = 0;
    
    switch (criteria.type) {
      case 'events_attended':
        current = userPoints.events_attended || 0;
        break;
      case 'feedback_submitted':
        current = userPoints.feedback_submitted || 0;
        break;
      case 'points_total':
        current = userPoints.lifetime_points || 0;
        break;
      case 'streak_days':
        current = userPoints.streak_days || 0;
        break;
      case 'activities_completed':
        current = userPoints.activities_completed || 0;
        break;
      default:
        return 0;
    }
    
    const threshold = criteria.threshold || 1;
    return Math.min(100, Math.round((current / threshold) * 100));
  };

  const renderBadge = (badge, isEarned = false) => {
    const Icon = BADGE_ICONS[badge.badge_type] || Award;
    const rarity = RARITY_STYLES[badge.rarity] || RARITY_STYLES.common;
    const progress = isEarned ? 100 : getProgress(badge);

    return (
      <div data-b44-sync="true" data-feature="gamification" data-component="badgeshowcase"         key={badge.id}
        onClick={() => setSelectedBadge({ ...badge, isEarned, progress })}
        className={`relative cursor-pointer p-4 rounded-xl border-2 transition-all hover:scale-105 ${
          isEarned 
            ? `${rarity.bg} ${rarity.border}` 
            : 'bg-slate-50 border-slate-200 opacity-60'
        }`}
      >
        <div className="text-center">
          <div className={`text-4xl mb-2 ${!isEarned && 'grayscale'}`}>
            {badge.badge_icon || '🏆'}
          </div>
          <h4 className={`font-semibold text-sm ${isEarned ? rarity.text : 'text-slate-500'}`}>
            {badge.badge_name}
          </h4>
          <Badge 
            variant="outline" 
            className={`text-xs mt-1 ${isEarned ? rarity.text : ''}`}
          >
            {badge.rarity}
          </Badge>
          
          {!isEarned && progress > 0 && (
            <div className="mt-2">
              <Progress value={progress} className="h-1" />
              <span className="text-xs text-slate-500">{progress}%</span>
            </div>
          )}
          
          {!isEarned && (
            <Lock className="absolute top-2 right-2 h-4 w-4 text-slate-400" />
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-500" />
            Badges ({earnedBadges.length}/{allBadges.filter(b => !b.is_hidden).length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Earned Badges */}
          {earnedBadges.length > 0 && (
            <div className="mb-6">
              <h4 className="font-semibold text-sm text-slate-500 mb-3">Earned</h4>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {earnedBadges.map(badge => renderBadge(badge, true))}
              </div>
            </div>
          )}

          {/* Locked Badges */}
          {lockedBadges.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm text-slate-500 mb-3">Locked</h4>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {lockedBadges.slice(0, 12).map(badge => renderBadge(badge, false))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Badge Detail Dialog */}
      <Dialog open={!!selectedBadge} onOpenChange={() => setSelectedBadge(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <span className="text-4xl">{selectedBadge?.badge_icon}</span>
              {selectedBadge?.badge_name}
            </DialogTitle>
          </DialogHeader>
          
          {selectedBadge && (
            <div className="space-y-4">
              <p className="text-slate-600">{selectedBadge.badge_description}</p>
              
              <div className="flex gap-2">
                <Badge className={RARITY_STYLES[selectedBadge.rarity]?.text}>
                  {selectedBadge.rarity}
                </Badge>
                <Badge variant="outline">{selectedBadge.badge_type}</Badge>
                {selectedBadge.points_value > 0 && (
                  <Badge className="bg-yellow-100 text-yellow-700">
                    +{selectedBadge.points_value} pts
                  </Badge>
                )}
              </div>

              {selectedBadge.award_criteria && (
                <div className="bg-slate-50 rounded-lg p-4">
                  <h4 className="font-semibold text-sm mb-2">How to Earn</h4>
                  <p className="text-sm text-slate-600">
                    {selectedBadge.award_criteria.type?.replace(/_/g, ' ')} ≥ {selectedBadge.award_criteria.threshold}
                  </p>
                  {!selectedBadge.isEarned && (
                    <div className="mt-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>{selectedBadge.progress}%</span>
                      </div>
                      <Progress value={selectedBadge.progress} />
                    </div>
                  )}
                </div>
              )}

              {selectedBadge.isEarned && (
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <Award className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-green-700 font-medium">Badge Earned!</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => {
                      setBadgeToShare(selectedBadge);
                      setShareDialogOpen(true);
                    }}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Achievement
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <SocialShareDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        shareType="badge_earned"
        shareData={{
          title: badgeToShare?.badge_name,
          description: `I earned the ${badgeToShare?.badge_name} badge!`,
          icon: badgeToShare?.badge_icon,
          value: badgeToShare?.points_value > 0 ? `+${badgeToShare.points_value} pts` : null
        }}
        onShare={async (platform) => {
          if (!badgeToShare) return;
          await base44.entities.SocialShare.create({
            user_email: userEmail,
            share_type: 'badge_earned',
            reference_id: badgeToShare.id,
            share_data: {
              title: badgeToShare.badge_name,
              description: `Earned the ${badgeToShare.badge_name} badge!`,
              icon: badgeToShare.badge_icon,
              value: badgeToShare.points_value > 0 ? `+${badgeToShare.points_value} pts` : null
            },
            platforms: [platform],
            visibility: 'public'
          });
        }}
      />
    </>
  );
}