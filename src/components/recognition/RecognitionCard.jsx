import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { Star, Sparkles, MessageCircle, Heart, ThumbsUp, PartyPopper, Lock, Users } from 'lucide-react';

const CATEGORY_CONFIG = {
  teamwork: { icon: '🤝', label: 'Teamwork', color: 'bg-blue-100 text-blue-700' },
  innovation: { icon: '💡', label: 'Innovation', color: 'bg-purple-100 text-purple-700' },
  leadership: { icon: '🎯', label: 'Leadership', color: 'bg-amber-100 text-amber-700' },
  going_above: { icon: '🚀', label: 'Above & Beyond', color: 'bg-green-100 text-green-700' },
  customer_focus: { icon: '❤️', label: 'Customer Focus', color: 'bg-red-100 text-red-700' },
  problem_solving: { icon: '🧩', label: 'Problem Solving', color: 'bg-cyan-100 text-cyan-700' },
  mentorship: { icon: '🌱', label: 'Mentorship', color: 'bg-emerald-100 text-emerald-700' },
  culture_champion: { icon: '⭐', label: 'Culture Champion', color: 'bg-yellow-100 text-yellow-700' }
};

const REACTION_EMOJIS = ['👏', '❤️', '🎉', '🔥', '💪'];

export default function RecognitionCard({ 
  recognition, 
  currentUserEmail,
  onReact,
  onFeature,
  isAdmin = false,
  compact = false 
}) {
  const category = CATEGORY_CONFIG[recognition.category] || CATEGORY_CONFIG.teamwork;
  const timeAgo = formatDistanceToNow(new Date(recognition.created_date), { addSuffix: true });

  const userReaction = recognition.reactions?.find(r => r.user_email === currentUserEmail);

  const getVisibilityIcon = () => {
    if (recognition.visibility === 'private') return <Lock className="h-3 w-3" />;
    if (recognition.visibility === 'team_only') return <Users className="h-3 w-3" />;
    return null;
  };

  return (
    <Card 
      data-b44-sync="true"
      data-feature="recognition"
      data-component="recognitioncard"
      className={`relative overflow-hidden transition-all hover:shadow-lg ${
        recognition.is_featured ? 'ring-2 ring-amber-400 bg-gradient-to-br from-amber-50 to-white' : ''
      }`}>
      {/* Featured banner */}
      {recognition.is_featured && (
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-amber-400 to-yellow-400 text-white text-xs font-bold py-1 px-3 flex items-center gap-1">
          <Star className="h-3 w-3" />
          FEATURED RECOGNITION
        </div>
      )}

      <CardContent className={`p-4 ${recognition.is_featured ? 'pt-8' : ''}`}>
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          {/* Sender Avatar */}
          <div className="w-10 h-10 rounded-full bg-int-navy text-white flex items-center justify-center font-medium shrink-0">
            {recognition.sender_name?.charAt(0) || '?'}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-slate-900">{recognition.sender_name}</span>
              <span className="text-slate-600">recognized</span>
              <span className="font-semibold text-int-orange">{recognition.recipient_name}</span>
              {getVisibilityIcon()}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600 mt-1">
              <span>{timeAgo}</span>
              {recognition.ai_suggested && (
                <Badge variant="secondary" className="text-[10px] bg-purple-50 text-purple-600">
                  <Sparkles className="h-2 w-2 mr-1" />
                  AI-assisted
                </Badge>
              )}
            </div>
          </div>

          {/* Category badge */}
          <Badge className={`${category.color} shrink-0`}>
            <span className="mr-1">{category.icon}</span>
            {!compact && category.label}
          </Badge>
        </div>

        {/* Message */}
        <div className="bg-slate-50 rounded-lg p-3 mb-3">
          <p className="text-slate-700 leading-relaxed">{recognition.message}</p>
        </div>

        {/* Company Values */}
        {recognition.company_values?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {recognition.company_values.map(value => (
              <Badge key={value} variant="outline" className="text-xs">
                {value}
              </Badge>
            ))}
          </div>
        )}

        {/* Points */}
        {recognition.points_awarded > 0 && (
          <div className="flex items-center gap-1 text-sm text-int-orange font-medium mb-3">
            +{recognition.points_awarded} points awarded
          </div>
        )}

        {/* Reactions & Actions */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-1">
            {REACTION_EMOJIS.map(emoji => {
              const count = recognition.reactions?.filter(r => r.emoji === emoji).length || 0;
              const isSelected = userReaction?.emoji === emoji;
              return (
                <button
                  key={emoji}
                  onClick={() => onReact?.(recognition.id, emoji)}
                  className={`px-2 py-1 rounded-full text-sm transition-all ${
                    isSelected 
                      ? 'bg-int-orange/20 ring-1 ring-int-orange' 
                      : 'hover:bg-slate-100'
                  }`}
                >
                  {emoji} {count > 0 && <span className="text-xs ml-1">{count}</span>}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            {recognition.comments_count > 0 && (
              <span className="text-xs text-slate-600 flex items-center gap-1">
                <MessageCircle className="h-3 w-3" />
                {recognition.comments_count}
              </span>
            )}

            {isAdmin && !recognition.is_featured && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onFeature?.(recognition.id)}
                className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
              >
                <Star className="h-4 w-4 mr-1" />
                Feature
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}