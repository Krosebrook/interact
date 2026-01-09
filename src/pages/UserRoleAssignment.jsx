import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useUserData } from '../components/hooks/useUserData';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { UserPlus, Search, X, Shield } from 'lucide-react';
import { toast } from 'sonner';

export default function UserRoleAssignment() {
  const { user, loading: userLoading } = useUserData(true, true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: allUsers, isLoading: usersLoading } = useQuery({
    queryKey: ['all-users'],
    queryFn: () => base44.entities.User.list('full_name', 200)
  });

  const { data: roleAssignments, isLoading: assignmentsLoading } = useQuery({
    queryKey: ['all-role-assignments'],
    queryFn: () => base44.entities.UserRoleAssignment.list('-assigned_date', 500)
  });

  const { data: customRoles } = useQuery({
    queryKey: ['custom-roles'],
    queryFn: () => base44.entities.CustomRole.filter({ is_active: true })
  });

  const assignRoleMutation = useMutation({
    mutationFn: (data) => base44.entities.UserRoleAssignment.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['all-role-assignments']);
      toast.success('Role assigned successfully');
      setIsDialogOpen(false);
    },
    onError: (error) => toast.error('Failed to assign role: ' + error.message)
  });

  const removeRoleMutation = useMutation({
    mutationFn: (id) => base44.entities.UserRoleAssignment.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['all-role-assignments']);
      toast.success('Role removed successfully');
    },
    onError: (error) => toast.error('Failed to remove role: ' + error.message)
  });

  if (userLoading || usersLoading || assignmentsLoading) {
    return <LoadingSpinner message="Loading user roles..." />;
  }

  const filteredUsers = allUsers?.filter(u =>
    u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getUserAssignments = (email) => {
    return roleAssignments?.filter(a => a.user_email === email) || [];
  };

  return (
    <div className="space-y-6">
      <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-blue-50">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-indigo-600" />
                User Role Assignment
              </CardTitle>
              <CardDescription>
                Assign custom roles to users for granular access control
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredUsers?.map(userItem => {
              const assignments = getUserAssignments(userItem.email);
              return (
                <div key={userItem.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-slate-900">{userItem.full_name}</div>
                    <div className="text-sm text-slate-600">{userItem.email}</div>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline">{userItem.role}</Badge>
                      {assignments.map(assignment => (
                        <Badge key={assignment.id} className="gap-1">
                          {assignment.role_key}
                          <button
                            onClick={() => {
                              if (confirm('Remove this role assignment?')) {
                                removeRoleMutation.mutate(assignment.id);
                              }
                            }}
                            className="ml-1 hover:text-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Assign Role
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Assign Role to {userItem.full_name}</DialogTitle>
                      </DialogHeader>
                      <AssignRoleForm
                        userEmail={userItem.email}
                        customRoles={customRoles || []}
                        existingAssignments={assignments}
                        onSubmit={(data) => assignRoleMutation.mutate(data)}
                        isSubmitting={assignRoleMutation.isPending}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AssignRoleForm({ userEmail, customRoles, existingAssignments, onSubmit, isSubmitting }) {
  const { user } = useUserData();
  const [selectedRoleId, setSelectedRoleId] = useState('');

  const availableRoles = customRoles.filter(
    role => !existingAssignments.some(a => a.custom_role_id === role.id)
  );

  const selectedRole = customRoles.find(r => r.id === selectedRoleId);

  const handleSubmit = () => {
    if (!selectedRoleId || !selectedRole) return;

    onSubmit({
      user_email: userEmail,
      custom_role_id: selectedRoleId,
      role_key: selectedRole.role_key,
      assigned_by: user.email,
      assigned_date: new Date().toISOString()
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Select Role</Label>
        <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
          <SelectTrigger>
            <SelectValue placeholder="Choose a role..." />
          </SelectTrigger>
          <SelectContent>
            {availableRoles.map(role => (
              <SelectItem key={role.id} value={role.id}>
                {role.role_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedRole && (
        <Card className="bg-slate-50">
          <CardContent className="pt-4">
            <div className="text-sm text-slate-600">{selectedRole.description}</div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end gap-2 pt-4">
        <Button
          onClick={handleSubmit}
          disabled={!selectedRoleId || isSubmitting}
          className="bg-gradient-to-r from-indigo-600 to-blue-600"
        >
          Assign Role
        </Button>
      </div>
    </div>
  );
}