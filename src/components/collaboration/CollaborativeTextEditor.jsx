import { useState, useEffect, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useUserData } from '../hooks/useUserData';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Save } from 'lucide-react';
import { toast } from 'sonner';
import { debounce } from 'lodash';

export default function CollaborativeTextEditor({ 
  entityType, 
  entityId, 
  fieldName, 
  initialValue = '', 
  onSave,
  title = "Collaborative Editor" 
}) {
  const { user } = useUserData();
  const queryClient = useQueryClient();
  const [value, setValue] = useState(initialValue);
  const [activeUsers, setActiveUsers] = useState([]);
  const lastSyncRef = useRef(Date.now());

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (content) => {
      const updateData = { [fieldName]: content };
      
      if (entityType === 'Event') {
        return base44.entities.Event.update(entityId, updateData);
      } else if (entityType === 'Activity') {
        return base44.entities.Activity.update(entityId, updateData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries([entityType.toLowerCase(), entityId]);
      if (onSave) onSave(value);
      lastSyncRef.current = Date.now();
    }
  });

  // Debounced save
  const debouncedSave = useRef(
    debounce((content) => {
      updateMutation.mutate(content);
    }, 2000)
  ).current;

  useEffect(() => {
    return () => {
      debouncedSave.cancel();
    };
  }, [debouncedSave]);

  // Real-time subscription for collaborative editing
  useEffect(() => {
    if (!entityType || !entityId) return;

    const entityMap = {
      'Event': base44.entities.Event,
      'Activity': base44.entities.Activity
    };

    const entity = entityMap[entityType];
    if (!entity) return;

    const unsubscribe = entity.subscribe((event) => {
      if (event.id === entityId && event.type === 'update') {
        // Only update if change came from another user
        const timeSinceLastSync = Date.now() - lastSyncRef.current;
        if (timeSinceLastSync > 3000) {
          const newValue = event.data?.[fieldName];
          if (newValue && newValue !== value) {
            setValue(newValue);
            toast.info('Content updated by another user');
          }
        }
      }
    });

    return unsubscribe;
  }, [entityType, entityId, fieldName, value]);

  const handleChange = (content) => {
    setValue(content);
    debouncedSave(content);
  };

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['blockquote', 'code-block'],
      ['link'],
      ['clean']
    ]
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-600" />
            {title}
          </CardTitle>
          <div className="flex items-center gap-2">
            {updateMutation.isPending && (
              <Badge variant="outline" className="text-xs">
                <Save className="h-3 w-3 mr-1 animate-pulse" />
                Saving...
              </Badge>
            )}
            <Badge variant="outline" className="text-xs">
              {user?.full_name}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ReactQuill
          theme="snow"
          value={value}
          onChange={handleChange}
          modules={modules}
          placeholder="Start typing... Changes save automatically."
          className="min-h-[300px]"
        />
        <p className="text-xs text-slate-500 mt-2">
          Changes are saved automatically. Multiple people can edit simultaneously.
        </p>
      </CardContent>
    </Card>
  );
}