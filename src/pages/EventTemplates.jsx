import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUserData } from '../components/hooks/useUserData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import EventTemplateEditor from '../components/events/EventTemplateEditor';
import TemplatePreview from '../components/events/TemplatePreview';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { PREMADE_TEMPLATES, TEMPLATE_CATEGORIES } from '../components/templates/TemplateData';
import { playSound, initAudio } from '../components/utils/soundEffects';
import { motion, AnimatePresence } from 'framer-motion';
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
  LayoutTemplate,
  Clock,
  Play,
  ChevronRight,
  Filter,
  Grid3X3,
  List,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';

const CATEGORY_ICONS = {
  workshop: GraduationCap,
  webinar: Video,
  team_building: Users,
  training: Presentation,
  social: PartyPopper,
  meeting: Calendar,
  onboarding: UserPlus,
  wellness: Sparkles,
  custom: Sparkles
};

const CATEGORY_GRADIENTS = {
  workshop: 'from-purple-500 to-violet-600',
  webinar: 'from-blue-500 to-cyan-600',
  team_building: 'from-emerald-500 to-teal-600',
  training: 'from-orange-500 to-amber-600',
  social: 'from-pink-500 to-rose-600',
  meeting: 'from-slate-500 to-gray-600',
  onboarding: 'from-cyan-500 to-blue-600',
  wellness: 'from-green-500 to-emerald-600',
  custom: 'from-indigo-500 to-purple-600'
};

export default function EventTemplates() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user, loading } = useUserData(true, true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showEditor, setShowEditor] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [showUseDialog, setShowUseDialog] = useState(false);
  const [selectedTemplateForUse, setSelectedTemplateForUse] = useState(null);

  const { data: templates = [], isLoading, refetch } = useQuery({
    queryKey: ['event-templates'],
    queryFn: () => base44.entities.EventTemplate.list()
  });

  // Seed premade templates if none exist
  useEffect(() => {
    if (!isLoading && templates.length === 0) {
      seedTemplates();
    }
  }, [isLoading, templates.length]);

  const seedTemplates = async () => {
    try {
      for (const template of PREMADE_TEMPLATES) {
        await base44.entities.EventTemplate.create({
          ...template,
          is_system_template: true,
          is_active: true
        });
      }
      refetch();
      toast.success('Templates library initialized!');
    } catch (error) {
      console.error('Failed to seed templates:', error);
    }
  };

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.EventTemplate.delete(id),
    onSuccess: () => {
      playSound('whoosh');
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
      playSound('success');
      queryClient.invalidateQueries(['event-templates']);
      toast.success('Template duplicated!');
    }
  });

  // Combine database templates with premade ones that might not be seeded yet
  const allTemplates = templates.length > 0 ? templates : PREMADE_TEMPLATES.map((t, i) => ({ ...t, id: `premade-${i}` }));

  const filteredTemplates = allTemplates.filter(t => {
    const matchesSearch = !searchQuery ||
      t.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || t.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleEdit = (template) => {
    playSound('click');
    setEditingTemplate(template);
    setShowEditor(true);
  };

  const handleCreate = () => {
    playSound('sparkle');
    setEditingTemplate(null);
    setShowEditor(true);
  };

  const handleUseTemplate = (template) => {
    playSound('zap');
    setSelectedTemplateForUse(template);
    setShowUseDialog(true);
  };

  const handleStartEvent = () => {
    playSound('success');
    navigate(`${createPageUrl('Calendar')}?template=${selectedTemplateForUse.id}`);
    setShowUseDialog(false);
  };

  const handleCardClick = (template) => {
    initAudio();
    playSound('pop');
    setPreviewTemplate(template);
  };

  if (loading || !user) {
    return <LoadingSpinner className="min-h-[60vh]" />;
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="glass-panel-solid mb-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg">
              <LayoutTemplate className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-int-navy font-display">
                Event Templates
              </h1>
              <p className="text-slate-600 text-sm lg:text-base">
                {filteredTemplates.length} ready-to-use templates
              </p>
            </div>
          </div>
          <Button 
            onClick={handleCreate} 
            className="bg-gradient-orange hover:opacity-90 text-white shadow-lg w-full lg:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" /> Create Template
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search templates..."
            className="pl-10 bg-white/80 backdrop-blur-sm"
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-full sm:w-[200px] bg-white/80 backdrop-blur-sm">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {TEMPLATE_CATEGORIES.map(cat => (
              <SelectItem key={cat.value} value={cat.value}>
                <span className="flex items-center gap-2">
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex gap-1 bg-white/80 backdrop-blur-sm rounded-lg p-1">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className={viewMode === 'grid' ? 'bg-int-navy' : ''}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
            className={viewMode === 'list' ? 'bg-int-navy' : ''}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Templates Grid/List */}
        <div className="xl:col-span-3">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-48 bg-slate-100 animate-pulse rounded-xl" />
              ))}
            </div>
          ) : filteredTemplates.length === 0 ? (
            <Card className="p-12 text-center bg-white/80 backdrop-blur-sm">
              <LayoutTemplate className="h-16 w-16 mx-auto mb-4 text-slate-300" />
              <h3 className="font-semibold text-xl mb-2">No templates found</h3>
              <p className="text-slate-500 mb-6">Try a different search or create a new template</p>
              <Button onClick={handleCreate} className="bg-gradient-orange text-white">
                <Plus className="h-4 w-4 mr-2" /> Create Template
              </Button>
            </Card>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence>
                {filteredTemplates.map((template, index) => {
                  const Icon = CATEGORY_ICONS[template.category] || Calendar;
                  const gradient = CATEGORY_GRADIENTS[template.category] || CATEGORY_GRADIENTS.custom;
                  const isSelected = previewTemplate?.id === template.id;
                  
                  return (
                    <motion.div
                      key={template.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.03 }}
                    >
                      <Card 
                        className={`cursor-pointer transition-all hover:shadow-xl hover:-translate-y-1 overflow-hidden bg-white/90 backdrop-blur-sm ${
                          isSelected ? 'ring-2 ring-int-orange shadow-lg' : ''
                        }`}
                        onClick={() => handleCardClick(template)}
                      >
                        {/* Gradient Header */}
                        <div className={`h-24 bg-gradient-to-br ${gradient} relative overflow-hidden`}>
                          <div className="absolute inset-0 bg-black/10" />
                          <div className="absolute top-3 left-3">
                            <span className="text-4xl">{template.icon}</span>
                          </div>
                          <div className="absolute bottom-3 right-3">
                            <Badge className="bg-white/20 text-white backdrop-blur-sm border-0">
                              <Clock className="h-3 w-3 mr-1" />
                              {template.default_duration_minutes || 60}min
                            </Badge>
                          </div>
                          {template.is_system_template && (
                            <Badge className="absolute top-3 right-3 bg-white/20 text-white backdrop-blur-sm border-0">
                              <Sparkles className="h-3 w-3 mr-1" />
                              Pro
                            </Badge>
                          )}
                        </div>

                        <CardContent className="p-4">
                          <h3 className="font-bold text-slate-900 mb-1 line-clamp-1">
                            {template.name}
                          </h3>
                          <p className="text-sm text-slate-500 line-clamp-2 mb-3 min-h-[40px]">
                            {template.description || 'No description'}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {(template.agenda || []).length} steps
                              </Badge>
                            </div>
                            <Button
                              size="sm"
                              className="bg-gradient-orange hover:opacity-90 text-white"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUseTemplate(template);
                              }}
                            >
                              <Play className="h-3 w-3 mr-1" />
                              Use
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          ) : (
            // List View
            <div className="space-y-3">
              {filteredTemplates.map((template, index) => {
                const Icon = CATEGORY_ICONS[template.category] || Calendar;
                const gradient = CATEGORY_GRADIENTS[template.category] || CATEGORY_GRADIENTS.custom;
                
                return (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.02 }}
                  >
                    <Card 
                      className="cursor-pointer transition-all hover:shadow-lg bg-white/90 backdrop-blur-sm"
                      onClick={() => handleCardClick(template)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-sm flex-shrink-0`}>
                            <span className="text-2xl">{template.icon}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-bold text-slate-900">{template.name}</h3>
                              {template.is_system_template && (
                                <Badge variant="outline" className="text-xs">Pro</Badge>
                              )}
                            </div>
                            <p className="text-sm text-slate-500 line-clamp-1">
                              {template.description}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Badge variant="outline">
                              <Clock className="h-3 w-3 mr-1" />
                              {template.default_duration_minutes || 60}min
                            </Badge>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                duplicateMutation.mutate(template);
                              }}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              className="bg-gradient-orange hover:opacity-90 text-white"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUseTemplate(template);
                              }}
                            >
                              <Play className="h-3 w-3 mr-1" />
                              Use
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Preview Panel */}
        <div className="xl:col-span-1">
          <div className="sticky top-4">
            {previewTemplate ? (
              <Card className="bg-white/90 backdrop-blur-sm overflow-hidden">
                <div className={`h-32 bg-gradient-to-br ${CATEGORY_GRADIENTS[previewTemplate.category] || CATEGORY_GRADIENTS.custom} relative`}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-6xl">{previewTemplate.icon}</span>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-bold text-lg text-slate-900 mb-2">{previewTemplate.name}</h3>
                  <p className="text-sm text-slate-600 mb-4">{previewTemplate.description}</p>
                  
                  {/* Agenda Preview */}
                  {previewTemplate.agenda?.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-sm text-slate-700 mb-2">Agenda</h4>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {previewTemplate.agenda.map((item, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm">
                            <div className="w-6 h-6 rounded-full bg-int-orange/10 flex items-center justify-center text-xs font-bold text-int-orange">
                              {i + 1}
                            </div>
                            <span className="flex-1 text-slate-700">{item.title}</span>
                            <span className="text-slate-400 text-xs">{item.duration_minutes}m</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      className="flex-1 bg-gradient-orange hover:opacity-90 text-white"
                      onClick={() => handleUseTemplate(previewTemplate)}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Start Event
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleEdit(previewTemplate)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="p-8 text-center border-dashed bg-white/50 backdrop-blur-sm">
                <LayoutTemplate className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                <p className="text-slate-500">Select a template to preview</p>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Use Template Dialog */}
      <Dialog open={showUseDialog} onOpenChange={setShowUseDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-int-orange" />
              Start Event from Template
            </DialogTitle>
          </DialogHeader>
          {selectedTemplateForUse && (
            <div className="space-y-4">
              <div className={`h-24 rounded-xl bg-gradient-to-br ${CATEGORY_GRADIENTS[selectedTemplateForUse.category]} flex items-center justify-center`}>
                <span className="text-5xl">{selectedTemplateForUse.icon}</span>
              </div>
              <div>
                <h3 className="font-bold text-lg">{selectedTemplateForUse.name}</h3>
                <p className="text-sm text-slate-600">{selectedTemplateForUse.description}</p>
              </div>
              <div className="flex items-center gap-4 text-sm text-slate-500">
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {selectedTemplateForUse.default_duration_minutes || 60} min
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  Up to {selectedTemplateForUse.default_max_participants || 50}
                </span>
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowUseDialog(false)} className="flex-1">
                  Cancel
                </Button>
                <Button 
                  className="flex-1 bg-gradient-orange hover:opacity-90 text-white"
                  onClick={handleStartEvent}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Event
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Editor Dialog */}
      <EventTemplateEditor
        open={showEditor}
        onOpenChange={setShowEditor}
        template={editingTemplate}
        onSaved={() => {
          setPreviewTemplate(null);
          refetch();
        }}
      />
    </div>
  );
}