import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import ActivityCard from '../components/activities/ActivityCard';
import ActivityGenerator from '../components/ai/ActivityGenerator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Search, Filter, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';

export default function Activities() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedDuration, setSelectedDuration] = useState('all');
  const [viewingActivity, setViewingActivity] = useState(null);
  const [showGenerator, setShowGenerator] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        if (currentUser.role !== 'admin') {
          base44.auth.redirectToLogin();
        }
      } catch (error) {
        base44.auth.redirectToLogin();
      }
    };
    loadUser();
  }, []);

  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['activities'],
    queryFn: () => base44.entities.Activity.list()
  });

  const duplicateMutation = useMutation({
    mutationFn: (activity) => {
      const { id, created_date, updated_date, created_by, ...activityData } = activity;
      return base44.entities.Activity.create({
        ...activityData,
        title: `${activity.title} (Copy)`,
        is_template: false
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['activities']);
      toast.success('Activity duplicated!');
    }
  });

  // Filter activities
  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         activity.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || activity.type === selectedType;
    const matchesDuration = selectedDuration === 'all' || activity.duration === selectedDuration;
    return matchesSearch && matchesType && matchesDuration;
  });

  const types = ['all', 'icebreaker', 'creative', 'competitive', 'wellness', 'learning', 'social'];
  const durations = ['all', '5-15min', '15-30min', '30+min'];

  const handleSchedule = (activity) => {
    navigate(`${createPageUrl('Calendar')}?activity=${activity.id}`);
  };

  const handleDuplicate = (activity) => {
    duplicateMutation.mutate(activity);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Activity Library</h1>
          <p className="text-slate-600">
            {filteredActivities.length} activities available
          </p>
        </div>
        <Button 
          onClick={() => setShowGenerator(true)}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Custom Activity
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                placeholder="Search activities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-500" />
              <span className="text-sm text-slate-600 font-medium">Type:</span>
              {types.map(type => (
                <Badge
                  key={type}
                  variant={selectedType === type ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setSelectedType(type)}
                >
                  {type}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-4 flex-wrap">
          <span className="text-sm text-slate-600 font-medium">Duration:</span>
          {durations.map(duration => (
            <Badge
              key={duration}
              variant={selectedDuration === duration ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setSelectedDuration(duration)}
            >
              {duration}
            </Badge>
          ))}
        </div>
      </div>

      {/* Activities Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-80 bg-slate-100 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : filteredActivities.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-slate-300">
          <Search className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No activities found</h3>
          <p className="text-slate-600">Try adjusting your filters or search query</p>
        </div>
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
            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => {
                  handleSchedule(viewingActivity);
                  setViewingActivity(null);
                }}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700"
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

      {/* Activity Generator */}
      <ActivityGenerator
        open={showGenerator}
        onOpenChange={setShowGenerator}
        onActivityCreated={(activity) => {
          setShowGenerator(false);
          toast.success('Custom activity created!');
        }}
      />
    </div>
  );
}