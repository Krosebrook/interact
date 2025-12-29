import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export function useGamificationStats() {
  const { data: userPoints } = useQuery({
    queryKey: ['stats-user-points'],
    queryFn: () => base44.entities.UserPoints.list(),
    staleTime: 60000
  });

  const { data: badgeAwards } = useQuery({
    queryKey: ['stats-badge-awards'],
    queryFn: () => base44.entities.BadgeAward.list(),
    staleTime: 60000
  });

  const { data: learningProgress } = useQuery({
    queryKey: ['stats-learning-progress'],
    queryFn: () => base44.entities.LearningPathProgress.list(),
    staleTime: 60000
  });

  const stats = {
    activeUsers: userPoints?.filter(p => (p.total_points || 0) > 0).length || 0,
    totalPoints: userPoints?.reduce((sum, p) => sum + (p.total_points || 0), 0) || 0,
    totalBadges: badgeAwards?.length || 0,
    activeLearningPaths: learningProgress?.filter(p => p.status === 'in_progress').length || 0
  };

  return stats;
}