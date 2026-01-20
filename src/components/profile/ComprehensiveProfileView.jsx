import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  User, Briefcase, MapPin, Calendar, Award, TrendingUp, 
  Target, BookOpen, Users, Mail 
} from 'lucide-react';

export default function ComprehensiveProfileView({ userEmail }) {
  const { data: profile, isLoading } = useQuery({
    queryKey: ['user-profile', userEmail],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.filter({ user_email: userEmail });
      return profiles[0];
    }
  });

  const { data: user } = useQuery({
    queryKey: ['user-data', userEmail],
    queryFn: async () => {
      const users = await base44.entities.User.filter({ email: userEmail });
      return users[0];
    }
  });

  if (isLoading) {
    return <div className="text-center py-8 text-slate-500">Loading profile...</div>;
  }

  if (!profile) {
    return <Card><CardContent className="py-8 text-center text-slate-500">Profile not found</CardContent></Card>;
  }

  const engagementScore = profile.engagement_metrics?.engagement_score || 0;

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="bg-gradient-to-br from-purple-50 to-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-6">
            <div className="h-24 w-24 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-slate-900">{user?.full_name}</h2>
              <p className="text-lg text-slate-600 flex items-center gap-2 mt-1">
                <Briefcase className="w-4 h-4" />
                {profile.role || 'No role set'}
              </p>
              <div className="flex flex-wrap gap-3 mt-3">
                <Badge variant="outline" className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {profile.department}
                </Badge>
                {profile.location && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {profile.location}
                  </Badge>
                )}
                {profile.start_date && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Since {new Date(profile.start_date).getFullYear()}
                  </Badge>
                )}
                <Badge variant="outline" className="flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  {userEmail}
                </Badge>
              </div>
              {profile.bio && (
                <p className="text-slate-700 mt-3 max-w-2xl">{profile.bio}</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-600 mb-1">Engagement Score</p>
              <p className="text-4xl font-bold text-purple-600">{engagementScore}</p>
              <Progress value={engagementScore} className="w-24 mt-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <Award className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-slate-900">
              {profile.engagement_metrics?.total_events_attended || 0}
            </p>
            <p className="text-xs text-slate-600">Events Attended</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-slate-900">
              {profile.engagement_metrics?.recognition_received || 0}
            </p>
            <p className="text-xs text-slate-600">Recognition Received</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-slate-900">
              {profile.engagement_metrics?.recognition_given || 0}
            </p>
            <p className="text-xs text-slate-600">Recognition Given</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Target className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-slate-900">
              {profile.development_goals?.filter(g => g.status === 'completed').length || 0}
            </p>
            <p className="text-xs text-slate-600">Goals Completed</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Skills */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-600" />
              Skills & Expertise
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {profile.skills?.length > 0 ? (
              profile.skills.map((skill, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-900">{skill.skill_name}</span>
                    <Badge className={
                      skill.proficiency === 'expert' ? 'bg-purple-600 text-white' :
                      skill.proficiency === 'advanced' ? 'bg-blue-600 text-white' :
                      skill.proficiency === 'intermediate' ? 'bg-green-600 text-white' :
                      'bg-slate-600 text-white'
                    }>
                      {skill.proficiency}
                    </Badge>
                  </div>
                  <div className="text-xs text-slate-600 mb-1">
                    {skill.years_experience || 0} years experience
                  </div>
                  <Progress 
                    value={
                      skill.proficiency === 'expert' ? 100 :
                      skill.proficiency === 'advanced' ? 75 :
                      skill.proficiency === 'intermediate' ? 50 : 25
                    } 
                    className="h-2"
                  />
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">No skills listed</p>
            )}
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Productivity</span>
                <span className="text-sm font-bold text-green-600">
                  {profile.performance_metrics?.productivity_score || 0}%
                </span>
              </div>
              <Progress value={profile.performance_metrics?.productivity_score || 0} />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Collaboration</span>
                <span className="text-sm font-bold text-blue-600">
                  {profile.performance_metrics?.collaboration_score || 0}%
                </span>
              </div>
              <Progress value={profile.performance_metrics?.collaboration_score || 0} />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Innovation</span>
                <span className="text-sm font-bold text-purple-600">
                  {profile.performance_metrics?.innovation_score || 0}%
                </span>
              </div>
              <Progress value={profile.performance_metrics?.innovation_score || 0} />
            </div>
            {profile.performance_metrics?.peer_rating && (
              <div className="pt-3 border-t">
                <p className="text-sm text-slate-600">Peer Rating</p>
                <p className="text-2xl font-bold text-purple-600">
                  {profile.performance_metrics.peer_rating.toFixed(1)}/5.0
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Development Goals */}
      {profile.development_goals?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-orange-600" />
              Development Goals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {profile.development_goals.map((goal, idx) => (
              <div key={idx} className="border rounded-lg p-3">
                <div className="flex items-start justify-between mb-2">
                  <p className="font-medium text-slate-900">{goal.goal}</p>
                  <Badge className={
                    goal.status === 'completed' ? 'bg-green-600 text-white' :
                    goal.status === 'in_progress' ? 'bg-blue-600 text-white' :
                    'bg-slate-600 text-white'
                  }>
                    {goal.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">
                    Target: {goal.target_date ? new Date(goal.target_date).toLocaleDateString() : 'Not set'}
                  </span>
                  <span className="font-medium">{goal.progress || 0}% complete</span>
                </div>
                <Progress value={goal.progress || 0} className="mt-2 h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Career Aspirations */}
      {profile.career_aspirations && (
        <Card className="border-purple-200 bg-purple-50">
          <CardHeader>
            <CardTitle className="text-purple-900">Career Aspirations</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700">{profile.career_aspirations}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}