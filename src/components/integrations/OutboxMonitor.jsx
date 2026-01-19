import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function OutboxMonitor() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: items, isLoading } = useQuery({
    queryKey: ['outbox-items', statusFilter],
    queryFn: async () => {
      if (statusFilter === 'all') {
        return await base44.entities.IntegrationOutbox.list('-created_date', 50);
      }
      return await base44.entities.IntegrationOutbox.filter({ status: statusFilter }, '-created_date', 50);
    },
    refetchInterval: 10000,
    initialData: []
  });

  const retryMutation = useMutation({
    mutationFn: async (itemId) => {
      return await base44.entities.IntegrationOutbox.update(itemId, {
        status: 'queued',
        attempt_count: 0,
        next_attempt_at: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['outbox-items']);
    }
  });

  const stats = {
    queued: items.filter(i => i.status === 'queued').length,
    sent: items.filter(i => i.status === 'sent').length,
    failed: items.filter(i => i.status === 'failed').length,
    dead_letter: items.filter(i => i.status === 'dead_letter').length
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <Card className="cursor-pointer" onClick={() => setStatusFilter('queued')}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <p className="text-sm text-slate-600">Queued</p>
            </div>
            <p className="text-3xl font-bold text-blue-600">{stats.queued}</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer" onClick={() => setStatusFilter('sent')}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <p className="text-sm text-slate-600">Sent</p>
            </div>
            <p className="text-3xl font-bold text-green-600">{stats.sent}</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer" onClick={() => setStatusFilter('failed')}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="w-4 h-4 text-orange-600" />
              <p className="text-sm text-slate-600">Failed</p>
            </div>
            <p className="text-3xl font-bold text-orange-600">{stats.failed}</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer" onClick={() => setStatusFilter('dead_letter')}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <p className="text-sm text-slate-600">Dead Letter</p>
            </div>
            <p className="text-3xl font-bold text-red-600">{stats.dead_letter}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Items</CardTitle>
            <Button size="sm" variant="outline" onClick={() => setStatusFilter('all')}>
              Show All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <p className="text-center py-8 text-slate-500">No items found</p>
          ) : (
            <div className="space-y-2">
              {items.map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={
                        item.status === 'sent' ? 'default' :
                        item.status === 'queued' ? 'secondary' :
                        item.status === 'failed' ? 'outline' : 'destructive'
                      }>
                        {item.status}
                      </Badge>
                      <span className="text-sm font-medium">{item.integration_id}</span>
                    </div>
                    <p className="text-xs text-slate-600">{item.operation} • Attempt {item.attempt_count}</p>
                    {item.last_error && (
                      <p className="text-xs text-red-600 mt-1">{item.last_error}</p>
                    )}
                  </div>
                  {(item.status === 'failed' || item.status === 'dead_letter') && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => retryMutation.mutate(item.id)}
                      disabled={retryMutation.isPending}
                    >
                      <RefreshCw className="w-3 h-3 mr-1" />
                      Retry
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}