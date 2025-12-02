import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProtectedRoute from '../components/common/ProtectedRoute';
import AISettingsPanel from '../components/settings/AISettingsPanel';
import TeamsConfigPanel from '../components/teams/TeamsConfigPanel';
import RoleManagement from '../components/admin/RoleManagement';
import UserTypeManager from '../components/admin/UserTypeManager';
import { Settings as SettingsIcon, Sparkles, Shield, MessageSquare, Users } from 'lucide-react';

function SettingsContent() {
  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Settings</h1>
          <p className="text-slate-600">Configure AI recommendations and integrations</p>
        </div>
        <SettingsIcon className="h-8 w-8 text-slate-400" />
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            User Management
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Roles & Permissions
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            AI Settings
          </TabsTrigger>
          <TabsTrigger value="teams" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Microsoft Teams
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-6">
          <UserTypeManager />
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
      </Tabs>
    </div>
  );
}

export default function Settings() {
  return (
    <ProtectedRoute requireAdmin>
      <SettingsContent />
    </ProtectedRoute>
  );
}