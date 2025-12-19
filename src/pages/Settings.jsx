import React from 'react';
import { useUserData } from '../components/hooks/useUserData.jsx';
import { useUserPermissions } from '../components/hooks/useRBACGuard';
import UserManagementPanel from '../components/admin/UserManagementPanel';
import BulkUserImport from '../components/admin/BulkUserImport';
import SurveyManagement from '../components/admin/SurveyManagement';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AISettingsPanel from '../components/settings/AISettingsPanel';
import TeamsConfigPanel from '../components/teams/TeamsConfigPanel';
import GoogleCalendarConnect from '../components/integrations/GoogleCalendarConnect';
import RoleManagement from '../components/admin/RoleManagement';
import UserTypeManager from '../components/admin/UserTypeManager';
import { Settings as SettingsIcon, Sparkles, Shield, MessageSquare, Users, FileText, Plug } from 'lucide-react';

function SettingsContent() {
  const { user, loading } = useUserData(true, true);
  const permissions = useUserPermissions(user);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin h-8 w-8 border-4 border-int-orange border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Settings</h1>
          <p className="text-slate-600">Configure system, users, and integrations</p>
        </div>
        <SettingsIcon className="h-8 w-8 text-slate-400" />
      </div>

      <Tabs defaultValue="invites" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="invites" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Invitations
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Roles
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            AI
          </TabsTrigger>
          <TabsTrigger value="teams" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Teams
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-2">
            <Plug className="h-4 w-4" />
            Integrations
          </TabsTrigger>
          <TabsTrigger value="surveys" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Surveys
          </TabsTrigger>
        </TabsList>

        <TabsContent value="invites" className="mt-6">
          {permissions.canInviteUsers ? (
            <UserManagementPanel currentUser={user} />
          ) : (
            <p className="text-slate-600">You don't have permission to manage invitations</p>
          )}
        </TabsContent>

        <TabsContent value="roles" className="mt-6">
          <RoleManagement />
        </TabsContent>

        <TabsContent value="ai" className="mt-6">
          <AISettingsPanel />
        </TabsContent>

        <TabsContent value="teams" className="mt-6">
          <TeamsConfigPanel />
        </TabsContent>

        <TabsContent value="integrations" className="mt-6">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-int-navy mb-4">External Integrations</h2>
            <GoogleCalendarConnect />
          </div>
        </TabsContent>

        <TabsContent value="surveys" className="mt-6">
          <SurveyManagement />
        </TabsContent>

        <TabsContent value="users" className="mt-6">
          <div className="space-y-6">
            {permissions.canInviteUsers && (
              <>
                <UserManagementPanel currentUser={user} />
                <BulkUserImport currentUser={user} />
              </>
            )}
            <UserTypeManager />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function Settings() {
  return <SettingsContent />;
}