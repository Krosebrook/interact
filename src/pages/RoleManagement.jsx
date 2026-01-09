import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useUserData } from '../components/hooks/useUserData';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Users, Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { toast } from 'sonner';

export default function RoleManagement() {
  const { user, loading: userLoading } = useUserData(true, true);
  const [editingRole, setEditingRole] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: customRoles, isLoading } = useQuery({
    queryKey: ['custom-roles'],
    queryFn: () => base44.entities.CustomRole.list('-created_date', 100)
  });

  const createRoleMutation = useMutation({
    mutationFn: (roleData) => base44.entities.CustomRole.create(roleData),
    onSuccess: () => {
      queryClient.invalidateQueries(['custom-roles']);
      toast.success('Role created successfully');
      setIsDialogOpen(false);
      setEditingRole(null);
    },
    onError: (error) => toast.error('Failed to create role: ' + error.message)
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.CustomRole.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['custom-roles']);
      toast.success('Role updated successfully');
      setIsDialogOpen(false);
      setEditingRole(null);
    },
    onError: (error) => toast.error('Failed to update role: ' + error.message)
  });

  const deleteRoleMutation = useMutation({
    mutationFn: (id) => base44.entities.CustomRole.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['custom-roles']);
      toast.success('Role deleted successfully');
    },
    onError: (error) => toast.error('Failed to delete role: ' + error.message)
  });

  if (userLoading || isLoading) {
    return <LoadingSpinner message="Loading role management..." />;
  }

  return (
    <div className="space-y-6">
      <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-purple-600" />
                Custom Role Management
              </CardTitle>
              <CardDescription>
                Create and manage custom roles with granular permissions
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => setEditingRole(null)}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Role
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingRole ? 'Edit Role' : 'Create New Role'}
                  </DialogTitle>
                </DialogHeader>
                <RoleForm
                  role={editingRole}
                  onSubmit={(data) => {
                    if (editingRole) {
                      updateRoleMutation.mutate({ id: editingRole.id, data });
                    } else {
                      createRoleMutation.mutate(data);
                    }
                  }}
                  onCancel={() => {
                    setIsDialogOpen(false);
                    setEditingRole(null);
                  }}
                  isSubmitting={createRoleMutation.isPending || updateRoleMutation.isPending}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-4">
        {customRoles?.map(role => (
          <RoleCard
            key={role.id}
            role={role}
            onEdit={() => {
              setEditingRole(role);
              setIsDialogOpen(true);
            }}
            onDelete={() => {
              if (role.is_system_role) {
                toast.error('Cannot delete system roles');
                return;
              }
              if (confirm(`Delete role "${role.role_name}"? This cannot be undone.`)) {
                deleteRoleMutation.mutate(role.id);
              }
            }}
          />
        ))}
      </div>

      {(!customRoles || customRoles.length === 0) && (
        <Card>
          <CardContent className="py-12 text-center">
            <Shield className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No custom roles created yet. Create your first role to get started.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function RoleCard({ role, onEdit, onDelete }) {
  const permissionCount = Object.values(role.permissions || {}).reduce((sum, module) => {
    return sum + Object.values(module).filter(Boolean).length;
  }, 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className="text-lg">{role.role_name}</CardTitle>
              {role.is_system_role && <Badge variant="secondary">System</Badge>}
              {!role.is_active && <Badge variant="destructive">Inactive</Badge>}
            </div>
            <CardDescription>{role.description}</CardDescription>
            <div className="flex gap-2 mt-2">
              <Badge variant="outline">{role.role_key}</Badge>
              <Badge variant="outline">
                <Users className="h-3 w-3 mr-1" />
                {role.user_count || 0} users
              </Badge>
              <Badge variant="outline">{permissionCount} permissions</Badge>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4" />
            </Button>
            {!role.is_system_role && (
              <Button variant="ghost" size="sm" onClick={onDelete}>
                <Trash2 className="h-4 w-4 text-red-600" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}

function RoleForm({ role, onSubmit, onCancel, isSubmitting }) {
  const [formData, setFormData] = useState(role || {
    role_name: '',
    role_key: '',
    description: '',
    is_active: true,
    permissions: {
      activities: { view: true, create: false, edit: false, delete: false },
      events: { view: true, create: false, edit: false, delete: false, facilitate: false },
      channels: { view: true, create: false, edit: false, delete: false, moderate: false },
      recognition: { view: true, give: true, moderate: false },
      surveys: { view: true, create: false, view_results: false },
      teams: { view: true, create: false, manage_members: false, view_analytics: false },
      gamification: { view: true, manage_points: false, manage_badges: false, manage_rules: false },
      analytics: { view_personal: true, view_team: false, view_company: false, export_reports: false },
      users: { view: false, invite: false, edit: false, assign_roles: false, view_sensitive_data: false },
      settings: { view: false, edit_general: false, edit_integrations: false, edit_security: false }
    }
  });

  const updatePermission = (module, action, value) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [module]: {
          ...prev.permissions[module],
          [action]: value
        }
      }
    }));
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Role Name *</Label>
          <Input
            value={formData.role_name}
            onChange={(e) => setFormData({ ...formData, role_name: e.target.value })}
            placeholder="e.g., Event Manager"
          />
        </div>
        <div className="space-y-2">
          <Label>Role Key *</Label>
          <Input
            value={formData.role_key}
            onChange={(e) => setFormData({ ...formData, role_key: e.target.value.toLowerCase().replace(/\s/g, '_') })}
            placeholder="e.g., event_manager"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe the role's purpose and responsibilities..."
          rows={2}
        />
      </div>

      <div className="flex items-center gap-2">
        <Switch
          checked={formData.is_active}
          onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
        />
        <Label>Active</Label>
      </div>

      <Tabs defaultValue="activities" className="w-full">
        <TabsList className="grid grid-cols-5 h-auto">
          <TabsTrigger value="activities">Activities</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="gamification">Gamification</TabsTrigger>
          <TabsTrigger value="admin">Admin</TabsTrigger>
        </TabsList>

        <TabsContent value="activities" className="space-y-4 mt-4">
          <PermissionModule
            title="Activities"
            permissions={formData.permissions.activities}
            onChange={(action, value) => updatePermission('activities', action, value)}
          />
          <PermissionModule
            title="Events"
            permissions={formData.permissions.events}
            onChange={(action, value) => updatePermission('events', action, value)}
          />
        </TabsContent>

        <TabsContent value="events" className="space-y-4 mt-4">
          <PermissionModule
            title="Channels"
            permissions={formData.permissions.channels}
            onChange={(action, value) => updatePermission('channels', action, value)}
          />
          <PermissionModule
            title="Recognition"
            permissions={formData.permissions.recognition}
            onChange={(action, value) => updatePermission('recognition', action, value)}
          />
        </TabsContent>

        <TabsContent value="content" className="space-y-4 mt-4">
          <PermissionModule
            title="Surveys"
            permissions={formData.permissions.surveys}
            onChange={(action, value) => updatePermission('surveys', action, value)}
          />
          <PermissionModule
            title="Teams"
            permissions={formData.permissions.teams}
            onChange={(action, value) => updatePermission('teams', action, value)}
          />
        </TabsContent>

        <TabsContent value="gamification" className="space-y-4 mt-4">
          <PermissionModule
            title="Gamification"
            permissions={formData.permissions.gamification}
            onChange={(action, value) => updatePermission('gamification', action, value)}
          />
          <PermissionModule
            title="Analytics"
            permissions={formData.permissions.analytics}
            onChange={(action, value) => updatePermission('analytics', action, value)}
          />
        </TabsContent>

        <TabsContent value="admin" className="space-y-4 mt-4">
          <PermissionModule
            title="Users"
            permissions={formData.permissions.users}
            onChange={(action, value) => updatePermission('users', action, value)}
          />
          <PermissionModule
            title="Settings"
            permissions={formData.permissions.settings}
            onChange={(action, value) => updatePermission('settings', action, value)}
          />
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <Button
          onClick={() => onSubmit(formData)}
          disabled={!formData.role_name || !formData.role_key || isSubmitting}
          className="bg-gradient-to-r from-purple-600 to-indigo-600"
        >
          <Save className="h-4 w-4 mr-2" />
          {role ? 'Update' : 'Create'} Role
        </Button>
      </div>
    </div>
  );
}

function PermissionModule({ title, permissions, onChange }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {Object.keys(permissions).map(action => (
          <div key={action} className="flex items-center justify-between">
            <Label className="text-sm capitalize">{action.replace(/_/g, ' ')}</Label>
            <Switch
              checked={permissions[action]}
              onCheckedChange={(checked) => onChange(action, checked)}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}