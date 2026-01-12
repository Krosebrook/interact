import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  Shield, 
  AlertTriangle, 
  Check, 
  X, 
  Flag, 
  Sparkles,
  Loader2,
  RefreshCw,
  Eye,
  MessageSquare
} from 'lucide-react';

const FLAG_REASONS = {
  inappropriate: { label: 'Inappropriate Content', severity: 'high', color: 'text-red-600' },
  spam: { label: 'Spam/Promotional', severity: 'medium', color: 'text-orange-600' },
  bias: { label: 'Potential Bias', severity: 'medium', color: 'text-yellow-600' },
  low_quality: { label: 'Low Quality', severity: 'low', color: 'text-slate-600' },
  needs_review: { label: 'Needs Human Review', severity: 'medium', color: 'text-blue-600' }
};

export default function ModerationQueue({ currentUser }) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('flagged');
  const [selectedItem, setSelectedItem] = useState(null);
  const [moderationNote, setModerationNote] = useState('');
  const [aiAnalyzing, setAiAnalyzing] = useState(false);

  // Fetch flagged and pending recognitions
  const { data: flaggedItems = [], isLoading: loadingFlagged } = useQuery({
    queryKey: ['recognitions-flagged'],
    queryFn: () => base44.entities.Recognition.filter({ status: 'flagged' }, '-created_date')
  });

  const { data: pendingItems = [], isLoading: loadingPending } = useQuery({
    queryKey: ['recognitions-pending'],
    queryFn: () => base44.entities.Recognition.filter({ status: 'pending' }, '-created_date')
  });

  const { data: recentItems = [], isLoading: loadingRecent } = useQuery({
    queryKey: ['recognitions-recent'],
    queryFn: () => base44.entities.Recognition.filter({ status: 'approved' }, '-created_date', 20)
  });

  // Moderate mutation
  const moderateMutation = useMutation({
    mutationFn: async ({ id, action, notes }) => {
      const status = action === 'approve' ? 'approved' : 'rejected';
      return base44.entities.Recognition.update(id, {
        status,
        moderation_notes: notes,
        moderated_by: currentUser.email,
        moderated_at: new Date().toISOString()
      });
    },
    onSuccess: (_, { action }) => {
      queryClient.invalidateQueries(['recognitions-flagged']);
      queryClient.invalidateQueries(['recognitions-pending']);
      queryClient.invalidateQueries(['recognitions-recent']);
      toast.success(action === 'approve' ? 'Recognition approved' : 'Recognition rejected');
      setSelectedItem(null);
      setModerationNote('');
    }
  });

  // AI analysis for a single item
  const analyzeWithAI = async (recognition) => {
    setAiAnalyzing(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this workplace recognition message for potential issues:

From: ${recognition.sender_name}
To: ${recognition.recipient_name}
Category: ${recognition.category}
Message: "${recognition.message}"

Check for:
1. Inappropriate language or content
2. Spam or promotional content
3. Potential bias (gender, racial, age-related)
4. Low quality or generic messages
5. Any policy violations

Provide analysis as JSON:
{
  "is_safe": boolean,
  "flag_reason": "inappropriate|spam|bias|low_quality|needs_review|none",
  "confidence": number (0-1),
  "explanation": "brief explanation",
  "suggestion": "recommendation for moderator"
}`,
        response_json_schema: {
          type: "object",
          properties: {
            is_safe: { type: "boolean" },
            flag_reason: { type: "string" },
            confidence: { type: "number" },
            explanation: { type: "string" },
            suggestion: { type: "string" }
          }
        }
      });

      // Update recognition with AI analysis
      if (!result.is_safe && result.flag_reason !== 'none') {
        await base44.entities.Recognition.update(recognition.id, {
          status: 'flagged',
          ai_flag_reason: result.flag_reason,
          ai_flag_confidence: result.confidence,
          moderation_notes: `AI Analysis: ${result.explanation}\nSuggestion: ${result.suggestion}`
        });
        queryClient.invalidateQueries(['recognitions-flagged']);
        queryClient.invalidateQueries(['recognitions-recent']);
        toast.warning('Content flagged for review');
      } else {
        toast.success('Content appears safe');
      }

      return result;
    } catch (error) {
      toast.error('AI analysis failed');
    } finally {
      setAiAnalyzing(false);
    }
  };

  // Bulk AI scan
  const bulkAIScan = async () => {
    setAiAnalyzing(true);
    toast.info('Scanning recent recognitions...');
    
    let flaggedCount = 0;
    for (const item of recentItems.slice(0, 10)) {
      if (item.ai_flag_reason) continue; // Skip already analyzed
      
      try {
        const result = await analyzeWithAI(item);
        if (result && !result.is_safe) flaggedCount++;
      } catch (e) {
        console.error('Scan error:', e);
      }
    }

    setAiAnalyzing(false);
    toast.success(`Scan complete. ${flaggedCount} item(s) flagged.`);
  };

  const getItemsForTab = () => {
    switch (activeTab) {
      case 'flagged': return flaggedItems;
      case 'pending': return pendingItems;
      case 'recent': return recentItems;
      default: return [];
    }
  };

  const renderModerationItem = (item) => {
    const flagInfo = item.ai_flag_reason ? FLAG_REASONS[item.ai_flag_reason] : null;

    return (
      <Card 
        key={item.id}
        data-b44-sync="true"
        data-feature="recognition"
        data-component="moderationqueue"
        className={`transition-all ${
          item.status === 'flagged' ? 'border-red-200 bg-red-50/50' : ''
        }`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            {/* AI Flag indicator */}
            {flagInfo && (
              <div className={`shrink-0 p-2 rounded-full ${
                flagInfo.severity === 'high' ? 'bg-red-100' :
                flagInfo.severity === 'medium' ? 'bg-orange-100' : 'bg-slate-100'
              }`}>
                <AlertTriangle className={`h-5 w-5 ${flagInfo.color}`} />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium">{item.sender_name}</span>
                <span className="text-slate-400">→</span>
                <span className="font-medium text-int-orange">{item.recipient_name}</span>
                <Badge variant="outline" className="capitalize">{item.category?.replace('_', ' ')}</Badge>
              </div>

              <p className="text-slate-700 text-sm bg-white p-2 rounded border mb-2">
                {item.message}
              </p>

              {/* AI Analysis */}
              {flagInfo && (
                <div className="bg-white rounded-lg p-3 border border-red-100 mb-2">
                  <div className="flex items-center gap-2 text-sm font-medium mb-1">
                    <Sparkles className="h-4 w-4 text-purple-600" />
                    AI Flag: <span className={flagInfo.color}>{flagInfo.label}</span>
                    <Badge variant="outline" className="ml-auto">
                      {Math.round((item.ai_flag_confidence || 0) * 100)}% confidence
                    </Badge>
                  </div>
                  {item.moderation_notes && (
                    <p className="text-xs text-slate-600">{item.moderation_notes}</p>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedItem(selectedItem?.id === item.id ? null : item)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Review
                </Button>

                {item.status !== 'approved' && (
                  <Button
                    size="sm"
                    onClick={() => moderateMutation.mutate({ id: item.id, action: 'approve', notes: 'Approved by moderator' })}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                )}

                {item.status !== 'rejected' && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => moderateMutation.mutate({ id: item.id, action: 'reject', notes: moderationNote || 'Rejected by moderator' })}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                )}

                {!item.ai_flag_reason && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => analyzeWithAI(item)}
                    disabled={aiAnalyzing}
                    className="text-purple-600"
                  >
                    <Sparkles className="h-4 w-4 mr-1" />
                    AI Analyze
                  </Button>
                )}
              </div>

              {/* Expanded review panel */}
              {selectedItem?.id === item.id && (
                <div className="mt-3 p-3 bg-slate-50 rounded-lg space-y-3">
                  <Textarea
                    placeholder="Add moderation notes..."
                    value={moderationNote}
                    onChange={(e) => setModerationNote(e.target.value)}
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => moderateMutation.mutate({ 
                        id: item.id, 
                        action: 'approve', 
                        notes: moderationNote 
                      })}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Approve with Notes
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => moderateMutation.mutate({ 
                        id: item.id, 
                        action: 'reject', 
                        notes: moderationNote 
                      })}
                    >
                      Reject with Notes
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const items = getItemsForTab();
  const isLoading = loadingFlagged || loadingPending || loadingRecent;

  return (
    <Card className="glass-card-solid">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-int-navy" />
            Recognition Moderation
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={bulkAIScan}
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
              <div className="text-center py-8 text-slate-500">Loading...</div>
            ) : items.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Shield className="h-12 w-12 mx-auto mb-2 text-slate-300" />
                <p>No items in this queue</p>
              </div>
            ) : (
              items.map(item => renderModerationItem(item))
            )}
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}