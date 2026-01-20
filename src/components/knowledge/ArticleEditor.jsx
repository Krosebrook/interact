import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Save, X } from 'lucide-react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const CATEGORIES = [
  'Getting Started',
  'Policies',
  'Benefits',
  'Tools & Technology',
  'Team & Culture',
  'HR Procedures',
  'Career Development',
  'Wellness',
  'Other'
];

export default function ArticleEditor({ article, onClose }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: article?.title || '',
    summary: article?.summary || '',
    content: article?.content || '',
    category: article?.category || 'Getting Started',
    tags: article?.tags || [],
    status: article?.status || 'draft'
  });
  const [newTag, setNewTag] = useState('');

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (article?.id) {
        return await base44.entities.KnowledgeBase.update(article.id, data);
      } else {
        return await base44.entities.KnowledgeBase.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['knowledge-base']);
      onClose?.();
    }
  });

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, newTag.trim()] });
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tagToRemove) });
  };

  const handleSave = () => {
    saveMutation.mutate(formData);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{article ? 'Edit Article' : 'New Article'}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Title</label>
          <Input
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Article title"
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Summary</label>
          <Textarea
            value={formData.summary}
            onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
            placeholder="Brief summary (shown in search results)"
            rows={2}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Category</label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Status</label>
            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Tags</label>
          <div className="flex gap-2 mb-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
              placeholder="Add tag"
            />
            <Button onClick={handleAddTag} variant="outline">Add</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.tags.map((tag, idx) => (
              <Badge key={idx} className="cursor-pointer" onClick={() => handleRemoveTag(tag)}>
                {tag} <X className="w-3 h-3 ml-1" />
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Content</label>
          <ReactQuill
            value={formData.content}
            onChange={(value) => setFormData({ ...formData, content: value })}
            theme="snow"
            className="bg-white"
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saveMutation.isPending}>
            <Save className="w-4 h-4 mr-2" />
            {saveMutation.isPending ? 'Saving...' : 'Save Article'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}