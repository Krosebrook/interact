import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Layout, GripVertical } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const AVAILABLE_WIDGETS = [
  { id: 'points_counter', name: 'Points Counter', icon: '⭐', category: 'stats' },
  { id: 'tier_status', name: 'Tier Status', icon: '👑', category: 'stats' },
  { id: 'streak_tracker', name: 'Streak Tracker', icon: '🔥', category: 'stats' },
  { id: 'recent_badges', name: 'Recent Badges', icon: '🏆', category: 'achievements' },
  { id: 'leaderboard_mini', name: 'Mini Leaderboard', icon: '📊', category: 'social' },
  { id: 'active_challenges', name: 'Active Challenges', icon: '🎯', category: 'challenges' },
  { id: 'ai_tips', name: 'AI Tips', icon: '💡', category: 'ai' },
  { id: 'progress_chart', name: 'Progress Chart', icon: '📈', category: 'analytics' },
  { id: 'team_stats', name: 'Team Stats', icon: '👥', category: 'social' },
  { id: 'upcoming_events', name: 'Upcoming Events', icon: '📅', category: 'events' }
];

export default function WidgetLayoutCustomizer({ currentLayout, onSave, isSaving }) {
  const [enabledWidgets, setEnabledWidgets] = useState(
    currentLayout?.enabled_widgets || AVAILABLE_WIDGETS.slice(0, 6).map(w => w.id)
  );
  const [widgetOrder, setWidgetOrder] = useState(
    currentLayout?.widget_order || AVAILABLE_WIDGETS.slice(0, 6).map(w => w.id)
  );

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(widgetOrder);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setWidgetOrder(items);
  };

  const toggleWidget = (widgetId) => {
    setEnabledWidgets(prev => {
      const isEnabled = prev.includes(widgetId);
      if (isEnabled) {
        setWidgetOrder(order => order.filter(id => id !== widgetId));
        return prev.filter(id => id !== widgetId);
      } else {
        setWidgetOrder(order => [...order, widgetId]);
        return [...prev, widgetId];
      }
    });
  };

  const handleSave = () => {
    onSave({
      enabled_widgets: enabledWidgets,
      widget_order: widgetOrder
    });
  };

  const enabledWidgetObjects = widgetOrder
    .map(id => AVAILABLE_WIDGETS.find(w => w.id === id))
    .filter(Boolean);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" data-b44-sync="true" data-feature="profile" data-component="widgetlayoutcustomizer">
      {/* Available Widgets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layout className="h-5 w-5" />
            Available Widgets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {AVAILABLE_WIDGETS.map((widget) => (
              <div key={widget.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border">
                <Checkbox
                  id={widget.id}
                  checked={enabledWidgets.includes(widget.id)}
                  onCheckedChange={() => toggleWidget(widget.id)}
                />
                <Label htmlFor={widget.id} className="flex items-center gap-2 flex-1 cursor-pointer">
                  <span className="text-xl">{widget.icon}</span>
                  <span className="font-medium">{widget.name}</span>
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Layout Preview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Dashboard Layout</CardTitle>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Layout'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="widgets">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-2"
                >
                  {enabledWidgetObjects.map((widget, index) => (
                    <Draggable key={widget.id} draggableId={widget.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`flex items-center gap-3 p-3 rounded-lg bg-white border ${
                            snapshot.isDragging ? 'border-int-orange shadow-lg' : 'border-slate-200'
                          }`}
                        >
                          <GripVertical className="h-5 w-5 text-slate-400" />
                          <span className="text-xl">{widget.icon}</span>
                          <span className="font-medium flex-1">{widget.name}</span>
                          <span className="text-xs text-slate-500">#{index + 1}</span>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          {enabledWidgetObjects.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              <Layout className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Select widgets to customize your dashboard</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}