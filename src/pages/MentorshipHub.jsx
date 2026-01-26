import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useUserData } from '@/components/hooks/useUserData';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { Users, Sparkles, CheckCircle, XCircle, Calendar, Target, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export default function MentorshipHub() {
  const { user, loading: userLoading } = useUserData();
  const queryClient = useQueryClient();
  
  const { data: matches = [], isLoading } = useQuery({
    queryKey: ['mentorMatches', user?.email],
    queryFn: () => base44.entities.MentorMatch.filter({
      $or: [
        { mentor_email: user.email },
        { mentee_email: user.email }
      ]
    }),
    enabled: !!user?.email
  });
  
  const findMatchesMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('aiMentorMatcher', {
        menteeEmail: user.email
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['mentorMatches']);
      toast.success('AI found your ideal mentors!');
    }
  });
  
  const updateStatusMutation = useMutation({
    mutationFn: ({ matchId, status }) => base44.entities.MentorMatch.update(matchId, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries(['mentorMatches']);
      toast.success('Match updated!');
    }
  });
  
  if (userLoading || isLoading) return <LoadingSpinner />;
  
  const asMentor = matches.filter(m => m.mentor_email === user.email);
  const asMentee = matches.filter(m => m.mentee_email === user.email);
  const suggested = matches.filter(m => m.status === 'suggested');
  const active = matches.filter(m => m.status === 'active');
  
  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-int-navy">Mentorship Hub</h1>
          <p className="text-slate-600">AI-powered mentor matching for career growth</p>
        </div>
        {asMentee.length === 0 && (
          <Button
            onClick={() => findMatchesMutation.mutate()}
            disabled={findMatchesMutation.isLoading}
            className="bg-int-orange hover:bg-int-orange-dark"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            {findMatchesMutation.isLoading ? 'Finding Matches...' : 'Find My Mentor'}
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Active Mentorships</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-int-orange">{active.length}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-base">As Mentor</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">{asMentor.length}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-base">As Mentee</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-purple-600">{asMentee.length}</p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="suggested">
        <TabsList>
          <TabsTrigger value="suggested">Suggested Matches ({suggested.length})</TabsTrigger>
          <TabsTrigger value="active">Active ({active.length})</TabsTrigger>
          <TabsTrigger value="as-mentor">Mentoring ({asMentor.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="suggested" className="space-y-4">
          {suggested.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Users className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                <p className="text-slate-600 mb-4">No mentor suggestions yet</p>
                <Button onClick={() => findMatchesMutation.mutate()} className="bg-int-orange">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Find Matches
                </Button>
              </CardContent>
            </Card>
          ) : (
            suggested.map(match => {
              const isMentee = match.mentee_email === user.email;
              const partnerEmail = isMentee ? match.mentor_email : match.mentee_email;
              
              return (
                <Card key={match.id} className="border-l-4 border-l-int-orange">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">{partnerEmail}</CardTitle>
                        <CardDescription>
                          Match Score: {match.match_score}/100
                        </CardDescription>
                      </div>
                      <Badge className="bg-int-orange text-white">
                        <Sparkles className="h-3 w-3 mr-1" />
                        AI Matched
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {match.matching_criteria && (
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          <span>Skill overlap: {Math.round(match.matching_criteria.skill_overlap || 0)}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-blue-500" />
                          <span>{match.matching_criteria.department_alignment ? 'Same dept' : 'Cross-dept'}</span>
                        </div>
                      </div>
                    )}
                    
                    {match.goals?.length > 0 && (
                      <div>
                        <p className="text-sm font-semibold mb-2">Suggested Goals:</p>
                        <ul className="space-y-1">
                          {match.goals.slice(0, 3).map((goal, i) => (
                            <li key={i} className="text-sm flex items-start gap-2">
                              <Target className="h-4 w-4 text-int-orange mt-0.5" />
                              {goal.goal}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {isMentee && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => updateStatusMutation.mutate({ matchId: match.id, status: 'pending' })}
                          className="bg-int-orange hover:bg-int-orange-dark"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Request Mentorship
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateStatusMutation.mutate({ matchId: match.id, status: 'declined' })}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Not Now
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>
        
        <TabsContent value="active" className="space-y-4">
          {active.map(match => {
            const isMentee = match.mentee_email === user.email;
            const partnerEmail = isMentee ? match.mentor_email : match.mentee_email;
            
            return (
              <Card key={match.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base">{partnerEmail}</CardTitle>
                    <Badge variant="outline">Active</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-500">Meetings</p>
                      <p className="font-semibold">{match.total_meetings || 0}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Frequency</p>
                      <p className="font-semibold capitalize">{match.meeting_frequency}</p>
                    </div>
                  </div>
                  
                  {match.goals?.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold mb-2">Goals Progress:</p>
                      {match.goals.map((goal, i) => (
                        <div key={i} className="mb-2">
                          <div className="flex justify-between text-sm mb-1">
                            <span>{goal.goal}</span>
                            <span className="text-slate-500">{goal.progress || 0}%</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-1.5">
                            <div
                              className="h-1.5 rounded-full bg-int-orange"
                              style={{ width: `${goal.progress || 0}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <Button size="sm" variant="outline" className="w-full">
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Meeting
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>
        
        <TabsContent value="as-mentor" className="space-y-4">
          {asMentor.map(match => (
            <Card key={match.id}>
              <CardHeader>
                <CardTitle className="text-base">Mentoring: {match.mentee_email}</CardTitle>
                <CardDescription>
                  Started {match.started_at ? new Date(match.started_at).toLocaleDateString() : 'Recently'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">{match.total_meetings || 0} meetings completed</p>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}