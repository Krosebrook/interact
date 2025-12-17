/**
 * EMPLOYEE DIRECTORY - Admin View
 * View and search all employee profiles with RBAC
 */

import React, { useState } from 'react';
import { useUserData } from '../components/hooks/useUserData.jsx';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
  User,
  Search,
  Building,
  MapPin,
  Mail,
  Briefcase,
  Award,
  TrendingUp,
  Filter,
  Users,
  UserPlus,
  Shield,
  Ban,
  CheckCircle,
  Settings
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import { toast } from 'sonner';
import { isOwner, getEffectiveRole, hasPermission } from '../components/lib/rbac/roles';

export default function EmployeeDirectory() {
  const { user, loading: userLoading, isAdmin } = useUserData(true, true);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const queryClient = useQueryClient();

  // Fetch all users (admin only)
  const { data: allUsers = [], isLoading: usersLoading } = useQuery({
    queryKey: ['all-users'],
    queryFn: () => base44.entities.User.list(),
    enabled: isAdmin
  });

  // Fetch all profiles
  const { data: allProfiles = [], isLoading: profilesLoading } = useQuery({
    queryKey: ['all-profiles'],
    queryFn: () => base44.entities.UserProfile.list(),
    enabled: isAdmin
  });

  // Fetch user points
  const { data: allUserPoints = [], isLoading: pointsLoading } = useQuery({
    queryKey: ['all-user-points'],
    queryFn: () => base44.entities.UserPoints.list(),
    enabled: isAdmin
  });

  if (userLoading || usersLoading || profilesLoading || pointsLoading) {
    return <LoadingSpinner className="min-h-[60vh]" message="Loading employee directory..." />;
  }

  // Merge user data with profiles and points
  const employees = allUsers.map(user => {
    const profile = allProfiles.find(p => p.user_email === user.email);
    const points = allUserPoints.find(p => p.user_email === user.email);
    return { ...user, profile, points };
  });

  // Get unique departments for filter
  const departments = [...new Set(allProfiles.map(p => p.department).filter(Boolean))];

  // Filter employees
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = !searchQuery || 
      emp.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.profile?.job_title?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDepartment = departmentFilter === 'all' || emp.profile?.department === departmentFilter;
    const matchesRole = roleFilter === 'all' || emp.user_type === roleFilter;
    
    return matchesSearch && matchesDepartment && matchesRole;
  });

  const userIsOwner = isOwner(user);
  const canInvite = hasPermission(user, 'INVITE_USERS');
  const canManageRoles = hasPermission(user, 'MANAGE_ROLES');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-int-navy mb-2">Employee Directory</h1>
          <p className="text-slate-600">{employees.length} employees • View profiles and team insights</p>
        </div>
        {canInvite && (
          <Button 
            onClick={() => setShowInviteDialog(true)}
            className="bg-int-orange hover:bg-int-orange/90"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Invite Users
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by name, email, or job title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Department Filter */}
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-full lg:w-48">
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-slate-500" />
                <SelectValue placeholder="Department" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map(dept => (
                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Role Filter */}
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full lg:w-48">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-slate-500" />
                <SelectValue placeholder="Role" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="facilitator">Facilitator</SelectItem>
              <SelectItem value="participant">Participant</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Results */}
      {filteredEmployees.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No employees found"
          description="Try adjusting your search or filters"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEmployees.map(employee => (
            <EmployeeCard 
              key={employee.id} 
              employee={employee}
              currentUser={user}
              canManage={canManageRoles}
              onManage={(emp) => setSelectedUser(emp)}
            />
          ))}
        </div>
      )}

      {/* Invite Dialog */}
      <InviteUsersDialog 
        open={showInviteDialog} 
        onOpenChange={setShowInviteDialog}
        currentUser={user}
      />

      {/* Manage User Dialog */}
      {selectedUser && (
        <ManageUserDialog
          open={!!selectedUser}
          onOpenChange={(open) => !open && setSelectedUser(null)}
          user={selectedUser}
          currentUser={user}
          onSuccess={() => {
            queryClient.invalidateQueries(['all-users']);
            queryClient.invalidateQueries(['all-profiles']);
            setSelectedUser(null);
          }}
        />
      )}
    </div>
  );
}

function EmployeeCard({ employee, currentUser, canManage, onManage }) {
  const { profile, points } = employee;
  const isSuspended = profile?.status === 'suspended';
  
  return (
    <Card className={`p-4 hover:shadow-lg transition-shadow ${isSuspended ? 'opacity-60 border-red-200' : ''}`}>
      <div className="flex items-start gap-3 mb-3">
        {/* Avatar */}
        <div className="relative">
          {profile?.avatar_url ? (
            <img 
              src={profile.avatar_url} 
              alt={employee.full_name}
              className="w-14 h-14 rounded-full object-cover border-2 border-slate-200"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
              <User className="h-7 w-7 text-white" />
            </div>
          )}
          {points?.level && (
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center text-xs font-bold text-white border-2 border-white">
              {points.level}
            </div>
          )}
        </div>

        {/* Name & Role */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 truncate">
            {profile?.display_name || employee.full_name}
          </h3>
          <p className="text-sm text-slate-600 truncate">
            {profile?.job_title || 'Team Member'}
          </p>
          <Badge className="mt-1 text-xs" variant="secondary">
            {employee.role === 'admin' ? 'Admin' : employee.user_type || 'User'}
          </Badge>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-1 mb-3 text-sm text-slate-600">
        {profile?.department && (
          <div className="flex items-center gap-2">
            <Building className="h-3.5 w-3.5 text-slate-400" />
            <span className="truncate">{profile.department}</span>
          </div>
        )}
        {profile?.location && (
          <div className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 text-slate-400" />
            <span className="truncate">{profile.location}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Mail className="h-3.5 w-3.5 text-slate-400" />
          <span className="truncate">{employee.email}</span>
        </div>
      </div>

      {/* Stats */}
      {points && (
        <div className="grid grid-cols-2 gap-2 mb-3 pt-3 border-t border-slate-200">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-purple-600" />
            <div>
              <p className="text-xs text-slate-600">Points</p>
              <p className="text-sm font-semibold text-slate-900">{points.total_points || 0}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-amber-600" />
            <div>
              <p className="text-xs text-slate-600">Badges</p>
              <p className="text-sm font-semibold text-slate-900">{points.badges_earned?.length || 0}</p>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <Link to={createPageUrl('PublicProfile') + `?email=${employee.email}`} className="flex-1">
          <Button variant="outline" className="w-full" size="sm">
            View Profile
          </Button>
        </Link>
        {canManage && currentUser.email !== employee.email && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onManage(employee)}
          >
            <Settings className="h-4 w-4" />
          </Button>
        )}
      </div>

      {isSuspended && (
        <div className="mt-2 flex items-center gap-1 text-xs text-red-600">
          <Ban className="h-3 w-3" />
          <span>Suspended</span>
        </div>
      )}
    </Card>
  );
}

// Invite Users Dialog Component
function InviteUsersDialog({ open, onOpenChange, currentUser }) {
  const [emails, setEmails] = useState('');
  const [role, setRole] = useState('participant');
  const [message, setMessage] = useState('');
  const queryClient = useQueryClient();

  const inviteMutation = useMutation({
    mutationFn: (data) => base44.functions.invoke('inviteUser', data),
    onSuccess: (response) => {
      toast.success(response.data.summary || 'Invitations sent!');
      queryClient.invalidateQueries(['all-users']);
      setEmails('');
      setMessage('');
      onOpenChange(false);
    },
    onError: (error) => toast.error(error.message || 'Failed to send invitations')
  });

  const handleSubmit = () => {
    const emailList = emails.split(/[\n,]/).map(e => e.trim()).filter(Boolean);
    if (emailList.length === 0) {
      toast.error('Please enter at least one email');
      return;
    }
    inviteMutation.mutate({ emails: emailList, role, message });
  };

  const userIsOwner = isOwner(currentUser);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Invite Users</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Email Addresses</label>
            <textarea
              value={emails}
              onChange={(e) => setEmails(e.target.value)}
              placeholder="Enter emails (one per line or comma-separated)&#10;john@intinc.com&#10;jane@intinc.com"
              className="w-full mt-1 p-2 border border-slate-300 rounded-md h-32 text-sm"
            />
            <p className="text-xs text-slate-500 mt-1">Only @intinc.com emails allowed</p>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Assign Role</label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="participant">Employee</SelectItem>
                <SelectItem value="facilitator">Facilitator</SelectItem>
                {userIsOwner && <SelectItem value="admin">Admin</SelectItem>}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Welcome Message (Optional)</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a personal welcome message..."
              className="w-full mt-1 p-2 border border-slate-300 rounded-md h-20 text-sm"
            />
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              className="flex-1 bg-int-orange hover:bg-int-orange/90"
              onClick={handleSubmit}
              disabled={inviteMutation.isPending}
            >
              {inviteMutation.isPending ? 'Sending...' : 'Send Invitations'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Manage User Dialog Component
function ManageUserDialog({ open, onOpenChange, user: targetUser, currentUser, onSuccess }) {
  const [action, setAction] = useState('');
  const queryClient = useQueryClient();

  const manageMutation = useMutation({
    mutationFn: (data) => base44.functions.invoke('manageUserRole', data),
    onSuccess: (response) => {
      toast.success(response.data.message || 'User updated');
      queryClient.invalidateQueries(['all-users']);
      queryClient.invalidateQueries(['all-profiles']);
      onSuccess();
    },
    onError: (error) => toast.error(error.message || 'Failed to update user')
  });

  const handleAction = (actionType, data = {}) => {
    manageMutation.mutate({
      action: actionType,
      targetEmail: targetUser.email,
      ...data
    });
  };

  const userIsOwner = isOwner(currentUser);
  const isSuspended = targetUser.profile?.status === 'suspended';
  const effectiveRole = getEffectiveRole(targetUser);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Manage User</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-3 bg-slate-50 rounded-lg">
            <p className="font-medium text-slate-900">{targetUser.full_name}</p>
            <p className="text-sm text-slate-600">{targetUser.email}</p>
            <Badge className="mt-2">{effectiveRole}</Badge>
          </div>

          {userIsOwner && (
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">Change Role</label>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleAction('change_role', { newRole: 'admin', newUserType: null })}
                  disabled={manageMutation.isPending || targetUser.role === 'admin'}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Make Admin
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleAction('change_role', { newRole: 'user', newUserType: 'facilitator' })}
                  disabled={manageMutation.isPending || targetUser.user_type === 'facilitator'}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Make Facilitator
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleAction('change_role', { newRole: 'user', newUserType: 'participant' })}
                  disabled={manageMutation.isPending || targetUser.user_type === 'participant'}
                >
                  <User className="h-4 w-4 mr-2" />
                  Make Employee
                </Button>
              </div>
            </div>
          )}

          <div className="pt-3 border-t border-slate-200">
            <label className="text-sm font-medium text-slate-700 mb-2 block">Account Status</label>
            {isSuspended ? (
              <Button
                variant="outline"
                className="w-full justify-start text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                onClick={() => handleAction('activate')}
                disabled={manageMutation.isPending}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Activate User
              </Button>
            ) : (
              <Button
                variant="outline"
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => handleAction('suspend')}
                disabled={manageMutation.isPending}
              >
                <Ban className="h-4 w-4 mr-2" />
                Suspend User
              </Button>
            )}
          </div>

          <Button variant="outline" className="w-full" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}