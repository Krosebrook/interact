import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { useUserData } from '../components/hooks/useUserData';
import { useActivities } from '../components/hooks/useActivities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import ActivityCard from '../components/activities/ActivityCard';
import ActivityGenerator from '../components/ai/ActivityGenerator';
import AIActivityPlanner from '../components/ai/AIActivityPlanner';
import AIActivitySuggester from '../components/activities/AIActivitySuggester';
import ModuleBuilder from '../components/activities/ModuleBuilder';
import SkillTagger from '../components/skills/SkillTagger';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import SkeletonGrid from '../components/common/SkeletonGrid';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Filter, Plus, Brain, GraduationCap, SortAsc, X, Clock, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';

export default function Activities() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, loading } = useUserData(true, true);
  const { activities, isLoading, duplicateActivity, filterActivities } = useActivities();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedDuration, setSelectedDuration] = useState('all');
  const [selectedSkill, setSelectedSkill] = useState('all');
  const [selectedSkillLevel, setSelectedSkillLevel] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewingActivity, setViewingActivity] = useState(null);
  const [showGenerator, setShowGenerator] = useState(false);
  const [showPlanner, setShowPlanner] = useState(false);
  const [showSuggester, setShowSuggester] = useState(false);
  const [showModuleBuilder, setShowModuleBuilder] = useState(false);

  // Get unique skills from all activities
  const allSkills = [...new Set(activities?.flatMap(a => a.skills_developed || []) || [])].sort();

  // Filter activities
  let filteredActivities = filterActivities({ 
    search: searchQuery, 
    type: selectedType, 
    duration: selectedDuration 
  });

  // Additional filtering by skill
  if (selectedSkill !== 'all') {
    filteredActivities = filteredActivities.filter(a => 
      a.skills_developed?.includes(selectedSkill)
    );
  }

  // Additional filtering by skill level
  if (selectedSkillLevel !== 'all') {
    filteredActivities = filteredActivities.filter(a => 
      a.skill_level === selectedSkillLevel
    );
  }

  // Sort activities
  filteredActivities = [...filteredActivities].sort((a, b) => {
    switch (sortBy) {
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

  const hasActiveFilters = selectedType !== 'all' || selectedDuration !== 'all' || 
    selectedSkill !== 'all' || selectedSkillLevel !== 'all' || searchQuery;

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedType('all');
    setSelectedDuration('all');
    setSelectedSkill('all');
    setSelectedSkillLevel('all');
  };

  const types = ['all', 'icebreaker', 'creative', 'competitive', 'wellness', 'learning', 'social'];
  const durations = ['all', '5-15min', '15-30min', '30+min'];
  const skillLevels = ['all', 'beginner', 'intermediate', 'advanced'];

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
      {/* Header with gradient background */}
      <div className="glass-panel-solid relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-int-navy/5 via-transparent to-int-orange/5 pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-int-navy mb-1 font-display">
              <span className="text-highlight">Activity Library</span>
            </h1>
            <p className="text-slate-600 font-medium">
              <span className="text-int-orange font-bold">{filteredActivities.length}</span> activities available
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button 
              onClick={() => setShowPlanner(true)}
              className="bg-gradient-purple hover:opacity-90 text-white shadow-lg hover:shadow-xl transition-all press-effect"
            >
              <Brain className="h-4 w-4 mr-2" />
              AI Activity Planner
            </Button>
            <Button 
              onClick={() => setShowSuggester(true)}
              variant="outline"
              className="border-int-navy text-int-navy hover:bg-int-navy/5 font-medium"
            >
              <Plus className="h-4 w-4 mr-2" />
              AI Suggestions
            </Button>
            <Button 
              onClick={() => setShowModuleBuilder(true)}
              variant="outline"
              className="border-int-navy text-int-navy hover:bg-int-navy/5 font-medium"
            >
              <Plus className="h-4 w-4 mr-2" />
              Build from Modules
            </Button>
            <Button 
              onClick={() => setShowGenerator(true)}
              className="bg-gradient-orange hover:opacity-90 text-white shadow-lg hover:shadow-xl transition-all press-effect"
            >
              <Plus className="h-4 w-4 mr-2" />
              Generate Custom
            </Button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="glass-card-solid space-y-4">
        {/* Search Bar & Sort */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-int-navy/40" />
            <Input
              placeholder="Search by name, description, or skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 border-slate-200 focus:border-int-orange focus:ring-int-orange/20 font-medium"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-int-orange transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <SortAsc className="h-4 w-4 text-int-navy/50" />
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[160px] border-slate-200 font-medium">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="popularity">Most Popular</SelectItem>
                <SelectItem value="az">A to Z</SelectItem>
                <SelectItem value="za">Z to A</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Filter Row 1: Type */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 mr-2">
            <Filter className="h-4 w-4 text-int-orange" />
            <span className="text-sm font-medium text-slate-700">Type:</span>
          </div>
          {types.map(type => (
            <Badge
              key={type}
              variant={selectedType === type ? 'default' : 'outline'}
              className={`cursor-pointer transition-all ${
                selectedType === type 
                  ? 'bg-int-orange hover:bg-int-orange/90 text-white' 
                  : 'hover:bg-slate-100'
              }`}
              onClick={() => setSelectedType(type)}
            >
              {type === 'all' ? 'All Types' : type}
            </Badge>
          ))}
        </div>

        {/* Filter Row 2: Duration & Skill Level */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 mr-2">
              <Clock className="h-4 w-4 text-int-navy" />
              <span className="text-sm font-medium text-slate-700">Duration:</span>
            </div>
            {durations.map(duration => (
              <Badge
                key={duration}
                variant={selectedDuration === duration ? 'default' : 'outline'}
                className={`cursor-pointer transition-all ${
                  selectedDuration === duration 
                    ? 'bg-int-navy hover:bg-int-navy/90 text-white' 
                    : 'hover:bg-slate-100'
                }`}
                onClick={() => setSelectedDuration(duration)}
              >
                {duration === 'all' ? 'Any' : duration}
              </Badge>
            ))}
          </div>

          <div className="h-6 w-px bg-slate-200 hidden sm:block" />

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 mr-2">
              <Zap className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-slate-700">Level:</span>
            </div>
            {skillLevels.map(level => (
              <Badge
                key={level}
                variant={selectedSkillLevel === level ? 'default' : 'outline'}
                className={`cursor-pointer transition-all ${
                  selectedSkillLevel === level 
                    ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                    : 'hover:bg-slate-100'
                }`}
                onClick={() => setSelectedSkillLevel(level)}
              >
                {level === 'all' ? 'Any' : level}
              </Badge>
            ))}
          </div>
        </div>

        {/* Filter Row 3: Skills Developed */}
        {allSkills.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 mr-2">
              <GraduationCap className="h-4 w-4 text-emerald-600" />
              <span className="text-sm font-medium text-slate-700">Skills:</span>
            </div>
            <Badge
              variant={selectedSkill === 'all' ? 'default' : 'outline'}
              className={`cursor-pointer transition-all ${
                selectedSkill === 'all' 
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                  : 'hover:bg-slate-100'
              }`}
              onClick={() => setSelectedSkill('all')}
            >
              All Skills
            </Badge>
            {allSkills.slice(0, 10).map(skill => (
              <Badge
                key={skill}
                variant={selectedSkill === skill ? 'default' : 'outline'}
                className={`cursor-pointer transition-all ${
                  selectedSkill === skill 
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                    : 'hover:bg-slate-100'
                }`}
                onClick={() => setSelectedSkill(skill)}
              >
                {skill}
              </Badge>
            ))}
            {allSkills.length > 10 && (
              <Select value={selectedSkill} onValueChange={setSelectedSkill}>
                <SelectTrigger className="w-[140px] h-7 text-xs">
                  <SelectValue placeholder="More skills..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Skills</SelectItem>
                  {allSkills.map(skill => (
                    <SelectItem key={skill} value={skill}>{skill}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        )}

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-3 border-t border-slate-200">
            <p className="text-sm text-slate-600">
              Showing <span className="font-semibold text-slate-900">{filteredActivities.length}</span> of {activities?.length || 0} activities
            </p>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearAllFilters}
              className="text-slate-500 hover:text-slate-700"
            >
              <X className="h-4 w-4 mr-1" />
              Clear all filters
            </Button>
          </div>
        )}
      </div>

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