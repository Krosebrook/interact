import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '../components/auth/AuthProvider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Plus, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ChallengeCard from '../components/challenges/ChallengeCard';
import CreateChallengeDialog from '../components/challenges/CreateChallengeDialog';
import ChallengeLeaderboard from '../components/challenges/ChallengeLeaderboard';
import MyChallenges from '../components/challenges/MyChallenges';

export default function Challenges() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('active');
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const { data: challenges = [], isLoading } = useQuery({
    queryKey: ['challenges'],
    queryFn: () => base44.entities.Challenge.list('-created_date', 100)
  });

  const { data: myParticipations = [] } = useQuery({
    queryKey: ['my-participations', user?.email],
    queryFn: () => base44.entities.ChallengeParticipation.filter({ user_email: user?.email }),
    enabled: !!user?.email
  });

  if (isLoading) return <LoadingSpinner message="Loading challenges..." />;

  const activeChallenges = challenges.filter(c => c.status === 'active');
  const completedChallenges = challenges.filter(c => c.status === 'completed');
  const myChallengeIds = myParticipations.map(p => p.challenge_id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-int-navy flex items-center gap-3">
            <Trophy className="h-8 w-8 text-int-orange" />
            Skill Challenges
          </h1>
          <p className="text-slate-600 mt-1">Participate in challenges to earn points and badges</p>
        </div>
        {user?.role === 'admin' && (
          <Button onClick={() => setShowCreateDialog(true)} className="bg-int-orange hover:bg-[#C46322]">
            <Plus className="h-4 w-4 mr-2" />
            Create Challenge
          </Button>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="active">
            <Zap className="h-4 w-4 mr-2" />
            Active ({activeChallenges.length})
          </TabsTrigger>
          <TabsTrigger value="my-challenges">
            My Challenges ({myChallengeIds.length})
          </TabsTrigger>
          <TabsTrigger value="leaderboard">
            <Trophy className="h-4 w-4 mr-2" />
            Leaderboard
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedChallenges.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6">
          <div className="grid md:grid-cols-2 gap-4">
            {activeChallenges.map(challenge => (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                isParticipating={myChallengeIds.includes(challenge.id)}
                userEmail={user?.email}
              />
            ))}
          </div>
          {activeChallenges.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Trophy className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                <p className="text-slate-600">No active challenges</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="my-challenges" className="mt-6">
          <MyChallenges
            participations={myParticipations}
            challenges={challenges}
          />
        </TabsContent>

        <TabsContent value="leaderboard" className="mt-6">
          <ChallengeLeaderboard challenges={activeChallenges} />
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          <div className="grid md:grid-cols-2 gap-4">
            {completedChallenges.map(challenge => (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                isParticipating={myChallengeIds.includes(challenge.id)}
                userEmail={user?.email}
                readOnly
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Dialog */}
      <CreateChallengeDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </div>
  );
}