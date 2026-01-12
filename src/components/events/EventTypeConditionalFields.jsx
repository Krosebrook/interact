/**
 * EVENT TYPE CONDITIONAL FIELDS
 * Renders different form fields based on the selected event type
 */

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  FileText, 
  Users, 
  BookOpen, 
  Award, 
  Presentation, 
  MessageSquare,
  Lightbulb,
  Palette,
  Heart,
  PartyPopper,
  Plus,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Event type configuration with icons and conditional field definitions
export const EVENT_TYPES = {
  meeting: {
    label: 'Meeting',
    icon: Users,
    color: 'bg-blue-100 text-blue-700',
    fields: ['agenda_link', 'required_attendees']
  },
  workshop: {
    label: 'Workshop',
    icon: Palette,
    color: 'bg-purple-100 text-purple-700',
    fields: ['materials_needed', 'prerequisites']
  },
  training: {
    label: 'Training',
    icon: BookOpen,
    color: 'bg-green-100 text-green-700',
    fields: ['prerequisites', 'learning_objectives', 'certification_offered']
  },
  presentation: {
    label: 'Presentation',
    icon: Presentation,
    color: 'bg-amber-100 text-amber-700',
    fields: ['presentation_slides_url', 'q_and_a_enabled']
  },
  brainstorm: {
    label: 'Brainstorm',
    icon: Lightbulb,
    color: 'bg-yellow-100 text-yellow-700',
    fields: ['brainstorm_topic', 'brainstorm_tools']
  },
  wellness: {
    label: 'Wellness',
    icon: Heart,
    color: 'bg-pink-100 text-pink-700',
    fields: ['wellness_category']
  },
  social: {
    label: 'Social',
    icon: PartyPopper,
    color: 'bg-orange-100 text-orange-700',
    fields: ['social_theme', 'dress_code']
  },
  other: {
    label: 'Other',
    icon: FileText,
    color: 'bg-slate-100 text-slate-700',
    fields: []
  }
};

const WELLNESS_CATEGORIES = [
  { value: 'meditation', label: 'Meditation & Mindfulness' },
  { value: 'exercise', label: 'Exercise & Fitness' },
  { value: 'nutrition', label: 'Nutrition & Diet' },
  { value: 'mental_health', label: 'Mental Health' },
  { value: 'team_building', label: 'Team Building' }
];

const BRAINSTORM_TOOLS = ['Miro', 'FigJam', 'Notion', 'Google Docs', 'Whiteboard', 'Sticky Notes'];

export default function EventTypeConditionalFields({ 
  eventType, 
  typeSpecificFields = {}, 
  onChange 
}) {
  const typeConfig = EVENT_TYPES[eventType] || EVENT_TYPES.other;
  const activeFields = typeConfig.fields;

  const updateField = (field, value) => {
    onChange({
      ...typeSpecificFields,
      [field]: value
    });
  };

  const addToArray = (field, value) => {
    const currentArray = typeSpecificFields[field] || [];
    if (value && !currentArray.includes(value)) {
      updateField(field, [...currentArray, value]);
    }
  };

  const removeFromArray = (field, value) => {
    const currentArray = typeSpecificFields[field] || [];
    updateField(field, currentArray.filter(item => item !== value));
  };

  if (!eventType || eventType === 'other' || activeFields.length === 0) {
    return null;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        data-b44-sync="true"
        data-feature="events"
        data-component="eventtypeconditionalfields"
        key={eventType}
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.2 }}
        className="space-y-4 p-4 bg-slate-50 rounded-xl border border-slate-200"
      >
        <div className="flex items-center gap-2 mb-3">
          <Badge className={typeConfig.color}>
            <typeConfig.icon className="h-3 w-3 mr-1" />
            {typeConfig.label} Fields
          </Badge>
        </div>

        {/* Meeting Fields */}
        {activeFields.includes('agenda_link') && (
          <div>
            <Label className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-slate-500" />
              Agenda Link
            </Label>
            <Input
              type="url"
              value={typeSpecificFields.agenda_link || ''}
              onChange={(e) => updateField('agenda_link', e.target.value)}
              placeholder="https://docs.google.com/..."
              className="mt-1"
            />
          </div>
        )}

        {activeFields.includes('required_attendees') && (
          <div>
            <Label className="flex items-center gap-2">
              <Users className="h-4 w-4 text-slate-500" />
              Required Attendees
            </Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {(typeSpecificFields.required_attendees || []).map((email, idx) => (
                <Badge key={idx} variant="secondary" className="gap-1">
                  {email}
                  <X 
                    className="h-3 w-3 cursor-pointer hover:text-red-500" 
                    onClick={() => removeFromArray('required_attendees', email)}
                  />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <Input
                type="email"
                placeholder="Add attendee email..."
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addToArray('required_attendees', e.target.value);
                    e.target.value = '';
                  }
                }}
              />
              <Button 
                type="button" 
                variant="outline" 
                size="icon"
                onClick={(e) => {
                  const input = e.target.previousSibling;
                  addToArray('required_attendees', input.value);
                  input.value = '';
                }}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Workshop Fields */}
        {activeFields.includes('materials_needed') && (
          <div>
            <Label className="flex items-center gap-2">
              <Palette className="h-4 w-4 text-slate-500" />
              Materials Needed
            </Label>
            <Textarea
              value={typeSpecificFields.materials_needed || ''}
              onChange={(e) => updateField('materials_needed', e.target.value)}
              placeholder="List materials participants should prepare..."
              className="mt-1"
              rows={3}
            />
          </div>
        )}

        {activeFields.includes('prerequisites') && (
          <div>
            <Label className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-slate-500" />
              Prerequisites
            </Label>
            <Textarea
              value={typeSpecificFields.prerequisites || ''}
              onChange={(e) => updateField('prerequisites', e.target.value)}
              placeholder="Any prerequisites or prior knowledge required..."
              className="mt-1"
              rows={2}
            />
          </div>
        )}

        {/* Training Fields */}
        {activeFields.includes('learning_objectives') && (
          <div>
            <Label className="flex items-center gap-2">
              <Award className="h-4 w-4 text-slate-500" />
              Learning Objectives
            </Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {(typeSpecificFields.learning_objectives || []).map((obj, idx) => (
                <Badge key={idx} variant="secondary" className="gap-1">
                  {obj}
                  <X 
                    className="h-3 w-3 cursor-pointer hover:text-red-500" 
                    onClick={() => removeFromArray('learning_objectives', obj)}
                  />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <Input
                placeholder="Add learning objective..."
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addToArray('learning_objectives', e.target.value);
                    e.target.value = '';
                  }
                }}
              />
              <Button 
                type="button" 
                variant="outline" 
                size="icon"
                onClick={(e) => {
                  const input = e.target.previousSibling;
                  addToArray('learning_objectives', input.value);
                  input.value = '';
                }}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {activeFields.includes('certification_offered') && (
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <Award className="h-4 w-4 text-slate-500" />
              Certification Offered
            </Label>
            <Switch
              checked={typeSpecificFields.certification_offered || false}
              onCheckedChange={(checked) => updateField('certification_offered', checked)}
            />
          </div>
        )}

        {/* Presentation Fields */}
        {activeFields.includes('presentation_slides_url') && (
          <div>
            <Label className="flex items-center gap-2">
              <Presentation className="h-4 w-4 text-slate-500" />
              Presentation Slides URL
            </Label>
            <Input
              type="url"
              value={typeSpecificFields.presentation_slides_url || ''}
              onChange={(e) => updateField('presentation_slides_url', e.target.value)}
              placeholder="https://slides.google.com/..."
              className="mt-1"
            />
          </div>
        )}

        {activeFields.includes('q_and_a_enabled') && (
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-slate-500" />
              Enable Q&A Session
            </Label>
            <Switch
              checked={typeSpecificFields.q_and_a_enabled || false}
              onCheckedChange={(checked) => updateField('q_and_a_enabled', checked)}
            />
          </div>
        )}

        {/* Brainstorm Fields */}
        {activeFields.includes('brainstorm_topic') && (
          <div>
            <Label className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-slate-500" />
              Brainstorm Topic
            </Label>
            <Input
              value={typeSpecificFields.brainstorm_topic || ''}
              onChange={(e) => updateField('brainstorm_topic', e.target.value)}
              placeholder="Main topic for brainstorming..."
              className="mt-1"
            />
          </div>
        )}

        {activeFields.includes('brainstorm_tools') && (
          <div>
            <Label className="flex items-center gap-2">
              <Palette className="h-4 w-4 text-slate-500" />
              Collaboration Tools
            </Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {BRAINSTORM_TOOLS.map(tool => {
                const isSelected = (typeSpecificFields.brainstorm_tools || []).includes(tool);
                return (
                  <Badge 
                    key={tool}
                    variant={isSelected ? "default" : "outline"}
                    className={`cursor-pointer transition-all ${isSelected ? 'bg-int-orange' : 'hover:bg-slate-100'}`}
                    onClick={() => {
                      if (isSelected) {
                        removeFromArray('brainstorm_tools', tool);
                      } else {
                        addToArray('brainstorm_tools', tool);
                      }
                    }}
                  >
                    {tool}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}

        {/* Wellness Fields */}
        {activeFields.includes('wellness_category') && (
          <div>
            <Label className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-slate-500" />
              Wellness Category
            </Label>
            <Select
              value={typeSpecificFields.wellness_category || ''}
              onValueChange={(value) => updateField('wellness_category', value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select category..." />
              </SelectTrigger>
              <SelectContent>
                {WELLNESS_CATEGORIES.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Social Fields */}
        {activeFields.includes('social_theme') && (
          <div>
            <Label className="flex items-center gap-2">
              <PartyPopper className="h-4 w-4 text-slate-500" />
              Event Theme
            </Label>
            <Input
              value={typeSpecificFields.social_theme || ''}
              onChange={(e) => updateField('social_theme', e.target.value)}
              placeholder="e.g., 80s Retro, Hawaiian Luau..."
              className="mt-1"
            />
          </div>
        )}

        {activeFields.includes('dress_code') && (
          <div>
            <Label className="flex items-center gap-2">
              <Users className="h-4 w-4 text-slate-500" />
              Dress Code
            </Label>
            <Input
              value={typeSpecificFields.dress_code || ''}
              onChange={(e) => updateField('dress_code', e.target.value)}
              placeholder="e.g., Casual, Costume, Formal..."
              className="mt-1"
            />
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}