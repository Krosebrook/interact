import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { base44 } from '@/api/base44Client';
import { LayoutDashboard, Download, Plus, GripVertical, Settings } from 'lucide-react';
import { AVAILABLE_WIDGETS } from '../components/analytics/WidgetLibrary';
import DataExplorationPanel from '../components/analytics/DataExplorationPanel';

export default function CustomizableAnalyticsDashboard() {
  const [widgets, setWidgets] = useState(() => {
    const saved = localStorage.getItem('dashboard-widgets');
    return saved ? JSON.parse(saved) : ['engagement_score', 'lifecycle_dist', 'churn_risk', 'recognition'];
  });

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(widgets);
    const [reordered] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordered);

    setWidgets(items);
    localStorage.setItem('dashboard-widgets', JSON.stringify(items));
  };

  const handleWidgetToggle = (widgetId) => {
    const newWidgets = widgets.includes(widgetId)
      ? widgets.filter(w => w !== widgetId)
      : [...widgets, widgetId];
    
    setWidgets(newWidgets);
    localStorage.setItem('dashboard-widgets', JSON.stringify(newWidgets));
  };

  const handleExport = async (format) => {
    try {
      const response = await base44.functions.invoke('exportAnalytics', {
        format,
        metrics: ['engagement', 'lifecycle', 'recognition', 'abtest'],
        date_range: 'last_30_days'
      });

      const blob = new Blob([response.data], { 
        type: format === 'csv' ? 'text/csv' : 'application/pdf' 
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (error) {
      console.error('Export failed:', error);
      alert(`Export failed: ${error.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <LayoutDashboard className="w-8 h-8 text-purple-600" />
            Analytics Dashboard
          </h1>
          <p className="text-slate-600 mt-1">Customize your view and explore insights</p>
        </div>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Customize
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Customize Widgets</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 py-4">
                {Object.entries(AVAILABLE_WIDGETS).map(([id, widget]) => (
                  <div key={id} className="flex items-center space-x-2">
                    <Checkbox
                      id={id}
                      checked={widgets.includes(id)}
                      onCheckedChange={() => handleWidgetToggle(id)}
                    />
                    <label htmlFor={id} className="text-sm font-medium cursor-pointer">
                      {widget.title}
                    </label>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline" onClick={() => handleExport('csv')}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={() => handleExport('pdf')}>
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      <Tabs defaultValue="dashboard">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="explorer">Data Explorer</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="widgets" direction="horizontal">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="grid grid-cols-2 gap-4"
                >
                  {widgets.map((widgetId, index) => {
                    const widget = AVAILABLE_WIDGETS[widgetId];
                    if (!widget) return null;

                    const WidgetComponent = widget.component;

                    return (
                      <Draggable key={widgetId} draggableId={widgetId} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`${widget.size === 2 ? 'col-span-2' : ''} ${
                              snapshot.isDragging ? 'opacity-50' : ''
                            }`}
                          >
                            <div className="relative group">
                              <div
                                {...provided.dragHandleProps}
                                className="absolute top-2 right-2 p-1 bg-white rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing z-10"
                              >
                                <GripVertical className="w-4 h-4 text-slate-400" />
                              </div>
                              <WidgetComponent />
                            </div>
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          {widgets.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-slate-500 mb-4">No widgets selected</p>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Widgets
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Customize Widgets</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 py-4">
                      {Object.entries(AVAILABLE_WIDGETS).map(([id, widget]) => (
                        <div key={id} className="flex items-center space-x-2">
                          <Checkbox
                            id={id}
                            checked={widgets.includes(id)}
                            onCheckedChange={() => handleWidgetToggle(id)}
                          />
                          <label htmlFor={id} className="text-sm font-medium cursor-pointer">
                            {widget.title}
                          </label>
                        </div>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="explorer">
          <DataExplorationPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}