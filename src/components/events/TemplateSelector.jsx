import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Clock, Users, Sparkles, Loader2, Star } from 'lucide-react';
import { toast } from 'sonner';
import LoadingSpinner from '../common/LoadingSpinner';

export default function TemplateSelector({ open, onOpenChange, onSelectTemplate }) {
  const [search, setSearch] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState(null);

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['event-templates'],
    queryFn: () => base44.entities.EventTemplate.list('-usage_count'),
    enabled: open
  });

  const { data: activities = [] } = useQuery({
    queryKey: ['activities-for-templates'],
    queryFn: () => base44.entities.Activity.list(),
    enabled: open
  });

  const filteredTemplates = templates.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.description?.toLowerCase().includes(search.toLowerCase())
  );

  const popularTemplates = templates.filter(t => (t.usage_count || 0) >= 5);
  const myTemplates = templates.filter(t => t.created_by === base44.auth.me()?.email);

  const handleGetAISuggestions = async (template) => {
    setLoadingAI(true);
    try {
      const response = await base44.functions.invoke('generateTemplateAISuggestions', {
        template_id: template.id,
        context: {}
      });

      if (response.data?.success) {
        setAiSuggestions(response.data);
        setSelectedTemplate(template);
        toast.success('AI suggestions generated!');
      }
    } catch (error) {
      console.error('Error getting AI suggestions:', error);
      toast.error('Failed to generate AI suggestions');
    } finally {
      setLoadingAI(false);
    }
  };

  const handleApplyTemplate = () => {
    if (!selectedTemplate) return;

    const activity = activities.find(a => a.id === selectedTemplate.activity_id);
    
    onSelectTemplate({
      template: selectedTemplate,
      activity,
      aiSuggestions: aiSuggestions?.suggestions
    });

    // Increment usage count
    base44.entities.EventTemplate.update(selectedTemplate.id, {
      usage_count: (selectedTemplate.usage_count || 0) + 1
    }).catch(console.error);

    onOpenChange(false);
  };

  const TemplateCard = ({ template }) => {
    const activity = activities.find(a => a.id === template.activity_id);
    const isSelected = selectedTemplate?.id === template.id;

    return (
      <Card 
        className={`cursor-pointer transition-all hover:shadow-md ${
          isSelected ? 'border-2 border-purple-500 shadow-md' : ''
        }`}
        onClick={() => setSelectedTemplate(template)}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900 mb-1">{template.name}</h3>
              {template.description && (
                <p className="text-sm text-slate-600 line-clamp-2">{template.description}</p>
              )}
            </div>
            {template.is_featured && (
              <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                <Star className="h-3 w-3 mr-1" />
                Featured
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500 mt-3">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {template.duration_minutes}m
            </span>
            {template.max_participants && (
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                Up to {template.max_participants}
              </span>
            )}
            <Badge variant="outline" className="text-xs">
              {template.event_format}
            </Badge>
          </div>

          {activity && (
            <div className="mt-2 pt-2 border-t border-slate-100">
              <span className="text-xs text-slate-500">{activity.title}</span>
            </div>
          )}

          {(template.usage_count || 0) > 0 && (
            <div className="mt-2">
              <Badge variant="outline" className="text-xs">
                Used {template.usage_count} times
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            Choose Event Template
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search templates..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <Tabs defaultValue="all" className="space-y-4">
              <TabsList>
                <TabsTrigger value="all">All ({filteredTemplates.length})</TabsTrigger>
                <TabsTrigger value="popular">Popular ({popularTemplates.length})</TabsTrigger>
                <TabsTrigger value="mine">My Templates ({myTemplates.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-3">
                {filteredTemplates.map(template => (
                  <TemplateCard key={template.id} template={template} />
                ))}
              </TabsContent>

              <TabsContent value="popular" className="space-y-3">
                {popularTemplates.map(template => (
                  <TemplateCard key={template.id} template={template} />
                ))}
              </TabsContent>

              <TabsContent value="mine" className="space-y-3">
                {myTemplates.map(template => (
                  <TemplateCard key={template.id} template={template} />
                ))}
              </TabsContent>
            </Tabs>
          )}

          {/* AI Suggestions Panel */}
          {selectedTemplate && aiSuggestions && (
            <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h4 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                AI Recommendations
              </h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-slate-600">Duration:</span>
                  <span className="ml-2 font-medium">{aiSuggestions.suggestions.duration_minutes} min</span>
                </div>
                <div>
                  <span className="text-slate-600">Max participants:</span>
                  <span className="ml-2 font-medium">{aiSuggestions.suggestions.max_participants}</span>
                </div>
                <div>
                  <span className="text-slate-600">Best time:</span>
                  <span className="ml-2 font-medium capitalize">{aiSuggestions.suggestions.best_time_of_day}</span>
                </div>
                <div>
                  <span className="text-slate-600">Best days:</span>
                  <span className="ml-2 font-medium capitalize">
                    {aiSuggestions.suggestions.best_days.slice(0, 2).join(', ')}
                  </span>
                </div>
              </div>
              {aiSuggestions.suggestions.tips && (
                <div className="mt-3 pt-3 border-t border-purple-200">
                  <p className="text-xs font-medium text-slate-700 mb-1">Success Tips:</p>
                  <ul className="text-xs text-slate-600 space-y-1">
                    {aiSuggestions.suggestions.tips.slice(0, 3).map((tip, idx) => (
                      <li key={idx}>• {tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-2 justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => selectedTemplate && handleGetAISuggestions(selectedTemplate)}
            disabled={!selectedTemplate || loadingAI}
          >
            {loadingAI ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Get AI Suggestions
              </>
            )}
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleApplyTemplate} disabled={!selectedTemplate}>
              Apply Template
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}