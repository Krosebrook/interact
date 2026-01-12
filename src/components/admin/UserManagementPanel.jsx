/**
 * USER MANAGEMENT PANEL
 * Comprehensive user admin controls with invite, role management, and suspension
 */

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  UserPlus, 
  Users, 
  Shield, 
  Ban, 
  CheckCircle,
  Clock,
  Mail,
  XCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { isOwner, hasPermission, getEffectiveRole } from '../lib/rbac/roles';

export default function UserManagementPanel({ currentUser }) {
  const queryClient = useQueryClient();

  // Fetch pending invitations
  const { data: invitations = [], isLoading } = useQuery({
    queryKey: ['user-invitations'],
    queryFn: () => base44.entities.UserInvitation.filter({ status: 'pending' }),
    enabled: hasPermission(currentUser, 'INVITE_USERS')
  });

  const revokeInviteMutation = useMutation({
    mutationFn: async (inviteId) => {
      await base44.entities.UserInvitation.update(inviteId, { status: 'revoked' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['user-invitations']);
      toast.success('Invitation revoked');
    }
  });

  if (!hasPermission(currentUser, 'INVITE_USERS')) {
    return null;
  }

  return (
    <div className="space-y-6" data-b44-sync="true" data-feature="admin" data-component="usermanagementpanel">
      {/* Pending Invitations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            Pending Invitations
          </CardTitle>
        </CardHeader>
        <CardContent>
          {invitations.length === 0 ? (
            <p className="text-sm text-slate-600 text-center py-4">
              No pending invitations
            </p>
          ) : (
            <div className="space-y-3">
              {invitations.map(invite => (
                <div key={invite.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Mail className="h-4 w-4 text-slate-400" />
                      <span className="font-medium text-slate-900">{invite.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <Badge variant="outline" className="text-xs">
                        {invite.role === 'admin' ? 'Admin' : invite.user_type || 'Employee'}
                      </Badge>
                      <span>Invited by {invite.invited_by}</span>
                      <span>• {new Date(invite.created_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => revokeInviteMutation.mutate(invite.id)}
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-blue-100">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {invitations.filter(i => i.status === 'pending').length}
              </p>
              <p className="text-sm text-slate-600">Pending</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-emerald-100">
              <CheckCircle className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {invitations.filter(i => i.status === 'accepted').length}
              </p>
              <p className="text-sm text-slate-600">Accepted</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-red-100">
              <Ban className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {invitations.filter(i => i.status === 'expired' || i.status === 'revoked').length}
              </p>
              <p className="text-sm text-slate-600">Expired/Revoked</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}