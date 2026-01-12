import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Target, 
  Sparkles, 
  RefreshCw, 
  Calendar,
  Flame,
  Trophy,
  Plus,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import PersonalChallengeCard from './PersonalChallengeCard';
import { SocialShareDialog } from './SocialShareCard';
import LoadingSpinner from '../common/LoadingSpinner';

export default function PersonalChallengesSection({ userEmail }) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('active');
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareChallenge, setShareChallenge] = useState(null);

  const { data: challenges = [], isLoading } = useQuery({
    queryKey: ['personal-challenges', userEmail],
    queryFn: () => base44.entities.PersonalChallenge.filter({ user_email: userEmail }, '-created_date'),
    enabled: !!userEmail
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      // Generate AI-personalized challenges
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate 3 personalized engagement challenges for an employee. Make them achievable but motivating.
        Return JSON with this structure:
        {
          "challenges": [
            {
              "title": "string",
              "description": "string",
              "challenge_type": "daily|weekly|milestone|streak|social|skill",
              "difficulty": "easy|medium|hard",
              "target_metric": "events_attended|feedback_submitted|recognitions_given|recognitions_received|streak_days",
              "target_value": number,
              "points_reward": number (50-200)
            }
          ]
        }`,
        response_json_schema: {
          type: "object",
          properties: {
            challenges: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  challenge_type: { type: "string" },
                  difficulty: { type: "string" },
                  target_metric: { type: "string" },
                  target_value: { type: "number" },
                  points_reward: { type: "number" }
                }
              }
            }
          }
        }
      });

      const generatedChallenges = response.challenges || [];
      
      // Create the challenges
      for (const challenge of generatedChallenges) {
        const endDate = new Date();
        if (challenge.challenge_type === 'daily') {
          endDate.setDate(endDate.getDate() + 1);
        } else if (challenge.challenge_type === 'weekly') {
          endDate.setDate(endDate.getDate() + 7);
        } else {
          endDate.setDate(endDate.getDate() + 30);
        }

        await base44.entities.PersonalChallenge.create({
          user_email: userEmail,
          ...challenge,
          current_progress: 0,
          status: 'active',
          start_date: new Date().toISOString(),
          end_date: endDate.toISOString(),
          is_ai_generated: true
        });
      }
      
      return generatedChallenges;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['personal-challenges']);
      toast.success(`${data.length} new challenges generated!`);
    },
    onError: () => {
      toast.error('Failed to generate challenges');
    }
  });

  const handleShare = (challenge) => {
    setShareChallenge(challenge);
    setShareDialogOpen(true);
  };

  const handleShareSubmit = async (platform) => {
    if (!shareChallenge) return;
    
    await base44.entities.SocialShare.create({
      user_email: userEmail,
      share_type: 'challenge_completed',
      reference_id: shareChallenge.id,
      share_data: {
        title: shareChallenge.title,
        description: `I completed the "${shareChallenge.title}" challenge!`,
        icon: '🎯',
        value: `+${shareChallenge.points_reward} points`
      },
      platforms: [platform],
      visibility: 'public',
      reactions: { likes: 0, celebrates: 0, inspired: 0 }
    });
  };

  const activeChallenges = challenges.filter(c => c.status === 'active');
  const completedChallenges = challenges.filter(c => c.status === 'completed');
  const dailyChallenges = activeChallenges.filter(c => c.challenge_type === 'daily');
  const weeklyChallenges = activeChallenges.filter(c => c.challenge_type === 'weekly');
  const otherChallenges = activeChallenges.filter(c => !['daily', 'weekly'].includes(c.challenge_type));

  if (isLoading) {
    return <LoadingSpinner data-b44-sync="true" data-feature="gamification" data-component="personalchallengessection" message="Loading challenges..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-600" />
              Personal Challenges
            </CardTitle>
            <Button
              onClick={() => generateMutation.mutate()}
              disabled={generateMutation.isPending}
              size="sm"
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
            >
              {generateMutation.isPending ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              Generate New
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-white rounded-xl shadow-sm">
              <div className="text-2xl font-bold text-purple-600">{activeChallenges.length}</div>
              <div className="text-xs text-slate-500">Active</div>
            </div>
            <div className="p-3 bg-white rounded-xl shadow-sm">
              <div className="text-2xl font-bold text-emerald-600">{completedChallenges.length}</div>
              <div className="text-xs text-slate-500">Completed</div>
            </div>
            <div className="p-3 bg-white rounded-xl shadow-sm">
              <div className="text-2xl font-bold text-int-orange">
                {completedChallenges.reduce((sum, c) => sum + (c.points_reward || 0), 0)}
              </div>
              <div className="text-xs text-slate-500">Points Earned</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Challenges Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white border">
          <TabsTrigger value="active" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700">
            <Target className="h-4 w-4 mr-2" />
            Active ({activeChallenges.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-700">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Completed ({completedChallenges.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-6 mt-4">
          {/* Daily Challenges */}
          {dailyChallenges.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-600 mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Daily Challenges
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dailyChallenges.map(challenge => (
                  <PersonalChallengeCard 
                    key={challenge.id} 
                    challenge={challenge}
                    onShare={handleShare}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Weekly Challenges */}
          {weeklyChallenges.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-600 mb-3 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Weekly Challenges
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {weeklyChallenges.map(challenge => (
                  <PersonalChallengeCard 
                    key={challenge.id} 
                    challenge={challenge}
                    onShare={handleShare}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Other Challenges */}
          {otherChallenges.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-600 mb-3 flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                Special Challenges
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {otherChallenges.map(challenge => (
                  <PersonalChallengeCard 
                    key={challenge.id} 
                    challenge={challenge}
                    onShare={handleShare}
                  />
                ))}
              </div>
            </div>
          )}

          {activeChallenges.length === 0 && (
            <div className="text-center py-12">
              <Target className="h-12 w-12 mx-auto mb-4 text-slate-300" />
              <p className="text-slate-500 mb-4">No active challenges</p>
              <Button
                onClick={() => generateMutation.mutate()}
                disabled={generateMutation.isPending}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Personalized Challenges
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-4">
          {completedChallenges.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {completedChallenges.map(challenge => (
                <PersonalChallengeCard 
                  key={challenge.id} 
                  challenge={challenge}
                  onShare={handleShare}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Trophy className="h-12 w-12 mx-auto mb-4 text-slate-300" />
              <p className="text-slate-500">No completed challenges yet</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Share Dialog */}
      <SocialShareDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        shareType="challenge_completed"
        shareData={{
          title: shareChallenge?.title,
          description: `Completed the "${shareChallenge?.title}" challenge!`,
          icon: '🎯',
          value: `+${shareChallenge?.points_reward || 0} points`
        }}
        onShare={handleShareSubmit}
      />
    </div>
  );
}