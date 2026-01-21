import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, TrendingUp, Gift } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';

export default function GamificationHeroCard({ points, level, nextLevelPoints, userName }) {
  const progress = (points / nextLevelPoints) * 100;

  const levelTitles = {
    1: 'Newcomer',
    2: 'Contributor',
    3: 'Collaborator',
    4: 'Innovator',
    5: 'Catalyst',
    6: 'Champion',
    7: 'Leader'
  };

  return (
    <div className="relative w-full overflow-hidden rounded-3xl bg-gradient-to-br from-int-navy via-[#1e3a6d] to-int-orange text-white shadow-xl shadow-int-navy/30 p-6 transition-transform hover:scale-[1.01] duration-300">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 -mr-12 -mt-12 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
      <div className="absolute bottom-0 left-0 -ml-12 -mb-12 h-48 w-48 rounded-full bg-int-orange/20 blur-2xl" />
      
      <div className="relative z-10 flex flex-col gap-5">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <p className="text-white/80 text-sm font-medium mb-1 flex items-center gap-1">
              <Trophy className="w-4 h-4" />
              Employee Status
            </p>
            <h3 className="text-3xl font-extrabold tracking-tight">
              Level {level}: {levelTitles[level] || 'Team Player'}
            </h3>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-2.5 rounded-2xl border border-white/20 shadow-inner">
            <Trophy className="w-8 h-8 text-int-gold drop-shadow-sm" />
          </div>
        </div>

        {/* Progress Section */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-sm font-bold tracking-wide">
            <span className="text-white">{points?.toLocaleString()} Points</span>
            <span className="text-white/70">Goal: {nextLevelPoints?.toLocaleString()}</span>
          </div>
          <div className="h-2.5 w-full bg-black/20 rounded-full overflow-hidden backdrop-blur-sm">
            <div 
              className="h-full bg-gradient-to-r from-int-orange to-orange-400 rounded-full shadow-[0_0_10px_rgba(217,114,48,0.5)] transition-all duration-500"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-1">
          <Link to={createPageUrl('Leaderboards')} className="flex-1">
            <Button className="w-full py-3 bg-white text-int-navy rounded-xl text-sm font-bold shadow-md hover:bg-int-gold hover:text-white transition-colors">
              <TrendingUp className="w-4 h-4 mr-2" />
              Leaderboard
            </Button>
          </Link>
          <Link to={createPageUrl('RewardsStore')}>
            <Button className="h-full px-4 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 transition-colors backdrop-blur-md text-white">
              <Gift className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}