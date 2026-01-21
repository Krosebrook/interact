import React from 'react';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function LeaderboardListItem({ rank, user, points, department, activity, trend }) {
  const isTopTen = rank <= 10;
  
  return (
    <div className={`flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-slate-800 border ${
      isTopTen ? 'border-primary/20' : 'border-slate-100 dark:border-slate-700'
    } hover:shadow-md transition-all`}>
      <div className="flex items-center justify-center w-12 text-center">
        <span className={`text-lg font-bold ${
          rank <= 3 ? 'text-primary' : 'text-slate-500 dark:text-slate-400'
        }`}>
          {rank.toString().padStart(2, '0')}
        </span>
      </div>
      
      <div className="relative">
        <div className="w-12 h-12 rounded-full bg-cover bg-center border-2 border-white dark:border-slate-900"
             style={{ backgroundImage: `url(${user.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.name)})` }}
        />
        {user.online && (
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-slate-900" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-bold text-slate-900 dark:text-white truncate">
          {user.name}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          {department && (
            <Badge className="text-[10px] font-semibold px-2 py-0" variant="outline">
              {department}
            </Badge>
          )}
          {activity && (
            <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
              {activity}
            </span>
          )}
        </div>
      </div>

      <div className="text-right">
        <p className="text-lg font-bold text-primary">
          {points?.toLocaleString()}
        </p>
        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
          PTS
        </p>
        {trend && (
          <div className={`flex items-center justify-end gap-0.5 mt-1 ${
            trend > 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            <span className="text-xs font-bold">{Math.abs(trend)}</span>
          </div>
        )}
      </div>
    </div>
  );
}