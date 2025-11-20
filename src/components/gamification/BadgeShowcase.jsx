import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';

const ALL_BADGES = [
  { id: 'first_timer', name: 'First Timer', description: 'Attended first event', emoji: '🎉', requirement: '1 event' },
  { id: 'team_player', name: 'Team Player', description: '5+ events attended', emoji: '🤝', requirement: '5 events' },
  { id: 'veteran', name: 'Veteran', description: '20+ events attended', emoji: '🎖️', requirement: '20 events' },
  { id: 'feedback_champion', name: 'Feedback Champion', description: '10+ feedback submissions', emoji: '💬', requirement: '10 feedback' },
  { id: 'engagement_master', name: 'Engagement Master', description: 'Avg 4.5+ rating', emoji: '⭐', requirement: '4.5+ avg' },
  { id: 'consistent_3', name: '3-Event Streak', description: '3 events in a row', emoji: '🔥', requirement: '3 streak' },
  { id: 'consistent_5', name: '5-Event Streak', description: '5 events in a row', emoji: '⚡', requirement: '5 streak' },
  { id: 'top_scorer', name: 'Top Scorer', description: '100+ points', emoji: '🏆', requirement: '100 points' },
  { id: 'super_scorer', name: 'Super Scorer', description: '500+ points', emoji: '👑', requirement: '500 points' }
];

export default function BadgeShowcase({ earnedBadges = [], compact = false }) {
  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        {ALL_BADGES.filter(badge => earnedBadges.includes(badge.id)).map((badge, index) => (
          <TooltipProvider key={badge.id}>
            <Tooltip>
              <TooltipTrigger>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-2xl"
                >
                  {badge.emoji}
                </motion.div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-semibold">{badge.name}</p>
                <p className="text-xs text-slate-400">{badge.description}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
    );
  }

  return (
    <Card className="p-6 border-0 shadow-lg">
      <h3 className="text-xl font-bold text-slate-900 mb-6">Achievement Badges</h3>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {ALL_BADGES.map((badge, index) => {
          const isEarned = earnedBadges.includes(badge.id);
          
          return (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`relative p-4 rounded-xl border-2 transition-all ${
                isEarned
                  ? 'bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200 hover:shadow-md'
                  : 'bg-slate-50 border-slate-200 opacity-50'
              }`}
            >
              {!isEarned && (
                <div className="absolute top-2 right-2">
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>
              )}
              
              <div className="text-center">
                <div className={`text-4xl mb-2 ${isEarned ? '' : 'grayscale'}`}>
                  {badge.emoji}
                </div>
                <p className="font-semibold text-sm text-slate-900 mb-1">
                  {badge.name}
                </p>
                <p className="text-xs text-slate-600 mb-2">
                  {badge.description}
                </p>
                <Badge 
                  variant="outline" 
                  className={`text-xs ${
                    isEarned 
                      ? 'border-indigo-300 text-indigo-700' 
                      : 'border-slate-300 text-slate-500'
                  }`}
                >
                  {badge.requirement}
                </Badge>
              </div>
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
}