import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

/**
 * Custom hook for moderation actions with centralized logic
 * Provides approve, reject, and AI analysis mutations
 */
export function useModerationActions(currentUser) {
  const queryClient = useQueryClient();

  const invalidateModerationQueries = () => {
    queryClient.invalidateQueries(['recognitions-flagged']);
    queryClient.invalidateQueries(['recognitions-pending']);
    queryClient.invalidateQueries(['recognitions-recent']);
  };

  // Moderate (approve/reject) mutation
  const moderateMutation = useMutation({
    mutationFn: async ({ id, action, notes }) => {
      const status = action === 'approve' ? 'approved' : 'rejected';
      return base44.entities.Recognition.update(id, {
        status,
        moderation_notes: notes,
        moderated_by: currentUser?.email,
        moderated_at: new Date().toISOString()
      });
    },
    onSuccess: (_, { action }) => {
      invalidateModerationQueries();
      toast.success(action === 'approve' ? 'Recognition approved' : 'Recognition rejected');
    },
    onError: (error) => {
      toast.error(`Moderation failed: ${error.message}`);
    }
  });

  // AI content analysis
  const analyzeContent = async (recognition) => {
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: buildAnalysisPrompt(recognition),
      response_json_schema: AI_ANALYSIS_SCHEMA
    });

    if (!result.is_safe && result.flag_reason !== 'none') {
      await base44.entities.Recognition.update(recognition.id, {
        status: 'flagged',
        ai_flag_reason: result.flag_reason,
        ai_flag_confidence: result.confidence,
        moderation_notes: `AI Analysis: ${result.explanation}\nSuggestion: ${result.suggestion}`
      });
      invalidateModerationQueries();
    }

    return result;
  };

  return {
    moderateMutation,
    analyzeContent,
    invalidateModerationQueries
  };
}

// AI analysis prompt builder
const buildAnalysisPrompt = (recognition) => `
Analyze this workplace recognition message for potential issues:

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

Provide analysis as JSON.
`;

// Schema for AI analysis response
const AI_ANALYSIS_SCHEMA = {
  type: "object",
  properties: {
    is_safe: { type: "boolean" },
    flag_reason: { type: "string" },
    confidence: { type: "number" },
    explanation: { type: "string" },
    suggestion: { type: "string" }
  }
};

export default useModerationActions;