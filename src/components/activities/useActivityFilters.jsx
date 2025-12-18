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
  materials: 'all',
  interactionType: 'all',
  favoritesOnly: false,
  sortBy: 'newest'
};

export function useActivityFilters(activities = [], favoriteIds = []) {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  // Get unique skills from all activities
  const allSkills = useMemo(() => {
    return [...new Set(activities.flatMap(a => a.skills_developed || []))].sort();
  }, [activities]);

  // Get unique interaction types
  const allInteractionTypes = useMemo(() => {
    return [...new Set(activities.map(a => a.interaction_type).filter(Boolean))].sort();
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

    // Materials filter
    if (filters.materials !== 'all') {
      if (filters.materials === 'none') {
        result = result.filter(a => !a.materials_needed || a.materials_needed.trim() === '');
      } else if (filters.materials === 'required') {
        result = result.filter(a => a.materials_needed && a.materials_needed.trim() !== '');
      }
    }

    // Interaction type filter
    if (filters.interactionType !== 'all') {
      result = result.filter(a => a.interaction_type === filters.interactionType);
    }

    // Favorites filter
    if (filters.favoritesOnly) {
      result = result.filter(a => favoriteIds.includes(a.id));
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
           filters.materials !== 'all' ||
           filters.interactionType !== 'all' ||
           filters.favoritesOnly ||
           filters.search !== '';
  }, [filters]);

  return {
    // State
    filters,
    allSkills,
    allInteractionTypes,
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
    setMaterials: (value) => setFilter('materials', value),
    setInteractionType: (value) => setFilter('interactionType', value),
    setFavoritesOnly: (value) => setFilter('favoritesOnly', value),
    setSortBy: (value) => setFilter('sortBy', value)
  };
}