import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ProfileEditForm({ profile, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    bio: profile?.bio || '',
    skills: profile?.skills || [],
    interests: profile?.interests || [],
  });

  const [newSkill, setNewSkill] = useState({ skill_name: '', proficiency: 'intermediate' });
  const [newInterest, setNewInterest] = useState('');

  const addSkill = () => {
    if (!newSkill.skill_name.trim()) return;
    setFormData({
      ...formData,
      skills: [...formData.skills, { ...newSkill }]
    });
    setNewSkill({ skill_name: '', proficiency: 'intermediate' });
  };

  const removeSkill = (index) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((_, i) => i !== index)
    });
  };

  const addInterest = () => {
    if (!newInterest.trim()) return;
    setFormData({
      ...formData,
      interests: [...formData.interests, newInterest.trim()]
    });
    setNewInterest('');
  };

  const removeInterest = (index) => {
    setFormData({
      ...formData,
      interests: formData.interests.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Bio */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">About Me</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Tell us about yourself..."
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            rows={4}
            className="resize-none"
          />
        </CardContent>
      </Card>

      {/* Skills */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Skills</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Existing Skills */}
          <div className="flex flex-wrap gap-2">
            {formData.skills.map((skill, index) => (
              <Badge
                key={index}
                variant="outline"
                className="px-3 py-1.5 text-sm"
              >
                {skill.skill_name}
                <span className="ml-2 text-xs text-slate-500">({skill.proficiency})</span>
                <button
                  type="button"
                  onClick={() => removeSkill(index)}
                  className="ml-2 hover:text-red-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>

          {/* Add New Skill */}
          <div className="flex gap-2">
            <Input
              placeholder="Skill name"
              value={newSkill.skill_name}
              onChange={(e) => setNewSkill({ ...newSkill, skill_name: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
            />
            <select
              value={newSkill.proficiency}
              onChange={(e) => setNewSkill({ ...newSkill, proficiency: e.target.value })}
              className="px-3 py-2 border border-slate-300 rounded-md text-sm"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="expert">Expert</option>
            </select>
            <Button type="button" onClick={addSkill} size="icon" variant="outline">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Interests */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Interests</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Existing Interests */}
          <div className="flex flex-wrap gap-2">
            {formData.interests.map((interest, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="px-3 py-1.5 text-sm"
              >
                {interest}
                <button
                  type="button"
                  onClick={() => removeInterest(index)}
                  className="ml-2 hover:text-red-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>

          {/* Add New Interest */}
          <div className="flex gap-2">
            <Input
              placeholder="Add an interest..."
              value={newInterest}
              onChange={(e) => setNewInterest(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest())}
            />
            <Button type="button" onClick={addInterest} size="icon" variant="outline">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="bg-int-orange hover:bg-int-orange-dark">
          Save Changes
        </Button>
      </div>
    </form>
  );
}