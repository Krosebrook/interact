import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { UserPlus, AlertCircle, CheckCircle2, Shield } from 'lucide-react';
import { toast } from 'sonner';

const ROLE_INFO = {
  admin: { 
    name: 'Admin', 
    warning: 'FULL ACCESS - Assign only to trusted personnel',
    color: 'destructive'
  },
  ops: { 
    name: 'Operations', 
    warning: 'Can manage content, events, and gamification',
    color: 'default'
  },
  hr: { 
    name: 'HR / People Ops', 
    warning: 'Access to sensitive employee data and analytics',
    color: 'default'
  },
  team_lead: { 
    name: 'Team Lead', 
    warning: 'Can manage their team and create events',
    color: 'default'
  },
  employee: { 
    name: 'Employee', 
    warning: 'Standard employee access - recommended for most users',
    color: 'secondary'
  }
};

export default function SecureUserInvitation() {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('employee');
  const [userType, setUserType] = useState('participant');
  const [isBetaTester, setIsBetaTester] = useState(false);
  const [betaAccessLevel, setBetaAccessLevel] = useState('basic');
  const [message, setMessage] = useState('');
  const [confirmElevated, setConfirmElevated] = useState(false);

  const queryClient = useQueryClient();

  const inviteMutation = useMutation({
    mutationFn: async (inviteData) => {
      // Call backend function to create invitation with extended metadata
      await base44.users.inviteUser(inviteData.email, inviteData.role);
      
      // Create invitation record with additional metadata
      return base44.entities.UserInvitation.create({
        email: inviteData.email,
        role: inviteData.role,
        user_type: inviteData.userType,
        invited_by: inviteData.invitedBy,
        message: inviteData.message,
        token: crypto.randomUUID(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userInvitations'] });
      toast.success('Invitation sent successfully', {
        description: `${email} will receive an invitation email.`
      });
      // Reset form
      setEmail('');
      setRole('employee');
      setUserType('participant');
      setIsBetaTester(false);
      setBetaAccessLevel('basic');
      setMessage('');
      setConfirmElevated(false);
    },
    onError: (error) => {
      toast.error('Failed to send invitation', {
        description: error.message
      });
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Require confirmation for elevated roles
    if (['admin', 'ops', 'hr'].includes(role) && !confirmElevated) {
      toast.error('Please confirm you want to assign this elevated role');
      return;
    }

    const user = await base44.auth.me();
    
    inviteMutation.mutate({
      email,
      role,
      userType,
      isBetaTester,
      betaAccessLevel: isBetaTester ? betaAccessLevel : null,
      message,
      invitedBy: user.email
    });
  };

  const selectedRoleInfo = ROLE_INFO[role];
  const isElevatedRole = ['admin', 'ops', 'hr'].includes(role);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Invite New User
        </CardTitle>
        <CardDescription>
          Send an invitation with specific role and permissions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@company.com"
              required
            />
          </div>

          {/* Role Selection */}
          <div>
            <Label htmlFor="role">Role *</Label>
            <Select value={role} onValueChange={(val) => {
              setRole(val);
              setConfirmElevated(false); // Reset confirmation when role changes
            }}>
              <SelectTrigger id="role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="employee">Employee (Standard Access)</SelectItem>
                <SelectItem value="team_lead">Team Lead</SelectItem>
                <SelectItem value="ops">Operations</SelectItem>
                <SelectItem value="hr">HR / People Ops</SelectItem>
                <SelectItem value="admin">Admin (Full Access)</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Role Warning */}
            {selectedRoleInfo && (
              <div className={`mt-2 p-3 rounded-lg ${
                role === 'admin' ? 'bg-red-50 border border-red-200' : 'bg-blue-50 border border-blue-200'
              }`}>
                <div className="flex gap-2">
                  {role === 'admin' ? (
                    <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                  ) : (
                    <Shield className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  )}
                  <p className={`text-sm ${role === 'admin' ? 'text-red-800' : 'text-blue-800'}`}>
                    {selectedRoleInfo.warning}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Elevated Role Confirmation */}
          {isElevatedRole && (
            <div className="flex items-start gap-2 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <Checkbox
                id="confirm-elevated"
                checked={confirmElevated}
                onCheckedChange={setConfirmElevated}
                className="mt-1"
              />
              <label htmlFor="confirm-elevated" className="text-sm text-orange-900 cursor-pointer">
                <span className="font-semibold">I confirm</span> that I want to assign the <Badge variant="outline">{role}</Badge> role
                with elevated permissions to this user. I understand this grants significant system access.
              </label>
            </div>
          )}

          {/* User Type (for events/activities) */}
          <div>
            <Label htmlFor="userType">User Type</Label>
            <Select value={userType} onValueChange={setUserType}>
              <SelectTrigger id="userType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="participant">Participant</SelectItem>
                <SelectItem value="facilitator">Facilitator</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500 mt-1">For events and activities management</p>
          </div>

          {/* Beta Tester Flag */}
          <div className="flex items-center gap-2 pt-2">
            <Checkbox
              id="beta-tester"
              checked={isBetaTester}
              onCheckedChange={setIsBetaTester}
            />
            <label htmlFor="beta-tester" className="text-sm font-medium">
              Mark as Beta Tester
            </label>
          </div>

          {isBetaTester && (
            <div>
              <Label htmlFor="betaLevel">Beta Access Level</Label>
              <Select value={betaAccessLevel} onValueChange={setBetaAccessLevel}>
                <SelectTrigger id="betaLevel">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic (Limited features)</SelectItem>
                  <SelectItem value="advanced">Advanced (Most features)</SelectItem>
                  <SelectItem value="full">Full (All features)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Personal Message */}
          <div>
            <Label htmlFor="message">Personal Message (Optional)</Label>
            <Input
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Welcome to the team!"
            />
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={inviteMutation.isPending || (isElevatedRole && !confirmElevated)}
            className="w-full"
          >
            {inviteMutation.isPending ? (
              'Sending...'
            ) : (
              <>
                <UserPlus className="h-4 w-4 mr-2" />
                Send Invitation
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}