import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useUserData } from '../components/hooks/useUserData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Layout, Plus, Clock, Users, Edit, Trash2, Star, Search } from 'lucide-react';
import { toast } from 'sonner';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function EventTemplates() {
  const { user, loading } = useUserData(true, true);
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);

  const { data: templates = [], isLoading: templatesLoading } = useQuery({
    queryKey: ['event-templates'],
    queryFn: () => base44.entities.EventTemplate.list('-created_date')
  });

  const { data: activities = [] } = useQuery({
    queryKey: ['activities'],
    queryFn: () => base44.entities.Activity.list()
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.EventTemplate.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['event-templates']);
      toast.success('Template deleted');
    }
  });

  const toggleFeaturedMutation = useMutation({
    mutationFn: ({ id, is_featured }) => base44.entities.EventTemplate.update(id, { is_featured }),
    onSuccess: () => {
      queryClient.invalidateQueries(['event-templates']);
      toast.success('Template updated');
    }
  });

  const filteredTemplates = templates.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.description?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading || templatesLoading) {
    return <LoadingSpinner className="min-h-screen" />;
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card>
          <CardContent className="p-8 text-center">
            <Layout className="h-12 w-12 mx-auto mb-4 text-slate-400" />
            <h3 className="text-lg font-semibold mb-2">Admin Access Required</h3>
            <p className="text-sm text-slate-600">
              Only administrators can manage event templates
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel-solid border-2 border-purple-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-purple shadow-lg">
              <Layout className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-int-navy">Event Templates</h1>
              <p className="text-sm text-slate-600">
                Create and manage reusable event templates
              </p>
            </div>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Template
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search templates..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map(template => {
          const activity = activities.find(a => a.id === template.activity_id);
          
          return (
            <Card key={template.id} className="hover:shadow-lg transition-all">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{template.name}</CardTitle>
                    {template.description && (
                      <p className="text-sm text-slate-600 line-clamp-2">{template.description}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleFeaturedMutation.mutate({ 
                      id: template.id, 
                      is_featured: !template.is_featured 
                    })}
                  >
                    <Star className={`h-4 w-4 ${template.is_featured ? 'fill-amber-500 text-amber-500' : 'text-slate-400'}`} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {template.duration_minutes}m
                  </span>
                  {template.max_participants && (
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {template.max_participants}
                    </span>
                  )}
                  <Badge variant="outline">{template.event_format}</Badge>
                </div>

                {activity && (
                  <div className="pt-2 border-t">
                    <span className="text-sm text-slate-500">{activity.title}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <Badge variant="outline" className="text-xs">
                    Used {template.usage_count || 0} times
                  </Badge>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingTemplate(template);
                        setCreateDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (confirm('Delete this template?')) {
                          deleteMutation.mutate(template.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Create/Edit Dialog */}
      <TemplateFormDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        template={editingTemplate}
        activities={activities}
        onSuccess={() => {
          queryClient.invalidateQueries(['event-templates']);
          setCreateDialogOpen(false);
          setEditingTemplate(null);
        }}
      />
    </div>
  );
}

function TemplateFormDialog({ open, onOpenChange, template, activities, onSuccess }) {
  const [formData, setFormData] = useState(template || {
    name: '',
    description: '',
    activity_id: '',
    event_type: 'other',
    duration_minutes: 60,
    event_format: 'online',
    max_participants: null,
    is_public: true,
    is_featured: false
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (template) {
        return base44.entities.EventTemplate.update(template.id, data);
      }
      return base44.entities.EventTemplate.create(data);
    },
    onSuccess
  });

  const handleSubmit = () => {
    if (!formData.name || !formData.activity_id) {
      toast.error('Name and activity are required');
      return;
    }
    saveMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>{template ? 'Edit' : 'Create'} Template</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Template Name *</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Weekly Team Standup"
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Activity *</Label>
              <Select value={formData.activity_id} onValueChange={(v) => setFormData({ ...formData, activity_id: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select activity" />
                </SelectTrigger>
                <SelectContent>
                  {activities.map(a => (
                    <SelectItem key={a.id} value={a.id}>{a.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Duration (minutes)</Label>
              <Input
                type="number"
                value={formData.duration_minutes}
                onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Format</Label>
              <Select value={formData.event_format} onValueChange={(v) => setFormData({ ...formData, event_format: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="offline">In-Person</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Max Participants</Label>
              <Input
                type="number"
                value={formData.max_participants || ''}
                onChange={(e) => setFormData({ ...formData, max_participants: e.target.value ? parseInt(e.target.value) : null })}
                placeholder="Unlimited"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is-public"
                checked={formData.is_public}
                onCheckedChange={(checked) => setFormData({ ...formData, is_public: checked })}
              />
              <Label htmlFor="is-public" className="font-normal cursor-pointer">
                Public (available to all admins)
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is-featured"
                checked={formData.is_featured}
                onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
              />
              <Label htmlFor="is-featured" className="font-normal cursor-pointer">
                Featured template
              </Label>
            </div>
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={saveMutation.isPending}>
            {template ? 'Update' : 'Create'} Template
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}