import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  Calendar,
  Users,
  Award,
  Target,
  TrendingUp,
  Sparkles,
  Bell,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';

/**
 * Personalized dashboard that adapts to user role and context
 */
export default function PersonalizedDashboard({ user, userProfile, userPoints }) {
  const isParticipant = user?.user_type === 'participant';
  const isFacilitator = user?.user_type === 'facilitator';
  const isAdmin = user?.role === 'admin';

  // Fetch relevant data based on role
  const { data: myEvents = [], isLoading: eventsLoading } = useQuery({
    queryKey: ['my-events', user?.email],
    queryFn: async () => {
      const participations = await base44.entities.Participation.filter({
        user_email: user.email,
        rsvp_status: 'yes'
      });
      const eventIds = participations.map(p => p.event_id);
      if (eventIds.length === 0) return [];
      const allEvents = await base44.entities.Event.list();
      return allEvents.filter(e => eventIds.includes(e.id) && new Date(e.scheduled_date) > new Date());
    },
    enabled: !!user?.email && isParticipant
  });

  const { data: myTeams = [] } = useQuery({
    queryKey: ['my-teams', user?.email],
    queryFn: async () => {
      const memberships = await base44.entities.TeamMembership.filter({
        user_email: user.email
      });
      const teamIds = memberships.map(m => m.team_id);
      if (teamIds.length === 0) return [];
      const allTeams = await base44.entities.Team.list();
      return allTeams.filter(t => teamIds.includes(t.id));
    },
    enabled: !!user?.email
  });

  const { data: myGoals = [] } = useQuery({
    queryKey: ['my-goals', user?.email],
    queryFn: () => base44.entities.PersonalChallenge.filter({
      user_email: user.email,
      status: 'in_progress'
    }),
    enabled: !!user?.email && isParticipant
  });

  const { data: pendingSurveys = [] } = useQuery({
    queryKey: ['pending-surveys', user?.email],
    queryFn: async () => {
      const surveys = await base44.entities.Survey.filter({ is_active: true });
      const responses = await base44.entities.SurveyResponse.filter({
        user_email: user.email
      });
      const respondedIds = responses.map(r => r.survey_id);
      return surveys.filter(s => !respondedIds.includes(s.id));
    },
    enabled: !!user?.email
  });

  // Personalized recommendations based on profile
  const recommendations = useMemo(() => {
    const recs = [];
    
    if (isParticipant) {
      if (myEvents.length === 0) {
        recs.push({
          type: 'action',
          title: 'Join Your First Event',
          description: 'Explore upcoming events and RSVP to start building connections',
          icon: Calendar,
          action: 'ParticipantPortal'
        });
      }
      
      if (myTeams.length === 0) {
        recs.push({
          type: 'action',
          title: 'Find Your Team',
          description: 'Join team channels to collaborate and stay updated',
          icon: Users,
          action: 'Teams'
        });
      }
      
      if (pendingSurveys.length > 0) {
        recs.push({
          type: 'urgent',
          title: `${pendingSurveys.length} Survey${pendingSurveys.length > 1 ? 's' : ''} Waiting`,
          description: 'Your feedback helps improve team experiences',
          icon: Bell,
          action: 'Surveys'
        });
      }
      
      if ((userPoints?.total_points || 0) < 100) {
        recs.push({
          type: 'tip',
          title: 'Start Earning Points',
          description: 'Attend events, give recognition, and complete challenges',
          icon: Sparkles,
          action: 'GamificationDashboard'
        });
      }
    }
    
    if (isFacilitator) {
      recs.push({
        type: 'action',
        title: 'Schedule Your Next Event',
        description: 'Keep your team engaged with regular activities',
        icon: Calendar,
        action: 'Calendar'
      });
      
      recs.push({
        type: 'tip',
        title: 'Check Team Analytics',
        description: 'Review engagement metrics and participation trends',
        icon: TrendingUp,
        action: 'Analytics'
      });
    }
    
    return recs;
  }, [isParticipant, isFacilitator, myEvents.length, myTeams.length, pendingSurveys.length, userPoints]);

  if (eventsLoading) {
    return <LoadingSpinner message="Loading your personalized dashboard..." />;
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <Card className="bg-gradient-to-br from-int-orange/10 to-int-gold/10 border-int-orange/20">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-int-orange to-int-gold flex items-center justify-center text-white text-2xl font-bold">
              {user?.full_name?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-slate-900">
                Welcome back, {user?.full_name?.split(' ')[0]}!
              </h2>
              <p className="text-slate-600">
                {isAdmin && 'Manage your platform and track engagement'}
                {isFacilitator && 'Create engaging experiences for your team'}
                {isParticipant && 'Stay connected and engaged with your team'}
              </p>
            </div>
            {isParticipant && (
              <div className="text-right">
                <div className="text-3xl font-bold text-int-orange">
                  {userPoints?.total_points || 0}
                </div>
                <p className="text-sm text-slate-600">Total Points</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {isParticipant && (
          <>
            <StatCard
              title="Upcoming Events"
              value={myEvents.length}
              icon={Calendar}
              color="blue"
            />
            <StatCard
              title="Active Goals"
              value={myGoals.length}
              icon={Target}
              color="green"
            />
            <StatCard
              title="My Teams"
              value={myTeams.length}
              icon={Users}
              color="purple"
            />
          </>
        )}
        
        {(isFacilitator || isAdmin) && (
          <>
            <StatCard
              title="My Teams"
              value={myTeams.length}
              icon={Users}
              color="purple"
            />
            <StatCard
              title="Pending Actions"
              value={pendingSurveys.length}
              icon={Bell}
              color="amber"
            />
            <StatCard
              title="Total Engagement"
              value="--"
              icon={TrendingUp}
              color="blue"
            />
          </>
        )}
      </div>

      {/* Personalized Recommendations */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              Recommended For You
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recommendations.map((rec, idx) => (
                <Link key={idx} to={createPageUrl(rec.action)}>
                  <div className="p-4 rounded-lg border border-slate-200 hover:border-int-orange/50 hover:bg-slate-50 transition-all cursor-pointer">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        rec.type === 'urgent' ? 'bg-red-100' :
                        rec.type === 'action' ? 'bg-blue-100' :
                        'bg-purple-100'
                      }`}>
                        <rec.icon className={`h-5 w-5 ${
                          rec.type === 'urgent' ? 'text-red-600' :
                          rec.type === 'action' ? 'text-blue-600' :
                          'text-purple-600'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900">{rec.title}</h4>
                        <p className="text-sm text-slate-600">{rec.description}</p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-slate-400" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Events (Participant) */}
      {isParticipant && myEvents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Your Upcoming Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {myEvents.slice(0, 5).map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-900">{event.title}</p>
                    <p className="text-sm text-slate-600">
                      {new Date(event.scheduled_date).toLocaleDateString()} at {event.time || 'TBD'}
                    </p>
                  </div>
                  <Badge>{event.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Goals (Participant) */}
      {isParticipant && myGoals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-600" />
              Active Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {myGoals.map((goal) => (
                <div key={goal.id} className="p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-slate-900">{goal.title}</p>
                    <span className="text-sm font-semibold text-green-600">
                      {goal.progress || 0}%
                    </span>
                  </div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-600"
                      style={{ width: `${goal.progress || 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }) {
  const colors = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-emerald-600',
    purple: 'from-purple-500 to-purple-600',
    amber: 'from-amber-500 to-orange-600'
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-600 mb-1">{title}</p>
            <p className="text-3xl font-bold text-slate-900">{value}</p>
          </div>
          <div className={`p-3 rounded-xl bg-gradient-to-br ${colors[color]} text-white`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}