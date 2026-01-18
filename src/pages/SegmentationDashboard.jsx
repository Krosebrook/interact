import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, RefreshCw, Trash2, Mail, MessageSquare } from 'lucide-react';
import SegmentBuilder from '../components/lifecycle/SegmentBuilder';
import { toast } from 'sonner';

export default function SegmentationDashboard() {
  const queryClient = useQueryClient();
  const [showBuilder, setShowBuilder] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState(null);

  const { data: segments, isLoading } = useQuery({
    queryKey: ['user-segments'],
    queryFn: async () => {
      return await base44.entities.UserSegment.list('-created_date');
    },
    initialData: []
  });

  const refreshMutation = useMutation({
    mutationFn: async (segmentId) => {
      const response = await base44.functions.invoke('segmentationEngine', {
        action: 'calculate_segment',
        segment_id: segmentId
      });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user-segments'] });
      toast.success(`Segment refreshed: ${data.user_count} users`);
    }
  });

  const deleteSegmentMutation = useMutation({
    mutationFn: async (segmentId) => {
      return await base44.entities.UserSegment.delete(segmentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-segments'] });
      toast.success('Segment deleted');
    }
  });

  const viewUsersMutation = useMutation({
    mutationFn: async (segmentId) => {
      const response = await base44.functions.invoke('segmentationEngine', {
        action: 'get_segment_users',
        segment_id: segmentId
      });
      return response.data;
    },
    onSuccess: (data) => {
      setSelectedSegment(data);
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="w-8 h-8 text-purple-600" />
            User Segmentation
          </h1>
          <p className="text-slate-600 mt-1">Create and manage targeted user segments</p>
        </div>
        <Button onClick={() => setShowBuilder(!showBuilder)} className="bg-purple-600 hover:bg-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          New Segment
        </Button>
      </div>

      {showBuilder && (
        <SegmentBuilder
          onSuccess={() => setShowBuilder(false)}
          onCancel={() => setShowBuilder(false)}
        />
      )}

      <div className="grid gap-4">
        {segments.map(segment => (
          <Card key={segment.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    {segment.segment_name}
                    <Badge className="bg-purple-600">{segment.user_count || 0} users</Badge>
                  </CardTitle>
                  <p className="text-sm text-slate-600 mt-1">{segment.description}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => refreshMutation.mutate(segment.id)}
                    disabled={refreshMutation.isPending}
                  >
                    <RefreshCw className={`w-4 h-4 ${refreshMutation.isPending ? 'animate-spin' : ''}`} />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteSegmentMutation.mutate(segment.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {segment.criteria?.lifecycle_states?.map(state => (
                    <Badge key={state} variant="outline" className="capitalize">
                      {state.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>

                <div className="grid grid-cols-4 gap-3 text-sm">
                  <div>
                    <p className="text-slate-600">Churn Risk</p>
                    <p className="font-semibold">
                      {segment.criteria?.churn_risk_min || 0}% - {segment.criteria?.churn_risk_max || 100}%
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-600">Days in State</p>
                    <p className="font-semibold">
                      {segment.criteria?.days_in_state_min || 0} - {segment.criteria?.days_in_state_max || 365}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-600">Last Updated</p>
                    <p className="font-semibold">
                      {segment.last_calculated 
                        ? new Date(segment.last_calculated).toLocaleDateString()
                        : 'Never'}
                    </p>
                  </div>
                  <div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => viewUsersMutation.mutate(segment.id)}
                      className="w-full"
                    >
                      View Users
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {segments.length === 0 && !isLoading && (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600">No segments created yet</p>
              <Button onClick={() => setShowBuilder(true)} className="mt-4">
                Create Your First Segment
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {selectedSegment && (
        <Card className="border-2 border-purple-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Segment Users ({selectedSegment.users.length})</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setSelectedSegment(null)}>
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {selectedSegment.users.map((user, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium">{user.email}</p>
                    <p className="text-xs text-slate-600">
                      {user.lifecycle_state} • Churn Risk: {user.churn_risk}%
                    </p>
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