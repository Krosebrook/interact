import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sparkles,
  Plus,
  X,
  Target,
  Award,
  Linkedin,
  Github,
  Globe,
  Twitter,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';

export default function SkillsInterestsSection({ profile, userEmail }) {
  const queryClient = useQueryClient();
  const [editMode, setEditMode] = useState(false);
  const [newSkill, setNewSkill] = useState({ skill: '', level: 'intermediate' });
  const [newInterest, setNewInterest] = useState('');
  const [newGoal, setNewGoal] = useState('');
  const [externalLinks, setExternalLinks] = useState(profile?.external_profiles || {});
  const [showMentors, setShowMentors] = useState(false);
  const [mentorMatches, setMentorMatches] = useState(null);

  // Update profile mutation
  const updateMutation = useMutation({
    mutationFn: async (updates) => {
      const profiles = await base44.entities.UserProfile.filter({ user_email: userEmail });
      if (profiles[0]) {
        return base44.entities.UserProfile.update(profiles[0].id, updates);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['user-profile']);
      toast.success('Profile updated');
      setEditMode(false);
    }
  });

  // Find mentors mutation
  const findMentorsMutation = useMutation({
    mutationFn: async () => {
      const result = await base44.functions.invoke('aiMentorMatcher', {
        user_email: userEmail,
        skills_to_learn: profile?.skill_interests || []
      });
      return result.data || result;
    },
    onSuccess: (data) => {
      setMentorMatches(data.matches);
      setShowMentors(true);
    }
  });

  const addSkill = () => {
    if (!newSkill.skill) return;
    const currentSkills = profile?.skill_levels || [];
    updateMutation.mutate({
      skill_levels: [...currentSkills, { skill: newSkill.skill, level: newSkill.level }]
    });
    setNewSkill({ skill: '', level: 'intermediate' });
  };

  const removeSkill = (skillToRemove) => {
    const currentSkills = profile?.skill_levels || [];
    updateMutation.mutate({
      skill_levels: currentSkills.filter(s => s.skill !== skillToRemove)
    });
  };

  const addInterest = () => {
    if (!newInterest) return;
    const currentInterests = profile?.skill_interests || [];
    updateMutation.mutate({
      skill_interests: [...currentInterests, newInterest]
    });
    setNewInterest('');
  };

  const removeInterest = (interest) => {
    const currentInterests = profile?.skill_interests || [];
    updateMutation.mutate({
      skill_interests: currentInterests.filter(i => i !== interest)
    });
  };

  const addGoal = () => {
    if (!newGoal) return;
    const currentGoals = profile?.learning_goals || [];
    updateMutation.mutate({
      learning_goals: [...currentGoals, newGoal]
    });
    setNewGoal('');
  };

  const removeGoal = (goal) => {
    const currentGoals = profile?.learning_goals || [];
    updateMutation.mutate({
      learning_goals: currentGoals.filter(g => g !== goal)
    });
  };

  const saveExternalLinks = () => {
    updateMutation.mutate({ external_profiles: externalLinks });
  };

  return (
    <div className="space-y-4" data-b44-sync="true" data-feature="profile" data-component="skillsinterestssection">
      {/* Current Skills */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-indigo-600" />
              My Skills
            </CardTitle>
            <Button size="sm" variant="outline" onClick={() => setEditMode(!editMode)}>
              {editMode ? 'Done' : 'Edit'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {profile?.skill_levels?.map((skill, idx) => (
              <Badge key={idx} variant="outline" className="px-3 py-1">
                {skill.skill} - {skill.level}
                {editMode && (
                  <button
                    onClick={() => removeSkill(skill.skill)}
                    className="ml-2 hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </Badge>
            ))}
          </div>

          {editMode && (
            <div className="flex gap-2">
              <Input
                placeholder="Skill name"
                value={newSkill.skill}
                onChange={(e) => setNewSkill({ ...newSkill, skill: e.target.value })}
              />
              <Select
                value={newSkill.level}
                onValueChange={(value) => setNewSkill({ ...newSkill, level: value })}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={addSkill} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Learning Interests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            Learning Interests
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {profile?.skill_interests?.map((interest, idx) => (
              <Badge key={idx} className="bg-purple-600 px-3 py-1">
                {interest}
                {editMode && (
                  <button
                    onClick={() => removeInterest(interest)}
                    className="ml-2 hover:text-red-200"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </Badge>
            ))}
          </div>

          {editMode && (
            <div className="flex gap-2">
              <Input
                placeholder="What do you want to learn?"
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
              />
              <Button onClick={addInterest} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          )}

          <Button
            onClick={() => findMentorsMutation.mutate()}
            disabled={findMentorsMutation.isPending}
            className="w-full"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Find Mentors
          </Button>
        </CardContent>
      </Card>

      {/* Learning Goals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-green-600" />
            Learning Goals
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {profile?.learning_goals?.map((goal, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 bg-green-50 rounded">
                <span className="text-sm">{goal}</span>
                {editMode && (
                  <button onClick={() => removeGoal(goal)} className="hover:text-red-600">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {editMode && (
            <div className="flex gap-2">
              <Input
                placeholder="Add a learning goal"
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
              />
              <Button onClick={addGoal} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* External Profiles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5 text-blue-600" />
            External Profiles
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {editMode ? (
            <>
              <div className="flex items-center gap-2">
                <Linkedin className="h-4 w-4 text-blue-600" />
                <Input
                  placeholder="LinkedIn URL"
                  value={externalLinks.linkedin || ''}
                  onChange={(e) => setExternalLinks({ ...externalLinks, linkedin: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-2">
                <Github className="h-4 w-4" />
                <Input
                  placeholder="GitHub URL"
                  value={externalLinks.github || ''}
                  onChange={(e) => setExternalLinks({ ...externalLinks, github: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-2">
                <Twitter className="h-4 w-4 text-blue-400" />
                <Input
                  placeholder="Twitter/X URL"
                  value={externalLinks.twitter || ''}
                  onChange={(e) => setExternalLinks({ ...externalLinks, twitter: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-slate-600" />
                <Input
                  placeholder="Portfolio URL"
                  value={externalLinks.portfolio || ''}
                  onChange={(e) => setExternalLinks({ ...externalLinks, portfolio: e.target.value })}
                />
              </div>
              <Button onClick={saveExternalLinks} className="w-full">
                Save Links
              </Button>
            </>
          ) : (
            <div className="space-y-2">
              {externalLinks?.linkedin && (
                <a href={externalLinks.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                  <Linkedin className="h-4 w-4" />
                  LinkedIn Profile
                </a>
              )}
              {externalLinks?.github && (
                <a href={externalLinks.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm hover:underline">
                  <Github className="h-4 w-4" />
                  GitHub Profile
                </a>
              )}
              {externalLinks?.twitter && (
                <a href={externalLinks.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-400 hover:underline">
                  <Twitter className="h-4 w-4" />
                  Twitter/X Profile
                </a>
              )}
              {externalLinks?.portfolio && (
                <a href={externalLinks.portfolio} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-slate-600 hover:underline">
                  <Globe className="h-4 w-4" />
                  Portfolio
                </a>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mentor Matches */}
      {showMentors && mentorMatches && (
        <Card>
          <CardHeader>
            <CardTitle>Recommended Mentors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mentorMatches.map((match, idx) => (
                <div key={idx} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{match.mentor_email}</span>
                    <Badge className="bg-purple-600">{match.match_score}% match</Badge>
                  </div>
                  <p className="text-sm text-slate-600 mb-2">{match.reasoning}</p>
                  <div className="flex flex-wrap gap-1">
                    {match.mentorship_areas?.map((area, i) => (
                      <Badge key={i} variant="outline" className="text-xs">{area}</Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}