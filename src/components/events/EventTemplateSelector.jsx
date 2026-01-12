import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Presentation, 
  Users, 
  GraduationCap, 
  PartyPopper, 
  Video, 
  UserPlus,
  Calendar,
  Search,
  Check,
  Sparkles
} from 'lucide-react';

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
  workshop: 'bg-purple-100 text-purple-700 border-purple-200',
  webinar: 'bg-blue-100 text-blue-700 border-blue-200',
  team_building: 'bg-green-100 text-green-700 border-green-200',
  training: 'bg-orange-100 text-orange-700 border-orange-200',
  social: 'bg-pink-100 text-pink-700 border-pink-200',
  meeting: 'bg-slate-100 text-slate-700 border-slate-200',
  onboarding: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  custom: 'bg-indigo-100 text-indigo-700 border-indigo-200'
};

export default function EventTemplateSelector({ open, onOpenChange, onSelectTemplate }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [previewTemplate, setPreviewTemplate] = useState(null);

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['event-templates'],
    queryFn: () => base44.entities.EventTemplate.filter({ is_active: true })
  });

  const categories = ['all', 'workshop', 'webinar', 'team_building', 'training', 'social', 'meeting', 'onboarding'];

  const filteredTemplates = templates.filter(t => {
    const matchesSearch = !searchQuery || 
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSelect = (template) => {
    onSelectTemplate(template);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} data-b44-sync="true" data-feature="events" data-component="eventtemplateselector">
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Choose Event Template</DialogTitle>
        </DialogHeader>

        {/* Search & Filters */}
        <div className="space-y-4 pb-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates..."
              className="pl-10"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => {
              const Icon = CATEGORY_ICONS[cat] || Calendar;
              return (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(cat)}
                  className={selectedCategory === cat ? 'bg-int-orange hover:bg-int-orange/90' : ''}
                >
                  {cat !== 'all' && <Icon className="h-3.5 w-3.5 mr-1" />}
                  {cat === 'all' ? 'All' : cat.replace('_', ' ')}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Templates Grid */}
        <div className="flex-1 overflow-y-auto py-4">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-40 bg-slate-100 animate-pulse rounded-xl" />
              ))}
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No templates found</p>
              <p className="text-sm">Try a different search or category</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTemplates.map(template => {
                const Icon = CATEGORY_ICONS[template.category] || Calendar;
                return (
                  <Card 
                    key={template.id} 
                    className={`cursor-pointer transition-all hover:shadow-lg hover:border-int-orange ${
                      previewTemplate?.id === template.id ? 'ring-2 ring-int-orange' : ''
                    }`}
                    onClick={() => setPreviewTemplate(template)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${CATEGORY_COLORS[template.category]}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold truncate">{template.icon} {template.name}</h3>
                            {template.is_system_template && (
                              <Badge variant="outline" className="text-xs">System</Badge>
                            )}
                          </div>
                          <p className="text-sm text-slate-500 line-clamp-2 mb-2">
                            {template.description || 'No description'}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            <Badge variant="outline" className="text-xs">
                              {template.default_duration_minutes || 60} min
                            </Badge>
                            {template.icebreakers?.length > 0 && (
                              <Badge variant="outline" className="text-xs">
                                {template.icebreakers.length} icebreakers
                              </Badge>
                            )}
                            {template.agenda?.length > 0 && (
                              <Badge variant="outline" className="text-xs">
                                {template.agenda.length} agenda items
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Preview & Select */}
        {previewTemplate && (
          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Selected: {previewTemplate.name}</p>
                <p className="text-sm text-slate-500">
                  {previewTemplate.agenda?.length || 0} agenda items • 
                  {previewTemplate.icebreakers?.length || 0} icebreakers • 
                  {previewTemplate.communication_schedule?.length || 0} scheduled messages
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setPreviewTemplate(null)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => handleSelect(previewTemplate)}
                  className="bg-int-orange hover:bg-int-orange/90"
                >
                  <Check className="h-4 w-4 mr-1" /> Use Template
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}