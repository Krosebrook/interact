import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, TrendingUp, AlertTriangle, CheckCircle, XCircle, Loader2, ArrowRight, Zap, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export default function AIRuleOptimizer() {
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const queryClient = useQueryClient();

  // Fetch existing suggestions
  const { data: suggestions = [], isLoading } = useQuery({
    queryKey: ['ai-gamification-suggestions'],
    queryFn: async () => {
      const data = await base44.entities.AIGamificationSuggestion.list('-created_date', 50);
      return data;
    }
  });

  // Analyze and generate suggestions
  const analyzeMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('aiGamificationRuleOptimizer', {
        action: 'analyze_and_suggest'
      });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['ai-gamification-suggestions']);
      toast.success(`Generated ${data.suggestions.length} new suggestions`);
      setAnalyzing(false);
    },
    onError: (error) => {
      toast.error('Analysis failed: ' + error.message);
      setAnalyzing(false);
    }
  });

  // Approve suggestion
  const approveMutation = useMutation({
    mutationFn: async ({ suggestionId, autoImplement }) => {
      const response = await base44.functions.invoke('aiGamificationRuleOptimizer', {
        action: 'approve_suggestion',
        suggestion_id: suggestionId,
        auto_implement: autoImplement
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['ai-gamification-suggestions']);
      toast.success('Suggestion approved');
      setShowDetailModal(false);
    },
    onError: (error) => {
      toast.error('Failed to approve: ' + error.message);
    }
  });

  // Reject suggestion
  const rejectMutation = useMutation({
    mutationFn: async (suggestionId) => {
      const response = await base44.functions.invoke('aiGamificationRuleOptimizer', {
        action: 'reject_suggestion',
        suggestion_id: suggestionId
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['ai-gamification-suggestions']);
      toast.success('Suggestion rejected');
      setShowDetailModal(false);
    }
  });

  // Implement suggestion
  const implementMutation = useMutation({
    mutationFn: async (suggestionId) => {
      const response = await base44.functions.invoke('aiGamificationRuleOptimizer', {
        action: 'implement_suggestion',
        suggestion_id: suggestionId
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['ai-gamification-suggestions']);
      queryClient.invalidateQueries(['gamification-rules']);
      queryClient.invalidateQueries(['badges']);
      toast.success('Changes implemented successfully!');
      setShowDetailModal(false);
    },
    onError: (error) => {
      toast.error('Failed to implement: ' + error.message);
    }
  });

  const handleAnalyze = () => {
    setAnalyzing(true);
    analyzeMutation.mutate();
  };

  const handleViewDetails = (suggestion) => {
    setSelectedSuggestion(suggestion);
    setAdminNotes(suggestion.admin_notes || '');
    setShowDetailModal(true);
  };

  const pendingSuggestions = suggestions.filter(s => s.status === 'pending');
  const approvedSuggestions = suggestions.filter(s => s.status === 'approved');
  const implementedSuggestions = suggestions.filter(s => s.status === 'implemented');
  const rejectedSuggestions = suggestions.filter(s => s.status === 'rejected');

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-purple-600" />
            AI Rule Optimizer
          </CardTitle>
          <CardDescription>
            Automated analysis and suggestions for gamification rules based on engagement trends
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm text-slate-600">
                Last analysis: {suggestions[0]?.created_date ? new Date(suggestions[0].created_date).toLocaleString() : 'Never'}
              </p>
              <p className="text-sm text-slate-600">
                {pendingSuggestions.length} pending • {implementedSuggestions.length} implemented
              </p>
            </div>
            <Button
              onClick={handleAnalyze}
              disabled={analyzing || analyzeMutation.isPending}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              {analyzing || analyzeMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Run AI Analysis
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Suggestions Tabs */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending" className="gap-2">
            Pending ({pendingSuggestions.length})
          </TabsTrigger>
          <TabsTrigger value="approved" className="gap-2">
            Approved ({approvedSuggestions.length})
          </TabsTrigger>
          <TabsTrigger value="implemented" className="gap-2">
            Implemented ({implementedSuggestions.length})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="gap-2">
            Rejected ({rejectedSuggestions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {isLoading ? (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-purple-600" />
            </div>
          ) : pendingSuggestions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-slate-500">No pending suggestions. Run AI analysis to generate new recommendations.</p>
              </CardContent>
            </Card>
          ) : (
            pendingSuggestions.map(suggestion => (
              <SuggestionCard
                key={suggestion.id}
                suggestion={suggestion}
                onViewDetails={handleViewDetails}
                showActions
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          {approvedSuggestions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-slate-500">No approved suggestions yet.</p>
              </CardContent>
            </Card>
          ) : (
            approvedSuggestions.map(suggestion => (
              <SuggestionCard
                key={suggestion.id}
                suggestion={suggestion}
                onViewDetails={handleViewDetails}
                showImplement
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="implemented" className="space-y-4">
          {implementedSuggestions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-slate-500">No implemented suggestions yet.</p>
              </CardContent>
            </Card>
          ) : (
            implementedSuggestions.map(suggestion => (
              <SuggestionCard
                key={suggestion.id}
                suggestion={suggestion}
                onViewDetails={handleViewDetails}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          {rejectedSuggestions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-slate-500">No rejected suggestions.</p>
              </CardContent>
            </Card>
          ) : (
            rejectedSuggestions.map(suggestion => (
              <SuggestionCard
                key={suggestion.id}
                suggestion={suggestion}
                onViewDetails={handleViewDetails}
              />
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Detail Modal */}
      {selectedSuggestion && (
        <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                {selectedSuggestion.title}
              </DialogTitle>
              <DialogDescription>
                {selectedSuggestion.description}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Priority & Confidence */}
              <div className="flex gap-3">
                <Badge className={
                  selectedSuggestion.priority === 'critical' ? 'bg-red-100 text-red-800' :
                  selectedSuggestion.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                  selectedSuggestion.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                }>
                  {selectedSuggestion.priority.toUpperCase()} Priority
                </Badge>
                <Badge variant="outline">
                  AI Confidence: {(selectedSuggestion.confidence_score * 100).toFixed(0)}%
                </Badge>
                <Badge variant="outline">
                  {selectedSuggestion.suggestion_type.replace('_', ' ')}
                </Badge>
              </div>

              {/* Reasoning */}
              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="font-semibold text-slate-900 mb-2">AI Reasoning:</h4>
                <p className="text-sm text-slate-700">{selectedSuggestion.reasoning}</p>
              </div>

              {/* Expected Impact */}
              {selectedSuggestion.expected_impact && (
                <div className="bg-emerald-50 rounded-lg p-4">
                  <h4 className="font-semibold text-slate-900 mb-2">Expected Impact:</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-slate-600">Engagement Lift:</span>
                      <span className="ml-2 font-medium text-emerald-700">
                        +{(selectedSuggestion.expected_impact.engagement_lift * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-600">Affected Users:</span>
                      <span className="ml-2 font-medium">
                        {selectedSuggestion.expected_impact.affected_user_count}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-600">Risk Level:</span>
                      <span className={`ml-2 font-medium ${
                        selectedSuggestion.expected_impact.risk_level === 'high' ? 'text-red-600' :
                        selectedSuggestion.expected_impact.risk_level === 'medium' ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                        {selectedSuggestion.expected_impact.risk_level}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Proposed Changes */}
              {selectedSuggestion.proposed_changes && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-slate-900 mb-2">Proposed Changes:</h4>
                  <pre className="text-xs bg-white p-3 rounded border overflow-x-auto">
                    {JSON.stringify(selectedSuggestion.proposed_changes, null, 2)}
                  </pre>
                </div>
              )}

              {/* Admin Notes */}
              {selectedSuggestion.status === 'pending' && (
                <div className="space-y-2">
                  <Label>Admin Notes (optional)</Label>
                  <Textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add any notes about this decision..."
                    rows={3}
                  />
                </div>
              )}
            </div>

            <DialogFooter className="gap-2">
              {selectedSuggestion.status === 'pending' && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => rejectMutation.mutate(selectedSuggestion.id)}
                    disabled={rejectMutation.isPending}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                  <Button
                    onClick={() => approveMutation.mutate({ 
                      suggestionId: selectedSuggestion.id, 
                      autoImplement: false 
                    })}
                    disabled={approveMutation.isPending}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    onClick={() => approveMutation.mutate({ 
                      suggestionId: selectedSuggestion.id, 
                      autoImplement: true 
                    })}
                    disabled={approveMutation.isPending || selectedSuggestion.confidence_score < 0.85}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Approve & Implement
                  </Button>
                </>
              )}
              
              {selectedSuggestion.status === 'approved' && (
                <Button
                  onClick={() => implementMutation.mutate(selectedSuggestion.id)}
                  disabled={implementMutation.isPending}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  {implementMutation.isPending ? 'Implementing...' : 'Implement Now'}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function SuggestionCard({ suggestion, onViewDetails, showActions, showImplement }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-slate-900">{suggestion.title}</h3>
              <Badge variant="outline" className="text-xs">
                {(suggestion.confidence_score * 100).toFixed(0)}% confidence
              </Badge>
            </div>
            
            <p className="text-sm text-slate-600 mb-3 line-clamp-2">
              {suggestion.description}
            </p>

            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                +{(suggestion.expected_impact?.engagement_lift * 100).toFixed(1)}% engagement
              </span>
              <span>•</span>
              <span>{suggestion.expected_impact?.affected_user_count} users</span>
              <span>•</span>
              <span className={
                suggestion.expected_impact?.risk_level === 'high' ? 'text-red-600' :
                suggestion.expected_impact?.risk_level === 'medium' ? 'text-yellow-600' :
                'text-green-600'
              }>
                {suggestion.expected_impact?.risk_level} risk
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2 ml-4">
            <Badge className={
              suggestion.priority === 'critical' ? 'bg-red-100 text-red-800' :
              suggestion.priority === 'high' ? 'bg-orange-100 text-orange-800' :
              suggestion.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-blue-100 text-blue-800'
            }>
              {suggestion.priority}
            </Badge>
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => onViewDetails(suggestion)}
            >
              <Eye className="h-3 w-3 mr-1" />
              Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}