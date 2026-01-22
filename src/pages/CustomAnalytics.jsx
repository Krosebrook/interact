import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useUserData } from '@/components/hooks/useUserData';
import { Plus, Settings, BarChart3, PieChart, LineChart, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

export default function CustomAnalytics() {
  const { user } = useUserData();
  const [roleView, setRoleView] = useState('hr');
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [newWidget, setNewWidget] = useState({ entity: '', chartType: 'bar', filters: {} });
  const queryClient = useQueryClient();

  const { data: config } = useQuery({
    queryKey: ['dashboardConfig', user?.email, roleView],
    queryFn: async () => {
      if (!user?.email) return null;
      const configs = await base44.entities.UserDashboardConfig.filter({
        user_email: user.email,
        role_context: roleView
      });
      return configs[0] || { widgets: [] };
    },
    enabled: !!user
  });

  const saveMutation = useMutation({
    mutationFn: async (widgets) => {
      if (config?.id) {
        await base44.entities.UserDashboardConfig.update(config.id, { widgets });
      } else {
        await base44.entities.UserDashboardConfig.create({
          user_email: user.email,
          role_context: roleView,
          widgets
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['dashboardConfig']);
      toast.success('Dashboard saved');
    }
  });

  const addWidget = () => {
    const widget = {
      id: Date.now().toString(),
      ...newWidget,
      position: { x: 0, y: 0 },
      size: 'medium'
    };
    saveMutation.mutate([...(config?.widgets || []), widget]);
    setIsConfiguring(false);
    setNewWidget({ entity: '', chartType: 'bar', filters: {} });
  };

  const availableEntities = [
    'Event', 'Participation', 'Recognition', 'UserPoints', 
    'BadgeAward', 'Survey', 'Team', 'Activity'
  ];

  const chartTypes = [
    { value: 'bar', label: 'Bar Chart', icon: BarChart3 },
    { value: 'pie', label: 'Pie Chart', icon: PieChart },
    { value: 'line', label: 'Line Chart', icon: LineChart }
  ];

  // RBAC check
  const canViewAnalytics = user?.role === 'admin' || user?.user_type === 'facilitator';

  if (!canViewAnalytics) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <p className="text-[var(--slate)]">You don't have permission to view analytics.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[var(--ink)]">Custom Analytics Dashboard</h1>
          <p className="text-[var(--slate)] mt-2">Build your own reports with live data</p>
        </div>

        <div className="flex items-center gap-4">
          <Select value={roleView} onValueChange={setRoleView}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hr">HR View</SelectItem>
              <SelectItem value="manager">Manager View</SelectItem>
              <SelectItem value="executive">Executive View</SelectItem>
            </SelectContent>
          </Select>

          <Dialog open={isConfiguring} onOpenChange={setIsConfiguring}>
            <DialogTrigger asChild>
              <Button className="bg-[var(--orb-accent)] hover:bg-[var(--orb-accent)]/90">
                <Plus className="w-4 h-4 mr-2" />
                Add Widget
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Configure New Widget</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-[var(--ink)] mb-2 block">
                    Data Source
                  </label>
                  <Select value={newWidget.entity} onValueChange={(v) => setNewWidget({ ...newWidget, entity: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select entity..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableEntities.map(e => (
                        <SelectItem key={e} value={e}>{e}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-semibold text-[var(--ink)] mb-2 block">
                    Chart Type
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {chartTypes.map(ct => {
                      const Icon = ct.icon;
                      return (
                        <button
                          key={ct.value}
                          onClick={() => setNewWidget({ ...newWidget, chartType: ct.value })}
                          className={`p-3 border rounded-lg flex flex-col items-center gap-2 transition-all ${
                            newWidget.chartType === ct.value
                              ? 'border-[var(--orb-accent)] bg-[var(--orb-accent)]/10'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="text-xs">{ct.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <Button
                  onClick={addWidget}
                  disabled={!newWidget.entity}
                  className="w-full bg-[var(--orb-accent)] hover:bg-[var(--orb-accent)]/90"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Add Widget
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Widgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {config?.widgets?.map((widget) => (
          <Card key={widget.id} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[var(--ink)]">{widget.entity}</h3>
              <Settings className="w-4 h-4 text-[var(--slate)] cursor-pointer" />
            </div>
            <div className="h-48 bg-slate-50 rounded-lg flex items-center justify-center">
              <p className="text-sm text-[var(--slate)]">{widget.chartType} chart placeholder</p>
            </div>
          </Card>
        ))}

        {(!config?.widgets || config.widgets.length === 0) && (
          <div className="col-span-full text-center py-12">
            <BarChart3 className="w-12 h-12 text-[var(--slate)] mx-auto mb-4" />
            <p className="text-[var(--slate)] mb-4">No widgets configured yet</p>
            <Button onClick={() => setIsConfiguring(true)} variant="outline">
              Add Your First Widget
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}