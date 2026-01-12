import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, TrendingUp, Users, Share2 } from 'lucide-react';
import LeaderboardRow from './LeaderboardRow';
import { SocialShareDialog } from '../gamification/SocialShareCard';

/**
 * Card showing current user's rank and nearby competitors
 */
export default function MyRankCard({ myRank, nearby, totalParticipants, categoryLabel, userEmail }) {
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  if (!myRank) {
    return (
      <Card className="bg-gradient-to-r from-slate-100 to-slate-50 border-slate-200" data-b44-sync="true" data-feature="leaderboard" data-component="myrankcard">
        <CardContent className="p-6 text-center">
          <Trophy className="h-12 w-12 mx-auto mb-3 text-slate-400" />
          <h3 className="font-semibold text-slate-700 mb-1">Start Earning!</h3>
          <p className="text-sm text-slate-500">
            Participate in activities to appear on the leaderboard
          </p>
        </CardContent>
      </Card>);

  }

  const percentile = Math.round((1 - myRank.rank / totalParticipants) * 100);

  return (
    <Card className="bg-gradient-to-r from-int-orange/10 to-amber-50 border-int-orange/20">
      <CardContent className="p-4">
        {/* Header stats */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-slate-600 font-medium">Your Rank</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-int-orange">#{myRank.rank}</span>
              <span className="text-sm text-slate-500">of {totalParticipants}</span>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-sm text-slate-600 font-medium">{categoryLabel}</p>
            <div className="text-2xl font-bold text-int-navy">
              {myRank.score.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Percentile badge */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Badge className="bg-int-orange text-slate-950 px-2.5 py-0.5 text-xs font-semibold rounded-md inline-flex items-center border transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent shadow hover:bg-primary/80">
              Top {100 - percentile}%
            </Badge>
            <span className="text-xs text-slate-500">
              Better than {percentile}% of users
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-slate-600 hover:text-int-orange"
            onClick={() => setShareDialogOpen(true)}
          >
            <Share2 className="h-4 w-4 mr-1" />
            Share
          </Button>
        </div>

        {/* Nearby competitors */}
        {nearby.length > 0 &&
        <div className="border-t border-slate-200 pt-4">
            <p className="text-xs font-medium text-slate-500 mb-2 flex items-center gap-1">
              <Users className="h-3 w-3" />
              Nearby Competitors
            </p>
            <div className="space-y-2">
              {nearby.map((user) =>
            <div
              key={user.user_email}
              className={`flex items-center justify-between text-sm px-2 py-1 rounded ${
              user.user_email === myRank.user_email ?
              'bg-int-orange/20 font-medium' :
              'bg-white'}`
              }>

                  <span className="flex items-center gap-2">
                    <span className="w-6 text-center text-slate-500">#{user.rank}</span>
                    <span className={user.user_email === myRank.user_email ? 'text-int-orange' : ''}>
                      {user.user_name}
                    </span>
                  </span>
                  <span className="font-medium">{user.score.toLocaleString()}</span>
                </div>
            )}
            </div>
          </div>
        }

        {/* Share Dialog */}
        <SocialShareDialog
          open={shareDialogOpen}
          onOpenChange={setShareDialogOpen}
          shareType="leaderboard_rank"
          shareData={{
            title: `Ranked #${myRank.rank}!`,
            description: `I'm in the top ${100 - percentile}% on the leaderboard with ${myRank.score.toLocaleString()} ${categoryLabel.toLowerCase()}!`,
            icon: '🏆',
            value: `#${myRank.rank} of ${totalParticipants}`
          }}
          onShare={async (platform) => {
            const { base44 } = await import('@/api/base44Client');
            await base44.entities.SocialShare.create({
              user_email: userEmail || myRank.user_email,
              share_type: 'leaderboard_rank',
              reference_id: `rank-${myRank.rank}`,
              share_data: {
                title: `Ranked #${myRank.rank}!`,
                description: `Top ${100 - percentile}% with ${myRank.score.toLocaleString()} ${categoryLabel.toLowerCase()}`,
                icon: '🏆',
                value: `#${myRank.rank}`
              },
              platforms: [platform],
              visibility: 'public'
            });
          }}
        />
      </CardContent>
    </Card>);

}