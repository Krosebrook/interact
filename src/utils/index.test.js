import { describe, it, expect } from 'vitest';
import { createPageUrl } from '@/utils/index.ts';

describe('createPageUrl', () => {
  it('should convert page name to lowercase URL', () => {
    const result = createPageUrl('Dashboard');
    expect(result).toBe('/dashboard');
  });

  it('should replace spaces with hyphens', () => {
    const result = createPageUrl('User Profile');
    expect(result).toBe('/user-profile');
  });

  it('should handle multiple spaces', () => {
    const result = createPageUrl('My  Team  Dashboard');
    expect(result).toBe('/my--team--dashboard');
  });

  it('should handle already lowercase names', () => {
    const result = createPageUrl('activities');
    expect(result).toBe('/activities');
  });

  it('should handle mixed case with spaces', () => {
    const result = createPageUrl('Team Leader Dashboard');
    expect(result).toBe('/team-leader-dashboard');
  });

  it('should handle single word page names', () => {
    const result = createPageUrl('Settings');
    expect(result).toBe('/settings');
  });

  it('should handle empty string', () => {
    const result = createPageUrl('');
    expect(result).toBe('/');
  });

  it('should add leading slash if not present', () => {
    const result = createPageUrl('calendar');
    expect(result).toBe('/calendar');
  });

  it('should handle page names with numbers', () => {
    const result = createPageUrl('Event 2024');
    expect(result).toBe('/event-2024');
  });

  it('should handle special characters in page names', () => {
    const result = createPageUrl('User&Profile');
    expect(result).toBe('/user&profile');
  });
});
