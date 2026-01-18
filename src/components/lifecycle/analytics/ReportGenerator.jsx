import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, ExternalLink, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ReportGenerator() {
  const [dateRange, setDateRange] = useState('30');
  const [reportType, setReportType] = useState('full');

  const generateReportMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('generateEngagementReport', {
        reportType,
        dateRange
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success('Report generated successfully!');
      window.open(data.documentUrl, '_blank');
    },
    onError: (error) => {
      toast.error('Failed to generate report: ' + error.message);
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          Generate Engagement Report
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Report Type</label>
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="full">Full Report</SelectItem>
              <SelectItem value="summary">Executive Summary</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Date Range</label>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 Days</SelectItem>
              <SelectItem value="30">Last 30 Days</SelectItem>
              <SelectItem value="60">Last 60 Days</SelectItem>
              <SelectItem value="90">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={() => generateReportMutation.mutate()}
          disabled={generateReportMutation.isPending}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {generateReportMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating Report...
            </>
          ) : (
            <>
              <FileText className="w-4 h-4 mr-2" />
              Generate Google Doc Report
            </>
          )}
        </Button>

        {generateReportMutation.isSuccess && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <p className="text-sm font-medium text-green-900">Report created successfully!</p>
                <p className="text-xs text-green-700 mt-1">
                  The report has been opened in a new tab
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(generateReportMutation.data.documentUrl, '_blank')}
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}