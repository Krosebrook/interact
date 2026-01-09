import React, { useState } from 'react';
import { useUserData } from '../components/hooks/useUserData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, Trophy, MessageCircle, Users } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import RecognitionFeed from '../components/social/RecognitionFeed';
import TeamChallengeLeaderboard from '../components/teams/TeamChallengeLeaderboard';
import ChannelDiscussion from '../components/channels/ChannelDiscussion';
import BuddyMatchingDashboard from '../components/social/BuddyMatchingDashboard';
import { Card } from '@/components/ui/card';

export default function SocialHub() {
  const { user, loading } = useUserData(true);
  const [activeTab, setActiveTab] = useState('feed');
  const [selectedChannel, setSelectedChannel] = useState(null);

  if (loading) {
    return <LoadingSpinner className="min-h-[60vh]" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-int-navy mb-2">Social Hub</h1>
        <p className="text-slate-600">Connect, collaborate, and celebrate with your team</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="feed" className="gap-2">
            <Heart className="h-4 w-4" />
            Recognition
          </TabsTrigger>
          <TabsTrigger value="challenges" className="gap-2">
            <Trophy className="h-4 w-4" />
            Challenges
          </TabsTrigger>
          <TabsTrigger value="channels" className="gap-2">
            <MessageCircle className="h-4 w-4" />
            Channels
          </TabsTrigger>
          <TabsTrigger value="buddies" className="gap-2">
            <Users className="h-4 w-4" />
            Buddies
          </TabsTrigger>
        </TabsList>

        <TabsContent value="feed" className="mt-6">
          <RecognitionFeed userEmail={user.email} />
        </TabsContent>

        <TabsContent value="challenges" className="mt-6">
          <TeamChallengeLeaderboard />
        </TabsContent>

        <TabsContent value="channels" className="mt-6">
          {selectedChannel ? (
            <ChannelDiscussion 
              channelId={selectedChannel} 
              userEmail={user.email}
            />
          ) : (
            <Card className="p-12 text-center">
              <p className="text-slate-500">Select a channel to start chatting</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="buddies" className="mt-6">
          <BuddyMatchingDashboard userEmail={user.email} />
        </TabsContent>
      </Tabs>
    </div>
  );
}