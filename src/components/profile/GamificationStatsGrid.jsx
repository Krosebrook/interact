import React from 'react';
import { Trophy, Calendar, Lightbulb, Flame } from 'lucide-react';

export default function GamificationStatsGrid({ eventsAttended, ideasSubmitted, dayStreak }) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {/* Events Attended */}
      <div className="flex flex-col items-center justify-center p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 group hover:border-blue-300 transition-all">
        <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 mb-2 group-hover:scale-110 transition-transform">
          <Calendar className="w-5 h-5" />
        </div>
        <span className="text-xl font-extrabold text-slate-900 dark:text-white">
          {eventsAttended || 0}
        </span>
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
          Attended
        </span>
      </div>

      {/* Ideas Submitted */}
      <div className="flex flex-col items-center justify-center p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 group hover:border-purple-300 transition-all">
        <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 mb-2 group-hover:scale-110 transition-transform">
          <Lightbulb className="w-5 h-5" />
        </div>
        <span className="text-xl font-extrabold text-slate-900 dark:text-white">
          {ideasSubmitted || 0}
        </span>
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
          Ideas
        </span>
      </div>

      {/* Day Streak */}
      <div className="flex flex-col items-center justify-center p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 group hover:border-orange-300 transition-all">
        <div className="w-10 h-10 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-600 mb-2 group-hover:scale-110 transition-transform">
          <Flame className="w-5 h-5" />
        </div>
        <span className="text-xl font-extrabold text-slate-900 dark:text-white">
          {dayStreak || 0}
        </span>
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
          Day Streak
        </span>
      </div>
    </div>
  );
}