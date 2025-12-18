import React, { useState } from 'react';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useUserData } from '../components/hooks/useUserData';
import { useActivities } from '../components/hooks/useActivities';
import { useActivityFilters } from '../components/activities/useActivityFilters';
import { useRolePermissions } from '../components/hooks/useRolePermissions';
import ActivityCard from '../components/activities/ActivityCard';
import ActivityGenerator from '../components/ai/ActivityGenerator';
import AIActivityPlanner from '../components/ai/AIActivityPlanner';
import AIActivitySuggester from '../components/activities/AIActivitySuggester';
import ModuleBuilder from '../components/activities/ModuleBuilder';
import ActivitiesHeader from '../components/activities/ActivitiesHeader';
import ActivitiesFilters from '../components/activities/ActivitiesFilters';
import ActivityDetailDialog from '../components/activities/ActivityDetailDialog';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import SkeletonGrid from '../components/common/SkeletonGrid';
import PageHeader, { SectionHeader } from '../components/common/PageHeader';
import { Search, Sparkles, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';

export default function Activities() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, loading } = useUserData(true);
  const { canCreateActivities, canEditActivities, canDeleteActivities } = useRolePermissions();
  const { activities, isLoading, duplicateActivity } = useActivities();

  // Fetch user's favorites
  const { data: favorites = [] } = useQuery({
    queryKey: ['activity-favorites', user?.email],
    queryFn: () => base44.entities.ActivityFavorite.filter({ user_email: user?.email }),
    enabled: !!user?.email
  });

  const favoriteIds = favorites.map(f => f.activity_id);
  
  // Use centralized filter hook
  const {
    filters,
    allSkills,
    allInteractionTypes,
    filteredActivities,
    setSearch,
    setType,
    setDuration,
    setSkill,
    setSkillLevel,
    setMaterials,
    setInteractionType,
    setFavoritesOnly,
    setSortBy,
    clearFilters
  } = useActivityFilters(activities || [], favoriteIds);

  // Dialog states
  const [viewingActivity, setViewingActivity] = useState(null);
  const [showGenerator, setShowGenerator] = useState(false);
  const [showPlanner, setShowPlanner] = useState(false);
  const [showSuggester, setShowSuggester] = useState(false);
  const [showModuleBuilder, setShowModuleBuilder] = useState(false);

  const handleSchedule = (activity) => {
    navigate(`${createPageUrl('Calendar')}?activity=${activity.id}`);
  };

  const handleDuplicate = (activity) => {
    duplicateActivity(activity);
  };

  if (loading || !user) {
    return <LoadingSpinner className="min-h-[60vh]" />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <ActivitiesHeader
        activityCount={filteredActivities.length}
        onOpenPlanner={canCreateActivities ? () => setShowPlanner(true) : undefined}
        onOpenSuggester={canCreateActivities ? () => setShowSuggester(true) : undefined}
        onOpenModuleBuilder={canCreateActivities ? () => setShowModuleBuilder(true) : undefined}
        onOpenGenerator={canCreateActivities ? () => setShowGenerator(true) : undefined}
        canCreate={canCreateActivities}
      />

      {/* Search and Filters */}
      <ActivitiesFilters
        searchQuery={filters.search}
        onSearchChange={setSearch}
        selectedType={filters.type}
        onTypeChange={setType}
        selectedDuration={filters.duration}
        onDurationChange={setDuration}
        selectedSkill={filters.skill}
        onSkillChange={setSkill}
        selectedSkillLevel={filters.skillLevel}
        onSkillLevelChange={setSkillLevel}
        selectedMaterials={filters.materials}
        onMaterialsChange={setMaterials}
        selectedInteractionType={filters.interactionType}
        onInteractionTypeChange={setInteractionType}
        favoritesOnly={filters.favoritesOnly}
        onFavoritesOnlyChange={setFavoritesOnly}
        sortBy={filters.sortBy}
        onSortChange={setSortBy}
        allSkills={allSkills}
        allInteractionTypes={allInteractionTypes}
        totalCount={activities?.length || 0}
        filteredCount={filteredActivities.length}
        onClearAll={clearFilters}
      />

      {/* Activities Grid */}
      {isLoading ? (
        <SkeletonGrid count={6} height="h-80" />
      ) : filteredActivities.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No activities found"
          description="We couldn't find any activities matching your criteria."
          actionLabel="Clear Filters"
          onAction={clearFilters}
          secondaryActionLabel="Create Activity"
          onSecondaryAction={() => setShowGenerator(true)}
          tips={[
            "Try using fewer or different keywords",
            "Remove some filters to see more results",
            "Create a custom activity with AI assistance"
          ]}
          type="navy"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredActivities.map(activity => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              onSchedule={handleSchedule}
              onDuplicate={canEditActivities ? handleDuplicate : undefined}
              onView={setViewingActivity}
              isFavorite={favoriteIds.includes(activity.id)}
              userEmail={user?.email}
              canEdit={canEditActivities}
              canDelete={canDeleteActivities}
            />
          ))}
        </div>
      )}

      {/* Activity Detail Dialog */}
      <ActivityDetailDialog
        activity={viewingActivity}
        onClose={() => setViewingActivity(null)}
        onSchedule={handleSchedule}
        onDuplicate={handleDuplicate}
      />

      {/* AI Activity Suggester */}
      <AIActivitySuggester
        open={showSuggester}
        onOpenChange={setShowSuggester}
        onSelect={(activityType) => {
          setSelectedType(activityType);
          setShowSuggester(false);
        }}
      />

      {/* Module Builder */}
      <ModuleBuilder
        open={showModuleBuilder}
        onOpenChange={setShowModuleBuilder}
        onActivityCreated={(activity) => {
          queryClient.invalidateQueries(['activities']);
          handleSchedule(activity);
        }}
      />

      {/* Activity Generator */}
      <ActivityGenerator
        open={showGenerator}
        onOpenChange={setShowGenerator}
        onActivityCreated={(activity) => {
          setShowGenerator(false);
          toast.success('Custom activity created!');
        }}
      />

      {/* AI Activity Planner */}
      <AIActivityPlanner
        open={showPlanner}
        onOpenChange={setShowPlanner}
        onActivityCreated={(activity) => {
          queryClient.invalidateQueries(['activities']);
          handleSchedule(activity);
        }}
      />
    </div>
  );
}