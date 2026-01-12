import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Mail, 
  Bell, 
  Send, 
  Users, 
  Clock,
  CheckCircle2,
  Loader2,
  MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';

const REMINDER_TEMPLATES = [
  {
    id: 'reminder_24h',
    name: '24-Hour Reminder',
    subject: 'Reminder: {event_title} is tomorrow!',
    body: `Hi {participant_name}!

Just a friendly reminder that "{event_title}" is happening tomorrow.

📅 Date: {event_date}
🕐 Time: {event_time}
{meeting_link}

We're looking forward to seeing you there!`
  },
  {
    id: 'reminder_1h',
    name: '1-Hour Reminder',
    subject: '{event_title} starts in 1 hour!',
    body: `Hi {participant_name}!

"{event_title}" is starting in just 1 hour.

{meeting_link}

See you soon!`
  },
  {
    id: 'recap',
    name: 'Post-Event Recap',
    subject: 'Thank you for attending {event_title}!',
    body: `Hi {participant_name}!

Thank you for joining us at "{event_title}"!

We hope you found the session valuable. If you have a moment, we'd love to hear your feedback.

See you at the next event!`
  }
];

export default function CommunicationHub({ eventId, eventTitle }) {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [customMessage, setCustomMessage] = useState({ subject: '', body: '' });
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [selectAll, setSelectAll] = useState(true);

  const { data: participations = [] } = useQuery({
    queryKey: ['participations', eventId],
    queryFn: () => base44.entities.Participation.filter({ event_id: eventId }),
    enabled: !!eventId
  });

  const { data: event } = useQuery({
    queryKey: ['event', eventId],
    queryFn: async () => {
      const events = await base44.entities.Event.filter({ id: eventId });
      return events[0];
    },
    enabled: !!eventId
  });

  const sendReminderMutation = useMutation({
    mutationFn: async () => {
      await base44.functions.invoke('sendTeamsNotification', {
        eventId,
        notificationType: 'reminder'
      });
    },
    onSuccess: () => toast.success('Reminder sent via Teams!')
  });

  const sendRecapMutation = useMutation({
    mutationFn: async () => {
      await base44.functions.invoke('sendTeamsNotification', {
        eventId,
        notificationType: 'recap'
      });
    },
    onSuccess: () => toast.success('Recap sent via Teams!')
  });

  const sendEmailMutation = useMutation({
    mutationFn: async ({ recipients, subject, body }) => {
      for (const recipient of recipients) {
        const personalizedBody = body
          .replace(/{participant_name}/g, recipient.participant_name || 'there')
          .replace(/{event_title}/g, eventTitle || 'the event')
          .replace(/{event_date}/g, event ? new Date(event.scheduled_date).toLocaleDateString() : '')
          .replace(/{event_time}/g, event ? new Date(event.scheduled_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '')
          .replace(/{meeting_link}/g, event?.meeting_link ? `🔗 Join here: ${event.meeting_link}` : '');

        const personalizedSubject = subject
          .replace(/{event_title}/g, eventTitle || 'Event');

        await base44.integrations.Core.SendEmail({
          to: recipient.participant_email,
          subject: personalizedSubject,
          body: personalizedBody.replace(/\n/g, '<br>')
        });
      }
    },
    onSuccess: () => {
      toast.success('Emails sent successfully!');
      setCustomMessage({ subject: '', body: '' });
      setSelectedTemplate(null);
    }
  });

  const handleSendEmails = () => {
    const template = selectedTemplate ? REMINDER_TEMPLATES.find(t => t.id === selectedTemplate) : null;
    const subject = template?.subject || customMessage.subject;
    const body = template?.body || customMessage.body;

    if (!subject || !body) {
      toast.error('Please provide subject and message');
      return;
    }

    const recipients = selectAll 
      ? participations.filter(p => p.rsvp_status === 'yes')
      : participations.filter(p => selectedParticipants.includes(p.id));

    if (recipients.length === 0) {
      toast.error('No recipients selected');
      return;
    }

    sendEmailMutation.mutate({ recipients, subject, body });
  };

  const confirmedParticipants = participations.filter(p => p.rsvp_status === 'yes');

  return (
    <Card className="border-0 shadow-lg" data-b44-sync="true" data-feature="facilitator" data-component="communicationhub">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-blue-600" />
          Communication Hub
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="quick">
          <TabsList className="mb-4">
            <TabsTrigger value="quick">Quick Actions</TabsTrigger>
            <TabsTrigger value="email">Custom Email</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          {/* Quick Actions */}
          <TabsContent value="quick" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4 border hover:border-blue-300 cursor-pointer transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Bell className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Send Reminder</h4>
                    <p className="text-xs text-slate-500">Via Teams</p>
                  </div>
                </div>
                <Button 
                  onClick={() => sendReminderMutation.mutate()}
                  disabled={sendReminderMutation.isLoading}
                  className="w-full"
                  size="sm"
                >
                  {sendReminderMutation.isLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Bell className="h-4 w-4 mr-2" />
                  )}
                  Send Reminder
                </Button>
              </Card>

              <Card className="p-4 border hover:border-green-300 cursor-pointer transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Send Recap</h4>
                    <p className="text-xs text-slate-500">Via Teams</p>
                  </div>
                </div>
                <Button 
                  onClick={() => sendRecapMutation.mutate()}
                  disabled={sendRecapMutation.isLoading}
                  className="w-full"
                  size="sm"
                  variant="outline"
                >
                  {sendRecapMutation.isLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Send Recap
                </Button>
              </Card>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-slate-500" />
                <span className="font-medium">{confirmedParticipants.length} confirmed participants</span>
              </div>
              <p className="text-sm text-slate-500">
                Quick actions will notify all confirmed participants via Microsoft Teams
              </p>
            </div>
          </TabsContent>

          {/* Custom Email */}
          <TabsContent value="email" className="space-y-4">
            <div>
              <Label>Recipients</Label>
              <div className="flex items-center gap-2 mt-2 mb-3">
                <Checkbox 
                  checked={selectAll}
                  onCheckedChange={setSelectAll}
                />
                <span className="text-sm">All confirmed participants ({confirmedParticipants.length})</span>
              </div>
              {!selectAll && (
                <div className="max-h-32 overflow-y-auto space-y-2 border rounded-lg p-3">
                  {confirmedParticipants.map(p => (
                    <div key={p.id} className="flex items-center gap-2">
                      <Checkbox 
                        checked={selectedParticipants.includes(p.id)}
                        onCheckedChange={(checked) => {
                          setSelectedParticipants(prev => 
                            checked 
                              ? [...prev, p.id]
                              : prev.filter(id => id !== p.id)
                          );
                        }}
                      />
                      <span className="text-sm">{p.participant_name} ({p.participant_email})</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Label>Subject</Label>
              <Input
                value={customMessage.subject}
                onChange={(e) => setCustomMessage(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Email subject..."
              />
            </div>

            <div>
              <Label>Message</Label>
              <Textarea
                value={customMessage.body}
                onChange={(e) => setCustomMessage(prev => ({ ...prev, body: e.target.value }))}
                placeholder="Type your message... Use {participant_name}, {event_title} for personalization"
                rows={6}
              />
              <p className="text-xs text-slate-500 mt-1">
                Variables: {'{participant_name}'}, {'{event_title}'}, {'{event_date}'}, {'{event_time}'}, {'{meeting_link}'}
              </p>
            </div>

            <Button
              onClick={handleSendEmails}
              disabled={sendEmailMutation.isLoading}
              className="w-full"
            >
              {sendEmailMutation.isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Send Email to {selectAll ? confirmedParticipants.length : selectedParticipants.length} recipients
            </Button>
          </TabsContent>

          {/* Templates */}
          <TabsContent value="templates" className="space-y-4">
            {REMINDER_TEMPLATES.map(template => (
              <Card 
                key={template.id}
                className={`p-4 cursor-pointer transition-all ${
                  selectedTemplate === template.id 
                    ? 'border-2 border-blue-500 bg-blue-50' 
                    : 'border hover:border-slate-300'
                }`}
                onClick={() => setSelectedTemplate(template.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{template.name}</h4>
                  {selectedTemplate === template.id && (
                    <Badge className="bg-blue-100 text-blue-700">Selected</Badge>
                  )}
                </div>
                <p className="text-sm text-slate-600 font-medium mb-1">{template.subject}</p>
                <p className="text-xs text-slate-500 line-clamp-2">{template.body}</p>
              </Card>
            ))}

            {selectedTemplate && (
              <Button
                onClick={handleSendEmails}
                disabled={sendEmailMutation.isLoading}
                className="w-full"
              >
                {sendEmailMutation.isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Send {REMINDER_TEMPLATES.find(t => t.id === selectedTemplate)?.name}
              </Button>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}