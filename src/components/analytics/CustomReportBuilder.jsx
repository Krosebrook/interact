/**
 * Custom Report Builder
 * Admins can create and schedule custom analytics reports
 */

import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, FileText, Mail, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function CustomReportBuilder() {
  const [reports, setReports] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    metrics: [],
    recipients: '',
    frequency: 'weekly',
    format: 'pdf'
  });

  const handleAddReport = async () => {
    try {
      await base44.functions.invoke('createCustomReport', {
        ...formData,
        recipients: formData.recipients.split(',').map(r => r.trim())
      });
      toast.success('Report created successfully');
      setIsCreating(false);
      setFormData({ name: '', metrics: [], recipients: '', frequency: 'weekly', format: 'pdf' });
    } catch (error) {
      toast.error('Failed to create report');
    }
  };

  const toggleMetric = (metric) => {
    setFormData(prev => ({
      ...prev,
      metrics: prev.metrics.includes(metric)
        ? prev.metrics.filter(m => m !== metric)
        : [...prev.metrics, metric]
    }));
  };

  const reportTemplates = [
    {
      name: 'Weekly Executive Summary',
      description: 'KPIs, trends, and top performers',
      metrics: ['engagement_score', 'active_users', 'points_awarded', 'top_actions']
    },
    {
      name: 'Monthly Engagement Report',
      description: 'Cohort analysis, retention, growth',
      metrics: ['cohort_retention', 'engagement_trajectory', 'new_users', 'churn_risk']
    },
    {
      name: 'Department Performance',
      description: 'By-department engagement metrics',
      metrics: ['department_engagement', 'team_leaderboard', 'badges_by_dept']
    }
  ];

  return (
    <div className="space-y-6">
      {/* Report Templates */}
      <div>
        <h3 className="text-lg font-bold mb-4">Quick Start Templates</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {reportTemplates.map((template, idx) => (
            <Card key={idx} className="cursor-pointer hover:shadow-lg transition">
              <CardContent className="pt-6">
                <p className="font-medium">{template.name}</p>
                <p className="text-sm text-slate-600 mt-2">{template.description}</p>
                <Button
                  size="sm"
                  className="mt-4 w-full"
                  onClick={() => setFormData({ ...formData, name: template.name, metrics: template.metrics })}
                >
                  Use Template
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Custom Report Builder */}
      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogTrigger asChild>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create Custom Report
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-xl">
          <DialogTitle>Build Custom Report</DialogTitle>

          <div className="space-y-4">
            {/* Report Name */}
            <div>
              <label className="text-sm font-medium">Report Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Q1 Performance Analysis"
                className="w-full mt-1 px-3 py-2 border rounded-lg"
              />
            </div>

            {/* Metrics Selection */}
            <div>
              <label className="text-sm font-medium mb-2 block">Select Metrics</label>
              <div className="space-y-2">
                {[
                  { id: 'engagement_score', label: 'Engagement Score' },
                  { id: 'active_users', label: 'Active Users' },
                  { id: 'churn_risk', label: 'Churn Risk Analysis' },
                  { id: 'cohort_analysis', label: 'Cohort Retention' },
                  { id: 'top_actions', label: 'Popular Actions' },
                  { id: 'badge_trends', label: 'Badge Trends' },
                  { id: 'challenges', label: 'Challenge Performance' }
                ].map(metric => (
                  <label key={metric.id} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={formData.metrics.includes(metric.id)}
                      onCheckedChange={() => toggleMetric(metric.id)}
                    />
                    <span className="text-sm">{metric.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Schedule */}
            <div>
              <label className="text-sm font-medium">Frequency</label>
              <select
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                className="w-full mt-1 px-3 py-2 border rounded-lg"
              >
                <option value="once">One-time</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            {/* Recipients */}
            <div>
              <label className="text-sm font-medium">Email Recipients</label>
              <input
                type="text"
                value={formData.recipients}
                onChange={(e) => setFormData({ ...formData, recipients: e.target.value })}
                placeholder="email1@test.com, email2@test.com"
                className="w-full mt-1 px-3 py-2 border rounded-lg"
              />
            </div>

            {/* Format */}
            <div>
              <label className="text-sm font-medium">Format</label>
              <select
                value={formData.format}
                onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                className="w-full mt-1 px-3 py-2 border rounded-lg"
              >
                <option value="pdf">PDF</option>
                <option value="csv">CSV</option>
                <option value="html">HTML</option>
              </select>
            </div>

            <Button onClick={handleAddReport} className="w-full">
              Create Report
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Saved Reports */}
      <div>
        <h3 className="text-lg font-bold mb-4">Scheduled Reports</h3>
        <div className="space-y-2">
          {reports.length === 0 ? (
            <p className="text-slate-600 text-center py-8">No reports scheduled yet</p>
          ) : (
            reports.map((report, idx) => (
              <Card key={idx}>
                <CardContent className="pt-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-int-orange" />
                    <div>
                      <p className="font-medium">{report.name}</p>
                      <p className="text-sm text-slate-600 flex items-center gap-2 mt-1">
                        <Clock className="h-3 w-3" />
                        {report.frequency}
                      </p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    Edit
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}