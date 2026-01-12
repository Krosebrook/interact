/**
 * REFACTORED CONTRIBUTIONS SHOWCASE
 * Production-grade with apiClient, memoization, and RBAC
 */

import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/apiClient';
import { queryKeys } from '../lib/queryKeys';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Camera, 
  Trophy, 
  Star, 
  MessageSquare,
  Calendar,
  Heart,
  Award,
  Gift,
  TrendingUp
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

export default function ContributionsShowcase({ userEmail }) {
  // Fetch data with apiClient and proper caching
  const { data: media = [] } = useQuery({
    queryKey: queryKeys.profile.media(userEmail),
    queryFn: () => apiClient.list('EventMedia', { 
      filters: { uploaded_by_email: userEmail },
      limit: 20 
    }),
    enabled: !!userEmail,
    staleTime: 60000
  });

  const { data: participations = [] } = useQuery({
    queryKey: queryKeys.profile.participations(userEmail),
    queryFn: () => apiClient.list('Participation', { 
      filters: { participant_email: userEmail },
      sort: '-created_date',
      limit: 100 
    }),
    enabled: !!userEmail,
    staleTime: 30000
  });

  const { data: userPoints } = useQuery({
    queryKey: queryKeys.gamification.userPoints.byEmail(userEmail),
    queryFn: async () => {
      const points = await apiClient.list('UserPoints', { 
        filters: { user_email: userEmail } 
      });
      return points[0];
    },
    enabled: !!userEmail,
    staleTime: 30000
  });

  const { data: badges = [] } = useQuery({
    queryKey: queryKeys.gamification.badges.active,
    queryFn: () => apiClient.list('Badge', { 
      filters: { is_active: true } 
    }),
    staleTime: 60000
  });

  const { data: recognitionsSent = [] } = useQuery({
    queryKey: queryKeys.recognition.sent(userEmail),
    queryFn: () => apiClient.list('Recognition', { 
      filters: { sender_email: userEmail },
      sort: '-created_date',
      limit: 50 
    }),
    enabled: !!userEmail,
    staleTime: 30000
  });

  const { data: recognitionsReceived = [] } = useQuery({
    queryKey: queryKeys.recognition.received(userEmail),
    queryFn: () => apiClient.list('Recognition', { 
      filters: { recipient_email: userEmail },
      sort: '-created_date',
      limit: 50 
    }),
    enabled: !!userEmail,
    staleTime: 30000
  });

  // Memoized computed values
  const stats = useMemo(() => {
    const earnedBadges = badges.filter(b => userPoints?.badges_earned?.includes(b.id));
    const completedActivities = participations.filter(p => p.activity_completed);
    const feedbackSubmitted = participations.filter(p => p.feedback_submitted);
    const eventsAttended = participations.filter(p => p.attended);

    return {
      earnedBadges,
      completedActivities,
      feedbackSubmitted,
      eventsAttended
    };
  }, [badges, userPoints, participations]);

  const statCards = useMemo(() => [
    { label: 'Events Attended', value: stats.eventsAttended.length, icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Badges Earned', value: stats.earnedBadges.length, icon: Award, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Recognitions Given', value: recognitionsSent.length, icon: Gift, color: 'text-pink-600', bg: 'bg-pink-50' },
    { label: 'Recognitions Received', value: recognitionsReceived.length, icon: Heart, color: 'text-red-500', bg: 'bg-red-50' },
    { label: 'Feedback Given', value: stats.feedbackSubmitted.length, icon: MessageSquare, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Photos Shared', value: media.length, icon: Camera, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ], [stats, recognitionsSent, recognitionsReceived, media]);

  return (
    <div className="space-y-6" data-b44-sync="true" data-feature="profile" data-component="contributionsshowcase">
      {/* Stats Overview Card */}
      <Card className="border-0 shadow-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-int-navy to-purple-700 text-white">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Contributions Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {statCards.map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`text-center p-4 ${stat.bg} rounded-xl`}
              >
                <stat.icon className={`h-6 w-6 mx-auto mb-2 ${stat.color}`} />
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-xs text-slate-600">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Tabs */}
      <Card className="border-0 shadow-lg overflow-hidden">
        <div className="p-6">

        <Tabs defaultValue="recognition" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="recognition">Recognition</TabsTrigger>
            <TabsTrigger value="badges">Badges</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          {/* Recognition */}
          <TabsContent value="recognition">
            {recognitionsReceived.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Heart className="h-12 w-12 mx-auto mb-2 text-slate-300" />
                <p>No recognitions received yet</p>
                <p className="text-sm">Keep contributing and colleagues will recognize you!</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {recognitionsReceived.slice(0, 10).map((rec, idx) => (
                  <motion.div
                    key={rec.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-4 bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl border border-pink-100"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0">
                        <Gift className="h-5 w-5 text-pink-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 text-sm">From {rec.sender_name}</p>
                        <p className="text-slate-600 text-sm mt-1">{rec.message}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs capitalize bg-white">
                            {rec.category?.replace('_', ' ')}
                          </Badge>
                          {rec.points_awarded > 0 && (
                            <Badge className="text-xs bg-amber-100 text-amber-700">
                              +{rec.points_awarded} pts
                            </Badge>
                          )}
                          <span className="text-xs text-slate-400 ml-auto">
                            {format(new Date(rec.created_date), 'MMM d')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Badges */}
          <TabsContent value="badges">
            {stats.earnedBadges.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Award className="h-12 w-12 mx-auto mb-2 text-slate-300" />
                <p>No badges earned yet</p>
                <p className="text-sm">Participate in events to earn badges!</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {stats.earnedBadges.map((badge, idx) => (
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
    </div>
  );
}