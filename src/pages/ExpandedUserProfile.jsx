/**
 * Expanded User Profile with Skills, Goals, Highlights, & Mentorship
 */

import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useUserData } from '../components/hooks/useUserData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  User,
  Target,
  BookOpen,
  Users,
  Zap,
  Trophy,
  Heart,
  Settings,
  Edit2,
  Briefcase,
  TrendingUp
} from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ProjectContributionsShowcase from '../components/profile/ProjectContributionsShowcase';
import AchievementsShowcase from '../components/profile/AchievementsShowcase';
import PersonalInterestsSection from '../components/profile/PersonalInterestsSection';
import ProfileRecognitionFeed from '../components/profile/ProfileRecognitionFeed';
import CareerPathVisualization from '../components/profile/CareerPathVisualization';

export default function ExpandedUserProfile() {
  const { user } = useUserData(true);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const { data: profile, isLoading } = useQuery({
    queryKey: ['user-profile', user?.email],
    queryFn: () => base44.entities.UserProfile.filter({ user_email: user?.email }).then(p => p[0]),
    enabled: !!user?.email
  });

  const { data: highlights } = useQuery({
    queryKey: ['user-highlights', user?.email],
    queryFn: () =>
      base44.entities.UserHighlight.filter({ user_email: user?.email }).then(h =>
        h.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10)
      ),
    enabled: !!user?.email
  });

  const { data: mentorMatches } = useQuery({
    queryKey: ['mentor-matches', user?.email],
    queryFn: () =>
      Promise.all([
        base44.entities.MentorshipMatch.filter({ mentee_email: user?.email }),
        base44.entities.MentorshipMatch.filter({ mentor_email: user?.email })
      ]),
    enabled: !!user?.email
  });

  const { data: learningResources } = useQuery({
    queryKey: ['learning-recommendations', user?.email],
    queryFn: () =>
      base44.functions.invoke('suggestLearningResources').then(r => r.data?.resources || []),
    enabled: !!user?.email
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="relative">
        <div className="h-32 bg-gradient-to-r from-int-navy to-int-orange rounded-t-xl" />
        <div className="px-6 pb-6 bg-white rounded-b-xl shadow">
          <div className="flex items-end gap-4 -mt-16">
            <img
              src={profile?.avatar_url}
              alt={user?.full_name}
              className="h-32 w-32 rounded-full border-4 border-white"
            />
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-slate-900">{user?.full_name}</h1>
              <p className="text-slate-600">{profile?.job_title}</p>
              {profile?.display_flair?.profile_title && (
                <Badge className="mt-2">{profile.display_flair.profile_title}</Badge>
              )}
            </div>
            <Button onClick={() => setIsEditing(!isEditing)} className="gap-2">
              <Edit2 className="h-4 w-4" />
              Edit Profile
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="projects" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            <span className="hidden sm:inline">Projects</span>
          </TabsTrigger>
          <TabsTrigger value="career" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Career</span>
          </TabsTrigger>
          <TabsTrigger value="recognition" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            <span className="hidden sm:inline">Recognition</span>
          </TabsTrigger>
          <TabsTrigger value="skills" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            <span className="hidden sm:inline">Skills</span>
          </TabsTrigger>
          <TabsTrigger value="goals" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            <span className="hidden sm:inline">Goals</span>
          </TabsTrigger>
          <TabsTrigger value="mentorship" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Mentoring</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InfoCard label="Department" value={profile?.department} />
            <InfoCard label="Location" value={profile?.location} />
            <InfoCard label="Years at Company" value={profile?.years_at_company?.toString()} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700">{profile?.bio || 'No bio added yet'}</p>
              </CardContent>
            </Card>
            <PersonalInterestsSection 
              hobbies={profile?.hobbies} 
              funFacts={profile?.fun_facts}
              interests={profile?.interests}
            />
          </div>
        </TabsContent>

        {/* Projects Tab */}
        <TabsContent value="projects" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ProjectContributionsShowcase contributions={profile?.project_contributions} />
            <AchievementsShowcase achievements={profile?.achievements} />
          </div>
        </TabsContent>

        {/* Career Path Tab */}
        <TabsContent value="career" className="space-y-4">
          <CareerPathVisualization 
            careerHistory={profile?.career_history}
            currentRole={profile?.role}
            performanceMetrics={profile?.performance_metrics}
            skills={profile?.skills}
          />
        </TabsContent>

        {/* Recognition Tab */}
        <TabsContent value="recognition" className="space-y-4">
          <ProfileRecognitionFeed userEmail={user?.email} />
        </TabsContent>

        {/* Skills & Expertise */}
        <TabsContent value="skills" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Skills & Expertise</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {profile?.skills?.length > 0 ? (
                  profile.skills.map((skill, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <p className="font-medium text-slate-900">{skill.skill_name}</p>
                        <p className="text-xs text-slate-600 capitalize">{skill.proficiency}</p>
                      </div>
                      {skill.endorsed_count > 0 && (
                        <Badge variant="outline">{skill.endorsed_count} endorsements</Badge>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-slate-600">No skills added yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Career Goals */}
        <TabsContent value="goals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Career Goals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {profile?.career_goals?.length > 0 ? (
                  profile.career_goals.map((goal, idx) => (
                    <div key={idx} className="p-4 bg-gradient-to-r from-int-orange/10 to-int-navy/10 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-slate-900">{goal.goal}</p>
                          <p className="text-sm text-slate-600 mt-1">{goal.notes}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-int-orange">{goal.progress || 0}%</p>
                          <p className="text-xs text-slate-600">
                            Target: {new Date(goal.target_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 w-full bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-int-orange to-int-navy h-2 rounded-full"
                          style={{ width: `${goal.progress || 0}%` }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-600">No goals set yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Mentorship */}
        <TabsContent value="mentorship" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Mentors */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  My Mentors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mentorMatches?.[0]?.length > 0 ? (
                    mentorMatches[0].map(match => (
                      <MentorshipCard key={match.id} match={match} type="mentee" />
                    ))
                  ) : (
                    <p className="text-slate-600">No mentors yet</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Mentees */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  Mentoring
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mentorMatches?.[1]?.length > 0 ? (
                    mentorMatches[1].map(match => (
                      <MentorshipCard key={match.id} match={match} type="mentor" />
                    ))
                  ) : (
                    <p className="text-slate-600">Not mentoring anyone yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Mentorship Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Mentorship Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                <strong>Open to mentoring:</strong>{' '}
                {profile?.mentorship_preferences?.open_to_mentoring ? '✓ Yes' : '✗ No'}
              </p>
              <p>
                <strong>Seeking mentor:</strong>{' '}
                {profile?.mentorship_preferences?.open_to_being_mentored ? '✓ Yes' : '✗ No'}
              </p>
              <p>
                <strong>Style:</strong> {profile?.mentorship_preferences?.preferred_mentorship_style}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Learning Recommendations */}
        <TabsContent value="highlights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Recommended Learning Resources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {learningResources?.length > 0 ? (
                  learningResources.map((resource, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-int-navy hover:underline"
                          >
                            {resource.title}
                          </a>
                          <p className="text-sm text-slate-600 mt-1">{resource.description}</p>
                          <div className="flex gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {resource.resource_type}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {resource.difficulty_level}
                            </Badge>
                            {resource.estimated_duration_minutes && (
                              <Badge variant="outline" className="text-xs">
                                {resource.estimated_duration_minutes} min
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-2xl font-bold text-int-orange">
                            {resource.match_score}%
                          </p>
                          <p className="text-xs text-slate-600 max-w-[150px]">{resource.reason}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-600">No recommendations yet</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Highlights Feed */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Highlights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {highlights?.length > 0 ? (
                  highlights.map(highlight => (
                    <div key={highlight.id} className="p-4 border border-slate-200 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-slate-900">{highlight.title}</p>
                          <p className="text-sm text-slate-600 mt-1">{highlight.description}</p>
                          <div className="mt-2">
                            <Badge>{highlight.highlight_type}</Badge>
                          </div>
                        </div>
                        <p className="text-xs text-slate-500">
                          {new Date(highlight.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-600">No highlights yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function InfoCard({ label, value }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-sm text-slate-600 mb-1">{label}</p>
        <p className="text-lg font-bold text-slate-900">{value || '—'}</p>
      </CardContent>
    </Card>
  );
}

function MentorshipCard({ match, type }) {
  const name = type === 'mentor' ? match.mentee_email : match.mentor_email;
  return (
    <div className="p-3 bg-slate-50 rounded-lg">
      <p className="font-medium text-slate-900">{name.split('@')[0]}</p>
      <p className="text-xs text-slate-600">{match.mentorship_areas?.join(', ')}</p>
      <div className="flex gap-2 mt-2">
        <Badge variant="outline" className="text-xs">
          {match.status}
        </Badge>
        {match.meetings_completed > 0 && (
          <Badge variant="outline" className="text-xs">
            {match.meetings_completed} meetings
          </Badge>
        )}
      </div>
    </div>
  );
}