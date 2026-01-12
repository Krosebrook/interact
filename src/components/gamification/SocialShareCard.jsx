import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { 
  Share2, 
  Linkedin, 
  Twitter, 
  Mail, 
  Copy, 
  Check,
  ThumbsUp,
  PartyPopper,
  Sparkles,
  MessageCircle,
  Award,
  Trophy,
  Crown,
  Target,
  Flame,
  Heart
} from 'lucide-react';
import { toast } from 'sonner';

const SHARE_TYPE_CONFIG = {
  badge_earned: { icon: Award, color: 'from-purple-500 to-violet-600', label: 'New Badge!' },
  level_up: { icon: Trophy, color: 'from-amber-500 to-orange-600', label: 'Level Up!' },
  tier_achieved: { icon: Crown, color: 'from-yellow-400 to-amber-500', label: 'New Tier!' },
  challenge_completed: { icon: Target, color: 'from-emerald-500 to-teal-600', label: 'Challenge Complete!' },
  leaderboard_rank: { icon: Trophy, color: 'from-blue-500 to-indigo-600', label: 'Ranking Up!' },
  streak_milestone: { icon: Flame, color: 'from-orange-500 to-red-600', label: 'Streak Milestone!' },
  recognition_received: { icon: Heart, color: 'from-pink-500 to-rose-600', label: 'Recognized!' }
};

const REACTION_ICONS = {
  likes: ThumbsUp,
  celebrates: PartyPopper,
  inspired: Sparkles
};

export function SocialShareDialog({ 
  open, 
  onOpenChange, 
  shareType, 
  shareData,
  onShare 
}) {
  const [copied, setCopied] = useState(false);
  const config = SHARE_TYPE_CONFIG[shareType] || SHARE_TYPE_CONFIG.badge_earned;
  const Icon = config.icon;

  const shareMessage = `🎉 ${shareData?.title || 'Achievement Unlocked!'}\n${shareData?.description || ''}\n\n#INTeract #TeamEngagement`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Copied to clipboard!');
  };

  const handleShare = async (platform) => {
    await onShare?.(platform);
    
    const encodedMessage = encodeURIComponent(shareMessage);
    let url = '';
    
    switch (platform) {
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.origin)}&summary=${encodedMessage}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodedMessage}`;
        break;
      case 'email':
        url = `mailto:?subject=${encodeURIComponent(shareData?.title || 'Check this out!')}&body=${encodedMessage}`;
        break;
    }
    
    if (url) {
      window.open(url, '_blank', 'width=600,height=400');
    }
    
    toast.success(`Shared to ${platform}!`);
    onOpenChange(false);
  };

  return (
    <Dialog data-b44-sync="true" data-feature="gamification" data-component="socialsharecard" open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-int-orange" />
            Share Your Achievement
          </DialogTitle>
        </DialogHeader>

        {/* Preview Card */}
        <div className="my-4">
          <Card className="overflow-hidden border-2 border-slate-200">
            <div className={`h-2 bg-gradient-to-r ${config.color}`} />
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${config.color} flex items-center justify-center shadow-lg`}>
                  {shareData?.icon ? (
                    <span className="text-3xl">{shareData.icon}</span>
                  ) : (
                    <Icon className="h-8 w-8 text-white" />
                  )}
                </div>
                <div className="flex-1">
                  <Badge className="mb-1 text-xs">{config.label}</Badge>
                  <h3 className="font-bold text-slate-900">{shareData?.title}</h3>
                  <p className="text-sm text-slate-600">{shareData?.description}</p>
                  {shareData?.value && (
                    <p className="text-lg font-bold text-int-orange mt-1">{shareData.value}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Share Options */}
        <div className="grid grid-cols-4 gap-3">
          <Button
            variant="outline"
            className="flex-col h-20 gap-2 hover:bg-blue-50 hover:border-blue-300"
            onClick={() => handleShare('linkedin')}
          >
            <Linkedin className="h-6 w-6 text-blue-600" />
            <span className="text-xs">LinkedIn</span>
          </Button>
          <Button
            variant="outline"
            className="flex-col h-20 gap-2 hover:bg-sky-50 hover:border-sky-300"
            onClick={() => handleShare('twitter')}
          >
            <Twitter className="h-6 w-6 text-sky-500" />
            <span className="text-xs">Twitter</span>
          </Button>
          <Button
            variant="outline"
            className="flex-col h-20 gap-2 hover:bg-slate-50"
            onClick={() => handleShare('email')}
          >
            <Mail className="h-6 w-6 text-slate-600" />
            <span className="text-xs">Email</span>
          </Button>
          <Button
            variant="outline"
            className="flex-col h-20 gap-2 hover:bg-emerald-50 hover:border-emerald-300"
            onClick={handleCopyLink}
          >
            {copied ? (
              <Check className="h-6 w-6 text-emerald-600" />
            ) : (
              <Copy className="h-6 w-6 text-slate-600" />
            )}
            <span className="text-xs">{copied ? 'Copied!' : 'Copy'}</span>
          </Button>
        </div>

        <DialogFooter className="mt-4">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            className="bg-int-orange hover:bg-int-orange/90"
            onClick={() => handleShare('internal')}
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Share in Feed
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function SocialShareCard({ share, currentUserEmail }) {
  const queryClient = useQueryClient();
  const config = SHARE_TYPE_CONFIG[share.share_type] || SHARE_TYPE_CONFIG.badge_earned;
  const Icon = config.icon;

  const hasReacted = share.reaction_users?.some(r => r.user_email === currentUserEmail);
  
  const reactMutation = useMutation({
    mutationFn: async (reaction) => {
      const newReactions = { ...(share.reactions || { likes: 0, celebrates: 0, inspired: 0 }) };
      newReactions[reaction] = (newReactions[reaction] || 0) + 1;
      
      const newReactionUsers = [...(share.reaction_users || []), {
        user_email: currentUserEmail,
        reaction,
        timestamp: new Date().toISOString()
      }];
      
      await base44.entities.SocialShare.update(share.id, {
        reactions: newReactions,
        reaction_users: newReactionUsers
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['social-shares']);
      toast.success('Reaction added!');
    }
  });

  const totalReactions = Object.values(share.reactions || {}).reduce((a, b) => a + b, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <div className={`h-1.5 bg-gradient-to-r ${config.color}`} />
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center shadow-md`}>
              {share.share_data?.icon ? (
                <span className="text-2xl">{share.share_data.icon}</span>
              ) : (
                <Icon className="h-6 w-6 text-white" />
              )}
            </div>
            <div className="flex-1">
              <Badge className="text-xs mb-0.5">{config.label}</Badge>
              <h4 className="font-bold text-slate-900">{share.share_data?.title}</h4>
            </div>
          </div>

          {/* Content */}
          <p className="text-sm text-slate-600 mb-3">{share.share_data?.description}</p>

          {share.share_data?.value && (
            <div className="bg-slate-50 rounded-lg p-3 mb-3 text-center">
              <span className="text-2xl font-bold text-int-orange">{share.share_data.value}</span>
            </div>
          )}

          {/* Reactions */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <div className="flex gap-1">
              {Object.entries(REACTION_ICONS).map(([key, ReactionIcon]) => (
                <Button
                  key={key}
                  variant="ghost"
                  size="sm"
                  className={`h-8 px-2 ${hasReacted ? 'opacity-50' : 'hover:bg-slate-100'}`}
                  onClick={() => !hasReacted && reactMutation.mutate(key)}
                  disabled={hasReacted || reactMutation.isPending}
                >
                  <ReactionIcon className="h-4 w-4 mr-1" />
                  <span className="text-xs">{share.reactions?.[key] || 0}</span>
                </Button>
              ))}
            </div>
            {totalReactions > 0 && (
              <span className="text-xs text-slate-500">{totalReactions} reactions</span>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}