import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, XCircle, AlertCircle, MessageSquare, Clock, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function TeamApprovalQueue({ team, pendingRecognitions, teamMembers }) {
  const queryClient = useQueryClient();
  const [expandedId, setExpandedId] = useState(null);

  const approveMutation = useMutation({
    mutationFn: async ({ id, notes }) => {
      return await base44.entities.Recognition.update(id, {
        status: 'approved',
        moderation_notes: notes,
        moderated_by: team.leader_email,
        moderated_at: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['pending-recognitions']);
      toast.success('Recognition approved! ✅');
      setExpandedId(null);
    },
    onError: () => {
      toast.error('Failed to approve recognition');
    }
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ id, notes }) => {
      return await base44.entities.Recognition.update(id, {
        status: 'rejected',
        moderation_notes: notes,
        moderated_by: team.leader_email,
        moderated_at: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['pending-recognitions']);
      toast.success('Recognition rejected');
      setExpandedId(null);
    },
    onError: () => {
      toast.error('Failed to reject recognition');
    }
  });

  if (pendingRecognitions.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">All caught up!</h3>
          <p className="text-slate-600">No pending recognitions to review</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-int-navy mb-2">Approval Queue</h2>
        <p className="text-slate-600">
          Review and approve team recognitions ({pendingRecognitions.length} pending)
        </p>
      </div>

      <div className="space-y-4">
        {pendingRecognitions.map((recognition) => (
          <RecognitionApprovalCard
            key={recognition.id}
            recognition={recognition}
            isExpanded={expandedId === recognition.id}
            onExpand={() => setExpandedId(expandedId === recognition.id ? null : recognition.id)}
            onApprove={(notes) => approveMutation.mutate({ id: recognition.id, notes })}
            onReject={(notes) => rejectMutation.mutate({ id: recognition.id, notes })}
            isProcessing={approveMutation.isPending || rejectMutation.isPending}
          />
        ))}
      </div>
    </div>
  );
}

function RecognitionApprovalCard({ 
  recognition, 
  isExpanded, 
  onExpand, 
  onApprove, 
  onReject,
  isProcessing 
}) {
  const [notes, setNotes] = useState('');
  const [isGeneratingDraft, setIsGeneratingDraft] = useState(false);

  const generateAIDraft = async () => {
    setIsGeneratingDraft(true);
    try {
      const response = await base44.functions.invoke('teamLeaderAIAssistant', {
        action: 'draft_approval',
        team_id: window.teamIdContext || 'unknown',
        context: {
          recognition_details: `${recognition.sender_name} recognized ${recognition.recipient_name} for ${recognition.category}: "${recognition.message}"`
        }
      });
      
      if (response.data?.data?.approval_message) {
        setNotes(response.data.data.approval_message);
        toast.success('Draft generated!');
      }
    } catch (error) {
      console.error('Failed to generate draft:', error);
      toast.error('Failed to generate draft');
    } finally {
      setIsGeneratingDraft(false);
    }
  };

  const categoryConfig = {
    teamwork: { icon: '🤝', color: 'bg-blue-100 text-blue-800' },
    innovation: { icon: '💡', color: 'bg-purple-100 text-purple-800' },
    leadership: { icon: '🎯', color: 'bg-indigo-100 text-indigo-800' },
    going_above: { icon: '🚀', color: 'bg-orange-100 text-orange-800' },
    customer_focus: { icon: '❤️', color: 'bg-pink-100 text-pink-800' },
    problem_solving: { icon: '🧩', color: 'bg-teal-100 text-teal-800' },
    mentorship: { icon: '🌱', color: 'bg-green-100 text-green-800' },
    culture_champion: { icon: '⭐', color: 'bg-yellow-100 text-yellow-800' }
  };

  const config = categoryConfig[recognition.category] || { icon: '⭐', color: 'bg-slate-100 text-slate-800' };

  return (
    <Card className={isExpanded ? 'border-int-orange' : ''}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{config.icon}</span>
              <Badge className={config.color}>
                {recognition.category.replace('_', ' ')}
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Clock className="h-3 w-3" />
                {format(new Date(recognition.created_date), 'MMM d, h:mm a')}
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-sm">
                <span className="font-medium">{recognition.sender_name}</span>
                {' → '}
                <span className="font-medium">{recognition.recipient_name}</span>
              </p>
              <p className="text-slate-700">{recognition.message}</p>
              {recognition.company_values?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {recognition.company_values.map((value) => (
                    <Badge key={value} variant="outline" className="text-xs">
                      {value}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      {isExpanded ? (
        <CardContent className="border-t pt-4">
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-slate-700">
                  Moderation Notes (Optional)
                </label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={generateAIDraft}
                  disabled={isGeneratingDraft}
                  className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 gap-1"
                >
                  {isGeneratingDraft ? (
                    <>Generating...</>
                  ) : (
                    <>
                      <Sparkles className="h-3 w-3" />
                      AI Draft
                    </>
                  )}
                </Button>
              </div>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about this approval/rejection..."
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => onReject(notes)}
                disabled={isProcessing}
                variant="outline"
                className="flex-1 border-red-300 text-red-700 hover:bg-red-50"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
              <Button
                onClick={() => onApprove(notes)}
                disabled={isProcessing}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </Button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={onExpand}
              className="w-full"
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      ) : (
        <CardContent className="pt-0">
          <Button
            onClick={onExpand}
            variant="outline"
            size="sm"
            className="w-full"
          >
            Review & Decide
          </Button>
        </CardContent>
      )}
    </Card>
  );
}