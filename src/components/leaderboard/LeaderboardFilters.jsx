import React from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LEADERBOARD_CATEGORIES, TIME_PERIODS } from './hooks/useLeaderboard';

/**
 * Filter controls for leaderboard category and time period
 */
export default function LeaderboardFilters({
  category,
  period,
  onCategoryChange,
  onPeriodChange,
  showFollowingOnly,
  onToggleFollowing
}) {
  return (
    <div className="space-y-4" data-b44-sync="true" data-feature="leaderboard" data-component="leaderboardfilters">
      {/* Category tabs */}
      <Tabs value={category} onValueChange={onCategoryChange}>
        <TabsList className="grid grid-cols-4 w-full">
          {Object.entries(LEADERBOARD_CATEGORIES).map(([key, config]) => (
            <TabsTrigger key={key} value={key} className="text-xs sm:text-sm">
              <span className="mr-1">{config.icon}</span>
              <span className="hidden sm:inline">{config.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Time period buttons */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-slate-700 font-medium mr-2">Period:</span>
        {Object.entries(TIME_PERIODS).map(([key, config]) => (
          <Button
            key={key}
            size="sm"
            variant={period === key ? 'default' : 'outline'}
            onClick={() => onPeriodChange(key)}
            className={period === key ? 'bg-int-navy' : ''}
          >
            {config.label}
          </Button>
        ))}

        {/* Following filter */}
        {onToggleFollowing && (
          <Button
            size="sm"
            variant={showFollowingOnly ? 'default' : 'outline'}
            onClick={onToggleFollowing}
            className={`ml-auto ${showFollowingOnly ? 'bg-int-orange hover:bg-[#C46322]' : ''}`}
          >
            👥 Following
          </Button>
        )}
      </div>
    </div>
  );
}