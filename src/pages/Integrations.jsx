import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUserData } from '../components/hooks/useUserData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import PageHeader from '../components/common/PageHeader';
import LoadingSpinner from '../components/common/LoadingSpinner';
import IntegrationCard, { INTEGRATION_INFO } from '../components/integrations/IntegrationCard';
import { 
  Plug, 
  Brain, 
  Map, 
  MessageSquare, 
  Zap, 
  Image,
  Search,
  RefreshCw,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

const INTEGRATION_CATEGORIES = {
  ai: {
    name: 'AI & Language Models',
    icon: Brain,
    keys: ['openai', 'claude', 'gemini', 'perplexity']
  },
  productivity: {
    name: 'Productivity',
    icon: MessageSquare,
    keys: ['notion', 'microsoft_teams', 'zapier']
  },
  crm: {
    name: 'CRM & Marketing',
    icon: Zap,
    keys: ['hubspot']
  },
  location: {
    name: 'Location & Maps',
    icon: Map,
    keys: ['google_maps', 'google_places']
  },
  media: {
    name: 'Media & Voice',
    icon: Image,
    keys: ['elevenlabs', 'cloudinary']
  },
  devops: {
    name: 'DevOps & Hosting',
    icon: Zap,
    keys: ['cloudflare', 'vercel']
  }
};

const DEFAULT_INTEGRATIONS = [
  { integration_name: 'OpenAI', integration_key: 'openai', is_enabled: false, status: 'disabled' },
  { integration_name: 'Claude', integration_key: 'claude', is_enabled: false, status: 'disabled' },
  { integration_name: 'Google Gemini', integration_key: 'gemini', is_enabled: false, status: 'disabled' },
  { integration_name: 'Perplexity', integration_key: 'perplexity', is_enabled: false, status: 'disabled' },
  { integration_name: 'Notion', integration_key: 'notion', is_enabled: false, status: 'disabled' },
  { integration_name: 'Microsoft Teams', integration_key: 'microsoft_teams', is_enabled: false, status: 'disabled' },
  { integration_name: 'Zapier', integration_key: 'zapier', is_enabled: false, status: 'disabled' },
  { integration_name: 'HubSpot', integration_key: 'hubspot', is_enabled: false, status: 'disabled' },
  { integration_name: 'Google Maps', integration_key: 'google_maps', is_enabled: false, status: 'disabled' },
  { integration_name: 'Google Places', integration_key: 'google_places', is_enabled: false, status: 'disabled' },
  { integration_name: 'ElevenLabs', integration_key: 'elevenlabs', is_enabled: false, status: 'disabled' },
  { integration_name: 'Cloudinary', integration_key: 'cloudinary', is_enabled: false, status: 'disabled' },
  { integration_name: 'Cloudflare', integration_key: 'cloudflare', is_enabled: false, status: 'disabled' },
  { integration_name: 'Vercel', integration_key: 'vercel', is_enabled: false, status: 'disabled' }
];

export default function Integrations() {
  const queryClient = useQueryClient();
  const { user, loading, isAdmin } = useUserData(true, true);
  const [searchQuery, setSearchQuery] = useState('');
  const [configuring, setConfiguring] = useState(null);
  const [testing, setTesting] = useState(null);
  const [testResult, setTestResult] = useState(null);

  const { data: integrations = [], isLoading } = useQuery({
    queryKey: ['integrations'],
    queryFn: () => base44.entities.Integration.list()
  });

  // Merge saved integrations with defaults
  const allIntegrations = DEFAULT_INTEGRATIONS.map(def => {
    const saved = integrations.find(i => i.integration_key === def.integration_key);
    return saved || def;
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ integration, enabled }) => {
      const existing = integrations.find(i => i.integration_key === integration.integration_key);
      if (existing) {
        return base44.entities.Integration.update(existing.id, { 
          is_enabled: enabled,
          status: enabled ? 'active' : 'disabled'
        });
      } else {
        return base44.entities.Integration.create({
          ...integration,
          is_enabled: enabled,
          status: enabled ? 'active' : 'disabled'
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['integrations']);
      toast.success('Integration updated');
    }
  });

  const testMutation = useMutation({
    mutationFn: async (integration) => {
      setTesting(integration.integration_key);
      setTestResult(null);

      let functionName;
      let testPayload;

      switch (integration.integration_key) {
        case 'openai':
          functionName = 'openaiIntegration';
          testPayload = { action: 'chat', prompt: 'Say "Integration test successful!" in one line.' };
          break;
        case 'claude':
          functionName = 'claudeIntegration';
          testPayload = { action: 'chat', prompt: 'Say "Integration test successful!" in one line.' };
          break;
        case 'gemini':
          functionName = 'geminiIntegration';
          testPayload = { action: 'chat', prompt: 'Say "Integration test successful!" in one line.' };
          break;
        case 'perplexity':
          functionName = 'perplexityIntegration';
          testPayload = { query: 'What is the current date?' };
          break;
        case 'notion':
          functionName = 'notionIntegration';
          testPayload = { action: 'list_databases' };
          break;
        case 'google_maps':
          functionName = 'googleMapsIntegration';
          testPayload = { action: 'geocode', query: 'New York City' };
          break;
        case 'elevenlabs':
          functionName = 'elevenlabsIntegration';
          testPayload = { action: 'list_voices' };
          break;
        default:
          throw new Error('No test available for this integration');
      }

      const response = await base44.functions.invoke(functionName, testPayload);
      return response.data;
    },
    onSuccess: (data) => {
      setTestResult({ success: true, data });
      toast.success('Integration test passed!');
    },
    onError: (error) => {
      setTestResult({ success: false, error: error.message });
      toast.error('Integration test failed');
    },
    onSettled: () => {
      setTesting(null);
    }
  });

  const filteredIntegrations = allIntegrations.filter(i => 
    i.integration_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.integration_key.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const enabledCount = allIntegrations.filter(i => i.is_enabled).length;

  if (loading || !user) {
    return <LoadingSpinner className="min-h-[60vh]" />;
  }

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Integrations" 
        description="Connect external services to enhance your platform"
      >
        <Badge className="bg-int-navy text-white">
          {enabledCount} Active
        </Badge>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{allIntegrations.length}</div>
            <div className="text-sm text-slate-500">Available</div>
          </CardContent>
        </Card>
        <Card className="bg-green-50">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-600">{enabledCount}</div>
            <div className="text-sm text-slate-500">Enabled</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">
              {integrations.reduce((sum, i) => sum + (i.usage_count || 0), 0)}
            </div>
            <div className="text-sm text-slate-500">Total Calls</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">
              {allIntegrations.filter(i => i.status === 'error').length}
            </div>
            <div className="text-sm text-slate-500">Errors</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search integrations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Categories */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="flex flex-wrap h-auto gap-2">
          <TabsTrigger value="all">
            <Plug className="h-4 w-4 mr-2" />
            All
          </TabsTrigger>
          {Object.entries(INTEGRATION_CATEGORIES).map(([key, cat]) => {
            const Icon = cat.icon;
            return (
              <TabsTrigger key={key} value={key}>
                <Icon className="h-4 w-4 mr-2" />
                {cat.name}
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="all">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredIntegrations.map(integration => (
              <IntegrationCard
                key={integration.integration_key}
                integration={integration}
                onToggle={(i, enabled) => toggleMutation.mutate({ integration: i, enabled })}
                onConfigure={setConfiguring}
                onTest={(i) => testMutation.mutate(i)}
              />
            ))}
          </div>
        </TabsContent>

        {Object.entries(INTEGRATION_CATEGORIES).map(([key, cat]) => (
          <TabsContent key={key} value={key}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredIntegrations
                .filter(i => cat.keys.includes(i.integration_key))
                .map(integration => (
                  <IntegrationCard
                    key={integration.integration_key}
                    integration={integration}
                    onToggle={(i, enabled) => toggleMutation.mutate({ integration: i, enabled })}
                    onConfigure={setConfiguring}
                    onTest={(i) => testMutation.mutate(i)}
                  />
                ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Configure Dialog */}
      <Dialog open={!!configuring} onOpenChange={() => setConfiguring(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configure {configuring?.integration_name}</DialogTitle>
            <DialogDescription>
              API keys are managed in Settings → Environment Variables
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Required Secrets</h4>
              <ul className="text-sm text-slate-600 space-y-1">
                {configuring?.integration_key === 'openai' && <li>• OPENAI_API_KEY</li>}
                {configuring?.integration_key === 'claude' && <li>• ANTHROPIC_API_KEY</li>}
                {configuring?.integration_key === 'gemini' && <li>• GOOGLE_API_KEY</li>}
                {configuring?.integration_key === 'perplexity' && <li>• PERPLEXITY_API_KEY</li>}
                {configuring?.integration_key === 'notion' && <li>• NOTION_API_KEY</li>}
                {configuring?.integration_key === 'google_maps' && <li>• GOOGLE_API_KEY</li>}
                {configuring?.integration_key === 'hubspot' && <li>• HUBSPOT_API_KEY</li>}
                {configuring?.integration_key === 'elevenlabs' && <li>• ELEVENLABS_API_KEY</li>}
                {configuring?.integration_key === 'cloudinary' && (
                  <>
                    <li>• CLOUDINARY_CLOUD_NAME</li>
                    <li>• CLOUDINARY_API_KEY</li>
                    <li>• CLOUDINARY_API_SECRET</li>
                  </>
                )}
                {configuring?.integration_key === 'cloudflare' && (
                  <>
                    <li>• CLOUDFLARE_API_KEY</li>
                    <li>• CLOUDFLARE_ACCOUNT_ID (optional)</li>
                  </>
                )}
                {configuring?.integration_key === 'vercel' && <li>• VERCEL_TOKEN</li>}
              </ul>
            </div>

            {testResult && (
              <div className={`p-4 rounded-lg ${testResult.success ? 'bg-green-50' : 'bg-red-50'}`}>
                <div className="flex items-center gap-2 mb-2">
                  {testResult.success ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <span className="font-medium">
                    {testResult.success ? 'Test Passed' : 'Test Failed'}
                  </span>
                </div>
                <pre className="text-xs overflow-auto max-h-40">
                  {JSON.stringify(testResult.success ? testResult.data : testResult.error, null, 2)}
                </pre>
              </div>
            )}

            <Button
              onClick={() => testMutation.mutate(configuring)}
              disabled={testing === configuring?.integration_key}
              className="w-full"
            >
              {testing === configuring?.integration_key ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Testing...</>
              ) : (
                <><RefreshCw className="h-4 w-4 mr-2" /> Test Connection</>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}