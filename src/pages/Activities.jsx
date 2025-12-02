import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useUserData } from '../components/hooks/useUserData';
import { useActivities } from '../components/hooks/useActivities';
import { useActivityFilters } from '../components/activities/useActivityFilters';
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
import { Search } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';

export default function Activities() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, loading } = useUserData(true, true);
  const { activities, isLoading, duplicateActivity } = useActivities();
  
  // Use centralized filter hook
  const {
    filters,
    allSkills,
    filteredActivities,
    setSearch,
    setType,
    setDuration,
    setSkill,
    setSkillLevel,
    setSortBy,
    clearFilters
  } = useActivityFilters(activities || []);

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
        onOpenPlanner={() => setShowPlanner(true)}
        onOpenSuggester={() => setShowSuggester(true)}
        onOpenModuleBuilder={() => setShowModuleBuilder(true)}
        onOpenGenerator={() => setShowGenerator(true)}
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
        sortBy={filters.sortBy}
        onSortChange={setSortBy}
        allSkills={allSkills}
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
          description="Try adjusting your filters or search query"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredActivities.map(activity => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              onSchedule={handleSchedule}
              onDuplicate={handleDuplicate}
              onView={setViewingActivity}
            />
          ))}
        </div>
      )}

      {/* Activity Detail Dialog */}
      <Dialog open={!!viewingActivity} onOpenChange={() => setViewingActivity(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">{viewingActivity?.title}</DialogTitle>
            <DialogDescription>
              <div className="flex gap-2 mt-2">
                <Badge>{viewingActivity?.type}</Badge>
                <Badge variant="outline">{viewingActivity?.duration}</Badge>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Description</h4>
              <p className="text-slate-600">{viewingActivity?.description}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Instructions</h4>
              <p className="text-slate-600 whitespace-pre-wrap">{viewingActivity?.instructions}</p>
            </div>
            {viewingActivity?.materials_needed && (
              <div>
                <h4 className="font-semibold mb-2">Materials Needed</h4>
                <p className="text-slate-600">{viewingActivity.materials_needed}</p>
              </div>
            )}
            {viewingActivity?.skills_developed?.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  Skills Developed
                </h4>
                <div className="flex flex-wrap gap-2">
                  {viewingActivity.skills_developed.map(skill => (
                    <Badge key={skill} className="bg-int-navy text-white">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {viewingActivity?.learning_outcomes?.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Learning Outcomes</h4>
                <ul className="list-disc list-inside text-slate-600 space-y-1">
                  {viewingActivity.learning_outcomes.map((outcome, i) => (
                    <li key={i}>{outcome}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => {
                  handleSchedule(viewingActivity);
                  setViewingActivity(null);
                }}
                className="flex-1 bg-int-orange hover:bg-[#C46322] text-white"
              >
                Schedule This Activity
              </Button>
              <Button
                onClick={() => {
                  handleDuplicate(viewingActivity);
                  setViewingActivity(null);
                }}
                variant="outline"
              >
                Duplicate
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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