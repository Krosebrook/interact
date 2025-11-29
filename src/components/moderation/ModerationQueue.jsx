import React, { useState, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Shield, Flag, Sparkles, Loader2, Eye, MessageSquare } from 'lucide-react';
import ModerationItem from './ModerationItem';
import { useModerationActions } from './hooks/useModerationActions';

/**
 * Moderation queue component for reviewing user-generated content
 * Provides AI-powered analysis and batch scanning capabilities
 */
export default function ModerationQueue({ currentUser }) {
  const [activeTab, setActiveTab] = useState('flagged');
  const [selectedItem, setSelectedItem] = useState(null);
  const [moderationNote, setModerationNote] = useState('');
  const [aiAnalyzing, setAiAnalyzing] = useState(false);

  const { moderateMutation, analyzeContent } = useModerationActions(currentUser);

  // Queries with consistent configuration
  const queryConfig = { staleTime: 30000 };

  const { data: flaggedItems = [], isLoading: loadingFlagged } = useQuery({
    queryKey: ['recognitions-flagged'],
    queryFn: () => base44.entities.Recognition.filter({ status: 'flagged' }, '-created_date'),
    ...queryConfig
  });

  const { data: pendingItems = [], isLoading: loadingPending } = useQuery({
    queryKey: ['recognitions-pending'],
    queryFn: () => base44.entities.Recognition.filter({ status: 'pending' }, '-created_date'),
    ...queryConfig
  });

  const { data: recentItems = [], isLoading: loadingRecent } = useQuery({
    queryKey: ['recognitions-recent'],
    queryFn: () => base44.entities.Recognition.filter({ status: 'approved' }, '-created_date', 20),
    ...queryConfig
  });

  // Handlers
  const handleApprove = useCallback((id, notes = 'Approved by moderator') => {
    moderateMutation.mutate({ id, action: 'approve', notes });
    setSelectedItem(null);
    setModerationNote('');
  }, [moderateMutation]);

  const handleReject = useCallback((id, notes = 'Rejected by moderator') => {
    moderateMutation.mutate({ id, action: 'reject', notes: moderationNote || notes });
    setSelectedItem(null);
    setModerationNote('');
  }, [moderateMutation, moderationNote]);

  const handleAIAnalyze = useCallback(async (item) => {
    setAiAnalyzing(true);
    try {
      const result = await analyzeContent(item);
      toast.success(result.is_safe ? 'Content appears safe' : 'Content flagged for review');
    } catch (error) {
      toast.error('AI analysis failed');
    } finally {
      setAiAnalyzing(false);
    }
  }, [analyzeContent]);

  const handleBulkScan = useCallback(async () => {
    setAiAnalyzing(true);
    toast.info('Scanning recent recognitions...');
    
    const itemsToScan = recentItems.filter(item => !item.ai_flag_reason).slice(0, 10);
    let flaggedCount = 0;

    for (const item of itemsToScan) {
      try {
        const result = await analyzeContent(item);
        if (result && !result.is_safe) flaggedCount++;
      } catch (e) {
        console.error('Scan error:', e);
      }
    }

    setAiAnalyzing(false);
    toast.success(`Scan complete. ${flaggedCount} item(s) flagged.`);
  }, [recentItems, analyzeContent]);

  // Get items for current tab
  const items = { flagged: flaggedItems, pending: pendingItems, recent: recentItems }[activeTab] || [];
  const isLoading = loadingFlagged || loadingPending || loadingRecent;

  return (
    <Card className="glass-card-solid">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-int-navy" />
            Content Moderation
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleBulkScan}
            disabled={aiAnalyzing}
            className="text-purple-600 border-purple-200 hover:bg-purple-50"
          >
            {aiAnalyzing ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-1" />
            )}
            AI Scan Recent
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="flagged" className="gap-2">
              <Flag className="h-4 w-4" />
              Flagged
              {flaggedItems.length > 0 && (
                <Badge variant="destructive" className="ml-1">{flaggedItems.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="pending" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Pending
              {pendingItems.length > 0 && (
                <Badge variant="secondary" className="ml-1">{pendingItems.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="recent" className="gap-2">
              <Eye className="h-4 w-4" />
              Recent
            </TabsTrigger>
          </TabsList>

          <div className="space-y-3">
            {isLoading ? (
              <LoadingState />
            ) : items.length === 0 ? (
              <EmptyState />
            ) : (
              items.map(item => (
                <ModerationItem
                  key={item.id}
                  item={item}
                  isSelected={selectedItem?.id === item.id}
                  moderationNote={moderationNote}
                  onNoteChange={setModerationNote}
                  onSelectItem={setSelectedItem}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onAnalyze={handleAIAnalyze}
                  isAnalyzing={aiAnalyzing}
                  isModerating={moderateMutation.isLoading}
                />
              ))
            )}
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function LoadingState() {
  return (
    <div className="text-center py-8 text-slate-500">
      <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin text-int-orange" />
      Loading...
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-8 text-slate-500">
      <Shield className="h-12 w-12 mx-auto mb-2 text-slate-300" />
      <p>No items in this queue</p>
    </div>
  );
}