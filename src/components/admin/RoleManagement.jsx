import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
  Shield, 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  UserPlus,
  Settings,
  Check
} from 'lucide-react';
import { toast } from 'sonner';

const PERMISSION_CATEGORIES = [
  { 
    key: 'events', 
    label: 'Events', 
    permissions: ['create', 'view_all', 'view_own', 'edit_all', 'edit_own', 'delete', 'cancel'] 
  },
  { 
    key: 'activities', 
    label: 'Activities', 
    permissions: ['create', 'view', 'edit', 'delete'] 
  },
  { 
    key: 'analytics', 
    label: 'Analytics', 
    permissions: ['view_basic', 'view_detailed', 'view_facilitator_metrics', 'export'] 
  },
  { 
    key: 'teams', 
    label: 'Teams', 
    permissions: ['create', 'manage_all', 'manage_own', 'invite_members'] 
  },
  { 
    key: 'users', 
    label: 'Users', 
    permissions: ['view_all', 'manage_roles', 'invite'] 
  },
  { 
    key: 'gamification', 
    label: 'Gamification', 
    permissions: ['manage_badges', 'manage_rewards', 'award_points'] 
  }
];

export default function RoleManagement() {
  const queryClient = useQueryClient();
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [roleForm, setRoleForm] = useState({
    role_name: '',
    role_key: '',
    description: '',
    hierarchy_level: 0,
    permissions: {}
  });
  const [assignForm, setAssignForm] = useState({
    user_email: '',
    role_id: ''
  });

  const { data: roles = [], isLoading: rolesLoading } = useQuery({
    queryKey: ['user-roles'],
    queryFn: () => base44.entities.UserRole.list()
  });

  const { data: assignments = [] } = useQuery({
    queryKey: ['role-assignments-all'],
    queryFn: () => base44.entities.UserRoleAssignment.list('-created_date', 100)
  });

  const { data: users = [] } = useQuery({
    queryKey: ['all-users'],
    queryFn: () => base44.entities.User.list()
  });

  const createRoleMutation = useMutation({
    mutationFn: (data) => base44.entities.UserRole.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['user-roles']);
      setShowRoleDialog(false);
      resetRoleForm();
      toast.success('Role created successfully');
    }
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.UserRole.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['user-roles']);
      setShowRoleDialog(false);
      resetRoleForm();
      toast.success('Role updated successfully');
    }
  });

  const deleteRoleMutation = useMutation({
    mutationFn: (id) => base44.entities.UserRole.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['user-roles']);
      toast.success('Role deleted');
    }
  });

  const assignRoleMutation = useMutation({
    mutationFn: async (data) => {
      const role = roles.find(r => r.id === data.role_id);
      return base44.entities.UserRoleAssignment.create({
        ...data,
        role_key: role?.role_key,
        is_active: true
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['role-assignments-all']);
      setShowAssignDialog(false);
      setAssignForm({ user_email: '', role_id: '' });
      toast.success('Role assigned successfully');
    }
  });

  const removeAssignmentMutation = useMutation({
    mutationFn: (id) => base44.entities.UserRoleAssignment.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['role-assignments-all']);
      toast.success('Role assignment removed');
    }
  });

  const resetRoleForm = () => {
    setRoleForm({
      role_name: '',
      role_key: '',
      description: '',
      hierarchy_level: 0,
      permissions: {}
    });
    setEditingRole(null);
  };

  const handleEditRole = (role) => {
    setEditingRole(role);
    setRoleForm({
      role_name: role.role_name,
      role_key: role.role_key,
      description: role.description || '',
      hierarchy_level: role.hierarchy_level || 0,
      permissions: role.permissions || {}
    });
    setShowRoleDialog(true);
  };

  const handlePermissionChange = (category, permission, value) => {
    setRoleForm(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [category]: {
          ...prev.permissions[category],
          [permission]: value
        }
      }
    }));
  };

  const handleSaveRole = () => {
    if (editingRole) {
      updateRoleMutation.mutate({ id: editingRole.id, data: roleForm });
    } else {
      createRoleMutation.mutate(roleForm);
    }
  };

  const getRoleAssignments = (roleId) => {
    return assignments.filter(a => a.role_id === roleId);
  };

  return (
    <div className="space-y-6" data-b44-sync="true" data-feature="admin" data-component="rolemanagement">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Role Management</h2>
          <p className="text-slate-600">Define roles and assign permissions to users</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowAssignDialog(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Assign Role
          </Button>
          <Button 
            className="bg-int-orange hover:bg-[#C46322]"
            onClick={() => {
              resetRoleForm();
              setShowRoleDialog(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Role
          </Button>
        </div>
      </div>

      {/* Roles Grid */}
      {rolesLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-int-orange"></div>
        </div>
      ) : roles.length === 0 ? (
        <Card className="p-8 text-center border-0 shadow-lg">
          <Shield className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No roles defined yet. Create your first role to get started.</p>
        </Card>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roles.map(role => {
          const roleAssignments = getRoleAssignments(role.id);
          return (
            <Card key={role.id} className="border-0 shadow-lg">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-int-orange" />
                    <CardTitle className="text-lg">{role.role_name}</CardTitle>
                  </div>
                  <Badge variant="outline">Level {role.hierarchy_level || 0}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-slate-600">{role.description || 'No description'}</p>
                
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-slate-400" />
                  <span>{roleAssignments.length} users assigned</span>
                </div>

                {/* Permission summary */}
                <div className="flex flex-wrap gap-1">
                  {Object.entries(role.permissions || {}).map(([cat, perms]) => {
                    const activeCount = Object.values(perms).filter(Boolean).length;
                    if (activeCount === 0) return null;
                    return (
                      <Badge key={cat} variant="secondary" className="text-xs">
                        {cat}: {activeCount}
                      </Badge>
                    );
                  })}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => handleEditRole(role)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  {!role.is_system_role && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-red-600 hover:text-red-700"
                      onClick={() => deleteRoleMutation.mutate(role.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      )}

      {/* User Assignments Table */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>User Role Assignments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">User</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Role</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Assigned By</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Status</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {assignments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">
                      No role assignments yet. Assign roles to users to get started.
                    </td>
                  </tr>
                ) : (
                  assignments.map(assignment => {
                    const role = roles.find(r => r.id === assignment.role_id);
                    const assignedUser = users.find(u => u.email === assignment.user_email);
                    return (
                      <tr key={assignment.id} className="border-b hover:bg-slate-50">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium">{assignedUser?.full_name || assignment.user_email}</p>
                            <p className="text-xs text-slate-500">{assignment.user_email}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className="bg-int-navy">{role?.role_name || assignment.role_key}</Badge>
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-600">
                          {assignment.assigned_by || 'System'}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={assignment.is_active ? "default" : "secondary"}>
                            {assignment.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-red-600"
                            onClick={() => removeAssignmentMutation.mutate(assignment.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Role Dialog */}
      <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRole ? 'Edit Role' : 'Create New Role'}</DialogTitle>
            <DialogDescription>
              Define role permissions for your organization
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Role Name</Label>
                <Input
                  value={roleForm.role_name}
                  onChange={(e) => setRoleForm(prev => ({ ...prev, role_name: e.target.value }))}
                  placeholder="e.g., Team Lead"
                />
              </div>
              <div>
                <Label>Role Key</Label>
                <Input
                  value={roleForm.role_key}
                  onChange={(e) => setRoleForm(prev => ({ ...prev, role_key: e.target.value.toLowerCase().replace(/\s/g, '_') }))}
                  placeholder="e.g., team_lead"
                  disabled={editingRole?.is_system_role}
                />
              </div>
            </div>

            <div>
              <Label>Description</Label>
              <Input
                value={roleForm.description}
                onChange={(e) => setRoleForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of this role"
              />
            </div>

            <div>
              <Label>Hierarchy Level (higher = more authority)</Label>
              <Input
                type="number"
                value={roleForm.hierarchy_level}
                onChange={(e) => setRoleForm(prev => ({ ...prev, hierarchy_level: parseInt(e.target.value) || 0 }))}
                min={0}
                max={100}
              />
            </div>

            {/* Permissions */}
            <div className="space-y-4">
              <Label className="text-lg font-semibold">Permissions</Label>
              {PERMISSION_CATEGORIES.map(category => (
                <div key={category.key} className="border rounded-lg p-4">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    {category.label}
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {category.permissions.map(perm => (
                      <div key={perm} className="flex items-center justify-between">
                        <span className="text-sm capitalize">{perm.replace(/_/g, ' ')}</span>
                        <Switch
                          checked={roleForm.permissions[category.key]?.[perm] || false}
                          onCheckedChange={(checked) => handlePermissionChange(category.key, perm, checked)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowRoleDialog(false)}>
                Cancel
              </Button>
              <Button 
                className="bg-int-orange hover:bg-[#C46322]"
                onClick={handleSaveRole}
              >
                <Check className="h-4 w-4 mr-2" />
                {editingRole ? 'Update Role' : 'Create Role'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assign Role Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Role to User</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Select User</Label>
              <Select
                value={assignForm.user_email}
                onValueChange={(value) => setAssignForm(prev => ({ ...prev, user_email: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a user..." />
                </SelectTrigger>
                <SelectContent>
                  {users.map(user => (
                    <SelectItem key={user.email} value={user.email}>
                      {user.full_name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Select Role</Label>
              <Select
                value={assignForm.role_id}
                onValueChange={(value) => setAssignForm(prev => ({ ...prev, role_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a role..." />
                </SelectTrigger>
                <SelectContent>
                  {roles.map(role => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.role_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowAssignDialog(false)}>
                Cancel
              </Button>
              <Button 
                className="bg-int-orange hover:bg-[#C46322]"
                onClick={() => assignRoleMutation.mutate(assignForm)}
                disabled={!assignForm.user_email || !assignForm.role_id}
              >
                Assign Role
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}