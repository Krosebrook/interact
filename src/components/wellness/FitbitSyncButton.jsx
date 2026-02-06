import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function FitbitSyncButton({ userEmail }) {
  const queryClient = useQueryClient();
  const [lastSync, setLastSync] = useState(null);
  
  const syncMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('syncFitbitData', {});
      return response.data;
    },
    onSuccess: (data) => {
      setLastSync(new Date().toLocaleTimeString());
      queryClient.invalidateQueries(['wellnessGoals']);
      queryClient.invalidateQueries(['wellnessLogs']);
      toast.success(`Synced ${data.steps?.toLocaleString()} steps from Fitbit! 🎉`);
    },
    onError: (error) => {
      toast.error('Failed to sync Fitbit data. Please reconnect your account.');
    }
  });
  
  return (
    <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Activity className="h-5 w-5 text-blue-600" />
          Fitbit Integration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-slate-600">
          Automatically sync your daily steps and activity data
        </p>
        
        {lastSync && (
          <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 p-2 rounded">
            <CheckCircle className="h-4 w-4" />
            Last synced: {lastSync}
          </div>
        )}
        
        <Button
          onClick={() => syncMutation.mutate()}
          disabled={syncMutation.isPending}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
          {syncMutation.isPending ? 'Syncing...' : 'Sync Now'}
        </Button>
        
        <p className="text-xs text-slate-500 text-center">
          Syncs steps, heart rate, and sleep data
        </p>
      </CardContent>
    </Card>
  );
}