import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUserData } from '../components/hooks/useUserData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import RecognitionForm from '../components/recognition/RecognitionForm';
import RecognitionCard from '../components/recognition/RecognitionCard';
import ModerationQueue from '../components/moderation/ModerationQueue';
import { toast } from 'sonner';
import {
  Heart,
  Send,
  Star,
  TrendingUp,
  Shield,
  Award,
  Users,
  Sparkles
} from 'lucide-react';

export default function RecognitionPage() {
  const queryClient = useQueryClient();
  const { user, loading, isAdmin } = useUserData(true);
  const [activeTab, setActiveTab] = useState('feed');
  const [showForm, setShowForm] = useState(false);

  // Fetch public recognitions
  const { data: recognitions = [], isLoading: loadingRecognitions } = useQuery({
    queryKey: ['recognitions'],
    queryFn: () => base44.entities.Recognition.filter({ 
      status: 'approved',
      visibility: 'public' 
    }, '-created_date', 50)
  });

  // Fetch featured recognitions
  const { data: featuredRecognitions = [] } = useQuery({
    queryKey: ['recognitions-featured'],
    queryFn: () => base44.entities.Recognition.filter({ 
      is_featured: true,
      status: 'approved'
    }, '-featured_at', 5)
  });

  // Fetch user's received recognitions
  const { data: myRecognitions = [] } = useQuery({
    queryKey: ['my-recognitions', user?.email],
    queryFn: () => base44.entities.Recognition.filter({ 
      recipient_email: user?.email,
      status: 'approved'
    }, '-created_date'),
    enabled: !!user?.email
  });

  // Fetch user's sent recognitions
  const { data: sentRecognitions = [] } = useQuery({
    queryKey: ['sent-recognitions', user?.email],
    queryFn: () => base44.entities.Recognition.filter({ 
      sender_email: user?.email 
    }, '-created_date'),
    enabled: !!user?.email
  });

  // React to recognition
  const reactMutation = useMutation({
    mutationFn: async ({ recognitionId, emoji }) => {
      const recognition = recognitions.find(r => r.id === recognitionId);
      if (!recognition) return;

      let newReactions = [...(recognition.reactions || [])];
      const existingIdx = newReactions.findIndex(r => r.user_email === user.email);
      
      if (existingIdx >= 0) {
        if (newReactions[existingIdx].emoji === emoji) {
          newReactions.splice(existingIdx, 1); // Remove reaction
        } else {
          newReactions[existingIdx].emoji = emoji; // Change reaction
        }
      } else {
        newReactions.push({ emoji, user_email: user.email });
      }

      return base44.entities.Recognition.update(recognitionId, { reactions: newReactions });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['recognitions']);
    }
  });

  // Feature recognition (admin only)
  const featureMutation = useMutation({
    mutationFn: async (recognitionId) => {
      // Double-check admin permission
      if (!isAdmin) {
        throw new Error('Unauthorized - admin access required');
      }
      return base44.entities.Recognition.update(recognitionId, {
        is_featured: true,
        featured_by: user.email,
        featured_at: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['recognitions']);
      queryClient.invalidateQueries(['recognitions-featured']);
      toast.success('Recognition featured!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to feature recognition');
    }
  });

  // Stats
  const totalReceived = myRecognitions.length;
  const totalSent = sentRecognitions.length;
  const totalPoints = myRecognitions.reduce((sum, r) => sum + (r.points_awarded || 0), 0);

  if (loading) {
    return <LoadingSpinner className="min-h-[60vh]" />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="glass-panel-solid">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-int-navy font-display flex items-center gap-2">
              <Heart className="h-8 w-8 text-int-orange" />
              Recognition Wall
            </h1>
            <p className="text-slate-600 mt-1">
              Celebrate your teammates and spread positivity
            </p>
          </div>

          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-int-orange hover:bg-int-orange/90 text-slate-900 font-semibold"
          >
            <Send className="h-4 w-4 mr-2" />
            Give Recognition
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center gap-2 text-slate-600 text-sm font-medium">
              <Award className="h-4 w-4" />
              Received
            </div>
            <div className="text-2xl font-bold text-int-navy">{totalReceived}</div>
          </div>
          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center gap-2 text-slate-600 text-sm font-medium">
              <Send className="h-4 w-4" />
              Sent
            </div>
            <div className="text-2xl font-bold text-int-navy">{totalSent}</div>
          </div>
          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center gap-2 text-slate-600 text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              Points Earned
            </div>
            <div className="text-2xl font-bold text-int-orange">{totalPoints}</div>
          </div>
          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center gap-2 text-slate-600 text-sm font-medium">
              <TrendingUp className="h-4 w-4" />
              This Month
            </div>
            <div className="text-2xl font-bold text-green-600">
              {recognitions.filter(r => {
                const date = new Date(r.created_date);
                const now = new Date();
                return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
              }).length}
            </div>
          </div>
        </div>
      </div>

      {/* Recognition Form (collapsible) */}
      {showForm && (
        <RecognitionForm 
          currentUser={user} 
          onSuccess={() => setShowForm(false)}
        />
      )}

      {/* Featured Recognitions */}
      {featuredRecognitions.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-int-navy flex items-center gap-2">
            <Star className="h-5 w-5 text-amber-500" />
            Featured Recognitions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featuredRecognitions.map(recognition => (
              <RecognitionCard
                key={recognition.id}
                recognition={recognition}
                currentUserEmail={user?.email}
                onReact={(id, emoji) => reactMutation.mutate({ recognitionId: id, emoji })}
                isAdmin={isAdmin}
              />
            ))}
          </div>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="feed" className="gap-2">
            <Users className="h-4 w-4" />
            Public Feed
          </TabsTrigger>
          <TabsTrigger value="received" className="gap-2">
            <Award className="h-4 w-4" />
            Received
            {totalReceived > 0 && <Badge variant="secondary">{totalReceived}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="sent" className="gap-2">
            <Send className="h-4 w-4" />
            Sent
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="moderation" className="gap-2">
              <Shield className="h-4 w-4" />
              Moderation
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="feed" className="space-y-4 mt-4">
          {loadingRecognitions ? (
            <LoadingSpinner />
          ) : recognitions.length === 0 ? (
            <EmptyState
              icon={Heart}
              title="No recognitions yet"
              description="Be the first to spread some positivity! Recognize a teammate for their great work."
              actionLabel="Give Recognition"
              onAction={() => setShowForm(true)}
              type="orange"
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {recognitions.map(recognition => (
                <RecognitionCard
                  key={recognition.id}
                  recognition={recognition}
                  currentUserEmail={user?.email}
                  onReact={(id, emoji) => reactMutation.mutate({ recognitionId: id, emoji })}
                  onFeature={(id) => featureMutation.mutate(id)}
                  isAdmin={isAdmin}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="received" className="space-y-4 mt-4">
          {myRecognitions.length === 0 ? (
            <EmptyState
              icon={Award}
              title="No recognitions received yet"
              description="Keep up the great work and they'll come! In the meantime, why not recognize a teammate?"
              actionLabel="Give Recognition"
              onAction={() => setShowForm(true)}
              type="default"
              compact
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {myRecognitions.map(recognition => (
                <RecognitionCard
                  key={recognition.id}
                  recognition={recognition}
                  currentUserEmail={user?.email}
                  onReact={(id, emoji) => reactMutation.mutate({ recognitionId: id, emoji })}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="sent" className="space-y-4 mt-4">
          {sentRecognitions.length === 0 ? (
            <EmptyState
              icon={Send}
              title="You haven't sent any recognitions yet"
              description="Spread some positivity! Recognize a teammate for their great work."
              actionLabel="Give Recognition"
              onAction={() => setShowForm(true)}
              type="default"
              compact
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {sentRecognitions.map(recognition => (
                <RecognitionCard
                  key={recognition.id}
                  recognition={recognition}
                  currentUserEmail={user?.email}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {isAdmin && (
          <TabsContent value="moderation" className="mt-4">
            <ModerationQueue currentUser={user} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}