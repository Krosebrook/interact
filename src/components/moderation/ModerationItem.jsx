import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  AlertTriangle, Check, X, Sparkles, Eye 
} from 'lucide-react';

/**
 * Flag reason configuration for display
 */
export const FLAG_REASONS = {
  inappropriate: { label: 'Inappropriate Content', severity: 'high', color: 'text-red-600' },
  spam: { label: 'Spam/Promotional', severity: 'medium', color: 'text-orange-600' },
  bias: { label: 'Potential Bias', severity: 'medium', color: 'text-yellow-600' },
  low_quality: { label: 'Low Quality', severity: 'low', color: 'text-slate-600' },
  needs_review: { label: 'Needs Human Review', severity: 'medium', color: 'text-blue-600' }
};

const SEVERITY_BG = {
  high: 'bg-red-100',
  medium: 'bg-orange-100',
  low: 'bg-slate-100'
};

/**
 * Individual moderation queue item component
 * Displays recognition details, AI analysis, and action buttons
 */
export default function ModerationItem({
  item,
  isSelected,
  moderationNote,
  onNoteChange,
  onSelectItem,
  onApprove,
  onReject,
  onAnalyze,
  isAnalyzing,
  isModerating
}) {
  const flagInfo = item.ai_flag_reason ? FLAG_REASONS[item.ai_flag_reason] : null;

  return (
    <Card className={`transition-all ${
      item.status === 'flagged' ? 'border-red-200 bg-red-50/50' : ''
    }`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* AI Flag indicator */}
          {flagInfo && (
            <FlagIndicator severity={flagInfo.severity} />
          )}

          <div className="flex-1 min-w-0">
            {/* Header with sender/recipient */}
            <ItemHeader item={item} />

            {/* Message content */}
            <p className="text-slate-700 text-sm bg-white p-2 rounded border mb-2">
              {item.message}
            </p>

            {/* AI Analysis panel */}
            {flagInfo && (
              <AIAnalysisPanel 
                item={item} 
                flagInfo={flagInfo} 
              />
            )}

            {/* Action buttons */}
            <ActionButtons
              item={item}
              isSelected={isSelected}
              onSelectItem={onSelectItem}
              onApprove={onApprove}
              onReject={onReject}
              onAnalyze={onAnalyze}
              isAnalyzing={isAnalyzing}
              isModerating={isModerating}
            />

            {/* Expanded review panel */}
            {isSelected && (
              <ReviewPanel
                item={item}
                moderationNote={moderationNote}
                onNoteChange={onNoteChange}
                onApprove={onApprove}
                onReject={onReject}
                isModerating={isModerating}
              />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Sub-components for better organization
function FlagIndicator({ severity }) {
  return (
    <div className={`shrink-0 p-2 rounded-full ${SEVERITY_BG[severity]}`}>
      <AlertTriangle className={`h-5 w-5 ${
        severity === 'high' ? 'text-red-600' :
        severity === 'medium' ? 'text-orange-600' : 'text-slate-600'
      }`} />
    </div>
  );
}

function ItemHeader({ item }) {
  return (
    <div className="flex items-center gap-2 mb-2 flex-wrap">
      <span className="font-medium">{item.sender_name}</span>
      <span className="text-slate-400">→</span>
      <span className="font-medium text-int-orange">{item.recipient_name}</span>
      <Badge variant="outline" className="capitalize">
        {item.category?.replace('_', ' ')}
      </Badge>
    </div>
  );
}

function AIAnalysisPanel({ item, flagInfo }) {
  return (
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
  );
}

function ActionButtons({ 
  item, isSelected, onSelectItem, onApprove, onReject, onAnalyze, isAnalyzing, isModerating 
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Button
        size="sm"
        variant="outline"
        onClick={() => onSelectItem(isSelected ? null : item)}
      >
        <Eye className="h-4 w-4 mr-1" />
        Review
      </Button>

      {item.status !== 'approved' && (
        <Button
          size="sm"
          onClick={() => onApprove(item.id)}
          className="bg-green-600 hover:bg-green-700"
          disabled={isModerating}
        >
          <Check className="h-4 w-4 mr-1" />
          Approve
        </Button>
      )}

      {item.status !== 'rejected' && (
        <Button
          size="sm"
          variant="destructive"
          onClick={() => onReject(item.id)}
          disabled={isModerating}
        >
          <X className="h-4 w-4 mr-1" />
          Reject
        </Button>
      )}

      {!item.ai_flag_reason && (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onAnalyze(item)}
          disabled={isAnalyzing}
          className="text-purple-600"
        >
          <Sparkles className="h-4 w-4 mr-1" />
          AI Analyze
        </Button>
      )}
    </div>
  );
}

function ReviewPanel({ item, moderationNote, onNoteChange, onApprove, onReject, isModerating }) {
  return (
    <div className="mt-3 p-3 bg-slate-50 rounded-lg space-y-3">
      <Textarea
        placeholder="Add moderation notes..."
        value={moderationNote}
        onChange={(e) => onNoteChange(e.target.value)}
        rows={2}
      />
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={() => onApprove(item.id, moderationNote)}
          className="bg-green-600 hover:bg-green-700"
          disabled={isModerating}
        >
          Approve with Notes
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={() => onReject(item.id, moderationNote)}
          disabled={isModerating}
        >
          Reject with Notes
        </Button>
      </div>
    </div>
  );
}