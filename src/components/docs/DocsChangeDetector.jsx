import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  FileText,
  Activity,
  Loader2,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

export default function DocsChangeDetector() {
  const [isRebuilding, setIsRebuilding] = useState(false);
  const queryClient = useQueryClient();

  // Fetch the latest knowledge base metadata
  const { data: metadata, isLoading } = useQuery({
    queryKey: ['docs-metadata'],
    queryFn: async () => {
      try {
        const docs = await base44.entities.ProjectDocumentation.filter({});
        return docs[0] || null;
      } catch (err) {
        // Entity might not exist yet
        return null;
      }
    },
    refetchInterval: 60000, // Refetch every minute to detect changes
    staleTime: 30000
  });

  // Rebuild mutation
  const rebuildMutation = useMutation({
    mutationFn: async () => {
      setIsRebuilding(true);
      const response = await base44.functions.invoke('rebuildDocsKnowledgeBase', {});
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['docs-metadata']);
      toast.success(
        `Knowledge base updated! Processed ${data.metadata.document_count} documents.`
      );
      setIsRebuilding(false);
    },
    onError: (error) => {
      toast.error('Failed to rebuild: ' + error.message);
      setIsRebuilding(false);
    }
  });

  const handleRebuild = () => {
    rebuildMutation.mutate();
  };

  const timeSinceLastBuild = metadata?.rebuild_date 
    ? formatDistanceToNow(new Date(metadata.rebuild_date), { addSuffix: true })
    : 'Never';

  const buildStatus = metadata ? 'up-to-date' : 'needs-build';

  return (
    <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              AI Knowledge Base Status
            </CardTitle>
            <CardDescription>
              Automatic documentation monitoring and refresh system
            </CardDescription>
          </div>
          <Badge 
            variant={buildStatus === 'up-to-date' ? 'default' : 'secondary'}
            className={buildStatus === 'up-to-date' ? 'bg-green-500' : 'bg-amber-500'}
          >
            {buildStatus === 'up-to-date' ? (
              <>
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Up to Date
              </>
            ) : (
              <>
                <AlertCircle className="h-3 w-3 mr-1" />
                Build Needed
              </>
            )}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Status Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-3 border border-blue-100">
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <Clock className="h-3 w-3" />
              Last Build
            </div>
            <div className="text-sm font-semibold text-slate-900">
              {timeSinceLastBuild}
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 border border-blue-100">
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <FileText className="h-3 w-3" />
              Documents
            </div>
            <div className="text-sm font-semibold text-slate-900">
              {metadata?.document_count || 0}
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 border border-blue-100">
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <Zap className="h-3 w-3" />
              Size
            </div>
            <div className="text-sm font-semibold text-slate-900">
              {metadata?.total_size_kb || '0'} KB
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 border border-blue-100">
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <Activity className="h-3 w-3" />
              Build Time
            </div>
            <div className="text-sm font-semibold text-slate-900">
              {metadata?.build_time_ms || '0'}ms
            </div>
          </div>
        </div>

        {/* Info Alert */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            The AI knowledge base is automatically rebuilt when documentation changes are detected.
            You can also manually trigger a rebuild if you've made recent updates.
          </AlertDescription>
        </Alert>

        {/* Processed Files */}
        {metadata?.files_processed && metadata.files_processed.length > 0 && (
          <div className="bg-white rounded-lg p-3 border border-slate-200">
            <h4 className="text-xs font-semibold text-slate-700 mb-2">
              Included Documents ({metadata.files_processed.length})
            </h4>
            <div className="flex flex-wrap gap-1">
              {metadata.files_processed.map((file, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {file}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Errors */}
        {metadata?.errors && metadata.errors.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="text-sm font-medium mb-1">
                {metadata.errors.length} error(s) during last build:
              </div>
              <ul className="text-xs space-y-1">
                {metadata.errors.map((err, idx) => (
                  <li key={idx}>
                    {err.file}: {err.error}
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Manual Rebuild Button */}
        <div className="flex gap-3">
          <Button
            onClick={handleRebuild}
            disabled={isRebuilding || rebuildMutation.isPending}
            className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
          >
            {isRebuilding || rebuildMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Rebuilding...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Rebuild Knowledge Base
              </>
            )}
          </Button>
        </div>

        {/* Last Build Info */}
        {metadata?.triggered_by && (
          <div className="text-xs text-slate-500 text-center">
            Last rebuilt by {metadata.triggered_by} on{' '}
            {new Date(metadata.rebuild_date).toLocaleString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}