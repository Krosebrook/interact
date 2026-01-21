import React from 'react';
import { Crown, TrendingUp } from 'lucide-react';

export default function PodiumDisplay({ topThree }) {
  if (!topThree || topThree.length < 3) return null;

  const [second, first, third] = [topThree[1], topThree[0], topThree[2]];

  const getMedalColor = (rank) => {
    if (rank === 1) return 'border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.4)]';
    if (rank === 2) return 'border-slate-300 shadow-[0_0_15px_rgba(203,213,225,0.4)]';
    return 'border-amber-600 shadow-[0_0_15px_rgba(217,119,6,0.4)]';
  };

  const getMedalBg = (rank) => {
    if (rank === 1) return 'bg-gradient-to-br from-yellow-400 to-yellow-500';
    if (rank === 2) return 'bg-gradient-to-br from-slate-200 to-slate-300';
    return 'bg-gradient-to-br from-amber-500 to-amber-600';
  };

  const getMedalText = (rank) => {
    if (rank === 1) return 'text-amber-900';
    if (rank === 2) return 'text-slate-600';
    return 'text-amber-100';
  };

  return (
    <div className="px-4 py-8">
      <div className="grid grid-cols-3 gap-2 items-end max-w-[340px] mx-auto">
        {/* Second Place */}
        <div className="flex flex-col items-center gap-2 transform translate-y-4">
          <div className="relative group cursor-pointer transition-transform hover:-translate-y-1 duration-300">
            <div className="h-6 w-full mb-1" />
            <div className={`w-20 h-20 rounded-full border-[3px] ${getMedalColor(2)} bg-cover bg-center`}
                 style={{ backgroundImage: `url(${second?.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(second?.name || 'User')})` }}
            />
            <div className={`absolute -bottom-3 left-1/2 -translate-x-1/2 ${getMedalBg(2)} ${getMedalText(2)} text-xs font-bold px-3 py-1 rounded-full shadow border-2 border-white dark:border-slate-900`}>
              #2
            </div>
          </div>
          <div className="text-center mt-3">
            <p className="text-slate-800 dark:text-white text-sm font-bold leading-tight truncate max-w-[80px]">
              {second?.name}
            </p>
            <p className="text-primary font-bold text-xs mt-0.5">
              {second?.points?.toLocaleString()}
            </p>
          </div>
        </div>

        {/* First Place */}
        <div className="flex flex-col items-center gap-2 z-20">
          <div className="relative group cursor-pointer transition-transform hover:-translate-y-1 duration-300">
            <div className="absolute -top-9 left-1/2 -translate-x-1/2 text-yellow-400 drop-shadow-md animate-bounce">
              <Crown className="w-7 h-7" />
            </div>
            <div className={`w-24 h-24 rounded-full border-[4px] ${getMedalColor(1)} bg-cover bg-center`}
                 style={{ backgroundImage: `url(${first?.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(first?.name || 'User')})` }}
            />
            <div className={`absolute -bottom-3 left-1/2 -translate-x-1/2 ${getMedalBg(1)} ${getMedalText(1)} text-sm font-bold px-3 py-1 rounded-full shadow-lg border-2 border-white dark:border-slate-900`}>
              #1
            </div>
          </div>
          <div className="text-center mt-4">
            <p className="text-slate-900 dark:text-white text-base font-bold leading-tight">
              {first?.name}
            </p>
            <p className="text-primary font-extrabold text-sm mt-1">
              {first?.points?.toLocaleString()} pts
            </p>
          </div>
        </div>

        {/* Third Place */}
        <div className="flex flex-col items-center gap-2 transform translate-y-6">
          <div className="relative group cursor-pointer transition-transform hover:-translate-y-1 duration-300">
            <div className="h-8 w-full mb-1" />
            <div className={`w-[72px] h-[72px] rounded-full border-[3px] ${getMedalColor(3)} bg-cover bg-center`}
                 style={{ backgroundImage: `url(${third?.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(third?.name || 'User')})` }}
            />
            <div className={`absolute -bottom-3 left-1/2 -translate-x-1/2 ${getMedalBg(3)} ${getMedalText(3)} text-xs font-bold px-2.5 py-1 rounded-full shadow border-2 border-white dark:border-slate-900`}>
              #3
            </div>
          </div>
          <div className="text-center mt-3">
            <p className="text-slate-800 dark:text-white text-sm font-bold leading-tight truncate max-w-[72px]">
              {third?.name}
            </p>
            <p className="text-primary font-bold text-xs mt-0.5">
              {third?.points?.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}