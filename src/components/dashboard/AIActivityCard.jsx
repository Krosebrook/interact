import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Users, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';

export default function AIActivityCard({ activity, points, matchScore, reason, onJoin }) {
  const categoryColors = {
    icebreaker: 'from-blue-500 to-blue-600',
    creative: 'from-purple-500 to-purple-600',
    competitive: 'from-orange-500 to-orange-600',
    wellness: 'from-green-500 to-green-600',
    learning: 'from-cyan-500 to-cyan-600',
    social: 'from-pink-500 to-pink-600'
  };

  const categoryEmojis = {
    icebreaker: '🎯',
    creative: '🎨',
    competitive: '🏆',
    wellness: '🧘',
    learning: '📚',
    social: '🎉'
  };

  const gradient = categoryColors[activity.type] || categoryColors.social;
  const emoji = categoryEmojis[activity.type] || '✨';

  return (
    <Card className="h-full glass-card hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-slate-50 group">
      {/* Header Image */}
      <div className="relative h-36 w-full overflow-hidden rounded-t-xl">
        <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
          <div className="text-6xl group-hover:scale-110 transition-transform">{emoji}</div>
        </div>
        
        {/* Overlay Badges */}
        <div className="absolute top-3 left-3">
          <Badge className="bg-white/90 text-slate-900 border-0 font-semibold backdrop-blur-sm">
            {activity.duration}
          </Badge>
        </div>
        
        {matchScore && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-purple-600 text-white border-0 font-semibold">
              <Sparkles className="h-3 w-3 mr-1" />
              {Math.round(matchScore * 100)}% match
            </Badge>
          </div>
        )}
        
        {points && (
          <div className="absolute bottom-3 right-3">
            <Badge className="bg-amber-500 text-white border-0 font-semibold">
              +{points} pts
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <h4 className="font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-int-orange transition-colors">
          {activity.title}
        </h4>
        
        {reason && (
          <p className="text-xs text-purple-700 mb-2 line-clamp-2 font-medium bg-purple-50 p-2 rounded">
            {reason}
          </p>
        )}
        
        <p className="text-sm text-slate-600 mb-3 line-clamp-2">
          {activity.description}
        </p>

        <div className="flex items-center gap-3 mb-3 text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {activity.duration}
          </div>
          {activity.capacity && (
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {activity.capacity} max
            </div>
          )}
        </div>

        <Link to={createPageUrl('Activities')}>
          <Button 
            size="sm" 
            className="w-full bg-gradient-to-r from-int-orange to-int-orange-dark hover:from-int-orange-dark hover:to-int-orange"
            onClick={() => onJoin && onJoin(activity)}
          >
            View Details
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}