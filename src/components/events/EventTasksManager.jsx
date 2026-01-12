import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Calendar, User } from 'lucide-react';
import { motion } from 'framer-motion';

export default function EventTasksManager({ tasks, onChange, availableUsers, aiSuggestions }) {
  const [newTask, setNewTask] = useState({
    task_title: '',
    task_description: '',
    assigned_to_email: '',
    assigned_to_name: '',
    due_date: '',
    priority: 'medium',
    category: 'logistics'
  });

  const handleAddTask = () => {
    if (!newTask.task_title || !newTask.assigned_to_email || !newTask.due_date) {
      return;
    }

    const assignedUser = availableUsers.find(u => u.email === newTask.assigned_to_email);
    
    onChange([...tasks, {
      ...newTask,
      assigned_to_name: assignedUser?.full_name || newTask.assigned_to_email
    }]);

    setNewTask({
      task_title: '',
      task_description: '',
      assigned_to_email: '',
      assigned_to_name: '',
      due_date: '',
      priority: 'medium',
      category: 'logistics'
    });
  };

  const handleRemoveTask = (index) => {
    onChange(tasks.filter((_, i) => i !== index));
  };

  const handleApplySuggestion = (suggestion) => {
    setNewTask(prev => ({
      ...prev,
      task_title: suggestion.title,
      task_description: suggestion.description,
      category: suggestion.category || 'logistics'
    }));
  };

  const priorityColors = {
    low: 'bg-blue-100 text-blue-700',
    medium: 'bg-yellow-100 text-yellow-700',
    high: 'bg-red-100 text-red-700'
  };

  return (
    <div className="space-y-4" data-b44-sync="true" data-feature="events" data-component="eventtasksmanager">
      {/* AI Suggestions */}
      {aiSuggestions && aiSuggestions.length > 0 && (
        <Card className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <h4 className="font-semibold mb-3 text-purple-900">AI Suggested Tasks</h4>
          <div className="space-y-2">
            {aiSuggestions.map((suggestion, i) => (
              <div key={i} className="flex items-center justify-between bg-white p-2 rounded">
                <div className="flex-1">
                  <div className="font-medium text-sm">{suggestion.title}</div>
                  <div className="text-xs text-slate-600">{suggestion.description}</div>
                </div>
                <Button size="sm" variant="outline" onClick={() => handleApplySuggestion(suggestion)}>
                  Use
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Add Task Form */}
      <Card className="p-4 bg-slate-50">
        <h4 className="font-semibold mb-3">Add Preparation Task</h4>
        <div className="space-y-3">
          <div>
            <Label>Task Title</Label>
            <Input
              value={newTask.task_title}
              onChange={(e) => setNewTask(prev => ({ ...prev, task_title: e.target.value }))}
              placeholder="e.g., Book meeting room"
            />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea
              value={newTask.task_description}
              onChange={(e) => setNewTask(prev => ({ ...prev, task_description: e.target.value }))}
              placeholder="Task details..."
              rows={2}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Assign To</Label>
              <Select
                value={newTask.assigned_to_email}
                onValueChange={(value) => setNewTask(prev => ({ ...prev, assigned_to_email: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select user..." />
                </SelectTrigger>
                <SelectContent>
                  {availableUsers.map(user => (
                    <SelectItem key={user.id} value={user.email}>
                      {user.full_name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Due Date</Label>
              <Input
                type="date"
                value={newTask.due_date}
                onChange={(e) => setNewTask(prev => ({ ...prev, due_date: e.target.value }))}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Priority</Label>
              <Select
                value={newTask.priority}
                onValueChange={(value) => setNewTask(prev => ({ ...prev, priority: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Category</Label>
              <Select
                value={newTask.category}
                onValueChange={(value) => setNewTask(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="logistics">Logistics</SelectItem>
                  <SelectItem value="materials">Materials</SelectItem>
                  <SelectItem value="communication">Communication</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="catering">Catering</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handleAddTask} className="w-full" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </div>
      </Card>

      {/* Task List */}
      {tasks.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-semibold">Assigned Tasks ({tasks.length})</h4>
          {tasks.map((task, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h5 className="font-semibold">{task.task_title}</h5>
                      <Badge className={priorityColors[task.priority]} variant="outline">
                        {task.priority}
                      </Badge>
                      <Badge variant="outline">{task.category}</Badge>
                    </div>
                    {task.task_description && (
                      <p className="text-sm text-slate-600 mb-2">{task.task_description}</p>
                    )}
                    <div className="flex gap-4 text-sm text-slate-600">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {task.assigned_to_name}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(task.due_date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveTask(index)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {tasks.length === 0 && !aiSuggestions && (
        <div className="text-center py-8 text-slate-500">
          <p>No preparation tasks added yet</p>
          <p className="text-sm">Tasks help ensure your event runs smoothly</p>
        </div>
      )}
    </div>
  );
}