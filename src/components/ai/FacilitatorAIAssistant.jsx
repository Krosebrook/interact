import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageSquare, 
  Mail, 
  Sparkles, 
  Copy, 
  RefreshCw,
  Send,
  Users,
  ThumbsUp,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

export default function FacilitatorAIAssistant({ event, participants, activity }) {
  const [activeTab, setActiveTab] = useState('followup');
  const [generatedContent, setGeneratedContent] = useState({
    followup: '',
    feedback: '',
    announcement: ''
  });
  const [customContext, setCustomContext] = useState('');

  const generateFollowUpMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a warm, personalized follow-up message for participants of this team event:

Event: ${event.title}
Activity Type: ${activity?.type || 'Team activity'}
Number of Participants: ${participants.length}
Event Description: ${event.custom_instructions || activity?.description || 'Team building activity'}

Additional Context from Facilitator: ${customContext || 'None provided'}

The message should:
1. Thank participants for attending
2. Highlight key moments or achievements (be general if not specified)
3. Encourage continued engagement
4. Be friendly and professional
5. Include a call-to-action for feedback

Keep it concise (150-200 words).`,
        response_json_schema: {
          type: "object",
          properties: {
            subject: { type: "string" },
            body: { type: "string" },
            key_points: { type: "array", items: { type: "string" } }
          }
        }
      });
      return response;
    },
    onSuccess: (data) => {
      setGeneratedContent(prev => ({ ...prev, followup: data }));
    },
    onError: () => toast.error('Failed to generate follow-up message')
  });

  const generateFeedbackRequestMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a feedback request message for participants of this team event:

Event: ${event.title}
Activity Type: ${activity?.type || 'Team activity'}

The message should:
1. Be brief and friendly
2. Explain why feedback matters
3. Mention it only takes 2 minutes
4. Include specific questions to think about

Generate 3-4 feedback questions that are relevant to this type of activity.`,
        response_json_schema: {
          type: "object",
          properties: {
            subject: { type: "string" },
            intro_message: { type: "string" },
            questions: { type: "array", items: { type: "string" } },
            closing_message: { type: "string" }
          }
        }
      });
      return response;
    },
    onSuccess: (data) => {
      setGeneratedContent(prev => ({ ...prev, feedback: data }));
    },
    onError: () => toast.error('Failed to generate feedback request')
  });

  const generateAnnouncementMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate an engaging pre-event announcement for this team activity:

Event: ${event.title}
Activity Type: ${activity?.type || 'Team activity'}
Description: ${event.custom_instructions || activity?.description || 'Team building activity'}
Date/Time: ${event.scheduled_date}
Duration: ${event.duration_minutes || 60} minutes

The announcement should:
1. Build excitement
2. Explain what to expect
3. List any preparation needed
4. Include practical details
5. Be energetic but professional`,
        response_json_schema: {
          type: "object",
          properties: {
            headline: { type: "string" },
            body: { type: "string" },
            what_to_prepare: { type: "array", items: { type: "string" } },
            fun_fact: { type: "string" }
          }
        }
      });
      return response;
    },
    onSuccess: (data) => {
      setGeneratedContent(prev => ({ ...prev, announcement: data }));
    },
    onError: () => toast.error('Failed to generate announcement')
  });

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const isLoading = generateFollowUpMutation.isPending || 
                    generateFeedbackRequestMutation.isPending || 
                    generateAnnouncementMutation.isPending;

  return (
    <Card data-b44-sync="true" data-feature="ai" data-component="facilitatoraiassistant" className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-int-orange" />
          AI Communication Assistant
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="followup" className="gap-2">
              <Mail className="h-4 w-4" />
              Follow-up
            </TabsTrigger>
            <TabsTrigger value="feedback" className="gap-2">
              <ThumbsUp className="h-4 w-4" />
              Feedback
            </TabsTrigger>
            <TabsTrigger value="announcement" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Announce
            </TabsTrigger>
          </TabsList>

          <TabsContent value="followup" className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Additional Context (optional)</label>
              <Textarea
                placeholder="Add specific highlights, achievements, or personal notes to include..."
                value={customContext}
                onChange={(e) => setCustomContext(e.target.value)}
                className="h-20"
              />
            </div>
            
            <Button 
              onClick={() => generateFollowUpMutation.mutate()}
              disabled={isLoading}
              className="bg-int-orange hover:bg-[#C46322]"
            >
              {generateFollowUpMutation.isPending ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              Generate Follow-up Message
            </Button>

            {generatedContent.followup && (
              <div className="border rounded-lg p-4 bg-slate-50 space-y-3">
                <div className="flex items-center justify-between">
                  <Badge>Subject: {generatedContent.followup.subject}</Badge>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => copyToClipboard(`Subject: ${generatedContent.followup.subject}\n\n${generatedContent.followup.body}`)}
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Copy All
                  </Button>
                </div>
                <p className="text-sm whitespace-pre-wrap">{generatedContent.followup.body}</p>
                {generatedContent.followup.key_points?.length > 0 && (
                  <div className="pt-2 border-t">
                    <p className="text-xs font-medium text-slate-500 mb-1">Key Points:</p>
                    <ul className="text-xs text-slate-600 list-disc list-inside">
                      {generatedContent.followup.key_points.map((point, i) => (
                        <li key={i}>{point}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="feedback" className="space-y-4">
            <Button 
              onClick={() => generateFeedbackRequestMutation.mutate()}
              disabled={isLoading}
              className="bg-int-orange hover:bg-[#C46322]"
            >
              {generateFeedbackRequestMutation.isPending ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              Generate Feedback Request
            </Button>

            {generatedContent.feedback && (
              <div className="border rounded-lg p-4 bg-slate-50 space-y-3">
                <div className="flex items-center justify-between">
                  <Badge>Subject: {generatedContent.feedback.subject}</Badge>
                  <Button size="sm" variant="ghost" onClick={() => copyToClipboard(
                    `Subject: ${generatedContent.feedback.subject}\n\n${generatedContent.feedback.intro_message}\n\nQuestions:\n${generatedContent.feedback.questions?.join('\n')}\n\n${generatedContent.feedback.closing_message}`
                  )}>
                    <Copy className="h-4 w-4 mr-1" />
                    Copy All
                  </Button>
                </div>
                <p className="text-sm">{generatedContent.feedback.intro_message}</p>
                <div className="space-y-2">
                  <p className="text-xs font-medium text-slate-500">Suggested Questions:</p>
                  {generatedContent.feedback.questions?.map((q, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm bg-white p-2 rounded">
                      <span className="font-medium text-int-orange">{i + 1}.</span>
                      <span>{q}</span>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-slate-600">{generatedContent.feedback.closing_message}</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="announcement" className="space-y-4">
            <Button 
              onClick={() => generateAnnouncementMutation.mutate()}
              disabled={isLoading}
              className="bg-int-orange hover:bg-[#C46322]"
            >
              {generateAnnouncementMutation.isPending ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              Generate Announcement
            </Button>

            {generatedContent.announcement && (
              <div className="border rounded-lg p-4 bg-slate-50 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-lg">{generatedContent.announcement.headline}</h4>
                  <Button size="sm" variant="ghost" onClick={() => copyToClipboard(
                    `${generatedContent.announcement.headline}\n\n${generatedContent.announcement.body}\n\nWhat to prepare:\n${generatedContent.announcement.what_to_prepare?.join('\n')}`
                  )}>
                    <Copy className="h-4 w-4 mr-1" />
                    Copy All
                  </Button>
                </div>
                <p className="text-sm whitespace-pre-wrap">{generatedContent.announcement.body}</p>
                {generatedContent.announcement.what_to_prepare?.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded p-3">
                    <p className="text-xs font-medium text-amber-700 mb-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      What to Prepare:
                    </p>
                    <ul className="text-sm text-amber-800 list-disc list-inside">
                      {generatedContent.announcement.what_to_prepare.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {generatedContent.announcement.fun_fact && (
                  <div className="bg-blue-50 border border-blue-200 rounded p-3">
                    <p className="text-xs font-medium text-blue-700 mb-1">💡 Fun Fact:</p>
                    <p className="text-sm text-blue-800">{generatedContent.announcement.fun_fact}</p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}