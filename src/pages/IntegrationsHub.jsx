import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useUserData } from '../components/hooks/useUserData';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plug, Check, Settings, Sparkles, Calendar, MessageSquare, Users, FileText } from 'lucide-react';
import { toast } from 'sonner';

const INTEGRATIONS = [
  {
    id: 'slack',
    name: 'Slack',
    icon: MessageSquare,
    description: 'Send recognition, event notifications, and milestone alerts to Slack channels',
    category: 'communication',
    status: 'available',
    features: ['Recognition notifications', 'Event reminders', 'Milestone celebrations', 'Survey alerts'],
    setupGuide: 'Connect your Slack workspace to enable notifications. Create a webhook URL from your Slack app settings.',
    docUrl: 'https://api.slack.com/messaging/webhooks'
  },
  {
    id: 'google_calendar',
    name: 'Google Calendar',
    icon: Calendar,
    description: 'Sync events to Google Calendar with bi-directional updates',
    category: 'productivity',
    status: 'available',
    features: ['Event sync', 'Calendar invites', 'Automatic reminders', 'Attendee management'],
    setupGuide: 'Authorize Google Calendar access. Events will automatically sync both ways.',
    docUrl: 'https://developers.google.com/calendar/api'
  },
  {
    id: 'ms_teams',
    name: 'Microsoft Teams',
    icon: Users,
    description: 'Post updates and notifications to Teams channels',
    category: 'communication',
    status: 'available',
    features: ['Channel notifications', 'Adaptive cards', 'Recognition posts', 'Event updates'],
    setupGuide: 'Configure Teams webhook connector to post automated updates.',
    docUrl: 'https://docs.microsoft.com/en-us/microsoftteams/platform/webhooks-and-connectors'
  },
  {
    id: 'bamboo_hr',
    name: 'BambooHR',
    icon: FileText,
    description: 'Sync employee data and automate onboarding',
    category: 'hris',
    status: 'coming_soon',
    features: ['Employee data sync', 'Onboarding automation', 'Birthday/anniversary import', 'Department sync'],
    setupGuide: 'Provide BambooHR API key to sync employee records automatically.',
    docUrl: 'https://documentation.bamboohr.com/docs'
  }
];

export default function IntegrationsHub() {
  const { user, loading } = useUserData(true, true);
  const [selectedIntegration, setSelectedIntegration] = useState(null);
  const [showSetup, setShowSetup] = useState(false);
  const queryClient = useQueryClient();

  const { data: integrations, isLoading } = useQuery({
    queryKey: ['integrations-config'],
    queryFn: () => base44.entities.Integration.list()
  });

  const { data: aiSuggestions, isLoading: suggestionsLoading } = useQuery({
    queryKey: ['integration-suggestions'],
    queryFn: async () => {
      const { data: users } = await base44.entities.User.list();
      const companySize = users?.length || 0;
      
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Recommend top 3 integrations for a remote-first tech company with ${companySize} employees.
        
Available integrations:
- Slack (team communication)
- Google Calendar (event management)
- Microsoft Teams (collaboration)
- BambooHR (HRIS)

Consider company size, remote work needs, and engagement priorities.`,
        response_json_schema: {
          type: 'object',
          properties: {
            recommendations: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  integration_id: { type: 'string' },
                  priority: { type: 'string', enum: ['high', 'medium', 'low'] },
                  reason: { type: 'string' }
                }
              }
            }
          }
        }
      });
      
      return response.recommendations;
    },
    staleTime: 3600000 // 1 hour
  });

  const toggleIntegrationMutation = useMutation({
    mutationFn: async ({ integrationId, enabled }) => {
      const existing = integrations?.find(i => i.integration_id === integrationId);
      
      if (existing) {
        return await base44.entities.Integration.update(existing.id, { is_enabled: enabled });
      } else {
        return await base44.entities.Integration.create({
          integration_id: integrationId,
          is_enabled: enabled,
          config: {}
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['integrations-config']);
      toast.success('Integration updated');
    }
  });

  if (loading || isLoading) {
    return <LoadingSpinner message="Loading integrations..." />;
  }

  const getIntegrationStatus = (integrationId) => {
    return integrations?.find(i => i.integration_id === integrationId);
  };

  return (
    <div className="space-y-6">
      <Card className="border-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <CardContent className="py-8">
          <div className="flex items-center gap-3 mb-3">
            <Plug className="h-8 w-8" />
            <h1 className="text-3xl font-bold">Integrations Hub</h1>
          </div>
          <p className="text-lg text-indigo-100">
            Connect external tools to enhance your employee engagement platform
          </p>
        </CardContent>
      </Card>

      {/* AI Recommendations */}
      {aiSuggestions && (
        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              Recommended for Your Organization
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {aiSuggestions.map((suggestion) => {
              const integration = INTEGRATIONS.find(i => i.id === suggestion.integration_id);
              if (!integration) return null;
              
              return (
                <div key={suggestion.integration_id} className="p-4 bg-white rounded-lg border border-purple-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-slate-900">{integration.name}</h4>
                        <Badge variant={suggestion.priority === 'high' ? 'default' : 'secondary'}>
                          {suggestion.priority} priority
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600">{suggestion.reason}</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedIntegration(integration);
                        setShowSetup(true);
                      }}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      Setup
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Integrations by Category */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Integrations</TabsTrigger>
          <TabsTrigger value="communication">Communication</TabsTrigger>
          <TabsTrigger value="productivity">Productivity</TabsTrigger>
          <TabsTrigger value="hris">HRIS</TabsTrigger>
        </TabsList>

        {['all', 'communication', 'productivity', 'hris'].map(category => (
          <TabsContent key={category} value={category} className="mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              {INTEGRATIONS
                .filter(i => category === 'all' || i.category === category)
                .map(integration => {
                  const status = getIntegrationStatus(integration.id);
                  const Icon = integration.icon;
                  
                  return (
                    <Card key={integration.id} className={status?.is_enabled ? 'border-green-300 bg-green-50' : ''}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-100 rounded-lg">
                              <Icon className="h-6 w-6 text-indigo-600" />
                            </div>
                            <div>
                              <CardTitle className="text-lg">{integration.name}</CardTitle>
                              <CardDescription>{integration.description}</CardDescription>
                            </div>
                          </div>
                          {status?.is_enabled && (
                            <Badge className="bg-green-600">
                              <Check className="h-3 w-3 mr-1" />
                              Active
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium text-slate-700 mb-2">Features:</h4>
                          <ul className="space-y-1">
                            {integration.features.map((feature, idx) => (
                              <li key={idx} className="text-sm text-slate-600 flex items-center gap-2">
                                <Check className="h-3 w-3 text-green-600" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t">
                          {integration.status === 'coming_soon' ? (
                            <Badge variant="secondary">Coming Soon</Badge>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={status?.is_enabled || false}
                                onCheckedChange={(checked) => 
                                  toggleIntegrationMutation.mutate({ 
                                    integrationId: integration.id, 
                                    enabled: checked 
                                  })
                                }
                              />
                              <span className="text-sm text-slate-600">
                                {status?.is_enabled ? 'Enabled' : 'Disabled'}
                              </span>
                            </div>
                          )}
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedIntegration(integration);
                              setShowSetup(true);
                            }}
                            disabled={integration.status === 'coming_soon'}
                          >
                            <Settings className="h-4 w-4 mr-2" />
                            Configure
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Setup Dialog */}
      <Dialog open={showSetup} onOpenChange={setShowSetup}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Setup {selectedIntegration?.name}</DialogTitle>
          </DialogHeader>
          
          {selectedIntegration && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Setup Guide</h4>
                <p className="text-sm text-blue-800">{selectedIntegration.setupGuide}</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg">
                <h4 className="font-medium text-slate-900 mb-2">Documentation</h4>
                <a
                  href={selectedIntegration.docUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-indigo-600 hover:underline"
                >
                  {selectedIntegration.docUrl}
                </a>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowSetup(false)}>
                  Close
                </Button>
                <Button className="bg-indigo-600 hover:bg-indigo-700">
                  Save Configuration
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}