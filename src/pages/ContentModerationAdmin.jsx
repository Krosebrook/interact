import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useUserData } from '@/components/hooks/useUserData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import FlaggedContentCard from '@/components/moderation/FlaggedContentCard';
import AppealWorkflow from '@/components/moderation/AppealWorkflow';
import { AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function ContentModerationAdmin() {
  const { user, loading: userLoading } = useUserData(true, true);
  const [selectedTab, setSelectedTab] = useState('pending');
  const queryClient = useQueryClient();

  const { data: allFlags, isLoading: flagsLoading } = useQuery({
    queryKey: ['content-flags'],
    queryFn: () => base44.entities.ContentFlag.list('-created_date', 500),
  });

  const { data: allAppeals, isLoading: appealsLoading } = useQuery({
    queryKey: ['content-appeals'],
    queryFn: () => base44.entities.ContentFlag.filter({ appeal_status: 'pending' }),
  });

  const moderateMutation = useMutation({
    mutationFn: async ({ flagId, action, notes }) => {
      return await base44.entities.ContentFlag.update(flagId, {
        status: 'reviewed',
        reviewed_by: user.email,
        reviewed_date: new Date().toISOString(),
        admin_action: action,
        admin_notes: notes,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['content-flags']);
      toast.success('Content moderation action completed');
    },
    onError: () => {
      toast.error('Failed to process moderation action');
    },
  });

  const handleAppealDecision = useMutation({
    mutationFn: async ({ flagId, decision, notes }) => {
      return await base44.entities.ContentFlag.update(flagId, {
        appeal_status: decision,
        reviewed_by: user.email,
        reviewed_date: new Date().toISOString(),
        admin_notes: notes,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['content-flags']);
      toast.success('Appeal decision recorded');
    },
  });

  if (userLoading || flagsLoading || appealsLoading) {
    return <LoadingSpinner message="Loading moderation queue..." />;
  }

  const pendingFlags = allFlags?.filter(f => f.status === 'pending') || [];
  const reviewedFlags = allFlags?.filter(f => f.status === 'reviewed') || [];
  const resolvedFlags = allFlags?.filter(f => f.status === 'resolved') || [];
  const dismissedFlags = allFlags?.filter(f => f.status === 'dismissed') || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Content Moderation</h1>
        <p className="text-slate-600 mt-1">Review and manage flagged content</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Pending Review</p>
                <p className="text-3xl font-bold text-slate-900">{pendingFlags.length}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Reviewed</p>
                <p className="text-3xl font-bold text-slate-900">{reviewedFlags.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Resolved</p>
                <p className="text-3xl font-bold text-slate-900">{resolvedFlags.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Appeals Pending</p>
                <p className="text-3xl font-bold text-slate-900">{allAppeals?.length || 0}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Moderation Queue */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({pendingFlags.length})
          </TabsTrigger>
          <TabsTrigger value="appeals">
            Appeals ({allAppeals?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="reviewed">
            Reviewed ({reviewedFlags.length})
          </TabsTrigger>
          <TabsTrigger value="resolved">
            Resolved ({resolvedFlags.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingFlags.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-slate-500">
                <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
                <p>No pending flags! Queue is clear.</p>
              </CardContent>
            </Card>
          ) : (
            pendingFlags.map(flag => (
              <FlaggedContentCard
                key={flag.id}
                flag={flag}
                onAction={(action, notes) => moderateMutation.mutate({ flagId: flag.id, action, notes })}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="appeals" className="space-y-4">
          {allAppeals?.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-slate-500">
                <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
                <p>No pending appeals.</p>
              </CardContent>
            </Card>
          ) : (
            allAppeals?.map(flag => (
              <AppealWorkflow
                key={flag.id}
                flag={flag}
                onDecision={(decision, notes) => handleAppealDecision.mutate({ flagId: flag.id, decision, notes })}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="reviewed" className="space-y-4">
          {reviewedFlags.map(flag => (
            <FlaggedContentCard key={flag.id} flag={flag} readOnly />
          ))}
        </TabsContent>

        <TabsContent value="resolved" className="space-y-4">
          {resolvedFlags.map(flag => (
            <FlaggedContentCard key={flag.id} flag={flag} readOnly />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}