import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useUserData } from '../components/hooks/useUserData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Calendar, Bell, Award, TrendingUp, Edit, Mail } from 'lucide-react';
import { format, isPast } from 'date-fns';
import LoadingSpinner from '../components/common/LoadingSpinner';
import NotificationSettings from '../components/profile/NotificationSettings';
import ProfileContributionSummary from '../components/profile/ProfileContributionSummary';
import CommentSection from '../components/collaboration/CommentSection';
import DirectMessaging from '../components/messaging/DirectMessaging';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { MessageSquare as MessageSquareIcon } from 'lucide-react';
import { toast } from 'sonner';

export default function UserProfile() {
  const { user, loading } = useUserData();
  const queryClient = useQueryClient();
  const [editMode, setEditMode] = useState(false);
  const [showMessaging, setShowMessaging] = useState(false);

  // Get user email from URL params (for admin viewing) or use current user
  const urlParams = new URLSearchParams(window.location.search);
  const viewingUserEmail = urlParams.get('email') || user?.email;

  // Fetch user profile
  const { data: userProfile } = useQuery({
    queryKey: ['user-profile', viewingUserEmail],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.filter({ user_email: viewingUserEmail });
      return profiles[0] || null;
    },
    enabled: !!viewingUserEmail
  });

  // Fetch user points
  const { data: userPoints } = useQuery({
    queryKey: ['user-points', viewingUserEmail],
    queryFn: async () => {
      const points = await base44.entities.UserPoints.filter({ user_email: viewingUserEmail });
      return points[0] || null;
    },
    enabled: !!viewingUserEmail
  });

  // Fetch participations
  const { data: participations = [] } = useQuery({
    queryKey: ['user-participations', viewingUserEmail],
    queryFn: () => base44.entities.Participation.filter({ user_email: viewingUserEmail }, '-created_date', 100),
    enabled: !!viewingUserEmail
  });

  // Fetch events for participations
  const { data: allEvents = [] } = useQuery({
    queryKey: ['events-for-profile'],
    queryFn: () => base44.entities.Event.list('-scheduled_date', 200)
  });

  // Fetch recognitions (given and received)
  const { data: recognitionsReceived = [] } = useQuery({
    queryKey: ['recognitions-received', viewingUserEmail],
    queryFn: () => base44.entities.Recognition.filter({ 
      recipient_email: viewingUserEmail,
      status: 'approved'
    }, '-created_date', 50),
    enabled: !!viewingUserEmail
  });

  const { data: recognitionsGiven = [] } = useQuery({
    queryKey: ['recognitions-given', viewingUserEmail],
    queryFn: () => base44.entities.Recognition.filter({ 
      sender_email: viewingUserEmail,
      status: 'approved'
    }, '-created_date', 50),
    enabled: !!viewingUserEmail
  });

  // Calculate upcoming and past events
  const { upcomingEvents, pastEvents } = useMemo(() => {
    const eventIds = participations.map(p => p.event_id);
    const userEvents = allEvents.filter(e => eventIds.includes(e.id));

    const now = new Date();
    const upcoming = userEvents.filter(e => !isPast(new Date(e.scheduled_date))).slice(0, 5);
    const past = userEvents.filter(e => isPast(new Date(e.scheduled_date))).slice(0, 10);

    return { upcomingEvents: upcoming, pastEvents: past };
  }, [participations, allEvents]);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data) => {
      if (userProfile?.id) {
        return base44.entities.UserProfile.update(userProfile.id, data);
      }
      return base44.entities.UserProfile.create({ ...data, user_email: viewingUserEmail });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['user-profile', viewingUserEmail]);
      toast.success('Profile updated');
      setEditMode(false);
    }
  });

  if (loading) {
    return <LoadingSpinner className="min-h-screen" />;
  }

  const isOwnProfile = user?.email === viewingUserEmail;
  const canEdit = isOwnProfile || user?.role === 'admin';

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className="border-2 border-purple-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
              <AvatarImage src={userProfile?.avatar_url} />
              <AvatarFallback className="text-2xl bg-gradient-purple text-white">
                {viewingUserEmail?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 mb-1">
                    {userProfile?.display_name || viewingUserEmail}
                  </h1>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Mail className="h-4 w-4" />
                    <span>{viewingUserEmail}</span>
                  </div>
                  {userProfile?.job_title && (
                    <p className="text-slate-600 mt-1">{userProfile.job_title}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  {!isOwnProfile && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowMessaging(true)}
                    >
                      <MessageSquareIcon className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                  )}
                  {canEdit && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditMode(!editMode)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      {editMode ? 'Cancel' : 'Edit Profile'}
                    </Button>
                  )}
                </div>
              </div>

              {userProfile?.bio && (
                <p className="text-slate-700 mt-3">{userProfile.bio}</p>
              )}

              {/* Stats */}
              <div className="grid grid-cols-4 gap-4 mt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {userPoints?.total_points || 0}
                  </div>
                  <div className="text-xs text-slate-500">Total Points</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-600">
                    {participations.filter(p => p.attendance_status === 'attended').length}
                  </div>
                  <div className="text-xs text-slate-500">Events Attended</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-600">
                    {recognitionsReceived.length}
                  </div>
                  <div className="text-xs text-slate-500">Recognitions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-int-orange">
                    {userPoints?.current_streak || 0}
                  </div>
                  <div className="text-xs text-slate-500">Day Streak</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="events" className="space-y-4">
        <TabsList>
          <TabsTrigger value="events">
            <Calendar className="h-4 w-4 mr-2" />
            Events
          </TabsTrigger>
          <TabsTrigger value="contributions">
            <Award className="h-4 w-4 mr-2" />
            Contributions
          </TabsTrigger>
          {isOwnProfile && (
            <TabsTrigger value="settings">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
          )}
        </TabsList>

        {/* Events Tab */}
        <TabsContent value="events" className="space-y-4">
          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                Upcoming Events ({upcomingEvents.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingEvents.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">No upcoming events</p>
              ) : (
                <div className="space-y-3">
                  {upcomingEvents.map(event => {
                    const participation = participations.find(p => p.event_id === event.id);
                    return (
                      <div key={event.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-900">{event.title}</h4>
                          <div className="flex items-center gap-3 text-sm text-slate-600 mt-1">
                            <span>{format(new Date(event.scheduled_date), 'MMM d, yyyy • h:mm a')}</span>
                            <Badge variant="outline">{event.event_format}</Badge>
                          </div>
                        </div>
                        <Badge className={
                          participation?.rsvp_status === 'yes' ? 'bg-emerald-100 text-emerald-700' :
                          participation?.rsvp_status === 'maybe' ? 'bg-amber-100 text-amber-700' :
                          'bg-slate-100 text-slate-700'
                        }>
                          {participation?.rsvp_status || 'pending'}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Past Events */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-slate-600" />
                Past Events ({pastEvents.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pastEvents.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">No past events</p>
              ) : (
                <div className="space-y-3">
                  {pastEvents.map(event => {
                    const participation = participations.find(p => p.event_id === event.id);
                    const attended = participation?.attendance_status === 'attended';
                    return (
                      <div key={event.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-900">{event.title}</h4>
                          <div className="flex items-center gap-3 text-sm text-slate-600 mt-1">
                            <span>{format(new Date(event.scheduled_date), 'MMM d, yyyy')}</span>
                            {participation?.feedback_rating && (
                              <span className="flex items-center gap-1">
                                {'★'.repeat(participation.feedback_rating)}
                                <span className="text-slate-400">{'★'.repeat(5 - participation.feedback_rating)}</span>
                              </span>
                            )}
                          </div>
                        </div>
                        <Badge className={attended ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}>
                          {attended ? 'Attended' : 'No Show'}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contributions Tab */}
        <TabsContent value="contributions" className="space-y-4">
          <ProfileContributionSummary
            recognitionsReceived={recognitionsReceived}
            recognitionsGiven={recognitionsGiven}
            participations={participations}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Recognitions Received */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recognitions Received ({recognitionsReceived.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {recognitionsReceived.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-8">No recognitions yet</p>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-auto">
                    {recognitionsReceived.slice(0, 10).map(rec => (
                      <div key={rec.id} className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                        <div className="flex items-start justify-between mb-2">
                          <Badge className="bg-amber-100 text-amber-700 capitalize">
                            {rec.category.replace('_', ' ')}
                          </Badge>
                          <span className="text-xs text-slate-500">
                            {format(new Date(rec.created_date), 'MMM d, yyyy')}
                          </span>
                        </div>
                        <p className="text-sm text-slate-700 italic line-clamp-2">"{rec.message}"</p>
                        <p className="text-xs text-slate-500 mt-2">— {rec.sender_name}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recognitions Given */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recognitions Given ({recognitionsGiven.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {recognitionsGiven.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-8">No recognitions given yet</p>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-auto">
                    {recognitionsGiven.slice(0, 10).map(rec => (
                      <div key={rec.id} className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                        <div className="flex items-start justify-between mb-2">
                          <Badge className="bg-purple-100 text-purple-700 capitalize">
                            {rec.category.replace('_', ' ')}
                          </Badge>
                          <span className="text-xs text-slate-500">
                            {format(new Date(rec.created_date), 'MMM d, yyyy')}
                          </span>
                        </div>
                        <p className="text-sm text-slate-700 italic line-clamp-2">"{rec.message}"</p>
                        <p className="text-xs text-slate-500 mt-2">To: {rec.recipient_name}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Notifications Tab (Only for own profile) */}
        {isOwnProfile && (
          <TabsContent value="settings">
            <NotificationSettings userProfile={userProfile} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}