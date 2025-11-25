import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUserData } from '../components/hooks/useUserData';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import EventTemplateEditor from '../components/events/EventTemplateEditor';
import TemplatePreview from '../components/events/TemplatePreview';
import LoadingSpinner from '../components/common/LoadingSpinner';
import PageHeader from '../components/common/PageHeader';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Copy,
  Presentation, 
  Users, 
  GraduationCap, 
  PartyPopper, 
  Video, 
  UserPlus,
  Calendar,
  Sparkles,
  LayoutTemplate
} from 'lucide-react';
import { toast } from 'sonner';

const CATEGORY_ICONS = {
  workshop: GraduationCap,
  webinar: Video,
  team_building: Users,
  training: Presentation,
  social: PartyPopper,
  meeting: Calendar,
  onboarding: UserPlus,
  custom: Sparkles
};

const CATEGORY_COLORS = {
  workshop: 'bg-purple-100 text-purple-700',
  webinar: 'bg-blue-100 text-blue-700',
  team_building: 'bg-green-100 text-green-700',
  training: 'bg-orange-100 text-orange-700',
  social: 'bg-pink-100 text-pink-700',
  meeting: 'bg-slate-100 text-slate-700',
  onboarding: 'bg-cyan-100 text-cyan-700',
  custom: 'bg-indigo-100 text-indigo-700'
};

export default function EventTemplates() {
  const queryClient = useQueryClient();
  const { user, loading } = useUserData(true, true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showEditor, setShowEditor] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [previewTemplate, setPreviewTemplate] = useState(null);

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['event-templates'],
    queryFn: () => base44.entities.EventTemplate.list()
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.EventTemplate.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['event-templates']);
      toast.success('Template deleted');
    }
  });

  const duplicateMutation = useMutation({
    mutationFn: async (template) => {
      const { id, created_date, updated_date, created_by, ...data } = template;
      return base44.entities.EventTemplate.create({
        ...data,
        name: `${data.name} (Copy)`,
        is_system_template: false
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['event-templates']);
      toast.success('Template duplicated!');
    }
  });

  const filteredTemplates = templates.filter(t => {
    const matchesSearch = !searchQuery ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || t.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setShowEditor(true);
  };

  const handleCreate = () => {
    setEditingTemplate(null);
    setShowEditor(true);
  };

  if (loading || !user) {
    return <LoadingSpinner className="min-h-[60vh]" />;
  }

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Event Templates" 
        description="Create and manage reusable event templates"
      >
        <Button onClick={handleCreate} className="bg-int-orange hover:bg-int-orange/90">
          <Plus className="h-4 w-4 mr-2" /> Create Template
        </Button>
      </PageHeader>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates..."
              className="pl-10"
            />
          </div>
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="workshop">Workshop</SelectItem>
            <SelectItem value="webinar">Webinar</SelectItem>
            <SelectItem value="team_building">Team Building</SelectItem>
            <SelectItem value="training">Training</SelectItem>
            <SelectItem value="social">Social</SelectItem>
            <SelectItem value="meeting">Meeting</SelectItem>
            <SelectItem value="onboarding">Onboarding</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Templates List */}
        <div className="lg:col-span-2 space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-slate-100 animate-pulse rounded-xl" />
              ))}
            </div>
          ) : filteredTemplates.length === 0 ? (
            <Card className="p-12 text-center">
              <LayoutTemplate className="h-12 w-12 mx-auto mb-4 text-slate-300" />
              <h3 className="font-semibold text-lg mb-2">No templates found</h3>
              <p className="text-slate-500 mb-4">Create your first event template to get started</p>
              <Button onClick={handleCreate}>
                <Plus className="h-4 w-4 mr-2" /> Create Template
              </Button>
            </Card>
          ) : (
            filteredTemplates.map(template => {
              const Icon = CATEGORY_ICONS[template.category] || Calendar;
              const isSelected = previewTemplate?.id === template.id;
              
              return (
                <Card 
                  key={template.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    isSelected ? 'ring-2 ring-int-orange' : ''
                  }`}
                  onClick={() => setPreviewTemplate(template)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl ${CATEGORY_COLORS[template.category]}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{template.icon} {template.name}</h3>
                          {template.is_system_template && (
                            <Badge variant="outline" className="text-xs">System</Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-500 line-clamp-1 mb-2">
                          {template.description || 'No description'}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="outline" className="text-xs">
                            {template.default_duration_minutes || 60} min
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {(template.agenda || []).length} agenda
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {(template.icebreakers || []).length} icebreakers
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={(e) => { e.stopPropagation(); duplicateMutation.mutate(template); }}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={(e) => { e.stopPropagation(); handleEdit(template); }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {!template.is_system_template && (
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(template.id); }}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-1">
          {previewTemplate ? (
            <TemplatePreview 
              template={previewTemplate}
              onCustomize={() => handleEdit(previewTemplate)}
            />
          ) : (
            <Card className="p-8 text-center border-dashed">
              <LayoutTemplate className="h-12 w-12 mx-auto mb-4 text-slate-300" />
              <p className="text-slate-500">Select a template to preview</p>
            </Card>
          )}
        </div>
      </div>

      {/* Editor Dialog */}
      <EventTemplateEditor
        open={showEditor}
        onOpenChange={setShowEditor}
        template={editingTemplate}
        onSaved={() => setPreviewTemplate(null)}
      />
    </div>
  );
}