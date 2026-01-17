import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Mail, 
  Send, 
  CheckCircle, 
  FileText, 
  BookOpen,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';
import { toast } from 'sonner';

const PRIORITY_COLORS = {
  high: 'bg-red-100 text-red-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-blue-100 text-blue-800'
};

export default function PostEventCommunications({ event, open, onOpenChange }) {
  const [selectedMessages, setSelectedMessages] = useState(['summary', 'thank_you']);
  const queryClient = useQueryClient();

  const generateMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('aiPostEventCommunications', {
        event_id: event.id
      });
      return response.data;
    }
  });

  const sendManualMutation = useMutation({
    mutationFn: async ({ type, recipients }) => {
      // Send custom emails based on generated content
      const comms = generateMutation.data?.communications;
      let emailData;

      switch (type) {
        case 'summary':
          emailData = comms.summary_message;
          break;
        case 'thank_you':
          emailData = comms.thank_you_message;
          break;
        case 'feedback':
          emailData = comms.feedback_survey;
          break;
      }

      for (const email of recipients) {
        await base44.integrations.Core.SendEmail({
          to: email,
          subject: emailData.subject,
          body: emailData.body || emailData.intro
        });
      }

      return { sent: recipients.length };
    },
    onSuccess: (data) => {
      toast.success(`Sent ${data.sent} emails!`);
    }
  });

  const communications = generateMutation.data?.communications;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-blue-600" />
            Post-Event Communications
          </DialogTitle>
        </DialogHeader>

        {!communications ? (
          <div className="py-8">
            <Button
              onClick={() => generateMutation.mutate()}
              disabled={generateMutation.isPending}
              className="w-full bg-purple-600 hover:bg-purple-700"
              size="lg"
            >
              {generateMutation.isPending ? (
                <LoadingSpinner size="small" />
              ) : (
                <>
                  <Sparkles className="h-5 w-5 mr-2" />
                  Generate AI Follow-Ups
                </>
              )}
            </Button>
            <p className="text-sm text-slate-600 text-center mt-4">
              AI will analyze the event and create personalized follow-up communications
            </p>
          </div>
        ) : (
          <Tabs defaultValue="summary" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="actions">Actions</TabsTrigger>
              <TabsTrigger value="feedback">Feedback</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
            </TabsList>

            {/* Summary Tab */}
            <TabsContent value="summary" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Mail className="h-5 w-5 text-blue-600" />
                    Event Summary Email
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-sm font-medium mb-2">Subject:</div>
                    <div className="p-3 bg-slate-50 rounded-lg text-sm">
                      {communications.summary_message.subject}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium mb-2">Body:</div>
                    <div 
                      className="p-3 bg-slate-50 rounded-lg text-sm prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: communications.summary_message.body }}
                    />
                  </div>
                  {communications.summary_message.highlights?.length > 0 && (
                    <div>
                      <div className="text-sm font-medium mb-2">Highlights:</div>
                      <ul className="space-y-1">
                        {communications.summary_message.highlights.map((h, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                            {h}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <Button 
                    onClick={() => toast.success('Summary email already sent to attendees!')}
                    className="w-full"
                    variant="outline"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Already Sent to Attendees
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Action Items Tab */}
            <TabsContent value="actions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Action Items
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {communications.action_items?.map((action, idx) => (
                      <div key={idx} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-slate-900">{action.item}</h4>
                          <Badge className={PRIORITY_COLORS[action.priority]}>{action.priority}</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-slate-600">Owner:</span>{' '}
                            <span className="font-medium">{action.owner}</span>
                          </div>
                          <div>
                            <span className="text-slate-600">Deadline:</span>{' '}
                            <span className="font-medium">{action.deadline}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {communications.next_steps?.length > 0 && (
                    <div className="mt-4">
                      <div className="text-sm font-medium mb-2">Next Steps:</div>
                      <ul className="space-y-1">
                        {communications.next_steps.map((step, idx) => (
                          <li key={idx} className="text-sm text-slate-700">• {step}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Feedback Tab */}
            <TabsContent value="feedback" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5 text-purple-600" />
                    Feedback Survey
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-sm font-medium mb-2">Subject:</div>
                    <div className="p-3 bg-slate-50 rounded-lg text-sm">
                      {communications.feedback_survey.subject}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium mb-2">Introduction:</div>
                    <div className="p-3 bg-slate-50 rounded-lg text-sm">
                      {communications.feedback_survey.intro}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium mb-2">Survey Questions:</div>
                    <div className="space-y-2">
                      {communications.feedback_survey.questions?.map((q, idx) => (
                        <div key={idx} className="p-3 bg-slate-50 rounded-lg">
                          <div className="flex items-start justify-between">
                            <p className="text-sm">{q.question}</p>
                            <Badge variant="outline" className="text-xs capitalize">{q.type}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Button className="w-full" variant="outline">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Create Survey (Manual)
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Resources Tab */}
            <TabsContent value="resources" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-amber-600" />
                    Recommended Resources
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {communications.resource_recommendations?.map((resource, idx) => (
                      <div key={idx} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-slate-900">{resource.title}</h4>
                          <Badge variant="outline" className="capitalize">{resource.type}</Badge>
                        </div>
                        <p className="text-sm text-slate-700 mb-2">{resource.description}</p>
                        <p className="text-xs text-slate-600">
                          <strong>Why it's helpful:</strong> {resource.relevance}
                        </p>
                      </div>
                    ))}
                  </div>
                  {communications.related_events?.length > 0 && (
                    <div className="mt-4">
                      <div className="text-sm font-medium mb-2">Related Events to Consider:</div>
                      <ul className="space-y-1">
                        {communications.related_events.map((evt, idx) => (
                          <li key={idx} className="text-sm text-slate-700">• {evt}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}