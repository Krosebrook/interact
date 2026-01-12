import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { 
  MessageSquare, 
  Bell, 
  BarChart3, 
  Save, 
  TestTube, 
  CheckCircle,
  XCircle,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';

export default function TeamsConfigPanel() {
  const queryClient = useQueryClient();
  const [testing, setTesting] = useState(false);

  const { data: configs = [], isLoading } = useQuery({
    queryKey: ['teams-config'],
    queryFn: () => base44.entities.TeamsConfig.list()
  });

  const currentConfig = configs[0] || {
    config_key: 'default',
    webhook_url: '',
    notifications_enabled: true,
    send_announcement: true,
    send_reminder: true,
    send_recap: true,
    announcement_template: '',
    reminder_template: '',
    recap_template: '',
    channel_name: ''
  };

  const [formData, setFormData] = useState(currentConfig);

  React.useEffect(() => {
    if (configs[0]) {
      setFormData(configs[0]);
    }
  }, [configs]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (configs[0]) {
        return base44.entities.TeamsConfig.update(configs[0].id, data);
      } else {
        return base44.entities.TeamsConfig.create({
          ...data,
          config_key: 'default'
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['teams-config']);
      toast.success('Teams configuration saved! 🎉');
    },
    onError: () => {
      toast.error('Failed to save configuration');
    }
  });

  const testWebhookMutation = useMutation({
    mutationFn: async () => {
      // First save the config
      await saveMutation.mutateAsync(formData);
      
      // Send a test message
      const testCard = {
        type: "message",
        attachments: [{
          contentType: "application/vnd.microsoft.card.adaptive",
          content: {
            type: "AdaptiveCard",
            version: "1.4",
            body: [
              {
                type: "TextBlock",
                text: "✅ Test Successful!",
                size: "Large",
                weight: "Bolder",
                color: "Good"
              },
              {
                type: "TextBlock",
                text: "Your Team Engage Hub is now connected to Microsoft Teams!",
                wrap: true
              },
              {
                type: "TextBlock",
                text: "You'll receive notifications for scheduled events, reminders, and recaps.",
                wrap: true,
                isSubtle: true,
                spacing: "Small"
              }
            ]
          }
        }]
      };

      const response = await fetch(formData.webhook_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testCard)
      });

      if (!response.ok) {
        throw new Error('Webhook test failed');
      }

      return response;
    },
    onSuccess: () => {
      setTesting(false);
      toast.success('Test message sent to Teams! Check your channel.');
    },
    onError: (error) => {
      setTesting(false);
      toast.error('Failed to send test message. Check your webhook URL.');
    }
  });

  const handleSave = () => {
    saveMutation.mutate(formData);
  };

  const handleTest = () => {
    if (!formData.webhook_url) {
      toast.error('Please enter a webhook URL first');
      return;
    }
    setTesting(true);
    testWebhookMutation.mutate();
  };

  if (isLoading) {
    return (
      <Card className="p-6" data-b44-sync="true" data-feature="teams" data-component="teamsconfigpanel">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card className="p-6 border-0 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare className="h-6 w-6 text-indigo-600" />
              Microsoft Teams Integration
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              Send automatic notifications to your Teams channel
            </p>
          </div>
          {formData.webhook_url ? (
            <Badge className="bg-emerald-100 text-emerald-700">
              <CheckCircle className="h-3 w-3 mr-1" />
              Connected
            </Badge>
          ) : (
            <Badge variant="outline" className="text-slate-600">
              <XCircle className="h-3 w-3 mr-1" />
              Not Connected
            </Badge>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <Label>Channel Name (optional)</Label>
            <Input
              placeholder="e.g., Team Activities"
              value={formData.channel_name || ''}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                channel_name: e.target.value 
              }))}
            />
            <p className="text-xs text-slate-500 mt-1">
              For your reference - helps you remember which channel this is for
            </p>
          </div>

          <div>
            <Label>Incoming Webhook URL</Label>
            <Input
              type="url"
              placeholder="https://outlook.office.com/webhook/..."
              value={formData.webhook_url || ''}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                webhook_url: e.target.value 
              }))}
            />
            <a
              href="https://learn.microsoft.com/en-us/microsoftteams/platform/webhooks-and-connectors/how-to/add-incoming-webhook"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1 mt-2"
            >
              How to get your webhook URL
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleTest}
              disabled={!formData.webhook_url || testing}
              variant="outline"
              className="flex-1"
            >
              {testing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <TestTube className="h-4 w-4 mr-2" />
                  Test Connection
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* Notification Settings */}
      <Card className="p-6 border-0 shadow-lg">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Notification Settings</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div>
              <Label className="text-base font-semibold">Master Toggle</Label>
              <p className="text-sm text-slate-600">Enable/disable all Teams notifications</p>
            </div>
            <Switch
              checked={formData.notifications_enabled}
              onCheckedChange={(checked) => setFormData(prev => ({ 
                ...prev, 
                notifications_enabled: checked 
              }))}
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-blue-600" />
              <div>
                <Label className="text-base">Event Announcements</Label>
                <p className="text-sm text-slate-600">When you schedule a new event</p>
              </div>
            </div>
            <Switch
              checked={formData.send_announcement}
              onCheckedChange={(checked) => setFormData(prev => ({ 
                ...prev, 
                send_announcement: checked 
              }))}
              disabled={!formData.notifications_enabled}
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-orange-600" />
              <div>
                <Label className="text-base">24-Hour Reminders</Label>
                <p className="text-sm text-slate-600">Automatic reminder before events</p>
              </div>
            </div>
            <Switch
              checked={formData.send_reminder}
              onCheckedChange={(checked) => setFormData(prev => ({ 
                ...prev, 
                send_reminder: checked 
              }))}
              disabled={!formData.notifications_enabled}
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-emerald-600" />
              <div>
                <Label className="text-base">Post-Event Recaps</Label>
                <p className="text-sm text-slate-600">Summary with stats and feedback</p>
              </div>
            </div>
            <Switch
              checked={formData.send_recap}
              onCheckedChange={(checked) => setFormData(prev => ({ 
                ...prev, 
                send_recap: checked 
              }))}
              disabled={!formData.notifications_enabled}
            />
          </div>
        </div>
      </Card>

      {/* Message Templates */}
      <Card className="p-6 border-0 shadow-lg">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Message Templates (Optional)</h3>
        <p className="text-sm text-slate-600 mb-4">
          Customize the introduction text for each notification type. Leave blank for defaults.
        </p>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="announcement">
            <AccordionTrigger>Announcement Template</AccordionTrigger>
            <AccordionContent>
              <Textarea
                placeholder="e.g., 🎉 Exciting news team! We have a new activity scheduled..."
                value={formData.announcement_template || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  announcement_template: e.target.value 
                }))}
                rows={3}
              />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="reminder">
            <AccordionTrigger>Reminder Template</AccordionTrigger>
            <AccordionContent>
              <Textarea
                placeholder="e.g., ⏰ Don't forget! Our team activity is coming up soon..."
                value={formData.reminder_template || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  reminder_template: e.target.value 
                }))}
                rows={3}
              />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="recap">
            <AccordionTrigger>Recap Template</AccordionTrigger>
            <AccordionContent>
              <Textarea
                placeholder="e.g., 📊 What an amazing event! Here's how it went..."
                value={formData.recap_template || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  recap_template: e.target.value 
                }))}
                rows={3}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saveMutation.isLoading}
          className="bg-indigo-600 hover:bg-indigo-700 px-8"
        >
          {saveMutation.isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Configuration
            </>
          )}
        </Button>
      </div>
    </div>
  );
}