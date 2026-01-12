import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Users, 
  UserPlus, 
  Mail, 
  Crown, 
  Shield, 
  MoreVertical,
  UserMinus,
  Check,
  X,
  Send
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const ROLE_CONFIG = {
  leader: { label: 'Leader', icon: Crown, color: 'text-yellow-500', badge: 'bg-yellow-100 text-yellow-800' },
  'co-leader': { label: 'Co-Leader', icon: Shield, color: 'text-blue-500', badge: 'bg-blue-100 text-blue-800' },
  organizer: { label: 'Organizer', icon: Users, color: 'text-purple-500', badge: 'bg-purple-100 text-purple-800' },
  member: { label: 'Member', icon: Users, color: 'text-slate-500', badge: 'bg-slate-100 text-slate-800' }
};

export default function TeamMemberManager({ teamId, team, currentUserEmail, isLeader }) {
  const queryClient = useQueryClient();
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [inviteMessage, setInviteMessage] = useState('');

  const { data: memberships = [] } = useQuery({
    queryKey: ['team-memberships', teamId],
    queryFn: () => base44.entities.TeamMembership.filter({ team_id: teamId, status: 'active' }),
    enabled: !!teamId
  });

  const { data: invitations = [] } = useQuery({
    queryKey: ['team-invitations', teamId],
    queryFn: () => base44.entities.TeamInvitation.filter({ team_id: teamId, status: 'pending' }),
    enabled: !!teamId && isLeader
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list()
  });

  const inviteMutation = useMutation({
    mutationFn: async () => {
      const user = await base44.auth.me();
      const invitee = users.find(u => u.email === inviteEmail);
      
      // Check if already a member
      const existingMembership = memberships.find(m => m.user_email === inviteEmail);
      if (existingMembership) {
        throw new Error('User is already a team member');
      }

      // Check for pending invitation
      const existingInvite = invitations.find(i => i.invitee_email === inviteEmail);
      if (existingInvite) {
        throw new Error('User already has a pending invitation');
      }

      // Create invitation
      await base44.entities.TeamInvitation.create({
        team_id: teamId,
        team_name: team.team_name,
        invitee_email: inviteEmail,
        invitee_name: invitee?.full_name || inviteEmail,
        inviter_email: user.email,
        inviter_name: user.full_name,
        invited_role: inviteRole,
        message: inviteMessage,
        status: 'pending',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      });

      // Create notification
      await base44.entities.Notification.create({
        user_email: inviteEmail,
        type: 'team_invite',
        title: `Team Invitation: ${team.team_name}`,
        message: `${user.full_name} has invited you to join ${team.team_name}`,
        icon: '👥',
        action_url: '/Teams'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['team-invitations']);
      toast.success('Invitation sent!');
      setShowInviteDialog(false);
      setInviteEmail('');
      setInviteRole('member');
      setInviteMessage('');
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ membershipId, newRole }) => {
      await base44.entities.TeamMembership.update(membershipId, { role: newRole });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['team-memberships']);
      toast.success('Role updated!');
    }
  });

  const removeMemberMutation = useMutation({
    mutationFn: async (membershipId) => {
      await base44.entities.TeamMembership.update(membershipId, { status: 'removed' });
      await base44.entities.Team.update(teamId, {
        member_count: Math.max(0, (team.member_count || 1) - 1)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['team-memberships']);
      queryClient.invalidateQueries(['teams']);
      toast.success('Member removed');
    }
  });

  const cancelInviteMutation = useMutation({
    mutationFn: async (invitationId) => {
      await base44.entities.TeamInvitation.update(invitationId, { status: 'expired' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['team-invitations']);
      toast.success('Invitation cancelled');
    }
  });

  const getMemberUser = (email) => users.find(u => u.email === email);

  return (
    <div className="space-y-6" data-b44-sync="true" data-feature="teams" data-component="teammembermanager">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-int-navy">Team Members</h3>
          <p className="text-sm text-slate-600">
            {memberships.length} / {team.max_members} members
          </p>
        </div>
        {isLeader && (
          <Button 
            onClick={() => setShowInviteDialog(true)}
            className="bg-int-orange hover:bg-[#C46322] text-white"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Invite Member
          </Button>
        )}
      </div>

      <Tabs defaultValue="members">
        <TabsList>
          <TabsTrigger value="members">
            <Users className="h-4 w-4 mr-2" />
            Members ({memberships.length})
          </TabsTrigger>
          {isLeader && (
            <TabsTrigger value="invitations">
              <Mail className="h-4 w-4 mr-2" />
              Pending ({invitations.length})
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="members" className="space-y-3 mt-4">
          {memberships
            .sort((a, b) => {
              const order = { leader: 0, 'co-leader': 1, organizer: 2, member: 3 };
              return order[a.role] - order[b.role];
            })
            .map((membership, index) => {
              const user = getMemberUser(membership.user_email);
              const roleConfig = ROLE_CONFIG[membership.role] || ROLE_CONFIG.member;
              const RoleIcon = roleConfig.icon;
              const canManage = isLeader && membership.role !== 'leader';

              return (
                <motion.div
                  key={membership.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-int-navy text-white flex items-center justify-center font-bold">
                          {(user?.full_name || membership.user_email)[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold flex items-center gap-2">
                            {user?.full_name || membership.user_email}
                            <Badge className={roleConfig.badge}>
                              <RoleIcon className={`h-3 w-3 mr-1 ${roleConfig.color}`} />
                              {roleConfig.label}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-500">{membership.user_email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right text-sm">
                          <p className="font-medium text-int-orange">{membership.points_contributed || 0} pts</p>
                          <p className="text-slate-500">{membership.events_attended_for_team || 0} events</p>
                        </div>

                        {canManage && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => updateRoleMutation.mutate({ 
                                  membershipId: membership.id, 
                                  newRole: 'co-leader' 
                                })}
                              >
                                <Shield className="h-4 w-4 mr-2" />
                                Make Co-Leader
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => updateRoleMutation.mutate({ 
                                  membershipId: membership.id, 
                                  newRole: 'organizer' 
                                })}
                              >
                                <Users className="h-4 w-4 mr-2" />
                                Make Organizer
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => updateRoleMutation.mutate({ 
                                  membershipId: membership.id, 
                                  newRole: 'member' 
                                })}
                              >
                                <Users className="h-4 w-4 mr-2" />
                                Set as Member
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => removeMemberMutation.mutate(membership.id)}
                                className="text-red-600"
                              >
                                <UserMinus className="h-4 w-4 mr-2" />
                                Remove from Team
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
        </TabsContent>

        {isLeader && (
          <TabsContent value="invitations" className="space-y-3 mt-4">
            {invitations.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Mail className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No pending invitations</p>
              </div>
            ) : (
              invitations.map((invitation) => (
                <Card key={invitation.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-slate-400" />
                      <div>
                        <p className="font-medium">{invitation.invitee_name || invitation.invitee_email}</p>
                        <p className="text-sm text-slate-500">
                          Invited as {ROLE_CONFIG[invitation.invited_role]?.label || 'Member'}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => cancelInviteMutation.mutate(invitation.id)}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>
        )}
      </Tabs>

      {/* Invite Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>
              Send an invitation to join {team.team_name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label>Email Address</Label>
              <Input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="colleague@company.com"
              />
            </div>

            <div>
              <Label>Role</Label>
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="organizer">Organizer</SelectItem>
                  <SelectItem value="co-leader">Co-Leader</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Personal Message (optional)</Label>
              <Input
                value={inviteMessage}
                onChange={(e) => setInviteMessage(e.target.value)}
                placeholder="Hey, join our team!"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowInviteDialog(false)} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={() => inviteMutation.mutate()}
              disabled={!inviteEmail || inviteMutation.isLoading}
              className="flex-1 bg-int-orange hover:bg-[#C46322] text-white"
            >
              <Send className="h-4 w-4 mr-2" />
              Send Invitation
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}