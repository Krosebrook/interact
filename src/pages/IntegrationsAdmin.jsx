import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Play, RefreshCw, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const INTEGRATIONS = [
  { id: 'google_sheets', name: 'Google Sheets', type: 'oauth', connector: 'googlesheets' },
  { id: 'google_drive', name: 'Google Drive', type: 'oauth', connector: 'googledrive' },
  { id: 'google_docs', name: 'Google Docs', type: 'oauth', connector: 'googledocs' },
  { id: 'google_slides', name: 'Google Slides', type: 'oauth', connector: 'googleslides' },
  { id: 'google_calendar', name: 'Google Calendar', type: 'oauth', connector: 'googlecalendar' },
  { id: 'slack', name: 'Slack', type: 'oauth', connector: 'slack' },
  { id: 'notion', name: 'Notion', type: 'oauth', connector: 'notion' },
  { id: 'linkedin', name: 'LinkedIn', type: 'oauth', connector: 'linkedin' },
  { id: 'tiktok', name: 'TikTok', type: 'oauth', connector: 'tiktok' },
  { id: 'resend', name: 'Resend', type: 'manual', secrets: ['RESEND_API_KEY'] },
  { id: 'twilio', name: 'Twilio', type: 'manual', secrets: ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_FROM_NUMBER'] },
  { id: 'openai_tts', name: 'OpenAI TTS', type: 'manual', secrets: ['OPENAI_API_KEY'] },
  { id: 'elevenlabs', name: 'ElevenLabs', type: 'manual', secrets: ['ELEVENLABS_API_KEY'] },
  { id: 'fal_ai', name: 'Fal AI', type: 'manual', secrets: ['FAL_API_KEY'] },
  { id: 'brightdata', name: 'BrightData', type: 'manual', secrets: ['BRIGHTDATA_USERNAME', 'BRIGHTDATA_PASSWORD'] },
  { id: 'x', name: 'X (Twitter)', type: 'manual', secrets: ['X_API_KEY', 'X_API_SECRET'] },
  { id: 'hubspot', name: 'HubSpot', type: 'manual', secrets: ['HUBSPOT_PRIVATE_APP_TOKEN'] },
  { id: 'monday', name: 'Monday.com', type: 'manual', secrets: ['MONDAY_API_TOKEN'] },
  { id: 'zapier', name: 'Zapier', type: 'manual', secrets: ['ZAPIER_WEBHOOK_URL'] },
  { id: 'custom_api', name: 'Custom API', type: 'manual', secrets: ['CUSTOM_API_BASE_URL', 'CUSTOM_API_API_KEY_OR_TOKEN'] }
];

const EXISTING_SECRETS = [
  'OPENAI_API_KEY', 'ELEVENLABS_API_KEY', 'HUBSPOT_PERSONAL_ACCESS_KEY'
];

export default function IntegrationsAdmin() {
  const queryClient = useQueryClient();
  const [runningJobs, setRunningJobs] = useState(new Set());

  const { data: outboxStats } = useQuery({
    queryKey: ['outbox-stats'],
    queryFn: async () => {
      const all = await base44.entities.IntegrationOutbox.list();
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const recent = all.filter(item => item.created_date > twentyFourHoursAgo);
      
      return INTEGRATIONS.map(integration => {
        const items = recent.filter(item => item.integration_id === integration.id);
        return {
          integration_id: integration.id,
          queued: items.filter(i => i.status === 'queued').length,
          sent: items.filter(i => i.status === 'sent').length,
          failed: items.filter(i => i.status === 'failed').length,
          dead_letter: items.filter(i => i.status === 'dead_letter').length
        };
      });
    },
    refetchInterval: 10000
  });

  const { data: reconcileRuns } = useQuery({
    queryKey: ['reconcile-runs'],
    queryFn: async () => {
      const all = await base44.entities.ReconcileRun.list('-created_date', 50);
      const byIntegration = {};
      all.forEach(run => {
        if (!byIntegration[run.integration_id] || run.created_date > byIntegration[run.integration_id].created_date) {
          byIntegration[run.integration_id] = run;
        }
      });
      return byIntegration;
    },
    refetchInterval: 30000
  });

  const { data: integrationConfigs } = useQuery({
    queryKey: ['integration-configs'],
    queryFn: () => base44.entities.IntegrationConfig.list()
  });

  const dispatchMutation = useMutation({
    mutationFn: () => base44.functions.invoke('dispatchOutbox', {}),
    onSuccess: (data) => {
      toast.success(`Dispatched: ${data.data.sent} sent, ${data.data.failed} failed`);
      queryClient.invalidateQueries({ queryKey: ['outbox-stats'] });
    },
    onError: (error) => {
      toast.error(`Dispatch failed: ${error.message}`);
    }
  });

  const reconcileMutation = useMutation({
    mutationFn: (integrationId) => {
      const functionName = `reconcile${integrationId.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')}`;
      return base44.functions.invoke(functionName, {});
    },
    onSuccess: (data, integrationId) => {
      toast.success(`${integrationId} reconciliation completed`);
      queryClient.invalidateQueries({ queryKey: ['reconcile-runs'] });
      queryClient.invalidateQueries({ queryKey: ['outbox-stats'] });
      setRunningJobs(prev => {
        const next = new Set(prev);
        next.delete(integrationId);
        return next;
      });
    },
    onError: (error, integrationId) => {
      toast.error(`Reconciliation failed: ${error.message}`);
      setRunningJobs(prev => {
        const next = new Set(prev);
        next.delete(integrationId);
        return next;
      });
    }
  });

  const handleReconcile = (integrationId) => {
    setRunningJobs(prev => new Set(prev).add(integrationId));
    reconcileMutation.mutate(integrationId);
  };

  const getSecretStatus = (integration) => {
    if (integration.type === 'oauth') return { configured: true, type: 'connector' };
    
    const missing = integration.secrets?.filter(s => !EXISTING_SECRETS.includes(s)) || [];
    return {
      configured: missing.length === 0,
      type: 'secrets',
      missing
    };
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      case 'running':
        return <Badge className="bg-blue-100 text-blue-800"><Clock className="w-3 h-3 mr-1" />Running</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="outline">Not Run</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-int-navy">Integrations Admin</h1>
          <p className="text-slate-600 mt-1">Manage external integrations with outbox pattern safety</p>
        </div>
        <Button
          onClick={() => dispatchMutation.mutate()}
          disabled={dispatchMutation.isPending}
          className="bg-int-orange hover:bg-int-orange-dark"
        >
          <Play className="w-4 h-4 mr-2" />
          {dispatchMutation.isPending ? 'Dispatching...' : 'Dispatch Outbox Now'}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Queued</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {outboxStats?.reduce((sum, s) => sum + s.queued, 0) || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Sent (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {outboxStats?.reduce((sum, s) => sum + s.sent, 0) || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Failed (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {outboxStats?.reduce((sum, s) => sum + s.failed, 0) || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Dead Letter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {outboxStats?.reduce((sum, s) => sum + s.dead_letter, 0) || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Integrations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Integrations Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {INTEGRATIONS.map(integration => {
              const stats = outboxStats?.find(s => s.integration_id === integration.id);
              const lastRun = reconcileRuns?.[integration.id];
              const secretStatus = getSecretStatus(integration);
              const isRunning = runningJobs.has(integration.id);

              return (
                <div key={integration.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-48">
                      <div className="font-medium text-int-navy">{integration.name}</div>
                      <div className="text-sm text-slate-500">{integration.id}</div>
                    </div>
                    
                    <div className="flex gap-2">
                      {secretStatus.configured ? (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          {secretStatus.type === 'connector' ? 'Connected' : 'Configured'}
                        </Badge>
                      ) : (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Missing: {secretStatus.missing?.join(', ')}
                        </Badge>
                      )}
                    </div>

                    <div className="flex gap-2 text-sm">
                      <span className="text-slate-600">Queued: <span className="font-medium">{stats?.queued || 0}</span></span>
                      <span className="text-green-600">Sent: <span className="font-medium">{stats?.sent || 0}</span></span>
                      <span className="text-red-600">Failed: <span className="font-medium">{stats?.failed || 0}</span></span>
                    </div>

                    <div className="flex items-center gap-2">
                      {lastRun && (
                        <>
                          {getStatusBadge(lastRun.status)}
                          <span className="text-xs text-slate-500">
                            {new Date(lastRun.started_at).toLocaleString()}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleReconcile(integration.id)}
                    disabled={isRunning || reconcileMutation.isPending}
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${isRunning ? 'animate-spin' : ''}`} />
                    {isRunning ? 'Running...' : 'Reconcile'}
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Setup Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Setup Checklist</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <h3 className="font-medium mb-2">OAuth Connectors (Authorize in Base44 UI):</h3>
              <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                <li>Google Sheets, Drive, Docs, Slides, Calendar</li>
                <li>Slack (user token integration)</li>
                <li>Notion</li>
                <li>LinkedIn</li>
                <li>TikTok</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">Manual Secrets (Set in Base44 Secrets):</h3>
              <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                <li>RESEND_API_KEY, TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER</li>
                <li>FAL_API_KEY, BRIGHTDATA_USERNAME, BRIGHTDATA_PASSWORD</li>
                <li>X_API_KEY, X_API_SECRET, MONDAY_API_TOKEN, ZAPIER_WEBHOOK_URL</li>
                <li>CUSTOM_API_BASE_URL, CUSTOM_API_API_KEY_OR_TOKEN</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}