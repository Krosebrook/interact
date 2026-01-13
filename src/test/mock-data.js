/**
 * Mock data generators for testing
 */

export const mockUser = (overrides = {}) => ({
  id: 'user-123',
  email: 'test@example.com',
  full_name: 'Test User',
  role: 'participant',
  user_type: 'participant',
  created_at: new Date().toISOString(),
  ...overrides,
});

export const mockActivity = (overrides = {}) => ({
  id: 'activity-123',
  title: 'Team Building Activity',
  description: 'A fun team building exercise',
  activity_type: 'team_building',
  duration_minutes: 60,
  min_participants: 5,
  max_participants: 20,
  points_reward: 100,
  created_by: 'facilitator@example.com',
  created_at: new Date().toISOString(),
  ...overrides,
});

export const mockEvent = (overrides = {}) => ({
  id: 'event-123',
  activity_id: 'activity-123',
  title: 'Team Building Session',
  start_time: new Date().toISOString(),
  end_time: new Date(Date.now() + 3600000).toISOString(),
  location: 'Conference Room A',
  status: 'scheduled',
  facilitator_email: 'facilitator@example.com',
  created_at: new Date().toISOString(),
  ...overrides,
});

export const mockUserPoints = (overrides = {}) => ({
  user_email: 'test@example.com',
  total_points: 500,
  current_streak: 5,
  longest_streak: 10,
  tier: 'silver',
  level: 3,
  team_id: 'team-123',
  ...overrides,
});

export const mockBadge = (overrides = {}) => ({
  id: 'badge-123',
  name: 'Team Player',
  description: 'Awarded for great teamwork',
  icon_url: 'https://example.com/badge.png',
  points_required: 100,
  tier: 'bronze',
  category: 'collaboration',
  ...overrides,
});

export const mockBadgeAward = (overrides = {}) => ({
  id: 'award-123',
  badge_id: 'badge-123',
  user_email: 'test@example.com',
  awarded_date: new Date().toISOString(),
  awarded_by: 'system',
  ...overrides,
});

export const mockLearningPath = (overrides = {}) => ({
  id: 'path-123',
  title: 'Leadership Skills',
  description: 'Develop your leadership abilities',
  difficulty: 'intermediate',
  estimated_hours: 10,
  total_modules: 5,
  created_by: 'admin@example.com',
  created_at: new Date().toISOString(),
  ...overrides,
});

export const mockChallenge = (overrides = {}) => ({
  id: 'challenge-123',
  user_email: 'test@example.com',
  title: '30-Day Streak Challenge',
  description: 'Maintain a 30-day activity streak',
  target_value: 30,
  current_value: 15,
  status: 'in_progress',
  start_date: new Date().toISOString(),
  end_date: new Date(Date.now() + 30 * 24 * 3600000).toISOString(),
  ...overrides,
});

export const mockTeam = (overrides = {}) => ({
  id: 'team-123',
  name: 'Engineering Team',
  description: 'Software engineering team',
  team_leader_email: 'leader@example.com',
  member_count: 10,
  total_points: 5000,
  created_at: new Date().toISOString(),
  ...overrides,
});

/**
 * Creates an array of mock items
 */
export const createMockArray = (mockFn, count = 5, overrideFn = null) => {
  return Array.from({ length: count }, (_, i) => {
    const base = mockFn({ id: `${mockFn.name.replace('mock', '').toLowerCase()}-${i}` });
    return overrideFn ? overrideFn(base, i) : base;
  });
};
