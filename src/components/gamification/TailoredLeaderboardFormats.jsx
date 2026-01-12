import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Crown, Medal, Star, Users, Flame, TrendingUp, Sparkles, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const SEGMENT_CONFIGS = {
  new_users: {
    name: 'Newcomer League',
    icon: '🌱',
    description: 'For users with less than 30 days on the platform',
    metric: 'weekly_points',
    maxDisplay: 10,
    color: 'emerald'
  },
  power_users: {
    name: 'Champions Arena',
    icon: '⚡',
    description: 'Top performers competing for the crown',
    metric: 'total_points',
    maxDisplay: 25,
    color: 'amber'
  },
  streak_masters: {
    name: 'Streak Warriors',
    icon: '🔥',
    description: 'Longest active streaks',
    metric: 'streak_days',
    maxDisplay: 15,
    color: 'orange'
  },
  social_stars: {
    name: 'Recognition Stars',
    icon: '💫',
    description: 'Most recognitions given and received',
    metric: 'recognitions',
    maxDisplay: 15,
    color: 'pink'
  },
  event_enthusiasts: {
    name: 'Event Champions',
    icon: '🎯',
    description: 'Most active in team events',
    metric: 'events_attended',
    maxDisplay: 15,
    color: 'blue'
  }
};

export default function TailoredLeaderboardFormats({ userPoints = [], currentUserEmail }) {
  const [activeSegment, setActiveSegment] = useState('power_users');
  const [displayStyle, setDisplayStyle] = useState('podium');

  // Segment users based on criteria
  const segmentedLeaderboards = useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

    return {
      new_users: userPoints
        .filter(u => u.created_date && new Date(u.created_date) > thirtyDaysAgo)
        .sort((a, b) => (b.weekly_points || 0) - (a.weekly_points || 0))
        .slice(0, 10)
        .map((u, idx) => ({ ...u, rank: idx + 1, score: u.weekly_points || 0 })),

      power_users: userPoints
        .filter(u => (u.total_points || 0) >= 500)
        .sort((a, b) => (b.total_points || 0) - (a.total_points || 0))
        .slice(0, 25)
        .map((u, idx) => ({ ...u, rank: idx + 1, score: u.total_points || 0 })),

      streak_masters: userPoints
        .filter(u => (u.streak_days || 0) >= 3)
        .sort((a, b) => (b.streak_days || 0) - (a.streak_days || 0))
        .slice(0, 15)
        .map((u, idx) => ({ ...u, rank: idx + 1, score: u.streak_days || 0 })),

      social_stars: userPoints
        .sort((a, b) => {
          const aScore = (a.recognitions_given || 0) + (a.recognitions_received || 0);
          const bScore = (b.recognitions_given || 0) + (b.recognitions_received || 0);
          return bScore - aScore;
        })
        .slice(0, 15)
        .map((u, idx) => ({ 
          ...u, 
          rank: idx + 1, 
          score: (u.recognitions_given || 0) + (u.recognitions_received || 0) 
        })),

      event_enthusiasts: userPoints
        .sort((a, b) => (b.events_attended || 0) - (a.events_attended || 0))
        .slice(0, 15)
        .map((u, idx) => ({ ...u, rank: idx + 1, score: u.events_attended || 0 }))
    };
  }, [userPoints]);

  const currentLeaderboard = segmentedLeaderboards[activeSegment] || [];
  const segmentConfig = SEGMENT_CONFIGS[activeSegment];

  const colorClasses = {
    emerald: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' },
    amber: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
    orange: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' },
    pink: { bg: 'bg-pink-100', text: 'text-pink-700', border: 'border-pink-200' },
    blue: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' }
  };

  const colors = colorClasses[segmentConfig.color];

  return (
    <Card data-b44-sync="true" data-feature="gamification" data-component="tailoredleaderboardformats">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-int-orange" />
            Tailored Leaderboards
          </CardTitle>
          <Select value={displayStyle} onValueChange={setDisplayStyle}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="podium">Podium</SelectItem>
              <SelectItem value="list">List</SelectItem>
              <SelectItem value="cards">Cards</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {/* Segment Selector */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {Object.entries(SEGMENT_CONFIGS).map(([key, config]) => (
            <Button
              key={key}
              variant={activeSegment === key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveSegment(key)}
              className={activeSegment === key ? 'bg-int-orange hover:bg-int-orange/90' : ''}
            >
              <span className="mr-2">{config.icon}</span>
              {config.name}
            </Button>
          ))}
        </div>

        {/* Segment Description */}
        <div className={`p-3 rounded-lg mb-6 ${colors.bg}`}>
          <p className={`text-sm ${colors.text}`}>
            {segmentConfig.icon} {segmentConfig.description}
          </p>
        </div>

        {/* Leaderboard Display */}
        {currentLeaderboard.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Users className="h-12 w-12 mx-auto mb-2 text-slate-300" />
            <p>No users qualify for this leaderboard yet</p>
          </div>
        ) : displayStyle === 'podium' ? (
          <PodiumDisplay 
            users={currentLeaderboard.slice(0, 3)} 
            colors={colors}
            currentUserEmail={currentUserEmail}
          />
        ) : displayStyle === 'cards' ? (
          <CardsDisplay 
            users={currentLeaderboard} 
            colors={colors}
            currentUserEmail={currentUserEmail}
          />
        ) : (
          <ListDisplay 
            users={currentLeaderboard} 
            colors={colors}
            currentUserEmail={currentUserEmail}
          />
        )}
      </CardContent>
    </Card>
  );
}

function PodiumDisplay({ users, colors, currentUserEmail }) {
  const [second, first, third] = [users[1], users[0], users[2]];
  
  return (
    <div className="flex items-end justify-center gap-4 py-8">
      {/* Second Place */}
      {second && (
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center"
        >
          <div className={`w-20 h-20 rounded-full ${second.user_email === currentUserEmail ? 'ring-4 ring-int-orange' : ''} bg-slate-200 flex items-center justify-center text-2xl mb-2 mx-auto`}>
            {second.user_name?.[0] || '?'}
          </div>
          <p className="font-medium text-sm truncate max-w-[80px]">{second.user_name || 'User'}</p>
          <p className="text-xs text-slate-500">{second.score.toLocaleString()}</p>
          <div className="w-20 h-16 bg-slate-300 rounded-t-lg mt-2 flex items-center justify-center">
            <Medal className="h-6 w-6 text-slate-600" />
          </div>
        </motion.div>
      )}

      {/* First Place */}
      {first && (
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center"
        >
          <div className="relative">
            <Crown className="h-6 w-6 text-amber-500 absolute -top-3 left-1/2 -translate-x-1/2" />
            <div className={`w-24 h-24 rounded-full ${first.user_email === currentUserEmail ? 'ring-4 ring-int-orange' : ''} bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-3xl text-white mb-2 mx-auto`}>
              {first.user_name?.[0] || '?'}
            </div>
          </div>
          <p className="font-bold">{first.user_name || 'User'}</p>
          <p className="text-sm text-int-orange font-medium">{first.score.toLocaleString()}</p>
          <div className="w-24 h-24 bg-amber-400 rounded-t-lg mt-2 flex items-center justify-center">
            <Star className="h-8 w-8 text-amber-700" />
          </div>
        </motion.div>
      )}

      {/* Third Place */}
      {third && (
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <div className={`w-20 h-20 rounded-full ${third.user_email === currentUserEmail ? 'ring-4 ring-int-orange' : ''} bg-orange-200 flex items-center justify-center text-2xl mb-2 mx-auto`}>
            {third.user_name?.[0] || '?'}
          </div>
          <p className="font-medium text-sm truncate max-w-[80px]">{third.user_name || 'User'}</p>
          <p className="text-xs text-slate-500">{third.score.toLocaleString()}</p>
          <div className="w-20 h-12 bg-orange-300 rounded-t-lg mt-2 flex items-center justify-center">
            <Medal className="h-5 w-5 text-orange-700" />
          </div>
        </motion.div>
      )}
    </div>
  );
}

function CardsDisplay({ users, colors, currentUserEmail }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {users.map((user, idx) => (
        <motion.div
          key={user.user_email}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: idx * 0.05 }}
          className={`p-4 rounded-xl ${user.user_email === currentUserEmail ? 'ring-2 ring-int-orange bg-int-orange/5' : 'bg-slate-50'}`}
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="text-lg font-bold text-slate-400">#{user.rank}</span>
            <Avatar className="h-10 w-10">
              <AvatarFallback className={colors.bg}>
                {user.user_name?.[0] || '?'}
              </AvatarFallback>
            </Avatar>
          </div>
          <p className="font-medium truncate">{user.user_name || user.user_email?.split('@')[0]}</p>
          <p className={`text-lg font-bold ${colors.text}`}>{user.score.toLocaleString()}</p>
        </motion.div>
      ))}
    </div>
  );
}

function ListDisplay({ users, colors, currentUserEmail }) {
  return (
    <div className="space-y-2">
      {users.map((user, idx) => (
        <motion.div
          key={user.user_email}
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: idx * 0.03 }}
          className={`flex items-center gap-3 p-3 rounded-lg ${user.user_email === currentUserEmail ? 'bg-int-orange/10 border border-int-orange/30' : 'bg-slate-50'}`}
        >
          <span className={`w-8 text-center font-bold ${user.rank <= 3 ? 'text-int-orange' : 'text-slate-400'}`}>
            #{user.rank}
          </span>
          <Avatar className="h-8 w-8">
            <AvatarFallback className={colors.bg}>
              {user.user_name?.[0] || '?'}
            </AvatarFallback>
          </Avatar>
          <span className="flex-1 font-medium truncate">
            {user.user_name || user.user_email?.split('@')[0]}
          </span>
          <span className={`font-bold ${colors.text}`}>{user.score.toLocaleString()}</span>
          {user.rank <= 3 && (
            <Badge className={`${colors.bg} ${colors.text}`}>
              {user.rank === 1 ? '🥇' : user.rank === 2 ? '🥈' : '🥉'}
            </Badge>
          )}
        </motion.div>
      ))}
    </div>
  );
}