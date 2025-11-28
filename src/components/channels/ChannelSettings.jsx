import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  Hash, 
  Users, 
  Settings,
  UserPlus,
  Trash2,
  LogOut,
  Crown,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { formatUserName } from '../utils/formatters';

export default function ChannelSettings({ open, onOpenChange, channel, user, onChannelDeleted }) {
  const queryClient = useQueryClient();
  const [inviteEmail, setInviteEmail] = useState('');
  const [editedName, setEditedName] = useState(channel?.name || '');
  const [editedDescription, setEditedDescription] = useState(channel?.description || '');

  const isOwner = channel?.owner_email === user?.email;
  const isAdmin = channel?.admin_emails?.includes(user?.email);
  const canManage = isOwner || isAdmin;

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.Channel.update(channel.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['channels']);
      toast.success('Channel updated');
    }
  });

  const inviteMutation = useMutation({
    mutationFn: async (email) => {
      const members = [...(channel.member_emails || [])];
      if (members.includes(email)) {
        throw new Error('User is already a member');
      }
      members.push(email);
      return base44.entities.Channel.update(channel.id, {
        member_emails: members,
        member_count: members.length
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['channels']);
      toast.success('Member invited');
      setInviteEmail('');
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const removeMemberMutation = useMutation({
    mutationFn: async (email) => {
      const members = (channel.member_emails || []).filter(e => e !== email);
      const admins = (channel.admin_emails || []).filter(e => e !== email);
      return base44.entities.Channel.update(channel.id, {
        member_emails: members,
        admin_emails: admins,
        member_count: members.length
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['channels']);
      toast.success('Member removed');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      // Delete all messages first
      const messages = await base44.entities.ChannelMessage.filter({ channel_id: channel.id });
      for (const msg of messages) {
        await base44.entities.ChannelMessage.delete(msg.id);
      }
      return base44.entities.Channel.delete(channel.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['channels']);
      toast.success('Channel deleted');
      onOpenChange(false);
      onChannelDeleted?.();
    }
  });

  const leaveMutation = useMutation({
    mutationFn: async () => {
      const members = (channel.member_emails || []).filter(e => e !== user.email);
      return base44.entities.Channel.update(channel.id, {
        member_emails: members,
        member_count: members.length
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['channels']);
      toast.success('Left channel');
      onOpenChange(false);
      onChannelDeleted?.();
    }
  });

  const handleSaveChanges = () => {
    updateMutation.mutate({
      name: editedName,
      description: editedDescription
    });
  };

  const handleInvite = (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    inviteMutation.mutate(inviteEmail.trim().toLowerCase());
  };

  if (!channel) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Channel Settings
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-100px)] pr-4 mt-6">
          <div className="space-y-6">
            {/* Channel Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-int-orange to-amber-500 flex items-center justify-center">
                  {channel.icon ? (
                    <span className="text-2xl">{channel.icon}</span>
                  ) : (
                    <Hash className="h-6 w-6 text-white" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{channel.name}</h3>
                  <Badge variant="outline">{channel.type}</Badge>
                </div>
              </div>

              {canManage && (
                <>
                  <div>
                    <Label>Channel Name</Label>
                    <Input
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={editedDescription}
                      onChange={(e) => setEditedDescription(e.target.value)}
                      rows={2}
                      className="mt-1"
                    />
                  </div>
                  <Button 
                    onClick={handleSaveChanges}
                    disabled={updateMutation.isPending}
                    className="w-full bg-int-orange hover:bg-int-orange/90"
                  >
                    Save Changes
                  </Button>
                </>
              )}
            </div>

            <Separator />

            {/* Members */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Members ({channel.member_emails?.length || 0})
                </Label>
              </div>

              {canManage && (
                <form onSubmit={handleInvite} className="flex gap-2 mb-4">
                  <Input
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="Enter email to invite"
                    type="email"
                    className="flex-1"
                  />
                  <Button type="submit" size="icon" disabled={inviteMutation.isPending}>
                    <UserPlus className="h-4 w-4" />
                  </Button>
                </form>
              )}

              <div className="space-y-2">
                {channel.member_emails?.map(email => (
                  <div key={email} className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-medium">
                        {email.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{formatUserName(email)}</p>
                        <p className="text-xs text-slate-500">{email}</p>
                      </div>
                      {email === channel.owner_email && (
                        <Crown className="h-4 w-4 text-amber-500" />
                      )}
                    </div>
                    {canManage && email !== channel.owner_email && email !== user.email && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500"
                        onClick={() => removeMemberMutation.mutate(email)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Danger Zone */}
            <div className="space-y-3">
              {!isOwner && (
                <Button
                  variant="outline"
                  className="w-full text-amber-600 border-amber-200 hover:bg-amber-50"
                  onClick={() => leaveMutation.mutate()}
                  disabled={leaveMutation.isPending}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Leave Channel
                </Button>
              )}

              {isOwner && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Channel
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Channel?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete #{channel.name} and all its messages. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteMutation.mutate()}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}