import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Plus, Sparkles, Zap } from 'lucide-react';
import AdvancedSegmentBuilder from '../components/segmentation/AdvancedSegmentBuilder';
import AISegmentSuggestions from '../components/segmentation/AISegmentSuggestions';
import AutoCampaignManager from '../components/segmentation/AutoCampaignManager';
import SegmentPredictions from '../components/segmentation/SegmentPredictions';

export default function UserSegmentation() {
  const queryClient = useQueryClient();
  const [showBuilder, setShowBuilder] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState(null);

  const { data: segments, isLoading } = useQuery({
    queryKey: ['user-segments'],
    queryFn: async () => {
      return await base44.entities.UserSegment.filter({ is_active: true }, '-created_date');
    },
    initialData: []
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="w-8 h-8 text-blue-600" />
            User Segmentation
          </h1>
          <p className="text-slate-600 mt-1">AI-powered user segments for targeted campaigns</p>
        </div>
        <Button onClick={() => setShowBuilder(!showBuilder)}>
          <Plus className="w-4 h-4 mr-2" />
          New Segment
        </Button>
      </div>

      {/* Builder */}
      {showBuilder && (
        <AdvancedSegmentBuilder onSegmentCreated={() => setShowBuilder(false)} />
      )}

      {/* AI Features */}
      <Tabs defaultValue="segments">
        <TabsList>
          <TabsTrigger value="segments">My Segments</TabsTrigger>
          <TabsTrigger value="ai-suggestions">
            <Sparkles className="w-4 h-4 mr-2" />
            AI Suggestions
          </TabsTrigger>
          <TabsTrigger value="auto-campaigns">
            <Zap className="w-4 h-4 mr-2" />
            Auto-Campaigns
          </TabsTrigger>
        </TabsList>

        <TabsContent value="segments" className="space-y-4">
          {segments.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-slate-500">
                No segments yet. Create one to get started or check AI Suggestions.
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 space-y-4">
                {segments.map(segment => (
                  <Card 
                    key={segment.id}
                    className={`cursor-pointer transition-all ${
                      selectedSegment === segment.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => setSelectedSegment(segment.id)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">
                            {segment.display_name || segment.segment_name}
                          </CardTitle>
                          <p className="text-sm text-slate-600 mt-1">{segment.description}</p>
                        </div>
                        <Badge variant="outline">
                          {segment.user_count || 0} users
                        </Badge>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>

              {/* Predictions Panel */}
              <div className="lg:col-span-1">
                {selectedSegment ? (
                  <SegmentPredictions 
                    segmentId={selectedSegment}
                    segmentName={segments.find(s => s.id === selectedSegment)?.display_name}
                  />
                ) : (
                  <Card>
                    <CardContent className="py-12 text-center text-slate-500 text-sm">
                      Select a segment to view AI predictions
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="ai-suggestions">
          <AISegmentSuggestions />
        </TabsContent>

        <TabsContent value="auto-campaigns">
          <AutoCampaignManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}