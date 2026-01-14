/**
 * Paginated Leaderboard with Lazy Loading
 * Loads 20 entries at a time, loads more on scroll
 */

import { useEffect, useRef, useCallback } from 'react';
import { useLeaderboardCache } from '../hooks/useLeaderboardCache';
import { useLazyLoading } from '../hooks/useLazyLoading';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Trophy } from 'lucide-react';

const PAGE_SIZE = 20;
const LOAD_MORE_THRESHOLD = 5; // Load more when 5 items from bottom

export default function LeaderboardPaginated({ type = 'weekly', period = null }) {
  const [currentPage, setCurrentPage] = React.useState(0);
  const [allSnapshots, setAllSnapshots] = React.useState([]);
  const observerRef = useRef(null);
  const { ref, inView } = useLazyLoading();

  // Fetch leaderboard with caching
  const { data, isLoading, error, prefetchNextPage } = useLeaderboardCache(type, period);

  // Initialize and paginate data
  useEffect(() => {
    if (data?.snapshots) {
      setAllSnapshots(data.snapshots);
    }
  }, [data]);

  // Auto-load next page when user scrolls near bottom
  useEffect(() => {
    if (inView && hasMorePages()) {
      loadNextPage();
    }
  }, [inView]);

  const loadNextPage = useCallback(() => {
    if (currentPage * PAGE_SIZE < allSnapshots.length) {
      setCurrentPage(p => p + 1);
    }
  }, [currentPage, allSnapshots.length]);

  const hasMorePages = useCallback(() => {
    return (currentPage + 1) * PAGE_SIZE < allSnapshots.length;
  }, [currentPage, allSnapshots.length]);

  const visibleSnapshots = allSnapshots.slice(
    0,
    (currentPage + 1) * PAGE_SIZE
  );

  if (error) {
    return (
      <Card className="border-red-200">
        <CardContent className="pt-6 flex gap-2">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <p>Failed to load leaderboard</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-500" />
          {type.charAt(0).toUpperCase() + type.slice(1)} Leaderboard
        </CardTitle>
        {data?.fetchedAt && (
          <p className="text-xs text-slate-500">
            Updated {new Date(data.fetchedAt).toLocaleTimeString()}
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-2">
        {/* Top 3 Highlighted */}
        {data?.topThree && (
          <div className="grid grid-cols-3 gap-2 mb-6">
            {data.topThree.map((entry, idx) => (
              <div
                key={entry.user_email}
                className={`p-3 rounded-lg text-center ${
                  idx === 0 ? 'bg-amber-100' : idx === 1 ? 'bg-gray-100' : 'bg-orange-50'
                }`}
              >
                <div className="text-2xl font-bold">{idx + 1}</div>
                <div className="text-sm font-medium truncate">{entry.user_email}</div>
                <div className="text-sm text-slate-600">{entry.points}pts</div>
              </div>
            ))}
          </div>
        )}

        {/* Paginated List */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {isLoading && currentPage === 0 ? (
            [...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))
          ) : (
            visibleSnapshots.map((entry, idx) => (
              <LeaderboardRow
                key={`${entry.user_email}-${entry.rank}`}
                rank={entry.rank}
                email={entry.user_email}
                points={entry.points}
                percentile={entry.percentile}
              />
            ))
          )}

          {/* Load More Sentinel */}
          {hasMorePages() && (
            <div ref={ref} className="py-4 text-center">
              {isLoading ? (
                <Skeleton className="h-8 w-full" />
              ) : (
                <p className="text-sm text-slate-500">
                  Scroll to load more ({visibleSnapshots.length} of {allSnapshots.length})
                </p>
              )}
            </div>
          )}
        </div>

        {visibleSnapshots.length === 0 && !isLoading && (
          <p className="text-center text-slate-500 py-8">No leaderboard data available</p>
        )}
      </CardContent>
    </Card>
  );
}

function LeaderboardRow({ rank, email, points, percentile }) {
  const getMedalEmoji = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return null;
  };

  return (
    <div className="flex items-center gap-4 p-3 bg-white/50 rounded-lg hover:bg-white/80 transition">
      <div className="w-8 text-center font-bold text-slate-600">
        {getMedalEmoji(rank) || `#${rank}`}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{email}</p>
        <div className="text-xs text-slate-500">Top {percentile}%</div>
      </div>
      <div className="text-right">
        <p className="font-bold text-int-orange">{points}</p>
        <p className="text-xs text-slate-500">points</p>
      </div>
    </div>
  );
}