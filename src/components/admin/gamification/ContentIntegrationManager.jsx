import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Zap, Link as LinkIcon, CheckCircle, XCircle, Settings, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

export default function ContentIntegrationManager() {
  const [integrations] = useState([
    {
      id: 'youtube',
      name: 'YouTube',
      description: 'Embed video content from YouTube',
      icon: '📹',
      status: 'active',
      config: { api_key: '••••••••••' }
    },
    {
      id: 'coursera',
      name: 'Coursera',
      description: 'Import courses from Coursera',
      icon: '🎓',
      status: 'inactive',
      config: {}
    },
    {
      id: 'linkedin-learning',
      name: 'LinkedIn Learning',
      description: 'Sync LinkedIn Learning courses',
      icon: '💼',
      status: 'active',
      config: { client_id: '••••••••••' }
    },
    {
      id: 'udemy',
      name: 'Udemy',
      description: 'Import Udemy courses',
      icon: '🔷',
      status: 'inactive',
      config: {}
    },
    {
      id: 'notion',
      name: 'Notion',
      description: 'Link learning resources from Notion',
      icon: '📝',
      status: 'active',
      config: { api_key: '••••••••••' }
    },
    {
      id: 'google-drive',
      name: 'Google Drive',
      description: 'Access learning materials from Drive',
      icon: '📁',
      status: 'active',
      config: { client_id: '••••••••••' }
    }
  ]);

  const handleToggle = (id, newStatus) => {
    toast.success(`${integrations.find(i => i.id === id)?.name} ${newStatus ? 'enabled' : 'disabled'}`);
  };

  const handleConfigure = (integration) => {
    toast.info(`Configure ${integration.name}`, {
      description: 'Integration settings would open here'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-600" />
            External Content Integrations
          </CardTitle>
          <CardDescription>
            Connect external learning platforms and content sources
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Integration Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        {integrations.map(integration => (
          <Card key={integration.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center text-2xl">
                    {integration.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{integration.name}</h3>
                    <p className="text-sm text-slate-600">{integration.description}</p>
                  </div>
                </div>
                <Badge 
                  variant={integration.status === 'active' ? 'default' : 'secondary'}
                  className={integration.status === 'active' ? 'bg-emerald-600' : ''}
                >
                  {integration.status === 'active' ? (
                    <CheckCircle className="h-3 w-3 mr-1" />
                  ) : (
                    <XCircle className="h-3 w-3 mr-1" />
                  )}
                  {integration.status}
                </Badge>
              </div>

              {/* Config Info */}
              {integration.status === 'active' && Object.keys(integration.config).length > 0 && (
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 mb-4">
                  <p className="text-xs font-medium text-slate-700 mb-2">Configuration:</p>
                  <div className="space-y-1">
                    {Object.entries(integration.config).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between text-xs">
                        <span className="text-slate-600">{key}:</span>
                        <span className="text-slate-900 font-mono">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={integration.status === 'active'}
                    onCheckedChange={(checked) => handleToggle(integration.id, checked)}
                  />
                  <span className="text-sm text-slate-600">Enable</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleConfigure(integration)}
                >
                  <Settings className="h-3 w-3 mr-1" />
                  Configure
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add New Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5" />
            Add Custom Integration
          </CardTitle>
          <CardDescription>
            Connect a custom learning platform or content source
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Integration Name</Label>
              <Input placeholder="e.g., Internal LMS" />
            </div>
            <div className="space-y-2">
              <Label>API Endpoint</Label>
              <Input placeholder="https://api.example.com" />
            </div>
            <div className="space-y-2">
              <Label>API Key</Label>
              <Input type="password" placeholder="Enter API key..." />
            </div>
            <div className="space-y-2">
              <Label>Content Type</Label>
              <Input placeholder="e.g., Video, Article, Course" />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Zap className="h-4 w-4 mr-2" />
              Add Integration
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Integration Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Integration Usage Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 border border-slate-200 rounded-lg">
              <p className="text-2xl font-bold text-int-navy">{integrations.filter(i => i.status === 'active').length}</p>
              <p className="text-sm text-slate-600">Active Integrations</p>
            </div>
            <div className="text-center p-4 border border-slate-200 rounded-lg">
              <p className="text-2xl font-bold text-int-navy">--</p>
              <p className="text-sm text-slate-600">Content Items Synced</p>
            </div>
            <div className="text-center p-4 border border-slate-200 rounded-lg">
              <p className="text-2xl font-bold text-int-navy">--</p>
              <p className="text-sm text-slate-600">Last Sync</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}