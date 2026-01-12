import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Users, 
  Search, 
  Edit, 
  Eye,
  Filter,
  Download,
  GraduationCap,
  Target,
  Brain,
  Star,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';

const SKILL_LEVELS = ['beginner', 'intermediate', 'advanced', 'expert'];
const LEARNING_STYLES = ['visual', 'auditory', 'reading', 'kinesthetic', 'social', 'solitary'];
const PERSONALITY_TYPES = {
  introvert_extrovert: ['introvert', 'ambivert', 'extrovert'],
  collaboration_style: ['leader', 'contributor', 'supporter', 'observer'],
  communication_preference: ['verbal', 'written', 'visual']
};

export default function ParticipantProfilesView({ eventId }) {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ['user-profiles'],
    queryFn: () => base44.entities.UserProfile.list()
  });

  const { data: participations = [] } = useQuery({
    queryKey: ['participations', eventId],
    queryFn: () => base44.entities.Participation.filter({ event_id: eventId }),
    enabled: !!eventId
  });

  const updateProfileMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.UserProfile.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['user-profiles']);
      setEditMode(false);
      toast.success('Profile updated!');
    }
  });

  // Get participant emails for filtering
  const participantEmails = eventId 
    ? participations.map(p => p.participant_email)
    : [];

  // Filter profiles
  const filteredProfiles = profiles.filter(p => {
    const matchesSearch = !searchQuery || 
      p.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.user_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.department?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDepartment = filterDepartment === 'all' || p.department === filterDepartment;
    
    const matchesEvent = !eventId || participantEmails.includes(p.user_email);

    return matchesSearch && matchesDepartment && matchesEvent;
  });

  // Get unique departments
  const departments = [...new Set(profiles.map(p => p.department).filter(Boolean))];

  const handleEdit = (profile) => {
    setSelectedProfile(profile);
    setEditData({ ...profile });
    setEditMode(true);
  };

  const handleView = (profile) => {
    setSelectedProfile(profile);
    setEditMode(false);
  };

  const handleSave = () => {
    updateProfileMutation.mutate({ id: selectedProfile.id, data: editData });
  };

  const addSkillLevel = () => {
    setEditData(prev => ({
      ...prev,
      skill_levels: [...(prev.skill_levels || []), { skill: '', level: 'beginner' }]
    }));
  };

  const updateSkillLevel = (index, field, value) => {
    setEditData(prev => ({
      ...prev,
      skill_levels: prev.skill_levels.map((s, i) => 
        i === index ? { ...s, [field]: value } : s
      )
    }));
  };

  const removeSkillLevel = (index) => {
    setEditData(prev => ({
      ...prev,
      skill_levels: prev.skill_levels.filter((_, i) => i !== index)
    }));
  };

  const exportProfiles = () => {
    const csv = [
      ['Name', 'Email', 'Department', 'Skills', 'Learning Styles', 'Events Attended'].join(','),
      ...filteredProfiles.map(p => [
        p.display_name || '',
        p.user_email,
        p.department || '',
        (p.skill_levels || []).map(s => `${s.skill}:${s.level}`).join('; '),
        (p.preferred_learning_styles || []).join('; '),
        p.engagement_stats?.total_events_attended || 0
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'participant-profiles.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Profiles exported!');
  };

  const getEngagementBadge = (score) => {
    if (!score) return <Badge variant="outline">No data</Badge>;
    if (score >= 8) return <Badge className="bg-green-100 text-green-700">High</Badge>;
    if (score >= 5) return <Badge className="bg-yellow-100 text-yellow-700">Medium</Badge>;
    return <Badge className="bg-red-100 text-red-700">Low</Badge>;
  };

  return (
    <Card className="border-0 shadow-lg" data-b44-sync="true" data-feature="facilitator" data-component="participantprofilesview">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-int-orange" />
            Participant Profiles
            {eventId && <Badge variant="outline">Event Participants</Badge>}
          </CardTitle>
          <Button variant="outline" size="sm" onClick={exportProfiles}>
            <Download className="h-4 w-4 mr-1" /> Export
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, department..."
                className="pl-10"
              />
            </div>
          </div>
          <Select value={filterDepartment} onValueChange={setFilterDepartment}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map(d => (
                <SelectItem key={d} value={d}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Profiles Table */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Participant</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Skills</TableHead>
                <TableHead>Learning Style</TableHead>
                <TableHead>Engagement</TableHead>
                <TableHead>Events</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">Loading...</TableCell>
                </TableRow>
              ) : filteredProfiles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                    No profiles found
                  </TableCell>
                </TableRow>
              ) : (
                filteredProfiles.map(profile => (
                  <TableRow key={profile.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-int-orange/20 flex items-center justify-center">
                          {profile.avatar_url ? (
                            <img src={profile.avatar_url} alt="" className="w-8 h-8 rounded-full" />
                          ) : (
                            <span className="text-sm font-bold text-int-orange">
                              {(profile.display_name || profile.user_email)?.[0]?.toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{profile.display_name || 'No name'}</p>
                          <p className="text-xs text-slate-500">{profile.user_email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{profile.department || '-'}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {(profile.skill_levels || []).slice(0, 2).map((s, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {s.skill}
                          </Badge>
                        ))}
                        {(profile.skill_levels || []).length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{profile.skill_levels.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {(profile.preferred_learning_styles || []).slice(0, 2).map((s, i) => (
                          <Badge key={i} className="text-xs bg-purple-100 text-purple-700">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getEngagementBadge(profile.engagement_stats?.average_engagement_score)}
                    </TableCell>
                    <TableCell>
                      {profile.engagement_stats?.total_events_attended || 0}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleView(profile)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(profile)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Profile Detail/Edit Dialog */}
        <Dialog open={!!selectedProfile} onOpenChange={() => setSelectedProfile(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {editMode ? <Edit className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                {editMode ? 'Edit Profile' : 'Profile Details'}
              </DialogTitle>
            </DialogHeader>

            {selectedProfile && (
              <Tabs defaultValue="basic">
                <TabsList className="grid grid-cols-4 mb-4">
                  <TabsTrigger value="basic">Basic</TabsTrigger>
                  <TabsTrigger value="skills">Skills</TabsTrigger>
                  <TabsTrigger value="learning">Learning</TabsTrigger>
                  <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>

                {/* Basic Info */}
                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Display Name</Label>
                      {editMode ? (
                        <Input
                          value={editData.display_name || ''}
                          onChange={(e) => setEditData(prev => ({ ...prev, display_name: e.target.value }))}
                        />
                      ) : (
                        <p className="text-sm mt-1">{selectedProfile.display_name || '-'}</p>
                      )}
                    </div>
                    <div>
                      <Label>Department</Label>
                      {editMode ? (
                        <Input
                          value={editData.department || ''}
                          onChange={(e) => setEditData(prev => ({ ...prev, department: e.target.value }))}
                        />
                      ) : (
                        <p className="text-sm mt-1">{selectedProfile.department || '-'}</p>
                      )}
                    </div>
                    <div>
                      <Label>Job Title</Label>
                      {editMode ? (
                        <Input
                          value={editData.job_title || ''}
                          onChange={(e) => setEditData(prev => ({ ...prev, job_title: e.target.value }))}
                        />
                      ) : (
                        <p className="text-sm mt-1">{selectedProfile.job_title || '-'}</p>
                      )}
                    </div>
                    <div>
                      <Label>Location</Label>
                      {editMode ? (
                        <Input
                          value={editData.location || ''}
                          onChange={(e) => setEditData(prev => ({ ...prev, location: e.target.value }))}
                        />
                      ) : (
                        <p className="text-sm mt-1">{selectedProfile.location || '-'}</p>
                      )}
                    </div>
                  </div>

                  {/* Personality Traits */}
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Brain className="h-4 w-4" /> Personality Traits
                    </h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label className="text-xs">Social Style</Label>
                        {editMode ? (
                          <Select
                            value={editData.personality_traits?.introvert_extrovert || ''}
                            onValueChange={(v) => setEditData(prev => ({
                              ...prev,
                              personality_traits: { ...prev.personality_traits, introvert_extrovert: v }
                            }))}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select..." />
                            </SelectTrigger>
                            <SelectContent>
                              {PERSONALITY_TYPES.introvert_extrovert.map(t => (
                                <SelectItem key={t} value={t}>{t}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <p className="text-sm mt-1 capitalize">
                            {selectedProfile.personality_traits?.introvert_extrovert || '-'}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label className="text-xs">Collaboration Style</Label>
                        {editMode ? (
                          <Select
                            value={editData.personality_traits?.collaboration_style || ''}
                            onValueChange={(v) => setEditData(prev => ({
                              ...prev,
                              personality_traits: { ...prev.personality_traits, collaboration_style: v }
                            }))}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select..." />
                            </SelectTrigger>
                            <SelectContent>
                              {PERSONALITY_TYPES.collaboration_style.map(t => (
                                <SelectItem key={t} value={t}>{t}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <p className="text-sm mt-1 capitalize">
                            {selectedProfile.personality_traits?.collaboration_style || '-'}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label className="text-xs">Communication</Label>
                        {editMode ? (
                          <Select
                            value={editData.personality_traits?.communication_preference || ''}
                            onValueChange={(v) => setEditData(prev => ({
                              ...prev,
                              personality_traits: { ...prev.personality_traits, communication_preference: v }
                            }))}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select..." />
                            </SelectTrigger>
                            <SelectContent>
                              {PERSONALITY_TYPES.communication_preference.map(t => (
                                <SelectItem key={t} value={t}>{t}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <p className="text-sm mt-1 capitalize">
                            {selectedProfile.personality_traits?.communication_preference || '-'}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Skills Tab */}
                <TabsContent value="skills" className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium flex items-center gap-2">
                        <Target className="h-4 w-4" /> Skill Levels
                      </h4>
                      {editMode && (
                        <Button size="sm" variant="outline" onClick={addSkillLevel}>
                          Add Skill
                        </Button>
                      )}
                    </div>
                    <div className="space-y-2">
                      {(editMode ? editData.skill_levels : selectedProfile.skill_levels)?.map((skill, i) => (
                        <div key={i} className="flex items-center gap-2 p-2 bg-white rounded">
                          {editMode ? (
                            <>
                              <Input
                                value={skill.skill}
                                onChange={(e) => updateSkillLevel(i, 'skill', e.target.value)}
                                placeholder="Skill name"
                                className="flex-1"
                              />
                              <Select
                                value={skill.level}
                                onValueChange={(v) => updateSkillLevel(i, 'level', v)}
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {SKILL_LEVELS.map(l => (
                                    <SelectItem key={l} value={l}>{l}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Button variant="ghost" size="sm" onClick={() => removeSkillLevel(i)}>×</Button>
                            </>
                          ) : (
                            <>
                              <span className="flex-1 font-medium">{skill.skill}</span>
                              <Badge className={
                                skill.level === 'expert' ? 'bg-purple-100 text-purple-700' :
                                skill.level === 'advanced' ? 'bg-blue-100 text-blue-700' :
                                skill.level === 'intermediate' ? 'bg-green-100 text-green-700' :
                                'bg-slate-100 text-slate-700'
                              }>
                                {skill.level}
                              </Badge>
                            </>
                          )}
                        </div>
                      )) || <p className="text-sm text-slate-500">No skills added</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Star className="h-4 w-4" /> Expertise Areas
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {(selectedProfile.expertise_areas || []).map((e, i) => (
                          <Badge key={i} variant="outline">{e}</Badge>
                        )) || <p className="text-sm text-slate-500">None specified</p>}
                      </div>
                    </div>
                    <div className="p-4 bg-orange-50 rounded-lg">
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <GraduationCap className="h-4 w-4" /> Learning Goals
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {(selectedProfile.learning_goals || []).map((g, i) => (
                          <Badge key={i} variant="outline">{g}</Badge>
                        )) || <p className="text-sm text-slate-500">None specified</p>}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Learning Tab */}
                <TabsContent value="learning" className="space-y-4">
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-medium mb-3">Preferred Learning Styles</h4>
                    {editMode ? (
                      <div className="grid grid-cols-3 gap-2">
                        {LEARNING_STYLES.map(style => (
                          <label key={style} className="flex items-center gap-2 p-2 bg-white rounded cursor-pointer">
                            <input
                              type="checkbox"
                              checked={(editData.preferred_learning_styles || []).includes(style)}
                              onChange={(e) => {
                                const styles = editData.preferred_learning_styles || [];
                                setEditData(prev => ({
                                  ...prev,
                                  preferred_learning_styles: e.target.checked
                                    ? [...styles, style]
                                    : styles.filter(s => s !== style)
                                }));
                              }}
                            />
                            <span className="capitalize text-sm">{style}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {(selectedProfile.preferred_learning_styles || []).map((s, i) => (
                          <Badge key={i} className="bg-purple-100 text-purple-700 capitalize">{s}</Badge>
                        )) || <p className="text-sm text-slate-500">Not specified</p>}
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* History Tab */}
                <TabsContent value="history" className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" /> Engagement Stats
                    </h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-white rounded">
                        <p className="text-2xl font-bold text-int-orange">
                          {selectedProfile.engagement_stats?.total_events_attended || 0}
                        </p>
                        <p className="text-xs text-slate-500">Events Attended</p>
                      </div>
                      <div className="text-center p-3 bg-white rounded">
                        <p className="text-2xl font-bold text-green-600">
                          {selectedProfile.engagement_stats?.average_engagement_score?.toFixed(1) || '-'}
                        </p>
                        <p className="text-xs text-slate-500">Avg Engagement</p>
                      </div>
                      <div className="text-center p-3 bg-white rounded">
                        <p className="text-2xl font-bold text-blue-600">
                          {selectedProfile.engagement_stats?.total_activities_completed || 0}
                        </p>
                        <p className="text-xs text-slate-500">Activities Done</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium mb-3">Recent Event History</h4>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto">
                      {(selectedProfile.previous_event_attendance || []).slice(0, 10).map((event, i) => (
                        <div key={i} className="flex items-center justify-between p-2 bg-white rounded">
                          <div>
                            <p className="text-sm font-medium">{event.event_title}</p>
                            <p className="text-xs text-slate-500">
                              {new Date(event.attended_date).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge variant="outline">{event.event_type}</Badge>
                        </div>
                      )) || <p className="text-sm text-slate-500">No history available</p>}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            )}

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setSelectedProfile(null)}>
                Close
              </Button>
              {editMode && (
                <Button onClick={handleSave} disabled={updateProfileMutation.isLoading}>
                  Save Changes
                </Button>
              )}
              {!editMode && (
                <Button onClick={() => { setEditData({ ...selectedProfile }); setEditMode(true); }}>
                  <Edit className="h-4 w-4 mr-1" /> Edit
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}