import React from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function IntegrationCard({ integration, onStatusChange }) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const toggleMutation = useMutation({
    mutationFn: async (action) => {
      const response = await base44.functions.invoke('integrationsManager', {
        action,
        integrationId: integration.id
      });
      return response.data;
    },
    onSuccess: (data) => {
      onStatusChange?.(integration.id, !integration.is_enabled);
    }
  });

  const testMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('integrationsManager', {
        action: 'test',
        integrationId: integration.id
      });
      return response.data;
    }
  });

  const getStatusIcon = () => {
    if (integration.status === 'active') {
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    }
    if (integration.status === 'error') {
      return <AlertCircle className="w-5 h-5 text-red-600" />;
    }
    return <Clock className="w-5 h-5 text-slate-400" />;
  };

  const getStatusColor = () => {
    if (integration.status === 'active') return 'text-green-600';
    if (integration.status === 'error') return 'text-red-600';
    return 'text-slate-400';
  };

  return (
    <Card className={cn(
      'hover:shadow-md transition-all',
      integration.is_enabled && 'border-int-orange/30'
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <span className="text-3xl">{integration.icon}</span>
            <div className="flex-1">
              <CardTitle className="text-lg">{integration.name}</CardTitle>
              <p className="text-sm text-slate-600 mt-1">{integration.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon()}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1">
            {integration.features?.slice(0, 2).map((feature) => (
              <Badge key={feature} variant="outline" className="text-xs">
                {feature.replace(/_/g, ' ')}
              </Badge>
            ))}
            {integration.features?.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{integration.features.length - 2}
              </Badge>
            )}
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            size="sm"
            variant={integration.is_enabled ? 'outline' : 'default'}
            onClick={() => toggleMutation.mutate(integration.is_enabled ? 'disable' : 'enable')}
            disabled={toggleMutation.isPending}
            className="flex-1"
          >
            {toggleMutation.isPending ? 'Updating...' : (integration.is_enabled ? 'Disable' : 'Enable')}
          </Button>
          
          {integration.is_enabled && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => testMutation.mutate()}
              disabled={testMutation.isPending}
            >
              {testMutation.isPending ? 'Testing...' : 'Test'}
            </Button>
          )}
        </div>

        {integration.is_authorized && (
          <div className="text-xs text-green-600 font-medium">✓ Authorized</div>
        )}

        {integration.error_message && (
          <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
            {integration.error_message}
          </div>
        )}

        {integration.last_tested && (
          <div className="text-xs text-slate-500">
            Last tested: {new Date(integration.last_tested).toLocaleDateString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}