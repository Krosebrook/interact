import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

export default function AppealWorkflow({ flag, onDecision }) {
  const [decisionDialogOpen, setDecisionDialogOpen] = useState(false);
  const [selectedDecision, setSelectedDecision] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');

  const handleDecisionClick = (decision) => {
    setSelectedDecision(decision);
    setDecisionDialogOpen(true);
  };

  const handleConfirmDecision = () => {
    if (onDecision) {
      onDecision(selectedDecision, reviewNotes);
    }
    setDecisionDialogOpen(false);
    setSelectedDecision(null);
    setReviewNotes('');
  };

  return (
    <>
      <Card className="border-l-4 border-l-orange-500">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-orange-100 text-orange-800">
                  Appeal Pending
                </Badge>
                <Badge variant="outline">
                  {flag.content_type?.replace(/_/g, ' ')}
                </Badge>
              </div>
              <CardTitle className="text-lg">Appeal Request</CardTitle>
              <p className="text-sm text-slate-600 mt-1">
                Original flag: {new Date(flag.created_date).toLocaleString()}
              </p>
            </div>
            <AlertCircle className="h-6 w-6 text-orange-500" />
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Original Flag Info */}
          <div className="bg-slate-50 p-3 rounded-lg">
            <p className="text-sm font-semibold text-slate-700 mb-2">Original Flag Reason:</p>
            <p className="text-sm text-slate-600">{flag.reason}</p>
          </div>

          {/* Content Preview */}
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-1">Content:</p>
            <div className="text-sm text-slate-900 bg-white p-3 rounded-lg border">
              {flag.content_preview || 'Content not available'}
            </div>
          </div>

          {/* Previous Action */}
          {flag.admin_action && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm font-semibold text-blue-900 mb-1">Previous Action:</p>
              <p className="text-sm text-blue-700">
                {flag.admin_action?.replace(/_/g, ' ')} by {flag.reviewed_by}
              </p>
              {flag.admin_notes && (
                <p className="text-sm text-blue-600 mt-2 italic">"{flag.admin_notes}"</p>
              )}
            </div>
          )}

          {/* Appeal Decision Buttons */}
          <div className="flex gap-2 pt-4 border-t">
            <Button
              className="flex-1 bg-green-600 hover:bg-green-700"
              onClick={() => handleDecisionClick('approved')}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve Appeal
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={() => handleDecisionClick('rejected')}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject Appeal
            </Button>
          </div>

          <p className="text-xs text-slate-500 text-center">
            Approving will restore the content. Rejecting will maintain the moderation action.
          </p>
        </CardContent>
      </Card>

      {/* Decision Confirmation Dialog */}
      <Dialog open={decisionDialogOpen} onOpenChange={setDecisionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedDecision === 'approved' ? 'Approve Appeal' : 'Reject Appeal'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              {selectedDecision === 'approved' 
                ? 'The content will be restored and the user will be notified of the successful appeal.'
                : 'The original moderation action will be maintained and the user will be notified.'}
            </p>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Review Notes
              </label>
              <Textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Explain your decision..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDecisionDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className={selectedDecision === 'approved' ? 'bg-green-600 hover:bg-green-700' : ''}
              variant={selectedDecision === 'rejected' ? 'destructive' : 'default'}
              onClick={handleConfirmDecision}
            >
              Confirm {selectedDecision === 'approved' ? 'Approval' : 'Rejection'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}