/**
 * ACTIVITIES FILTERS
 * Filter and search controls for activities
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useDebounce } from '../shared/hooks/useDebounce';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Filter, X, Clock, Zap, GraduationCap, SortAsc, Package, Star, MessageSquare } from 'lucide-react';

const TYPES = ['all', 'icebreaker', 'creative', 'competitive', 'wellness', 'learning', 'social'];
const DURATIONS = ['all', '5-15min', '15-30min', '30+min'];
const SKILL_LEVELS = ['all', 'beginner', 'intermediate', 'advanced'];
const MATERIALS = ['all', 'none', 'required'];

const TYPE_COLORS = {
  all: 'bg-int-orange',
  icebreaker: 'bg-gradient-icebreaker',
  creative: 'bg-gradient-creative',
  competitive: 'bg-gradient-competitive',
  wellness: 'bg-gradient-wellness',
  learning: 'bg-gradient-learning',
  social: 'bg-gradient-social'
};

export default function ActivitiesFilters({
  searchQuery,
  onSearchChange,
  selectedType,
  onTypeChange,
  selectedDuration,
  onDurationChange,
  selectedSkill,
  onSkillChange,
  selectedSkillLevel,
  onSkillLevelChange,
  selectedMaterials,
  onMaterialsChange,
  selectedInteractionType,
  onInteractionTypeChange,
  favoritesOnly,
  onFavoritesOnlyChange,
  sortBy,
  onSortChange,
  allSkills = [],
  allInteractionTypes = [],
  totalCount,
  filteredCount,
  onClearAll
}) {
  const hasActiveFilters = selectedType !== 'all' || selectedDuration !== 'all' || 
    selectedSkill !== 'all' || selectedSkillLevel !== 'all' || selectedMaterials !== 'all' ||
    selectedInteractionType !== 'all' || favoritesOnly || searchQuery;

  // Debounce search query internally
  const [localSearchQuery, setLocalSearchQuery] = React.useState(searchQuery);
  const debouncedSearch = useDebounce(localSearchQuery, 300);

  // Sync debounced value with parent
  React.useEffect(() => {
    if (debouncedSearch !== searchQuery) {
      onSearchChange(debouncedSearch);
    }
  }, [debouncedSearch]);

  // Sync external changes with local state
  React.useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);

  return (
    <div data-b44-sync="true" data-feature="activities" data-component="activitiesfilters" className="glass-card-solid space-y-4">
      {/* Search Bar, Favorites Toggle & Sort */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
          <Input
            placeholder="Search by name, description, or skills..."
            value={localSearchQuery}
            onChange={(e) => setLocalSearchQuery(e.target.value)}
            className="pl-10 h-11 border-slate-200 focus:border-int-orange focus:ring-int-orange/20 font-medium"
          />
          {localSearchQuery && (
            <button 
              onClick={() => {
                setLocalSearchQuery('');
                onSearchChange('');
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-int-orange transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button
          variant={favoritesOnly ? "default" : "outline"}
          className={favoritesOnly ? "bg-int-orange hover:bg-int-orange/90 text-white font-semibold" : "border-slate-300 text-slate-700 hover:bg-slate-100 font-medium"}
          onClick={() => onFavoritesOnlyChange(!favoritesOnly)}
        >
          <Star className={`h-4 w-4 mr-2 ${favoritesOnly ? 'fill-white' : ''}`} />
          Favorites
        </Button>
        <div className="flex items-center gap-2">
          <SortAsc className="h-4 w-4 text-int-navy" />
          <Select value={sortBy} onValueChange={onSortChange}>
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
          <span className="text-sm font-semibold text-int-navy">Type:</span>
        </div>
        {TYPES.map(type => (
          <Badge
            key={type}
            variant={selectedType === type ? 'default' : 'outline'}
            className={`cursor-pointer transition-all font-medium ${
              selectedType === type 
                ? `${TYPE_COLORS[type]} text-white shadow-sm` 
                : 'hover:bg-slate-100 text-slate-700 border-slate-300'
            }`}
            onClick={() => onTypeChange(type)}
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
            <span className="text-sm font-semibold text-int-navy">Duration:</span>
          </div>
          {DURATIONS.map(duration => (
            <Badge
              key={duration}
              variant={selectedDuration === duration ? 'default' : 'outline'}
              className={`cursor-pointer transition-all font-medium ${
                selectedDuration === duration 
                  ? 'bg-gradient-navy text-white shadow-sm' 
                  : 'hover:bg-slate-100 text-slate-700 border-slate-300'
              }`}
              onClick={() => onDurationChange(duration)}
            >
              {duration === 'all' ? 'Any' : duration}
            </Badge>
          ))}
        </div>

        <div className="h-6 w-px bg-slate-200 hidden sm:block" />

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 mr-2">
            <Zap className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-semibold text-int-navy">Level:</span>
          </div>
          {SKILL_LEVELS.map(level => (
            <Badge
              key={level}
              variant={selectedSkillLevel === level ? 'default' : 'outline'}
              className={`cursor-pointer transition-all font-medium ${
                selectedSkillLevel === level 
                  ? 'bg-gradient-purple text-white shadow-sm' 
                  : 'hover:bg-slate-100 text-slate-700 border-slate-300'
              }`}
              onClick={() => onSkillLevelChange(level)}
            >
              {level === 'all' ? 'Any' : level}
            </Badge>
          ))}
        </div>
      </div>

      {/* Filter Row 3: Materials & Interaction Type */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 mr-2">
            <Package className="h-4 w-4 text-amber-600" />
            <span className="text-sm font-semibold text-int-navy">Materials:</span>
          </div>
          {MATERIALS.map(material => (
            <Badge
              key={material}
              variant={selectedMaterials === material ? 'default' : 'outline'}
              className={`cursor-pointer transition-all font-medium ${
                selectedMaterials === material 
                  ? 'bg-gradient-competitive text-white shadow-sm' 
                  : 'hover:bg-slate-100 text-slate-700 border-slate-300'
              }`}
              onClick={() => onMaterialsChange(material)}
            >
              {material === 'all' ? 'Any' : material === 'none' ? 'No Materials' : 'Materials Needed'}
            </Badge>
          ))}
        </div>

        {allInteractionTypes.length > 0 && (
          <>
            <div className="h-6 w-px bg-slate-200 hidden sm:block" />
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 mr-2">
                <MessageSquare className="h-4 w-4 text-cyan-600" />
                <span className="text-sm font-semibold text-int-navy">Interaction:</span>
              </div>
              <Badge
                variant={selectedInteractionType === 'all' ? 'default' : 'outline'}
                className={`cursor-pointer transition-all font-medium ${
                  selectedInteractionType === 'all' 
                    ? 'bg-gradient-learning text-white shadow-sm' 
                    : 'hover:bg-slate-100 text-slate-700 border-slate-300'
                }`}
                onClick={() => onInteractionTypeChange('all')}
              >
                All Types
              </Badge>
              {allInteractionTypes.slice(0, 5).map(type => (
                <Badge
                  key={type}
                  variant={selectedInteractionType === type ? 'default' : 'outline'}
                  className={`cursor-pointer transition-all font-medium ${
                    selectedInteractionType === type 
                      ? 'bg-gradient-learning text-white shadow-sm' 
                      : 'hover:bg-slate-100 text-slate-700 border-slate-300'
                  }`}
                  onClick={() => onInteractionTypeChange(type)}
                >
                  {type.replace('_', ' ')}
                </Badge>
              ))}
              {allInteractionTypes.length > 5 && (
                <Select value={selectedInteractionType} onValueChange={onInteractionTypeChange}>
                  <SelectTrigger className="w-[140px] h-7 text-xs font-medium">
                    <SelectValue placeholder="More types..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {allInteractionTypes.map(type => (
                      <SelectItem key={type} value={type}>{type.replace('_', ' ')}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </>
        )}
      </div>

      {/* Filter Row 4: Skills Developed */}
      {allSkills.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 mr-2">
            <GraduationCap className="h-4 w-4 text-emerald-600" />
            <span className="text-sm font-semibold text-int-navy">Skills:</span>
          </div>
          <Badge
            variant={selectedSkill === 'all' ? 'default' : 'outline'}
            className={`cursor-pointer transition-all font-medium ${
              selectedSkill === 'all' 
                ? 'bg-gradient-wellness text-white shadow-sm' 
                : 'hover:bg-slate-100 text-slate-700 border-slate-300'
            }`}
            onClick={() => onSkillChange('all')}
          >
            All Skills
          </Badge>
          {allSkills.slice(0, 10).map(skill => (
            <Badge
              key={skill}
              variant={selectedSkill === skill ? 'default' : 'outline'}
              className={`cursor-pointer transition-all font-medium ${
                selectedSkill === skill 
                  ? 'bg-gradient-wellness text-white shadow-sm' 
                  : 'hover:bg-slate-100 text-slate-700 border-slate-300'
              }`}
              onClick={() => onSkillChange(skill)}
            >
              {skill}
            </Badge>
          ))}
          {allSkills.length > 10 && (
            <Select value={selectedSkill} onValueChange={onSkillChange}>
              <SelectTrigger className="w-[140px] h-7 text-xs font-medium">
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
            Showing <span className="font-semibold text-slate-900">{filteredCount}</span> of {totalCount} activities
          </p>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClearAll}
            className="text-slate-600 hover:text-slate-900"
          >
            <X className="h-4 w-4 mr-1" />
            Clear all filters
          </Button>
        </div>
      )}
    </div>
  );
}