import React, { useState } from 'react';
import StatsCard from '../dashboard/StatsCard';
import { Button } from '@/components/ui/button';
import { TrendingUp, Users, Star, Calendar, Download, FileText, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function AnalyticsHeader({ metrics = {} }) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format) => {
    setIsExporting(true);
    try {
      const response = await base44.functions.invoke('exportAnalyticsReport', { 
        format,
        dateRange: 'all'
      });

      // Create download link
      const blob = new Blob([response.data], { 
        type: format === 'pdf' ? 'application/pdf' : 'text/csv' 
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-report-${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();

      toast.success(`Analytics exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export analytics');
    } finally {
      setIsExporting(false);
    }
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Analytics Dashboard</h1>
          <p className="text-slate-600">Track engagement, attendance, and skill development insights</p>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button disabled={isExporting} className="bg-int-orange hover:bg-int-orange/90">
              {isExporting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Export Report
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleExport('pdf')}>
              <FileText className="h-4 w-4 mr-2" />
              Export as PDF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('csv')}>
              <FileText className="h-4 w-4 mr-2" />
              Export as CSV
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Events"
          value={metrics.totalEvents || 0}
          subtitle="All time"
          icon={Calendar}
          color="indigo"
        />
        <StatsCard
          title="Avg Attendance"
          value={metrics.avgParticipation || 0}
          subtitle="Per event"
          icon={Users}
          color="coral"
        />
        <StatsCard
          title="Engagement Score"
          value={metrics.avgEngagement || 0}
          subtitle="Out of 10"
          icon={Star}
          color="mint"
        />
        <StatsCard
          title="Completion Rate"
          value={`${metrics.completionRate || 0}%`}
          subtitle="Events completed"
          icon={TrendingUp}
          color="sky"
        />
      </div>
    </div>
  );
}