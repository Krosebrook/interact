import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Sparkles, FileText, AlertTriangle, Shield, Download } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

export default function AIAdminAssistant() {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState(null);
  const [activeTab, setActiveTab] = useState('chat');

  const assistantMutation = useMutation({
    mutationFn: async (action) => {
      const result = await base44.functions.invoke('aiAdminAssistant', action);
      return result.data || result;
    },
    onSuccess: (data) => {
      setResponse(data);
      toast.success('Analysis complete');
      setQuery(''); // Clear query after success
    },
    onError: (error) => toast.error(error.message || 'Failed to process request')
  });

  const quickActions = [
    {
      id: 'engagement_report',
      label: 'Generate Engagement Report',
      icon: FileText,
      action: { action: 'generate_report', report_type: 'engagement' }
    },
    {
      id: 'system_health',
      label: 'Check System Health',
      icon: AlertTriangle,
      action: { action: 'system_health_check' }
    },
    {
      id: 'trend_analysis',
      label: 'Long-Term Trend Analysis',
      icon: Download,
      action: { action: 'trend_analysis' }
    },
    {
      id: 'create_role',
      label: 'Create Role from Description',
      icon: Shield,
      prompt: true
    }
  ];

  return (
    <Card data-b44-sync="true" data-feature="admin" data-component="aiadminassistant">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-600" />
          AI Admin Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickActions.map(action => {
            const Icon = action.icon;
            return (
              <Button
                key={action.id}
                variant="outline"
                onClick={() => {
                  if (action.prompt) {
                    setActiveTab('chat');
                  } else {
                    assistantMutation.mutate(action.action);
                  }
                }}
                disabled={assistantMutation.isPending}
                className="flex flex-col h-auto py-4"
              >
                <Icon className="h-5 w-5 mb-2" />
                <span className="text-xs text-center">{action.label}</span>
              </Button>
            );
          })}
        </div>

        {/* Chat Interface */}
        <div className="space-y-3">
          <Textarea
            placeholder="Ask the AI assistant anything... e.g., 'Create a Content Manager role with event creation and channel moderation permissions'"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            rows={3}
          />
          <Button
            onClick={() => assistantMutation.mutate({ action: 'custom_query', query })}
            disabled={!query || assistantMutation.isPending}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {assistantMutation.isPending ? 'Processing...' : 'Ask AI Assistant'}
          </Button>
        </div>

        {/* Response Display */}
        {response && (
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            {response.report_type && (
              <div className="flex items-center justify-between mb-3">
                <Badge className="bg-purple-600">
                  {response.report_type.replace('_', ' ').toUpperCase()}
                </Badge>
                {response.downloadable && (
                  <Button size="sm" variant="outline">
                    <Download className="h-3 w-3 mr-1" />
                    Export
                  </Button>
                )}
              </div>
            )}
            
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown>{response.content || response.analysis}</ReactMarkdown>
            </div>

            {response.role_config && (
              <div className="mt-4 p-3 bg-white rounded border">
                <h4 className="font-medium mb-2">Generated Role Configuration:</h4>
                <pre className="text-xs bg-slate-100 p-3 rounded overflow-auto">
                  {JSON.stringify(response.role_config, null, 2)}
                </pre>
                <Button
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(response.role_config, null, 2));
                    toast.success('Configuration copied to clipboard');
                  }}
                >
                  Copy Configuration
                </Button>
              </div>
            )}

            {response.recommendations && response.recommendations.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="font-medium text-slate-900">Recommendations:</h4>
                {response.recommendations.map((rec, idx) => (
                  <div key={idx} className="p-3 bg-white rounded border border-slate-200">
                    <div className="flex items-start gap-2">
                      <Badge variant={rec.priority === 'high' ? 'destructive' : 'secondary'}>
                        {rec.priority}
                      </Badge>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{rec.title}</p>
                        <p className="text-sm text-slate-600 mt-1">{rec.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}