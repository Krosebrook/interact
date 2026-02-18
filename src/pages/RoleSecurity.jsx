import React from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Users, Key, AlertTriangle } from 'lucide-react';
import RolePermissionMatrix from '@/components/admin/RolePermissionMatrix';
import SecureUserInvitation from '@/components/admin/SecureUserInvitation';
import { Badge } from '@/components/ui/badge';

export default function RoleSecurity() {
  const { user } = useAuth();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
            <Shield className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Role & Security Management</h1>
            <p className="text-slate-600">Manage user roles, permissions, and access control</p>
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-red-900 flex items-center gap-2">
                Admin Access Required
                <Badge variant="destructive">Current: {user?.role}</Badge>
              </h3>
              <p className="text-sm text-red-800 mt-1">
                You are managing critical security settings. All role assignments are logged and auditable.
                Follow principle of least privilege - only grant permissions that users absolutely need.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="invite" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="invite" className="gap-2">
            <Users className="h-4 w-4" />
            Invite Users
          </TabsTrigger>
          <TabsTrigger value="roles" className="gap-2">
            <Key className="h-4 w-4" />
            Role Matrix
          </TabsTrigger>
          <TabsTrigger value="guide" className="gap-2">
            <Shield className="h-4 w-4" />
            Security Guide
          </TabsTrigger>
        </TabsList>

        <TabsContent value="invite" className="space-y-6">
          <SecureUserInvitation />
        </TabsContent>

        <TabsContent value="roles" className="space-y-6">
          <RolePermissionMatrix />
        </TabsContent>

        <TabsContent value="guide" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Beta Testing Security Best Practices</CardTitle>
              <CardDescription>Guidelines for safely onboarding beta testers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4 text-sm">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <h4 className="font-semibold text-slate-900 mb-2">1. Use Appropriate Roles</h4>
                  <ul className="space-y-1 text-slate-700 list-disc list-inside">
                    <li><strong>Employee role</strong> for most beta testers testing end-user experience</li>
                    <li><strong>Team Lead role</strong> for testers who need to manage small teams</li>
                    <li><strong>Ops role</strong> for testers helping manage content and events</li>
                    <li><strong>Admin role</strong> only for trusted co-founders or senior leadership</li>
                  </ul>
                </div>

                <div className="p-4 bg-slate-50 rounded-lg">
                  <h4 className="font-semibold text-slate-900 mb-2">2. Entity-Level Security</h4>
                  <p className="text-slate-700 mb-2">
                    All entities have role-based permissions configured. Key protections:
                  </p>
                  <ul className="space-y-1 text-slate-700 list-disc list-inside">
                    <li>Employees can only edit their own UserProfile</li>
                    <li>Survey responses are anonymized (min 5 responses)</li>
                    <li>HR data only accessible to hr and admin roles</li>
                    <li>User invitations only manageable by admin</li>
                    <li>Recognition posts visible company-wide unless marked private</li>
                  </ul>
                </div>

                <div className="p-4 bg-slate-50 rounded-lg">
                  <h4 className="font-semibold text-slate-900 mb-2">3. Monitor and Audit</h4>
                  <p className="text-slate-700">
                    All role assignments and permission changes are logged in the AuditLog entity.
                    Regularly review who has elevated access and revoke when testing is complete.
                  </p>
                </div>

                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <h4 className="font-semibold text-amber-900 mb-2">⚠️ Never Do This</h4>
                  <ul className="space-y-1 text-amber-800 list-disc list-inside">
                    <li>Don't assign admin role "just to be safe"</li>
                    <li>Don't leave test accounts active after beta period</li>
                    <li>Don't share admin credentials between multiple people</li>
                    <li>Don't skip the elevated role confirmation checkbox</li>
                  </ul>
                </div>

                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">✓ Recommended Workflow</h4>
                  <ol className="space-y-1 text-green-800 list-decimal list-inside">
                    <li>Invite beta testers with <code className="bg-green-100 px-1 rounded">employee</code> role by default</li>
                    <li>Enable "Mark as Beta Tester" flag for tracking</li>
                    <li>Grant elevated roles (ops, hr) only when user specifically needs to test those features</li>
                    <li>Use Beta Access Level to gradually roll out features</li>
                    <li>After beta, convert beta testers to permanent employees or remove accounts</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}