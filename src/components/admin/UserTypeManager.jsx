import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  UserCog,
  Shield,
  User,
  Filter,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

const USER_TYPES = [
  { value: 'facilitator', label: 'Facilitator', icon: UserCog, color: 'bg-purple-100 text-purple-800' },
  { value: 'participant', label: 'Participant', icon: User, color: 'bg-blue-100 text-blue-800' },
];

export default function UserTypeManager() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  const { data: users = [], isLoading, refetch } = useQuery({
    queryKey: ['all-users-management'],
    queryFn: () => base44.entities.User.list()
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, userType }) => {
      // Note: We use the User entity update, but this requires admin privileges
      return await base44.entities.User.update(userId, { user_type: userType });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['all-users-management']);
      toast.success('User type updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update user: ' + error.message);
    }
  });

  const handleUserTypeChange = (userId, newType) => {
    updateUserMutation.mutate({ userId, userType: newType });
  };

  // Filter and search users
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = 
      filterType === 'all' || 
      (filterType === 'unassigned' && !user.user_type) ||
      user.user_type === filterType;

    return matchesSearch && matchesFilter;
  });

  const getUserTypeBadge = (userType, role) => {
    if (role === 'admin') {
      return <Badge className="bg-int-orange text-white">Admin</Badge>;
    }
    if (!userType) {
      return <Badge variant="outline" className="text-slate-500">Not Assigned</Badge>;
    }
    const type = USER_TYPES.find(t => t.value === userType);
    return <Badge className={type?.color}>{type?.label || userType}</Badge>;
  };

  const unassignedCount = users.filter(u => !u.user_type && u.role !== 'admin').length;

  return (
    <Card className="border-0 shadow-lg" data-b44-sync="true" data-feature="admin" data-component="usertypemanager">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-int-orange" />
              User Type Management
            </CardTitle>
            <CardDescription>
              Assign user types to control dashboard access and permissions
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mt-4">
          <div className="bg-slate-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-slate-900">{users.length}</p>
            <p className="text-xs text-slate-500">Total Users</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-purple-600">
              {users.filter(u => u.user_type === 'facilitator').length}
            </p>
            <p className="text-xs text-purple-600">Facilitators</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-blue-600">
              {users.filter(u => u.user_type === 'participant').length}
            </p>
            <p className="text-xs text-blue-600">Participants</p>
          </div>
          <div className="bg-amber-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-amber-600">{unassignedCount}</p>
            <p className="text-xs text-amber-600">Unassigned</p>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Search and Filter */}
        <div className="flex gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              <SelectItem value="unassigned">Unassigned</SelectItem>
              <SelectItem value="facilitator">Facilitators</SelectItem>
              <SelectItem value="participant">Participants</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Users Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-int-orange" />
          </div>
        ) : (
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>User</TableHead>
                  <TableHead>System Role</TableHead>
                  <TableHead>User Type</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                      No users found matching your criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map(user => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-slate-600">
                              {user.full_name?.charAt(0) || user.email?.charAt(0) || '?'}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{user.full_name || 'No Name'}</p>
                            <p className="text-sm text-slate-500">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          <Shield className="h-3 w-3 mr-1" />
                          {user.role || 'user'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {getUserTypeBadge(user.user_type, user.role)}
                      </TableCell>
                      <TableCell className="text-right">
                        {user.role !== 'admin' && (
                          <Select
                            value={user.user_type || ''}
                            onValueChange={(value) => handleUserTypeChange(user.id, value)}
                          >
                            <SelectTrigger className="w-36">
                              <SelectValue placeholder="Assign type..." />
                            </SelectTrigger>
                            <SelectContent>
                              {USER_TYPES.map(type => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}