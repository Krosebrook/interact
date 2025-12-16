/**
 * EMPLOYEE DIRECTORY - Admin View
 * View and search all employee profiles with RBAC
 */

import React, { useState } from 'react';
import { useUserData } from '../components/hooks/useUserData.jsx';
import { useQuery } from '@tanstack/react-query';
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
  Users
} from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';

export default function EmployeeDirectory() {
  const { user, loading: userLoading, isAdmin } = useUserData(true, true);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');

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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-int-navy mb-2">Employee Directory</h1>
          <p className="text-slate-600">{employees.length} employees • View profiles and team insights</p>
        </div>
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
            <EmployeeCard key={employee.id} employee={employee} />
          ))}
        </div>
      )}
    </div>
  );
}

function EmployeeCard({ employee }) {
  const { profile, points } = employee;
  
  return (
    <Card className="p-4 hover:shadow-lg transition-shadow">
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

      {/* View Profile Button */}
      <Link to={createPageUrl('PublicProfile') + `?email=${employee.email}`}>
        <Button variant="outline" className="w-full" size="sm">
          View Profile
        </Button>
      </Link>
    </Card>
  );
}