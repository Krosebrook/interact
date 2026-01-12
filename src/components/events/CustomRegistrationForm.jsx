import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ClipboardList, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function CustomRegistrationForm({ 
  form, 
  eventId, 
  seriesId, 
  userEmail, 
  userName,
  onSubmitSuccess 
}) {
  const queryClient = useQueryClient();
  const [responses, setResponses] = useState({});
  const [extraFields, setExtraFields] = useState({
    dietary_requirements: '',
    accessibility_needs: '',
    tshirt_size: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const submitMutation = useMutation({
    mutationFn: async () => {
      const submission = await base44.entities.RegistrationSubmission.create({
        form_id: form.id,
        event_id: eventId,
        series_id: seriesId,
        user_email: userEmail,
        user_name: userName,
        responses,
        ...extraFields,
        status: 'confirmed'
      });

      // Update submission count
      await base44.entities.RegistrationForm.update(form.id, {
        submissions_count: (form.submissions_count || 0) + 1
      });

      return submission;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['registration-submissions']);
      setSubmitted(true);
      toast.success('Registration submitted!');
      onSubmitSuccess?.();
    }
  });

  const updateResponse = (fieldId, value) => {
    setResponses(prev => ({ ...prev, [fieldId]: value }));
  };

  const renderField = (field) => {
    const value = responses[field.id] || '';

    switch (field.type) {
      case 'text':
      case 'email':
      case 'phone':
        return (
          <Input
            type={field.type}
            value={value}
            onChange={(e) => updateResponse(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
          />
        );
      
      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => updateResponse(field.id, e.target.value)}
            placeholder={field.placeholder}
            min={field.validation?.min}
            max={field.validation?.max}
            required={field.required}
          />
        );

      case 'date':
        return (
          <Input
            type="date"
            value={value}
            onChange={(e) => updateResponse(field.id, e.target.value)}
            required={field.required}
          />
        );

      case 'textarea':
        return (
          <Textarea
            value={value}
            onChange={(e) => updateResponse(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            rows={3}
          />
        );

      case 'select':
        return (
          <Select value={value} onValueChange={(val) => updateResponse(field.id, val)}>
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder || 'Select an option'} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map(option => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'multiselect':
        const selectedValues = value ? value.split(',') : [];
        return (
          <div className="space-y-2" data-b44-sync="true" data-feature="events" data-component="customregistrationform">
            {field.options?.map(option => (
              <div key={option} className="flex items-center gap-2">
                <Checkbox
                  checked={selectedValues.includes(option)}
                  onCheckedChange={(checked) => {
                    const newValues = checked
                      ? [...selectedValues, option]
                      : selectedValues.filter(v => v !== option);
                    updateResponse(field.id, newValues.join(','));
                  }}
                />
                <span className="text-sm">{option}</span>
              </div>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <div className="flex items-center gap-2">
            <Checkbox
              checked={value === 'true'}
              onCheckedChange={(checked) => updateResponse(field.id, checked.toString())}
            />
            <span className="text-sm">{field.placeholder}</span>
          </div>
        );

      default:
        return (
          <Input
            value={value}
            onChange={(e) => updateResponse(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
          />
        );
    }
  };

  if (submitted) {
    return (
      <Card className="p-8 text-center border-0 shadow-lg">
        <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-slate-900 mb-2">Registration Complete!</h3>
        <p className="text-slate-600">
          {form.confirmation_message || "Thank you for registering. We'll see you at the event!"}
        </p>
      </Card>
    );
  }

  const isValid = form.fields
    .filter(f => f.required)
    .every(f => responses[f.id]?.trim());

  return (
    <Card className="p-6 border-0 shadow-lg">
      <div className="flex items-center gap-2 mb-6">
        <ClipboardList className="h-5 w-5 text-int-orange" />
        <h3 className="text-lg font-bold">{form.form_name}</h3>
      </div>

      <div className="space-y-4">
        {form.fields.map((field) => (
          <div key={field.id}>
            <Label className="flex items-center gap-1">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </Label>
            <div className="mt-1">
              {renderField(field)}
            </div>
          </div>
        ))}

        {/* Optional Standard Fields */}
        {form.collect_dietary && (
          <div>
            <Label>Dietary Requirements</Label>
            <Input
              value={extraFields.dietary_requirements}
              onChange={(e) => setExtraFields(prev => ({ ...prev, dietary_requirements: e.target.value }))}
              placeholder="e.g., Vegetarian, Gluten-free, Allergies"
            />
          </div>
        )}

        {form.collect_accessibility && (
          <div>
            <Label>Accessibility Needs</Label>
            <Textarea
              value={extraFields.accessibility_needs}
              onChange={(e) => setExtraFields(prev => ({ ...prev, accessibility_needs: e.target.value }))}
              placeholder="Let us know how we can accommodate you"
              rows={2}
            />
          </div>
        )}

        {form.collect_tshirt_size && (
          <div>
            <Label>T-Shirt Size</Label>
            <Select 
              value={extraFields.tshirt_size}
              onValueChange={(val) => setExtraFields(prev => ({ ...prev, tshirt_size: val }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent>
                {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(size => (
                  <SelectItem key={size} value={size}>{size}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <Button
          onClick={() => submitMutation.mutate()}
          disabled={!isValid || submitMutation.isLoading}
          className="w-full bg-int-orange hover:bg-[#C46322]"
        >
          {submitMutation.isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : null}
          Submit Registration
        </Button>
      </div>
    </Card>
  );
}