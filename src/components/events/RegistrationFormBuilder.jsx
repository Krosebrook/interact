import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  ClipboardList, 
  Plus, 
  X, 
  GripVertical,
  Loader2,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';

const FIELD_TYPES = [
  { value: 'text', label: 'Short Text' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'textarea', label: 'Long Text' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'select', label: 'Dropdown' },
  { value: 'multiselect', label: 'Multi-Select' },
  { value: 'checkbox', label: 'Checkbox' }
];

export default function RegistrationFormBuilder({ open, onOpenChange, eventId, seriesId, onFormCreated }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    form_name: '',
    fields: [],
    confirmation_message: '',
    collect_dietary: false,
    collect_accessibility: false,
    collect_tshirt_size: false
  });
  const [editingField, setEditingField] = useState(null);

  const createFormMutation = useMutation({
    mutationFn: (data) => base44.entities.RegistrationForm.create({
      ...data,
      event_id: eventId,
      series_id: seriesId
    }),
    onSuccess: (form) => {
      queryClient.invalidateQueries(['registration-forms']);
      toast.success('Registration form created!');
      onFormCreated?.(form);
      onOpenChange(false);
      resetForm();
    }
  });

  const resetForm = () => {
    setFormData({
      form_name: '',
      fields: [],
      confirmation_message: '',
      collect_dietary: false,
      collect_accessibility: false,
      collect_tshirt_size: false
    });
  };

  const addField = () => {
    const newField = {
      id: `field_${Date.now()}`,
      label: '',
      type: 'text',
      required: false,
      placeholder: '',
      options: []
    };
    setFormData(prev => ({
      ...prev,
      fields: [...prev.fields, newField]
    }));
    setEditingField(newField.id);
  };

  const updateField = (fieldId, updates) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.map(f => 
        f.id === fieldId ? { ...f, ...updates } : f
      )
    }));
  };

  const removeField = (fieldId) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.filter(f => f.id !== fieldId)
    }));
  };

  const addOption = (fieldId) => {
    const field = formData.fields.find(f => f.id === fieldId);
    if (field) {
      updateField(fieldId, {
        options: [...(field.options || []), '']
      });
    }
  };

  const updateOption = (fieldId, optionIndex, value) => {
    const field = formData.fields.find(f => f.id === fieldId);
    if (field) {
      const newOptions = [...field.options];
      newOptions[optionIndex] = value;
      updateField(fieldId, { options: newOptions });
    }
  };

  const removeOption = (fieldId, optionIndex) => {
    const field = formData.fields.find(f => f.id === fieldId);
    if (field) {
      updateField(fieldId, {
        options: field.options.filter((_, i) => i !== optionIndex)
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} data-b44-sync="true" data-feature="events" data-component="registrationformbuilder">
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-int-orange" />
            Create Registration Form
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Form Name */}
          <div>
            <Label>Form Name</Label>
            <Input
              value={formData.form_name}
              onChange={(e) => setFormData(prev => ({ ...prev, form_name: e.target.value }))}
              placeholder="e.g., Workshop Registration"
            />
          </div>

          {/* Form Fields */}
          <div>
            <Label className="flex items-center justify-between">
              <span>Custom Fields</span>
              <Button variant="outline" size="sm" onClick={addField}>
                <Plus className="h-4 w-4 mr-1" /> Add Field
              </Button>
            </Label>

            <div className="space-y-3 mt-3">
              {formData.fields.length === 0 ? (
                <Card className="p-6 text-center border-dashed">
                  <p className="text-slate-500 text-sm">No fields added yet. Click "Add Field" to start.</p>
                </Card>
              ) : (
                formData.fields.map((field, idx) => (
                  <Card key={field.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <GripVertical className="h-5 w-5 text-slate-400 mt-1 cursor-move" />
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-2">
                          <Input
                            value={field.label}
                            onChange={(e) => updateField(field.id, { label: e.target.value })}
                            placeholder="Field label"
                            className="flex-1"
                          />
                          <Select
                            value={field.type}
                            onValueChange={(val) => updateField(field.id, { type: val })}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {FIELD_TYPES.map(type => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button variant="ghost" size="icon" onClick={() => removeField(field.id)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={field.required}
                              onCheckedChange={(checked) => updateField(field.id, { required: checked })}
                            />
                            <Label className="text-sm">Required</Label>
                          </div>
                          <Input
                            value={field.placeholder}
                            onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                            placeholder="Placeholder text"
                            className="flex-1"
                          />
                        </div>

                        {/* Options for select/multiselect */}
                        {(field.type === 'select' || field.type === 'multiselect') && (
                          <div className="space-y-2">
                            <Label className="text-sm">Options</Label>
                            {field.options?.map((option, optIdx) => (
                              <div key={optIdx} className="flex gap-2">
                                <Input
                                  value={option}
                                  onChange={(e) => updateOption(field.id, optIdx, e.target.value)}
                                  placeholder={`Option ${optIdx + 1}`}
                                  className="flex-1"
                                />
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => removeOption(field.id, optIdx)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => addOption(field.id)}
                            >
                              <Plus className="h-3 w-3 mr-1" /> Add Option
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Standard Optional Fields */}
          <Card className="p-4">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Optional Standard Fields
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Collect Dietary Requirements</Label>
                <Switch
                  checked={formData.collect_dietary}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, collect_dietary: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm">Collect Accessibility Needs</Label>
                <Switch
                  checked={formData.collect_accessibility}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, collect_accessibility: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm">Collect T-Shirt Size</Label>
                <Switch
                  checked={formData.collect_tshirt_size}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, collect_tshirt_size: checked }))}
                />
              </div>
            </div>
          </Card>

          {/* Confirmation Message */}
          <div>
            <Label>Confirmation Message</Label>
            <Textarea
              value={formData.confirmation_message}
              onChange={(e) => setFormData(prev => ({ ...prev, confirmation_message: e.target.value }))}
              placeholder="Message shown after successful registration"
              rows={2}
            />
          </div>

          <Button
            onClick={() => createFormMutation.mutate(formData)}
            disabled={!formData.form_name || formData.fields.length === 0 || createFormMutation.isLoading}
            className="w-full bg-int-orange hover:bg-[#C46322]"
          >
            {createFormMutation.isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <ClipboardList className="h-4 w-4 mr-2" />
            )}
            Create Form
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}