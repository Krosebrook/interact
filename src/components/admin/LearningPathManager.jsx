import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Edit, Trash2, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

export default function LearningPathManager() {
  const queryClient = useQueryClient();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingPath, setEditingPath] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'technical',
    difficulty: 'intermediate',
    estimated_hours: 10,
    points_reward: 500
  });

  const { data: learningPaths = [], isLoading } = useQuery({
    queryKey: ['learning-paths-admin'],
    queryFn: () => base44.entities.LearningPath.list('-created_date', 100)
  });

  const createPathMutation = useMutation({
    mutationFn: (data) => base44.entities.LearningPath.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['learning-paths-admin']);
      setShowCreateDialog(false);
      resetForm();
      toast.success('Learning path created!');
    },
    onError: () => toast.error('Failed to create learning path')
  });

  const updatePathMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.LearningPath.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['learning-paths-admin']);
      setEditingPath(null);
      resetForm();
      toast.success('Learning path updated!');
    },
    onError: () => toast.error('Failed to update learning path')
  });

  const deletePathMutation = useMutation({
    mutationFn: (id) => base44.entities.LearningPath.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['learning-paths-admin']);
      toast.success('Learning path deleted');
    },
    onError: () => toast.error('Failed to delete learning path')
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'technical',
      difficulty: 'intermediate',
      estimated_hours: 10,
      points_reward: 500
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingPath) {
      updatePathMutation.mutate({ id: editingPath.id, data: formData });
    } else {
      createPathMutation.mutate(formData);
    }
  };

  const handleEdit = (path) => {
    setEditingPath(path);
    setFormData({
      title: path.title,
      description: path.description,
      category: path.category || 'technical',
      difficulty: path.difficulty || 'intermediate',
      estimated_hours: path.estimated_hours || 10,
      points_reward: path.points_reward || 500
    });
    setShowCreateDialog(true);
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this learning path?')) {
      deletePathMutation.mutate(id);
    }
  };

  if (isLoading) return <LoadingSpinner message="Loading learning paths..." />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-900">Learning Path Management</h2>
        <Button 
          onClick={() => {
            setEditingPath(null);
            resetForm();
            setShowCreateDialog(true);
          }}
          className="bg-int-orange hover:bg-[#C46322]"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Learning Path
        </Button>
      </div>

      <div className="grid gap-4">
        {learningPaths.map(path => (
          <Card key={path.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-int-orange" />
                    {path.title}
                  </CardTitle>
                  <p className="text-sm text-slate-600 mt-2">{path.description}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={() => handleEdit(path)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => handleDelete(path.id)}
                    className="text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Badge>{path.category || 'General'}</Badge>
                <Badge variant="outline">{path.difficulty || 'Intermediate'}</Badge>
                <Badge className="bg-amber-100 text-amber-800">
                  {path.estimated_hours}h
                </Badge>
                <Badge className="bg-green-100 text-green-800">
                  {path.points_reward} pts
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}

        {learningPaths.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="h-12 w-12 mx-auto mb-3 text-slate-300" />
              <p className="text-slate-600">No learning paths created yet</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingPath ? 'Edit Learning Path' : 'Create Learning Path'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="e.g., Advanced React Development"
                required
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="What will learners achieve?"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => setFormData({...formData, category: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="leadership">Leadership</SelectItem>
                    <SelectItem value="communication">Communication</SelectItem>
                    <SelectItem value="creativity">Creativity</SelectItem>
                    <SelectItem value="wellness">Wellness</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Difficulty</Label>
                <Select 
                  value={formData.difficulty} 
                  onValueChange={(value) => setFormData({...formData, difficulty: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Estimated Hours</Label>
                <Input
                  type="number"
                  value={formData.estimated_hours}
                  onChange={(e) => setFormData({...formData, estimated_hours: parseInt(e.target.value)})}
                  min="1"
                  required
                />
              </div>

              <div>
                <Label>Points Reward</Label>
                <Input
                  type="number"
                  value={formData.points_reward}
                  onChange={(e) => setFormData({...formData, points_reward: parseInt(e.target.value)})}
                  min="0"
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setShowCreateDialog(false);
                  setEditingPath(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-int-orange hover:bg-[#C46322]"
                disabled={createPathMutation.isPending || updatePathMutation.isPending}
              >
                {editingPath ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}