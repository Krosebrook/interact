import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Users, Calendar, Copy } from 'lucide-react';
import { motion } from 'framer-motion';

const typeColors = {
  icebreaker: "bg-blue-100 text-blue-700 border-blue-200",
  creative: "bg-purple-100 text-purple-700 border-purple-200",
  competitive: "bg-yellow-100 text-yellow-700 border-yellow-200",
  wellness: "bg-emerald-100 text-emerald-700 border-emerald-200",
  learning: "bg-cyan-100 text-cyan-700 border-cyan-200",
  social: "bg-pink-100 text-pink-700 border-pink-200"
};

const typeGradients = {
  icebreaker: "from-blue-400/10 to-blue-600/10",
  creative: "from-purple-400/10 to-purple-600/10",
  competitive: "from-yellow-400/10 to-yellow-600/10",
  wellness: "from-emerald-400/10 to-emerald-600/10",
  learning: "from-cyan-400/10 to-cyan-600/10",
  social: "from-pink-400/10 to-pink-600/10"
};

export default function ActivityCard({ activity, onSchedule, onDuplicate, onView }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      whileHover={{ y: -4 }}
    >
      <Card className="overflow-hidden border-0 shadow-md hover:shadow-xl transition-all group cursor-pointer">
        <div 
          className={`h-40 bg-gradient-to-br ${typeGradients[activity.type]} relative`}
          onClick={() => onView(activity)}
        >
          {activity.image_url ? (
            <img 
              src={activity.image_url} 
              alt={activity.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-6xl opacity-20">
                {activity.type === 'icebreaker' && '❄️'}
                {activity.type === 'creative' && '🎨'}
                {activity.type === 'competitive' && '🏆'}
                {activity.type === 'wellness' && '🧘'}
                {activity.type === 'learning' && '📚'}
                {activity.type === 'social' && '🎉'}
              </div>
            </div>
          )}
          <div className="absolute top-3 right-3 flex gap-2">
            <Badge className={`${typeColors[activity.type]} border`}>
              {activity.type}
            </Badge>
          </div>
        </div>
        
        <div className="p-5" onClick={() => onView(activity)}>
          <h3 className="font-bold text-lg text-slate-900 mb-2 line-clamp-1">
            {activity.title}
          </h3>
          <p className="text-sm text-slate-600 mb-4 line-clamp-2">
            {activity.description}
          </p>
          
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
          
          <div className="flex gap-2">
            <Button 
              onClick={(e) => {
                e.stopPropagation();
                onSchedule(activity);
              }}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
              size="sm"
            >
              <Calendar className="h-4 w-4 mr-1" />
              Schedule
            </Button>
            <Button 
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate(activity);
              }}
              variant="outline"
              size="sm"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}