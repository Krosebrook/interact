import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X, Plus, Tag } from 'lucide-react';

const SKILL_CATEGORIES = [
  { value: 'communication', label: 'Communication', color: 'bg-blue-100 text-blue-700' },
  { value: 'leadership', label: 'Leadership', color: 'bg-purple-100 text-purple-700' },
  { value: 'technical', label: 'Technical', color: 'bg-green-100 text-green-700' },
  { value: 'creativity', label: 'Creativity', color: 'bg-pink-100 text-pink-700' },
  { value: 'collaboration', label: 'Collaboration', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'problem_solving', label: 'Problem Solving', color: 'bg-orange-100 text-orange-700' },
  { value: 'emotional_intelligence', label: 'Emotional Intelligence', color: 'bg-red-100 text-red-700' },
  { value: 'time_management', label: 'Time Management', color: 'bg-indigo-100 text-indigo-700' },
  { value: 'presentation', label: 'Presentation', color: 'bg-teal-100 text-teal-700' },
];

const COMMON_SKILLS = [
  'Active Listening', 'Public Speaking', 'Team Coordination', 'Creative Thinking',
  'Conflict Resolution', 'Decision Making', 'Strategic Planning', 'Empathy',
  'Adaptability', 'Critical Thinking', 'Negotiation', 'Mentoring',
  'Brainstorming', 'Networking', 'Feedback Delivery', 'Project Management'
];

export default function SkillTagger({ skills = [], onChange, showCategories = false }) {
  const [newSkill, setNewSkill] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredSuggestions = COMMON_SKILLS.filter(
    s => s.toLowerCase().includes(newSkill.toLowerCase()) && !skills.includes(s)
  ).slice(0, 5);

  const addSkill = (skill) => {
    if (skill && !skills.includes(skill)) {
      onChange([...skills, skill]);
    }
    setNewSkill('');
    setShowSuggestions(false);
  };

  const removeSkill = (skillToRemove) => {
    onChange(skills.filter(s => s !== skillToRemove));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && newSkill.trim()) {
      e.preventDefault();
      addSkill(newSkill.trim());
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Tag className="h-4 w-4 text-slate-500" />
        <span className="text-sm font-medium">Skills Developed</span>
      </div>

      {/* Current Skills */}
      <div className="flex flex-wrap gap-2">
        {skills.map(skill => (
          <Badge 
            key={skill} 
            className="bg-int-navy text-white flex items-center gap-1 py-1 px-2"
          >
            {skill}
            <button onClick={() => removeSkill(skill)} className="hover:opacity-70">
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        {skills.length === 0 && (
          <span className="text-sm text-slate-400">No skills tagged yet</span>
        )}
      </div>

      {/* Add Skill Input */}
      <div className="relative">
        <div className="flex gap-2">
          <Input
            value={newSkill}
            onChange={(e) => {
              setNewSkill(e.target.value);
              setShowSuggestions(e.target.value.length > 0);
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(newSkill.length > 0)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder="Type a skill..."
            className="flex-1"
          />
          <Button 
            type="button"
            size="icon"
            onClick={() => addSkill(newSkill.trim())}
            disabled={!newSkill.trim()}
            className="bg-int-orange hover:bg-[#C46322]"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-10">
            {filteredSuggestions.map(suggestion => (
              <button
                key={suggestion}
                type="button"
                onClick={() => addSkill(suggestion)}
                className="w-full text-left px-3 py-2 hover:bg-slate-50 text-sm"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quick Add Common Skills */}
      <div className="pt-2">
        <p className="text-xs text-slate-500 mb-2">Quick add:</p>
        <div className="flex flex-wrap gap-1">
          {COMMON_SKILLS.filter(s => !skills.includes(s)).slice(0, 8).map(skill => (
            <button
              key={skill}
              type="button"
              onClick={() => addSkill(skill)}
              className="text-xs px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"
            >
              + {skill}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export { SKILL_CATEGORIES, COMMON_SKILLS };