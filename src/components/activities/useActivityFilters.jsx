/**
 * ACTIVITY FILTERS HOOK
 * Centralized filtering and sorting logic for activities
 */

import { useState, useMemo, useCallback } from 'react';

const DEFAULT_FILTERS = {
  search: '',
  type: 'all',
  duration: 'all',
  skill: 'all',
  skillLevel: 'all',
  sortBy: 'newest'
};

export function useActivityFilters(activities = []) {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  // Get unique skills from all activities
  const allSkills = useMemo(() => {
    return [...new Set(activities.flatMap(a => a.skills_developed || []))].sort();
  }, [activities]);

  // Apply filters
  const filteredActivities = useMemo(() => {
    let result = [...activities];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(a => 
        a.title?.toLowerCase().includes(searchLower) ||
        a.description?.toLowerCase().includes(searchLower) ||
        a.skills_developed?.some(s => s.toLowerCase().includes(searchLower))
      );
    }

    // Type filter
    if (filters.type !== 'all') {
      result = result.filter(a => a.type === filters.type);
    }

    // Duration filter
    if (filters.duration !== 'all') {
      result = result.filter(a => a.duration === filters.duration);
    }

    // Skill filter
    if (filters.skill !== 'all') {
      result = result.filter(a => a.skills_developed?.includes(filters.skill));
    }

    // Skill level filter
    if (filters.skillLevel !== 'all') {
      result = result.filter(a => a.skill_level === filters.skillLevel);
    }

    // Sorting
    result.sort((a, b) => {
      switch (filters.sortBy) {
        case 'newest':
          return new Date(b.created_date) - new Date(a.created_date);
        case 'oldest':
          return new Date(a.created_date) - new Date(b.created_date);
        case 'popularity':
          return (b.popularity_score || 0) - (a.popularity_score || 0);
        case 'az':
          return a.title.localeCompare(b.title);
        case 'za':
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });

    return result;
  }, [activities, filters]);

  // Update single filter
  const setFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return filters.type !== 'all' || 
           filters.duration !== 'all' || 
           filters.skill !== 'all' || 
           filters.skillLevel !== 'all' || 
           filters.search !== '';
  }, [filters]);

  return {
    // State
    filters,
    allSkills,
    filteredActivities,
    hasActiveFilters,
    
    // Setters
    setFilter,
    setFilters,
    clearFilters,
    
    // Convenience setters
    setSearch: (value) => setFilter('search', value),
    setType: (value) => setFilter('type', value),
    setDuration: (value) => setFilter('duration', value),
    setSkill: (value) => setFilter('skill', value),
    setSkillLevel: (value) => setFilter('skillLevel', value),
    setSortBy: (value) => setFilter('sortBy', value)
  };
}