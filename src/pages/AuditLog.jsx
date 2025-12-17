/**
 * AUDIT LOG PAGE - Owner/Admin only
 * View all system actions and changes
 */

import React, { useState } from 'react';
import { useUserData } from '../components/hooks/useUserData.jsx';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Shield, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { format } from 'date-fns';
import { hasPermission } from '../components/lib/rbac/roles';

export default function AuditLog() {
  const { user, loading: userLoading } = useUserData(true, true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');

  // Fetch audit logs
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: () => base44.entities.AuditLog.list('-created_date', 100),
    enabled: hasPermission(user, 'VIEW_AUDIT_LOG')
  });

  if (userLoading || isLoading) {
    return <LoadingSpinner className="min-h-[60vh]" message="Loading audit log..." />;
  }

  if (!hasPermission(user, 'VIEW_AUDIT_LOG')) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="p-8 text-center">
          <Shield className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Access Denied</h2>
          <p className="text-slate-600">You don't have permission to view the audit log</p>
        </Card>
      </div>
    );
  }

  // Filter logs
  const filteredLogs = logs.filter(log => {
    const matchesSearch = !searchQuery || 
      log.actor_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.target_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    const matchesSeverity = severityFilter === 'all' || log.severity === severityFilter;
    
    return matchesSearch && matchesAction && matchesSeverity;
  });

  const severityIcons = {
    low: <Info className="h-4 w-4 text-blue-500" />,
    medium: <AlertCircle className="h-4 w-4 text-yellow-500" />,
    high: <AlertTriangle className="h-4 w-4 text-orange-500" />,
    critical: <Shield className="h-4 w-4 text-red-500" />
  };

  const severityColors = {
    low: 'bg-blue-100 text-blue-700',
    medium: 'bg-yellow-100 text-yellow-700',
    high: 'bg-orange-100 text-orange-700',
    critical: 'bg-red-100 text-red-700'
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-int-navy mb-2">Audit Log</h1>
        <p className="text-slate-600">System activity and security events</p>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by user or action..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="w-full lg:w-40">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severity</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>

          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-full lg:w-48">
              <SelectValue placeholder="Action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="role_changed">Role Changed</SelectItem>
              <SelectItem value="user_suspended">User Suspended</SelectItem>
              <SelectItem value="user_activated">User Activated</SelectItem>
              <SelectItem value="invitation_sent">Invitation Sent</SelectItem>
              <SelectItem value="data_exported">Data Exported</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Log entries */}
      <div className="space-y-3">
        {filteredLogs.map(log => (
          <Card key={log.id} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3">
              <div className="mt-1">{severityIcons[log.severity] || severityIcons.low}</div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      {log.action?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </h3>
                    <p className="text-sm text-slate-600">
                      by <span className="font-medium">{log.actor_email}</span>
                      {log.target_email && (
                        <> → <span className="font-medium">{log.target_email}</span></>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={severityColors[log.severity]}>
                      {log.severity}
                    </Badge>
                    <span className="text-xs text-slate-500 whitespace-nowrap">
                      {format(new Date(log.created_date), 'MMM d, h:mm a')}
                    </span>
                  </div>
                </div>

                {log.changes && (
                  <div className="text-xs bg-slate-50 rounded p-2 mt-2 font-mono">
                    <div className="grid grid-cols-2 gap-2">
                      {log.changes.before && (
                        <div>
                          <span className="text-slate-500">Before:</span>
                          <pre className="mt-1 text-slate-700">
                            {JSON.stringify(log.changes.before, null, 2)}
                          </pre>
                        </div>
                      )}
                      {log.changes.after && (
                        <div>
                          <span className="text-slate-500">After:</span>
                          <pre className="mt-1 text-slate-700">
                            {JSON.stringify(log.changes.after, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}

        {filteredLogs.length === 0 && (
          <Card className="p-8 text-center">
            <p className="text-slate-600">No audit log entries found</p>
          </Card>
        )}
      </div>
    </div>
  );
}