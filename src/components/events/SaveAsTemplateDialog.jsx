import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Save, Loader2 } from 'lucide-react';

export default function SaveAsTemplateDialog({ open, onOpenChange, event, activity }) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: event?.title || '',
    description: activity?.description || '',
    is_public: true
  });

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('Please enter a template name');
      return;
    }

    setSaving(true);
    try {
      await base44.entities.EventTemplate.create({
        name: formData.name,
        description: formData.description,
        activity_id: event.activity_id,
        event_type: event.event_type,
        duration_minutes: event.duration_minutes,
        event_format: event.event_format,
        location: event.location,
        max_participants: event.max_participants,
        custom_instructions: event.custom_instructions,
        meeting_link_pattern: event.meeting_link,
        is_public: formData.is_public,
        created_by: event.created_by || event.facilitator_email
      });

      toast.success('Template saved successfully!');
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="h-5 w-5 text-purple-600" />
            Save as Template
          </DialogTitle>
          <DialogDescription>
            Create a reusable template from this event
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="template-name">Template Name *</Label>
            <Input
              id="template-name"
              placeholder="e.g., Weekly Team Standup"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="template-description">Description</Label>
            <Textarea
              id="template-description"
              placeholder="What makes this event template effective?"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is-public"
              checked={formData.is_public}
              onCheckedChange={(checked) => setFormData({ ...formData, is_public: checked })}
            />
            <Label htmlFor="is-public" className="text-sm font-normal cursor-pointer">
              Make available to all admins
            </Label>
          </div>

          <div className="bg-slate-50 rounded-lg p-3 text-sm text-slate-600">
            <strong>Template will include:</strong>
            <ul className="mt-2 space-y-1 list-disc list-inside">
              <li>Activity type: {activity?.title}</li>
              <li>Duration: {event.duration_minutes} minutes</li>
              <li>Format: {event.event_format}</li>
              {event.max_participants && <li>Max participants: {event.max_participants}</li>}
            </ul>
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Template
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}