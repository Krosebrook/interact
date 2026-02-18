import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUserData } from '../components/hooks/useUserData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { toast } from 'sonner';
import {
  Users,
  Search,
  UserPlus,
  Edit,
  Trash2,
  Ban,
  Shield,
  UserCheck,
  Mail,
  Calendar,
  MoreVertical,
  AlertTriangle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const ROLES = [
  { value: 'admin', label: 'Admin', color: 'bg-red-100 text-red-800' },
  { value: 'facilitator', label: 'Facilitator', color: 'bg-blue-100 text-blue-800' },
  { value: 'participant', label: 'Participant', color: 'bg-green-100 text-green-800' }
];

export default function UserManagement() {
  const queryClient = useQueryClient();
  const { user: currentUser, loading } = useUserData(true, true); // Admin only
  const [searchQuery, setSearchQuery] = useState('');
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Invite form state
  const [inviteEmails, setInviteEmails] = useState('');
  const [inviteRole, setInviteRole] = useState('participant');
  const [inviteMessage, setInviteMessage] = useState('');

  // Edit form state
  const [editRole, setEditRole] = useState('');

  // Suspend form state
  const [suspendReason, setSuspendReason] = useState('');
  const [suspendDuration, setSuspendDuration] = useState('7');

  // Fetch all users
  const { data: users = [], isLoading: loadingUsers } = useQuery({
    queryKey: ['all-users'],
    queryFn: async () => {
      const allUsers = await base44.asServiceRole.entities.User.list();
      
      // Enrich with profile data
      const enrichedUsers = await Promise.all(
        allUsers.map(async (user) => {
          const profiles = await base44.asServiceRole.entities.UserProfile.filter({
            user_email: user.email
          });
          const pointsRecords = await base44.asServiceRole.entities.UserPoints.filter({
            user_email: user.email
          });
          
          return {
            ...user,
            profile: profiles[0] || null,
            points: pointsRecords[0] || null,
            display_role: user.role === 'admin' ? 'admin' : profiles[0]?.user_type || 'participant'
          };
        })
      );
      
      return enrichedUsers.sort((a, b) => 
        new Date(b.created_date) - new Date(a.created_date)
      );
    },
    staleTime: 30000
  });

  // Invite user mutation
  const inviteMutation = useMutation({
    mutationFn: async ({ emails, role, message }) => {
      const response = await base44.functions.invoke('inviteUser', {
        emails,
        role,
        message
      });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['all-users']);
      setInviteDialogOpen(false);
      setInviteEmails('');
      setInviteMessage('');
      toast.success(data.summary || 'Invitations sent successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to send invitations');
    }
  });

  // Update user role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ email, role }) => {
      const response = await base44.functions.invoke('updateUserRole', {
        targetUserEmail: email,
        newRole: role
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['all-users']);
      setEditDialogOpen(false);
      setSelectedUser(null);
      toast.success('User role updated successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to update user role');
    }
  });

  // Delete user mutation
  const deleteMutation = useMutation({
    mutationFn: async (email) => {
      const response = await base44.functions.invoke('deleteUser', {
        targetUserEmail: email
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['all-users']);
      setDeleteDialogOpen(false);
      setSelectedUser(null);
      toast.success('User deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to delete user');
    }
  });

  // Suspend user mutation
  const suspendMutation = useMutation({
    mutationFn: async ({ email, reason, duration_days }) => {
      const response = await base44.functions.invoke('suspendUser', {
        targetUserEmail: email,
        reason,
        duration_days: parseInt(duration_days)
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['all-users']);
      setSuspendDialogOpen(false);
      setSelectedUser(null);
      setSuspendReason('');
      toast.success('User suspended successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to suspend user');
    }
  });

  const handleInvite = () => {
    const emailList = inviteEmails
      .split(/[,\n]/)
      .map(e => e.trim())
      .filter(e => e.length > 0);

    if (emailList.length === 0) {
      toast.error('Please enter at least one email address');
      return;
    }

    inviteMutation.mutate({
      emails: emailList,
      role: inviteRole,
      message: inviteMessage
    });
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setEditRole(user.display_role);
    setEditDialogOpen(true);
  };

  const handleUpdateRole = () => {
    updateRoleMutation.mutate({
      email: selectedUser.email,
      role: editRole
    });
  };

  const handleDelete = (user) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const handleSuspend = (user) => {
    setSelectedUser(user);
    setSuspendDialogOpen(true);
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading || !currentUser) {
    return <LoadingSpinner className="min-h-[60vh]" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-int-navy flex items-center gap-2">
            <Users className="h-8 w-8 text-int-orange" />
            User Management
          </h1>
          <p className="text-slate-600 mt-1">
            Manage users, roles, and access permissions
          </p>
        </div>
        <Button
          onClick={() => setInviteDialogOpen(true)}
          className="bg-int-orange hover:bg-[#C46322]"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Invite Users
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-slate-600">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-int-navy">{users.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-slate-600">Admins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {users.filter(u => u.role === 'admin').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-slate-600">Facilitators</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {users.filter(u => u.display_role === 'facilitator').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-slate-600">Participants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {users.filter(u => u.display_role === 'participant').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          {loadingUsers ? (
            <div className="p-12">
              <LoadingSpinner />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Points</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => {
                  const roleConfig = ROLES.find(r => r.value === user.display_role) || ROLES[2];
                  const isCurrentUser = user.email === currentUser.email;
                  
                  return (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-int-orange/10 flex items-center justify-center">
                            <span className="text-int-orange font-semibold">
                              {user.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-slate-900">
                              {user.full_name || 'No name'}
                              {isCurrentUser && (
                                <Badge variant="outline" className="ml-2 text-xs">You</Badge>
                              )}
                            </div>
                            <div className="text-xs text-slate-500">
                              {user.profile?.department || 'No department'}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="h-3 w-3 text-slate-400" />
                          <span className="text-sm">{user.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={roleConfig.color}>
                          {roleConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          <UserCheck className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium">
                          {user.points?.total_points?.toLocaleString() || 0}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Calendar className="h-3 w-3" />
                          {new Date(user.created_date).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(user)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Role
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleSuspend(user)}
                              disabled={isCurrentUser}
                            >
                              <Ban className="h-4 w-4 mr-2" />
                              Suspend
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(user)}
                              disabled={isCurrentUser}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Invite Dialog */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite New Users</DialogTitle>
            <DialogDescription>
              Send invitations to join the platform. Only @intinc.com emails are allowed.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Email Addresses (one per line or comma-separated)
              </label>
              <Textarea
                value={inviteEmails}
                onChange={(e) => setInviteEmails(e.target.value)}
                placeholder="john.doe@intinc.com&#10;jane.smith@intinc.com"
                rows={4}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Role</label>
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="participant">Participant</SelectItem>
                  <SelectItem value="facilitator">Facilitator</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Personal Message (optional)
              </label>
              <Textarea
                value={inviteMessage}
                onChange={(e) => setInviteMessage(e.target.value)}
                placeholder="Welcome to our team!"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setInviteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleInvite}
              disabled={inviteMutation.isPending}
              className="bg-int-orange hover:bg-[#C46322]"
            >
              {inviteMutation.isPending ? 'Sending...' : 'Send Invitations'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User Role</DialogTitle>
            <DialogDescription>
              Change the role for {selectedUser?.full_name || selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">New Role</label>
              <Select value={editRole} onValueChange={setEditRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="participant">Participant</SelectItem>
                  <SelectItem value="facilitator">Facilitator</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdateRole}
              disabled={updateRoleMutation.isPending}
              className="bg-int-orange hover:bg-[#C46322]"
            >
              {updateRoleMutation.isPending ? 'Updating...' : 'Update Role'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Delete User
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedUser?.full_name || selectedUser?.email}?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">
              This will permanently remove the user and their data from the system.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => deleteMutation.mutate(selectedUser.email)}
              disabled={deleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suspend Dialog */}
      <Dialog open={suspendDialogOpen} onOpenChange={setSuspendDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspend User</DialogTitle>
            <DialogDescription>
              Temporarily suspend {selectedUser?.full_name || selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Reason</label>
              <Textarea
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                placeholder="Reason for suspension..."
                rows={3}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Duration (days)</label>
              <Input
                type="number"
                value={suspendDuration}
                onChange={(e) => setSuspendDuration(e.target.value)}
                min="1"
                max="365"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSuspendDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() =>
                suspendMutation.mutate({
                  email: selectedUser.email,
                  reason: suspendReason,
                  duration_days: suspendDuration
                })
              }
              disabled={suspendMutation.isPending}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {suspendMutation.isPending ? 'Suspending...' : 'Suspend User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}