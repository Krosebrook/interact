import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Users, 
  Plus, 
  Edit2, 
  Trash2, 
  Save,
  UserPlus,
  Trophy,
  TrendingUp,
  Crown,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';

export default function TeamStructureManager() {
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    team_lead_email: '',
    department: '',
    color: '#D97230'
  });

  const { data: teams = [], isLoading } = useQuery({
    queryKey: ['teams'],
    queryFn: () => base44.entities.Team.list('-total_points')
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list()
  });

  const { data: memberships = [] } = useQuery({
    queryKey: ['team-memberships'],
    queryFn: () => base44.entities.TeamMembership.list()
  });

  const createTeamMutation = useMutation({
    mutationFn: (data) => base44.entities.Team.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      setShowDialog(false);
      resetForm();
      toast.success('Team created successfully');
    }
  });

  const updateTeamMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Team.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      setShowDialog(false);
      resetForm();
      toast.success('Team updated successfully');
    }
  });

  const deleteTeamMutation = useMutation({
    mutationFn: (id) => base44.entities.Team.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      setDeleteConfirm(null);
      toast.success('Team deleted successfully');
    }
  });

  const resetForm = () => {
    setEditingTeam(null);
    setFormData({
      name: '',
      description: '',
      team_lead_email: '',
      department: '',
      color: '#D97230'
    });
  };

  const handleEdit = (team) => {
    setEditingTeam(team);
    setFormData({
      name: team.name,
      description: team.description || '',
      team_lead_email: team.team_lead_email || '',
      department: team.department || '',
      color: team.color || '#D97230'
    });
    setShowDialog(true);
  };

  const handleSave = () => {
    if (editingTeam) {
      updateTeamMutation.mutate({ id: editingTeam.id, data: formData });
    } else {
      createTeamMutation.mutate(formData);
    }
  };

  // Get member count for each team
  const getTeamMemberCount = (teamId) => {
    return memberships.filter(m => m.team_id === teamId).length;
  };

  // Calculate stats
  const totalTeams = teams.length;
  const totalMembers = memberships.length;
  const avgTeamSize = totalTeams > 0 ? Math.round(totalMembers / totalTeams) : 0;

  // Predefined colors
  const colorOptions = [
    '#D97230', '#14294D', '#8B5CF6', '#10B981', '#F59E0B', '#EC4899', '#06B6D4', '#EF4444'
  ];

  return (
    <Card className="border-2 border-int-navy/20">
      <CardHeader className="bg-gradient-to-r from-int-navy/10 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-navy shadow-sm">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle>Team Structure</CardTitle>
              <p className="text-sm text-slate-500 mt-1">
                Manage teams and organizational hierarchy
              </p>
            </div>
          </div>
          <Button
            onClick={() => { resetForm(); setShowDialog(true); }}
            className="bg-gradient-navy hover:opacity-90 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Team
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="p-3 bg-white/80 rounded-lg text-center">
            <div className="text-2xl font-bold text-int-navy">{totalTeams}</div>
            <div className="text-xs text-slate-500">Teams</div>
          </div>
          <div className="p-3 bg-white/80 rounded-lg text-center">
            <div className="text-2xl font-bold text-int-orange">{totalMembers}</div>
            <div className="text-xs text-slate-500">Total Members</div>
          </div>
          <div className="p-3 bg-white/80 rounded-lg text-center">
            <div className="text-2xl font-bold text-purple-600">{avgTeamSize}</div>
            <div className="text-xs text-slate-500">Avg Size</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {/* Teams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {teams.map((team, index) => {
              const memberCount = getTeamMemberCount(team.id);
              const teamLead = users.find(u => u.email === team.team_lead_email);

              return (
                <motion.div
                  key={team.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="relative overflow-hidden border-2 border-slate-200 hover:border-int-navy/50 transition-all">
                    {/* Team color bar */}
                    <div 
                      className="h-2" 
                      style={{ backgroundColor: team.color || '#D97230' }}
                    />

                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                            {team.name}
                            {index === 0 && (
                              <Crown className="h-4 w-4 text-amber-500" />
                            )}
                          </h4>
                          {team.department && (
                            <Badge variant="outline" className="mt-1">
                              {team.department}
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleEdit(team)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => setDeleteConfirm(team)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>

                      {team.description && (
                        <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                          {team.description}
                        </p>
                      )}

                      {/* Team Lead */}
                      {teamLead && (
                        <div className="flex items-center gap-2 mb-3 p-2 bg-slate-50 rounded-lg">
                          <Crown className="h-4 w-4 text-amber-500" />
                          <span className="text-sm text-slate-700">{teamLead.full_name}</span>
                        </div>
                      )}

                      {/* Stats */}
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1 text-slate-600">
                          <Users className="h-4 w-4" />
                          {memberCount} members
                        </div>
                        <div className="flex items-center gap-1 text-int-orange font-semibold">
                          <Trophy className="h-4 w-4" />
                          {team.total_points?.toLocaleString() || 0} pts
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {teams.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No teams configured yet. Create your first team!</p>
          </div>
        )}
      </CardContent>

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingTeam ? 'Edit Team' : 'Create New Team'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label>Team Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(d => ({ ...d, name: e.target.value }))}
                placeholder="e.g., Engineering"
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(d => ({ ...d, description: e.target.value }))}
                placeholder="Team description..."
                rows={2}
              />
            </div>

            <div>
              <Label>Department</Label>
              <Input
                value={formData.department}
                onChange={(e) => setFormData(d => ({ ...d, department: e.target.value }))}
                placeholder="e.g., Product Development"
              />
            </div>

            <div>
              <Label>Team Lead Email</Label>
              <Input
                type="email"
                value={formData.team_lead_email}
                onChange={(e) => setFormData(d => ({ ...d, team_lead_email: e.target.value }))}
                placeholder="leader@company.com"
              />
            </div>

            <div>
              <Label>Team Color</Label>
              <div className="flex gap-2 mt-2">
                {colorOptions.map(color => (
                  <button
                    key={color}
                    type="button"
                    className={`w-8 h-8 rounded-full transition-all ${
                      formData.color === color 
                        ? 'ring-2 ring-offset-2 ring-int-navy scale-110' 
                        : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setFormData(d => ({ ...d, color }))}
                  />
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={createTeamMutation.isPending || updateTeamMutation.isPending}
              className="bg-gradient-navy hover:opacity-90 text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              {editingTeam ? 'Update Team' : 'Create Team'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Team</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteConfirm?.name}"? This will remove all team memberships. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTeamMutation.mutate(deleteConfirm.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}