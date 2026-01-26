import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useUserData } from '@/components/hooks/useUserData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { Plus, Download, Calendar, Users, BarChart3, Mail, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const WIDGET_TYPES = [
  { id: 'stat', label: 'Statistic Card', icon: BarChart3 },
  { id: 'chart', label: 'Chart', icon: BarChart3 },
  { id: 'table', label: 'Data Table', icon: Users }
];

const ENTITIES = [
  { id: 'Event', label: 'Events' },
  { id: 'Participation', label: 'Participations' },
  { id: 'Recognition', label: 'Recognitions' },
  { id: 'UserPoints', label: 'User Points' },
  { id: 'Team', label: 'Teams' },
  { id: 'WellnessLog', label: 'Wellness Logs' }
];

const METRICS = [
  { id: 'count', label: 'Count' },
  { id: 'sum', label: 'Sum' },
  { id: 'average', label: 'Average' }
];

export default function ReportBuilder() {
  const { user, loading: userLoading, isAdmin } = useUserData();
  const [editingReport, setEditingReport] = useState(null);
  const [widgets, setWidgets] = useState([]);
  const [reportName, setReportName] = useState('');
  const [filters, setFilters] = useState({});
  const queryClient = useQueryClient();
  
  const { data: reports = [], isLoading } = useQuery({
    queryKey: ['analyticsReports'],
    queryFn: () => base44.entities.AnalyticsReport.filter({}),
    enabled: isAdmin
  });
  
  const saveMutation = useMutation({
    mutationFn: async (reportData) => {
      if (editingReport) {
        return base44.entities.AnalyticsReport.update(editingReport.id, reportData);
      }
      return base44.entities.AnalyticsReport.create(reportData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['analyticsReports']);
      toast.success('Report saved!');
      resetForm();
    }
  });
  
  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.AnalyticsReport.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['analyticsReports']);
      toast.success('Report deleted');
    }
  });
  
  const generateMutation = useMutation({
    mutationFn: async (reportId) => {
      const response = await base44.functions.invoke('generateCustomReport', {
        reportId,
        format: 'json'
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success('Report generated!');
      window.open(`data:application/json,${encodeURIComponent(JSON.stringify(data, null, 2))}`);
    }
  });
  
  if (userLoading || isLoading) return <LoadingSpinner />;
  
  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600">Admin access required</p>
      </div>
    );
  }
  
  const resetForm = () => {
    setEditingReport(null);
    setReportName('');
    setWidgets([]);
    setFilters({});
  };
  
  const addWidget = (widgetType) => {
    setWidgets([...widgets, {
      id: `widget-${Date.now()}`,
      type: widgetType,
      entity: 'Event',
      metric: 'count',
      position: { x: 0, y: widgets.length },
      size: 'medium'
    }]);
  };
  
  const updateWidget = (widgetId, updates) => {
    setWidgets(widgets.map(w => w.id === widgetId ? { ...w, ...updates } : w));
  };
  
  const removeWidget = (widgetId) => {
    setWidgets(widgets.filter(w => w.id !== widgetId));
  };
  
  const onDragEnd = (result) => {
    if (!result.destination) return;
    
    const items = Array.from(widgets);
    const [reordered] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordered);
    
    setWidgets(items);
  };
  
  const handleSave = () => {
    if (!reportName) {
      toast.error('Please enter a report name');
      return;
    }
    
    if (widgets.length === 0) {
      toast.error('Please add at least one widget');
      return;
    }
    
    saveMutation.mutate({
      report_name: reportName,
      report_type: 'custom',
      config: { widgets, filters },
      created_by: user.email
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-int-navy">Custom Report Builder</h1>
          <p className="text-slate-600">Create and schedule analytics reports</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Report Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Report Name</Label>
                <Input
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                  placeholder="Monthly Engagement Report"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Department</Label>
                  <Select value={filters.department} onValueChange={(v) => setFilters({...filters, department: v})}>
                    <SelectTrigger>
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      <SelectItem value="Engineering">Engineering</SelectItem>
                      <SelectItem value="Product">Product</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Sales">Sales</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <Label className="mb-3 block">Add Widgets</Label>
                <div className="flex gap-2">
                  {WIDGET_TYPES.map(type => {
                    const Icon = type.icon;
                    return (
                      <Button
                        key={type.id}
                        variant="outline"
                        size="sm"
                        onClick={() => addWidget(type.id)}
                      >
                        <Icon className="h-4 w-4 mr-2" />
                        {type.label}
                      </Button>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Widgets ({widgets.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="widgets">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                      {widgets.map((widget, index) => (
                        <Draggable key={widget.id} draggableId={widget.id} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="bg-slate-50 p-4 rounded-lg border-2 border-dashed border-slate-300"
                            >
                              <div className="flex items-start gap-4">
                                <div className="flex-1 space-y-3">
                                  <div className="grid grid-cols-2 gap-3">
                                    <div>
                                      <Label className="text-xs">Entity</Label>
                                      <Select
                                        value={widget.entity}
                                        onValueChange={(v) => updateWidget(widget.id, { entity: v })}
                                      >
                                        <SelectTrigger className="h-9">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {ENTITIES.map(e => (
                                            <SelectItem key={e.id} value={e.id}>{e.label}</SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    
                                    <div>
                                      <Label className="text-xs">Metric</Label>
                                      <Select
                                        value={widget.metric}
                                        onValueChange={(v) => updateWidget(widget.id, { metric: v })}
                                      >
                                        <SelectTrigger className="h-9">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {METRICS.map(m => (
                                            <SelectItem key={m.id} value={m.id}>{m.label}</SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>
                                </div>
                                
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeWidget(widget.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
              
              {widgets.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2 text-slate-300" />
                  <p>Add widgets to build your report</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <div className="flex gap-3">
            <Button onClick={handleSave} disabled={saveMutation.isLoading} className="bg-int-orange hover:bg-int-orange-dark">
              {saveMutation.isLoading ? 'Saving...' : editingReport ? 'Update Report' : 'Save Report'}
            </Button>
            {editingReport && (
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            )}
          </div>
        </div>
        
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Saved Reports ({reports.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {reports.map(report => (
                <div key={report.id} className="p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-semibold text-sm">{report.report_name}</p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => deleteMutation.mutate(report.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="text-xs text-slate-500 mb-3">
                    {report.config.widgets?.length || 0} widgets
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingReport(report);
                        setReportName(report.report_name);
                        setWidgets(report.config.widgets || []);
                        setFilters(report.config.filters || {});
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => generateMutation.mutate(report.id)}
                      disabled={generateMutation.isLoading}
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Generate
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}