import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Users, Zap, Sparkles } from 'lucide-react';

const categoryBadges = {
  icebreaker: { label: 'Quick Win', icon: Zap, color: 'bg-blue-100 text-blue-800 border-blue-200' },
  social: { label: 'Social', icon: Users, color: 'bg-pink-100 text-pink-800 border-pink-200' },
  wellness: { label: 'Wellness', icon: Sparkles, color: 'bg-green-100 text-green-800 border-green-200' },
  learning: { label: 'Learning', icon: Sparkles, color: 'bg-purple-100 text-purple-800 border-purple-200' },
  competitive: { label: 'Priority', icon: Zap, color: 'bg-orange-100 text-orange-800 border-orange-200' },
};

export default function AIActivityCard({ activity, onJoin, points = 10 }) {
  const badgeInfo = categoryBadges[activity.type] || categoryBadges.icebreaker;
  const BadgeIcon = badgeInfo.icon;

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 border-0 overflow-hidden bg-white dark:bg-slate-800">
      <div className="relative h-32 w-full bg-slate-100 overflow-hidden">
        {activity.image_url ? (
          <img 
            src={activity.image_url}
            alt={activity.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-int-navy to-int-orange flex items-center justify-center text-white text-4xl">
            ✨
          </div>
        )}
        <div className="absolute top-3 left-3">
          <Badge className={`${badgeInfo.color} border font-semibold backdrop-blur-sm`}>
            <BadgeIcon className="w-3 h-3 mr-1" />
            {badgeInfo.label}
          </Badge>
        </div>
        {points && (
          <div className="absolute bottom-3 right-3 bg-int-orange/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 text-white text-xs font-bold">
            +{points} pts
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <h4 className="font-bold text-slate-900 dark:text-white mb-2 line-clamp-2 text-base">
          {activity.title}
        </h4>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
          {activity.description}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-slate-500">
            {activity.duration && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {activity.duration}
              </span>
            )}
          </div>
          <Button 
            size="sm" 
            onClick={() => onJoin(activity)}
            className="bg-primary hover:bg-primary/90 text-white font-semibold"
          >
            Join
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}