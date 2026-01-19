import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function AdvancedSegmentBuilder({ onSegmentCreated }) {
  const queryClient = useQueryClient();
  const [segmentData, setSegmentData] = useState({
    segment_name: '',
    display_name: '',
    description: '',
    is_dynamic: true
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.UserSegment.create({
        ...data,
        criteria: { logic_operator: 'AND', conditions: [] },
        auto_recalculate_frequency: 'daily'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['user-segments']);
      if (onSegmentCreated) onSegmentCreated();
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Segment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Segment Name</label>
          <Input
            placeholder="e.g., high_value_users"
            value={segmentData.segment_name}
            onChange={(e) => setSegmentData({...segmentData, segment_name: e.target.value})}
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">Display Name</label>
          <Input
            placeholder="e.g., High Value Users"
            value={segmentData.display_name}
            onChange={(e) => setSegmentData({...segmentData, display_name: e.target.value})}
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">Description</label>
          <Textarea
            placeholder="Describe this segment..."
            value={segmentData.description}
            onChange={(e) => setSegmentData({...segmentData, description: e.target.value})}
          />
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onSegmentCreated}>Cancel</Button>
          <Button onClick={() => createMutation.mutate(segmentData)}>Create Segment</Button>
        </div>
      </CardContent>
    </Card>
  );
}