import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Users, Calendar, Copy, GraduationCap, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const typeConfig = {
  icebreaker: { emoji: '❄️', label: 'Icebreaker', color: 'bg-blue-500/20 text-blue-200 border-blue-400/30' },
  creative: { emoji: '🎨', label: 'Creative', color: 'bg-purple-500/20 text-purple-200 border-purple-400/30' },
  competitive: { emoji: '🏆', label: 'Competitive', color: 'bg-yellow-500/20 text-yellow-200 border-yellow-400/30' },
  wellness: { emoji: '🧘', label: 'Wellness', color: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30' },
  learning: { emoji: '📚', label: 'Learning', color: 'bg-cyan-500/20 text-cyan-200 border-cyan-400/30' },
  social: { emoji: '🎉', label: 'Social', color: 'bg-pink-500/20 text-pink-200 border-pink-400/30' }
};

const gradientBgs = {
  icebreaker: 'from-blue-600/40 to-blue-800/60',
  creative: 'from-purple-600/40 to-purple-800/60',
  competitive: 'from-yellow-600/40 to-amber-800/60',
  wellness: 'from-emerald-600/40 to-emerald-800/60',
  learning: 'from-cyan-600/40 to-cyan-800/60',
  social: 'from-pink-600/40 to-rose-800/60'
};

export default function ActivityCard({ activity, onSchedule, onDuplicate, onView }) {
  const config = typeConfig[activity.type] || typeConfig.social;
  const gradient = gradientBgs[activity.type] || gradientBgs.social;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="h-full"
    >
      <div 
        className="glass-card h-full flex flex-col cursor-pointer group overflow-hidden"
        onClick={() => onView(activity)}
      >
        {/* Header with gradient and icon */}
        <div className={`relative h-32 -mx-4 -mt-4 mb-4 bg-gradient-to-br ${gradient} flex items-center justify-center`}>
          {activity.image_url ? (
            <img 
              src={activity.image_url} 
              alt={activity.title}
              className="w-full h-full object-cover opacity-80"
            />
          ) : (
            <span className="text-6xl opacity-60 group-hover:scale-110 transition-transform">
              {config.emoji}
            </span>
          )}
          
          {/* Type badge */}
          <Badge className={`absolute top-3 right-3 ${config.color} border backdrop-blur-sm`}>
            {config.emoji} {config.label}
          </Badge>
        </div>
        
        {/* Content */}
        <div className="flex-1 flex flex-col">
          <h3 className="font-bold text-lg text-white mb-2 line-clamp-1 group-hover:text-int-orange transition-colors">
            {activity.title}
          </h3>
          <p className="text-sm text-white/70 mb-4 line-clamp-2 flex-1">
            {activity.description}
          </p>
          
          {/* Meta info */}
          <div className="flex flex-wrap gap-3 mb-4 text-xs text-white/60">
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              <span>{activity.duration}</span>
            </div>
            {activity.capacity && (
              <div className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                <span>Max {activity.capacity}</span>
              </div>
            )}
            {activity.popularity_score > 0 && (
              <div className="flex items-center gap-1">
                <span>⭐ {activity.popularity_score}</span>
              </div>
            )}
          </div>
          
          {/* Skills Tags */}
          {activity.skills_developed?.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              <GraduationCap className="h-3.5 w-3.5 text-white/50" />
              {activity.skills_developed.slice(0, 2).map(skill => (
                <Badge key={skill} variant="outline" className="text-xs py-0 px-1.5 border-white/20 text-white/70 bg-white/5">
                  {skill}
                </Badge>
              ))}
              {activity.skills_developed.length > 2 && (
                <Badge variant="outline" className="text-xs py-0 px-1.5 border-white/20 text-white/70 bg-white/5">
                  +{activity.skills_developed.length - 2}
                </Badge>
              )}
            </div>
          )}
          
          {/* Actions */}
          <div className="flex gap-2 mt-auto">
            <Button 
              onClick={(e) => {
                e.stopPropagation();
                onSchedule(activity);
              }}
              className="flex-1 bg-int-orange hover:bg-[#C46322] text-white shadow-lg"
              size="sm"
            >
              <Calendar className="h-4 w-4 mr-1" />
              Schedule
            </Button>
            <Button 
              onClick={(e) => {
                e.stopPropagation();
                onView(activity);
              }}
              variant="outline"
              size="sm"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button 
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate(activity);
              }}
              variant="outline"
              size="sm"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}