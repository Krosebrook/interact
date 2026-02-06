import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Settings, Plus, Trash2 } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AVAILABLE_WIDGETS = [
  { id: 'points_trend', label: 'Points Trend', type: 'line', entity: 'UserPoints' },
  { id: 'badge_distribution', label: 'Badge Distribution', type: 'bar', entity: 'Badge' },
  { id: 'challenge_participation', label: 'Challenge Participation', type: 'bar', entity: 'PersonalChallenge' },
  { id: 'engagement_metrics', label: 'Engagement Metrics', type: 'line', entity: 'Participation' },
  { id: 'wellness_activity', label: 'Wellness Activity', type: 'line', entity: 'WellnessLog' },
  { id: 'recognition_flow', label: 'Recognition Flow', type: 'bar', entity: 'Recognition' }
];

export default function CustomizableDashboard({ userEmail }) {
  const [selectedWidgets, setSelectedWidgets] = useState(['points_trend', 'badge_distribution']);
  const [isCustomizing, setIsCustomizing] = useState(false);
  
  const { data: dashboardData = {} } = useQuery({
    queryKey: ['dashboardData', userEmail],
    queryFn: async () => {
      const points = await base44.asServiceRole.entities.UserPoints.list('-created_date', 50);
      const challenges = await base44.asServiceRole.entities.PersonalChallenge.list();
      const recognitions = await base44.asServiceRole.entities.Recognition.list('-created_date', 100);
      
      return {
        points,
        challenges,
        recognitions
      };
    }
  });
  
  const toggleWidget = (widgetId) => {
    setSelectedWidgets(prev => 
      prev.includes(widgetId) 
        ? prev.filter(id => id !== widgetId)
        : [...prev, widgetId]
    );
  };
  
  const renderWidget = (widgetId) => {
    const widget = AVAILABLE_WIDGETS.find(w => w.id === widgetId);
    if (!widget) return null;
    
    let chartData = [];
    
    if (widgetId === 'points_trend') {
      chartData = dashboardData.points?.slice(0, 10).map(p => ({
        name: p.user_email?.split('@')[0] || 'User',
        points: p.total_points || 0
      })) || [];
    } else if (widgetId === 'challenge_participation') {
      const statusCounts = dashboardData.challenges?.reduce((acc, c) => {
        acc[c.status] = (acc[c.status] || 0) + 1;
        return acc;
      }, {}) || {};
      
      chartData = Object.entries(statusCounts).map(([status, count]) => ({
        name: status,
        count
      }));
    } else if (widgetId === 'recognition_flow') {
      const categoryCounts = dashboardData.recognitions?.reduce((acc, r) => {
        acc[r.category] = (acc[r.category] || 0) + 1;
        return acc;
      }, {}) || {};
      
      chartData = Object.entries(categoryCounts).map(([category, count]) => ({
        name: category,
        count
      }));
    }
    
    return (
      <Card key={widgetId}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">{widget.label}</CardTitle>
            {isCustomizing && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => toggleWidget(widgetId)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              {widget.type === 'line' ? (
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="points" stroke="#D97230" />
                </LineChart>
              ) : (
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8B5CF6" />
                </BarChart>
              )}
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-slate-500 py-8">No data available</p>
          )}
        </CardContent>
      </Card>
    );
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Dashboard Widgets</h2>
        <Button
          variant="outline"
          onClick={() => setIsCustomizing(!isCustomizing)}
        >
          <Settings className="h-4 w-4 mr-2" />
          {isCustomizing ? 'Done' : 'Customize'}
        </Button>
      </div>
      
      {isCustomizing && (
        <Card className="bg-slate-50">
          <CardHeader>
            <CardTitle className="text-base">Add Widgets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {AVAILABLE_WIDGETS.map(widget => (
                <div key={widget.id} className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedWidgets.includes(widget.id)}
                    onCheckedChange={() => toggleWidget(widget.id)}
                  />
                  <Label className="text-sm">{widget.label}</Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {selectedWidgets.map(widgetId => renderWidget(widgetId))}
      </div>
    </div>
  );
}