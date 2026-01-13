import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, Eye, EyeOff, Trash2, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

export default function FlaggedContentCard({ flag, onAction, readOnly = false }) {
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');

  const contentTypeColors = {
    recognition: 'bg-blue-100 text-blue-800',
    channel_message: 'bg-purple-100 text-purple-800',
    direct_message: 'bg-pink-100 text-pink-800',
    comment: 'bg-orange-100 text-orange-800',
  };

  const statusColors = {
    pending: 'bg-orange-100 text-orange-800',
    reviewed: 'bg-blue-100 text-blue-800',
    resolved: 'bg-green-100 text-green-800',
    dismissed: 'bg-slate-100 text-slate-800',
  };

  const actionIcons = {
    hide: <EyeOff className="h-4 w-4" />,
    delete: <Trash2 className="h-4 w-4" />,
    dismiss: <X className="h-4 w-4" />,
    warn_user: <AlertTriangle className="h-4 w-4" />,
  };

  const handleActionClick = (action) => {
    setSelectedAction(action);
    setActionDialogOpen(true);
  };

  const handleConfirmAction = () => {
    if (onAction) {
      onAction(selectedAction, adminNotes);
    }
    setActionDialogOpen(false);
    setSelectedAction(null);
    setAdminNotes('');
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge className={contentTypeColors[flag.content_type]}>
                  {flag.content_type?.replace(/_/g, ' ')}
                </Badge>
                <Badge className={statusColors[flag.status]}>
                  {flag.status}
                </Badge>
                {flag.flagged_by === 'system' && (
                  <Badge variant="outline">Auto-flagged</Badge>
                )}
              </div>
              <CardTitle className="text-lg">Flagged by: {flag.flagged_by}</CardTitle>
              <p className="text-sm text-slate-600 mt-1">
                {new Date(flag.created_date).toLocaleString()}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Flag Reason */}
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-1">Reason:</p>
            <p className="text-sm text-slate-600 bg-red-50 p-3 rounded-lg border border-red-200">
              {flag.reason}
            </p>
          </div>

          {/* Content Preview */}
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-1">Content Preview:</p>
            <div className="text-sm text-slate-900 bg-slate-50 p-3 rounded-lg border border-slate-200">
              {flag.content_preview || 'Content not available'}
            </div>
          </div>

          {/* Admin Review Info */}
          {flag.reviewed_by && (
            <div className="border-t pt-4">
              <p className="text-sm font-semibold text-slate-700 mb-2">Admin Review:</p>
              <div className="space-y-2">
                <p className="text-sm text-slate-600">
                  <span className="font-medium">Reviewed by:</span> {flag.reviewed_by}
                </p>
                <p className="text-sm text-slate-600">
                  <span className="font-medium">Action taken:</span> {flag.admin_action?.replace(/_/g, ' ')}
                </p>
                {flag.admin_notes && (
                  <p className="text-sm text-slate-600 bg-blue-50 p-2 rounded">
                    <span className="font-medium">Notes:</span> {flag.admin_notes}
                  </p>
                )}
                <p className="text-xs text-slate-500">
                  {new Date(flag.reviewed_date).toLocaleString()}
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {!readOnly && flag.status === 'pending' && (
            <div className="flex gap-2 pt-4 border-t">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleActionClick('delete')}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleActionClick('hide')}
              >
                <EyeOff className="h-4 w-4 mr-2" />
                Hide
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleActionClick('warn_user')}
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Warn User
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleActionClick('dismiss')}
              >
                <X className="h-4 w-4 mr-2" />
                Dismiss
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Confirmation Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Moderation Action</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              You are about to <span className="font-semibold">{selectedAction?.replace(/_/g, ' ')}</span> this content.
            </p>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Admin Notes (optional)
              </label>
              <Textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add notes about this decision..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmAction}>
              Confirm Action
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}