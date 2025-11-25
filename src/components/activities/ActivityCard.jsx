import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Users, Calendar, Copy, GraduationCap, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const typeConfig = {
  icebreaker: { emoji: '❄️', label: 'Icebreaker', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  creative: { emoji: '🎨', label: 'Creative', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  competitive: { emoji: '🏆', label: 'Competitive', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  wellness: { emoji: '🧘', label: 'Wellness', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  learning: { emoji: '📚', label: 'Learning', color: 'bg-cyan-100 text-cyan-700 border-cyan-200' },
  social: { emoji: '🎉', label: 'Social', color: 'bg-pink-100 text-pink-700 border-pink-200' }
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
          <h3 className="font-bold text-lg text-slate-900 mb-2 line-clamp-1 group-hover:text-int-orange transition-colors">
            {activity.title}
          </h3>
          <p className="text-sm text-slate-600 mb-4 line-clamp-2 flex-1">
            {activity.description}
          </p>
          
          {/* Meta info */}
          <div className="flex flex-wrap gap-3 mb-4 text-xs text-slate-500">
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
              <GraduationCap className="h-3.5 w-3.5 text-slate-400" />
              {activity.skills_developed.slice(0, 2).map(skill => (
                <Badge key={skill} variant="outline" className="text-xs py-0 px-1.5 border-slate-200 text-slate-600 bg-slate-50">
                  {skill}
                </Badge>
              ))}
              {activity.skills_developed.length > 2 && (
                <Badge variant="outline" className="text-xs py-0 px-1.5 border-slate-200 text-slate-600 bg-slate-50">
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
              className="border-slate-200 text-slate-700 hover:bg-slate-100"
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
              className="border-slate-200 text-slate-700 hover:bg-slate-100"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}