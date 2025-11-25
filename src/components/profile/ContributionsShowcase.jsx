import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Camera, 
  Trophy, 
  Star, 
  MessageSquare,
  Calendar,
  Heart,
  Award
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

export default function ContributionsShowcase({ userEmail }) {
  const { data: media = [] } = useQuery({
    queryKey: ['user-media', userEmail],
    queryFn: () => base44.entities.EventMedia.filter({ uploaded_by_email: userEmail }),
    enabled: !!userEmail
  });

  const { data: participations = [] } = useQuery({
    queryKey: ['user-participations', userEmail],
    queryFn: () => base44.entities.Participation.filter({ participant_email: userEmail }),
    enabled: !!userEmail
  });

  const { data: userPoints } = useQuery({
    queryKey: ['user-points', userEmail],
    queryFn: async () => {
      const points = await base44.entities.UserPoints.filter({ user_email: userEmail });
      return points[0];
    },
    enabled: !!userEmail
  });

  const { data: badges = [] } = useQuery({
    queryKey: ['badges'],
    queryFn: () => base44.entities.Badge.list()
  });

  const earnedBadges = badges.filter(b => userPoints?.badges_earned?.includes(b.id));
  const completedActivities = participations.filter(p => p.activity_completed);
  const feedbackSubmitted = participations.filter(p => p.feedback_submitted);

  const stats = [
    { label: 'Photos Shared', value: media.length, icon: Camera, color: 'text-pink-600' },
    { label: 'Activities Completed', value: completedActivities.length, icon: Trophy, color: 'text-amber-600' },
    { label: 'Feedback Given', value: feedbackSubmitted.length, icon: MessageSquare, color: 'text-blue-600' },
    { label: 'Badges Earned', value: earnedBadges.length, icon: Award, color: 'text-purple-600' },
  ];

  return (
    <Card className="border-0 shadow-lg overflow-hidden">
      <div className="p-6">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-500" />
          Contributions & Achievements
        </h3>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {stats.map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="text-center p-4 bg-slate-50 rounded-xl"
            >
              <stat.icon className={`h-6 w-6 mx-auto mb-2 ${stat.color}`} />
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              <p className="text-xs text-slate-500">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <Tabs defaultValue="badges" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="badges">Badges</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          {/* Badges */}
          <TabsContent value="badges">
            {earnedBadges.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Award className="h-12 w-12 mx-auto mb-2 text-slate-300" />
                <p>No badges earned yet</p>
                <p className="text-sm">Participate in events to earn badges!</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {earnedBadges.map((badge, idx) => (
                  <motion.div
                    key={badge.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-4 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl border border-amber-200 text-center"
                  >
                    <span className="text-3xl block mb-2">{badge.badge_icon}</span>
                    <p className="font-semibold text-slate-900 text-sm">{badge.badge_name}</p>
                    <Badge variant="outline" className="mt-1 text-xs">
                      {badge.rarity}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Media */}
          <TabsContent value="media">
            {media.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Camera className="h-12 w-12 mx-auto mb-2 text-slate-300" />
                <p>No media uploaded yet</p>
                <p className="text-sm">Share photos from events!</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {media.slice(0, 9).map((item, idx) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="relative aspect-square rounded-lg overflow-hidden group"
                  >
                    <img
                      src={item.media_url}
                      alt={item.caption || 'Event photo'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-2 left-2 right-2">
                        {item.caption && (
                          <p className="text-white text-xs truncate">{item.caption}</p>
                        )}
                        <div className="flex items-center gap-1 text-white/80 text-xs">
                          <Heart className="h-3 w-3" />
                          {item.likes?.length || 0}
                        </div>
                      </div>
                    </div>
                    {item.is_featured && (
                      <Badge className="absolute top-2 right-2 bg-amber-500 text-xs">
                        Featured
                      </Badge>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Recent Activity */}
          <TabsContent value="activity">
            {participations.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Calendar className="h-12 w-12 mx-auto mb-2 text-slate-300" />
                <p>No activity yet</p>
                <p className="text-sm">Join events to build your history!</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {participations.slice(0, 10).map((p, idx) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg"
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      p.attended ? 'bg-emerald-100' : 'bg-slate-200'
                    }`}>
                      {p.attended ? (
                        <Trophy className="h-5 w-5 text-emerald-600" />
                      ) : (
                        <Calendar className="h-5 w-5 text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-slate-900 truncate">
                        Event Participation
                      </p>
                      <p className="text-xs text-slate-500">
                        {format(new Date(p.created_date), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      {p.attended && (
                        <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700">
                          Attended
                        </Badge>
                      )}
                      {p.engagement_score && (
                        <div className="flex items-center gap-0.5">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs font-medium">{p.engagement_score}</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Card>
  );
}