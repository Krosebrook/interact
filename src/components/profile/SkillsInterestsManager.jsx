import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Lightbulb, 
  Heart, 
  Plus, 
  X, 
  Sparkles,
  Target,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

const SKILL_CATEGORIES = {
  'Professional': ['Leadership', 'Communication', 'Project Management', 'Public Speaking', 'Negotiation'],
  'Creative': ['Design', 'Writing', 'Photography', 'Video Production', 'Music'],
  'Technical': ['Programming', 'Data Analysis', 'AI/ML', 'Cloud Computing', 'Cybersecurity'],
  'Personal': ['Time Management', 'Emotional Intelligence', 'Mindfulness', 'Networking', 'Problem Solving']
};

const INTEREST_CATEGORIES = {
  'Activities': ['Sports', 'Fitness', 'Gaming', 'Cooking', 'Travel'],
  'Arts & Culture': ['Music', 'Movies', 'Art', 'Reading', 'Theater'],
  'Lifestyle': ['Photography', 'Fashion', 'Food', 'Wellness', 'Volunteering'],
  'Technology': ['Gadgets', 'AI', 'Startups', 'Innovation', 'Science']
};

export default function SkillsInterestsManager({ profile, onUpdate }) {
  const queryClient = useQueryClient();
  const [newSkill, setNewSkill] = useState('');
  const [newInterest, setNewInterest] = useState('');
  const [showSkillSuggestions, setShowSkillSuggestions] = useState(false);
  const [showInterestSuggestions, setShowInterestSuggestions] = useState(false);

  const skills = profile?.skill_interests || [];
  const interests = profile?.interests_tags || [];

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.UserProfile.update(profile.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['user-profile']);
      onUpdate?.();
    }
  });

  const addSkill = (skill) => {
    if (!skill.trim() || skills.includes(skill)) return;
    updateMutation.mutate({ skill_interests: [...skills, skill.trim()] });
    setNewSkill('');
    toast.success(`Added "${skill}" to skills`);
  };

  const removeSkill = (skill) => {
    updateMutation.mutate({ skill_interests: skills.filter(s => s !== skill) });
  };

  const addInterest = (interest) => {
    if (!interest.trim() || interests.includes(interest)) return;
    updateMutation.mutate({ interests_tags: [...interests, interest.trim()] });
    setNewInterest('');
    toast.success(`Added "${interest}" to interests`);
  };

  const removeInterest = (interest) => {
    updateMutation.mutate({ interests_tags: interests.filter(i => i !== interest) });
  };

  return (
    <div className="space-y-6" data-b44-sync="true" data-feature="profile" data-component="skillsinterestsmanager">
      {/* Skills Section */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-emerald-600" />
            Skills I Want to Develop
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Current Skills */}
          <div className="flex flex-wrap gap-2 mb-4">
            {skills.length === 0 ? (
              <p className="text-sm text-slate-500">No skills added yet</p>
            ) : (
              skills.map((skill, idx) => (
                <Badge 
                  key={idx} 
                  className="bg-emerald-100 text-emerald-700 pr-1 hover:bg-emerald-200 transition-colors"
                >
                  {skill}
                  <button 
                    onClick={() => removeSkill(skill)} 
                    className="ml-1 hover:bg-emerald-300 rounded-full p-0.5"
                    disabled={updateMutation.isLoading}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))
            )}
          </div>

          {/* Add Skill Input */}
          <div className="flex gap-2 mb-3">
            <Input
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="Add a skill..."
              onKeyDown={(e) => e.key === 'Enter' && addSkill(newSkill)}
              onFocus={() => setShowSkillSuggestions(true)}
            />
            <Button 
              onClick={() => addSkill(newSkill)} 
              disabled={!newSkill.trim() || updateMutation.isLoading}
            >
              {updateMutation.isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            </Button>
          </div>

          {/* Skill Suggestions */}
          {showSkillSuggestions && (
            <div className="space-y-3">
              {Object.entries(SKILL_CATEGORIES).map(([category, categorySkills]) => {
                const availableSkills = categorySkills.filter(s => !skills.includes(s));
                if (availableSkills.length === 0) return null;
                return (
                  <div key={category}>
                    <p className="text-xs font-medium text-slate-500 mb-1">{category}</p>
                    <div className="flex flex-wrap gap-1">
                      {availableSkills.map(skill => (
                        <button
                          key={skill}
                          onClick={() => addSkill(skill)}
                          className="text-xs px-2 py-1 bg-slate-100 hover:bg-emerald-100 hover:text-emerald-700 rounded-full transition-colors"
                        >
                          + {skill}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowSkillSuggestions(false)}
                className="w-full text-xs"
              >
                Hide suggestions
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Interests Section */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-pink-600" />
            Personal Interests
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Current Interests */}
          <div className="flex flex-wrap gap-2 mb-4">
            {interests.length === 0 ? (
              <p className="text-sm text-slate-500">No interests added yet</p>
            ) : (
              interests.map((interest, idx) => (
                <Badge 
                  key={idx} 
                  className="bg-pink-100 text-pink-700 pr-1 hover:bg-pink-200 transition-colors"
                >
                  {interest}
                  <button 
                    onClick={() => removeInterest(interest)} 
                    className="ml-1 hover:bg-pink-300 rounded-full p-0.5"
                    disabled={updateMutation.isLoading}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))
            )}
          </div>

          {/* Add Interest Input */}
          <div className="flex gap-2 mb-3">
            <Input
              value={newInterest}
              onChange={(e) => setNewInterest(e.target.value)}
              placeholder="Add an interest..."
              onKeyDown={(e) => e.key === 'Enter' && addInterest(newInterest)}
              onFocus={() => setShowInterestSuggestions(true)}
            />
            <Button 
              onClick={() => addInterest(newInterest)} 
              disabled={!newInterest.trim() || updateMutation.isLoading}
            >
              {updateMutation.isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            </Button>
          </div>

          {/* Interest Suggestions */}
          {showInterestSuggestions && (
            <div className="space-y-3">
              {Object.entries(INTEREST_CATEGORIES).map(([category, categoryInterests]) => {
                const availableInterests = categoryInterests.filter(i => !interests.includes(i));
                if (availableInterests.length === 0) return null;
                return (
                  <div key={category}>
                    <p className="text-xs font-medium text-slate-500 mb-1">{category}</p>
                    <div className="flex flex-wrap gap-1">
                      {availableInterests.map(interest => (
                        <button
                          key={interest}
                          onClick={() => addInterest(interest)}
                          className="text-xs px-2 py-1 bg-slate-100 hover:bg-pink-100 hover:text-pink-700 rounded-full transition-colors"
                        >
                          + {interest}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowInterestSuggestions(false)}
                className="w-full text-xs"
              >
                Hide suggestions
              </Button>
            </div>
          )}

          {/* Recommendation Note */}
          <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
            <div className="flex items-start gap-2">
              <Sparkles className="h-4 w-4 text-purple-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-purple-800">Personalized Recommendations</p>
                <p className="text-xs text-purple-600">
                  Your skills and interests help us suggest events and activities tailored just for you!
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}