import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Users, Calendar, Copy, GraduationCap, ChevronRight, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const typeConfig = {
  icebreaker: { emoji: '❄️', label: 'Icebreaker', badgeClass: 'activity-badge-icebreaker' },
  creative: { emoji: '🎨', label: 'Creative', badgeClass: 'activity-badge-creative' },
  competitive: { emoji: '🏆', label: 'Competitive', badgeClass: 'activity-badge-competitive' },
  wellness: { emoji: '🧘', label: 'Wellness', badgeClass: 'activity-badge-wellness' },
  learning: { emoji: '📚', label: 'Learning', badgeClass: 'activity-badge-learning' },
  social: { emoji: '🎉', label: 'Social', badgeClass: 'activity-badge-social' }
};



// Default images per type for activities without images
const defaultImages = {
  icebreaker: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=300&fit=crop',
  creative: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=300&fit=crop',
  competitive: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400&h=300&fit=crop',
  wellness: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop',
  learning: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=300&fit=crop',
  social: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=400&h=300&fit=crop'
};

export default function ActivityCard({ activity, onSchedule, onDuplicate, onView, isFavorite = false, userEmail, canEdit = true, canDelete = true }) {
  const queryClient = useQueryClient();
  const config = typeConfig[activity.type] || typeConfig.social;
  const imageUrl = activity.image_url || defaultImages[activity.type] || defaultImages.social;

  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      if (isFavorite) {
        const favorites = await base44.entities.ActivityFavorite.filter({ 
          user_email: userEmail, 
          activity_id: activity.id 
        });
        if (favorites[0]) {
          await base44.entities.ActivityFavorite.delete(favorites[0].id);
        }
      } else {
        await base44.entities.ActivityFavorite.create({
          user_email: userEmail,
          activity_id: activity.id
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['activity-favorites', userEmail]);
      toast.success(isFavorite ? 'Removed from favorites' : 'Added to favorites');
    },
    onError: () => {
      toast.error('Failed to update favorites');
    }
  });

  const handleToggleFavorite = (e) => {
    e.stopPropagation();
    toggleFavoriteMutation.mutate();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover={{ y: -6 }}
      className="h-full"
    >
      <div 
        className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 h-full flex flex-col cursor-pointer group overflow-hidden"
        onClick={() => onView(activity)}
      >
        {/* Image Header - fixed height, no overflow */}
        <div className="relative h-40 flex-shrink-0 overflow-hidden">
          <img 
            src={imageUrl} 
            alt={activity.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          
          {/* Type badge - top right */}
          <div className={`absolute top-3 right-3 ${config.badgeClass} px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-sm`}>
            {config.emoji} {config.label}
          </div>

          {/* Favorite button - top left */}
          <button
            onClick={handleToggleFavorite}
            className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm hover:bg-white p-2 rounded-full shadow-sm transition-all hover:scale-110"
          >
            <Star 
              className={`h-4 w-4 transition-all ${
                isFavorite 
                  ? 'fill-int-orange text-int-orange' 
                  : 'text-slate-400 hover:text-int-orange'
              }`}
            />
          </button>
        </div>
        
        {/* Content - separate from image, no overlay */}
        <div className="flex-1 flex flex-col p-4">
          {/* Title */}
          <h3 
            className="font-semibold text-slate-900 text-base mb-2 line-clamp-2 group-hover:text-int-orange transition-colors" 
            title={activity.title}
          >
            {activity.title}
          </h3>
          
          {/* Description */}
          <p 
            className="text-sm text-slate-500 mb-3 line-clamp-2 leading-relaxed"
            title={activity.description}
          >
            {activity.description || 'No description available'}
          </p>
          
          {/* Meta info with pills */}
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-xs font-medium text-slate-600">
              <Clock className="h-3 w-3" />
              {activity.duration}
            </span>
            {activity.capacity && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-xs font-medium text-slate-600">
                <Users className="h-3 w-3" />
                Max {activity.capacity}
              </span>
            )}
            {activity.popularity_score > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-xs font-medium text-amber-600">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                {activity.popularity_score}
              </span>
            )}
          </div>
          
          {/* Skills Tags */}
          {activity.skills_developed?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {activity.skills_developed.slice(0, 3).map(skill => (
                <Badge 
                  key={skill} 
                  variant="outline" 
                  className="text-xs py-0.5 px-2 border-int-navy/20 text-int-navy bg-int-navy/5 font-medium"
                >
                  {skill}
                </Badge>
              ))}
              {activity.skills_developed.length > 3 && (
                <Badge 
                  variant="outline" 
                  className="text-xs py-0.5 px-2 border-slate-200 text-slate-500 bg-slate-50"
                >
                  +{activity.skills_developed.length - 3}
                </Badge>
              )}
            </div>
          )}
          
          {/* Actions - pushed to bottom */}
          <div className="flex gap-2 mt-auto pt-3 border-t border-slate-100">
            <Button 
              onClick={(e) => {
                e.stopPropagation();
                onSchedule(activity);
              }}
              className="flex-1 bg-int-orange hover:bg-int-orange/90 text-slate-900 font-semibold shadow-sm hover:shadow-md transition-all"
              size="sm"
            >
              <Calendar className="h-4 w-4 mr-1.5" />
              Schedule
            </Button>
            <Button 
              onClick={(e) => {
                e.stopPropagation();
                onView(activity);
              }}
              variant="outline"
              size="sm"
              className="border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            {canEdit && onDuplicate && (
              <Button 
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicate(activity);
                }}
                variant="outline"
                size="sm"
                className="border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
              >
                <Copy className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}