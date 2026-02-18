import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Shield, Users, Eye, Settings, AlertTriangle } from 'lucide-react';

const ROLE_DEFINITIONS = {
  admin: {
    name: 'Admin',
    description: 'Full system access - use sparingly',
    color: 'bg-red-100 text-red-800',
    icon: Shield,
    defaultPermissions: [
      'manage_users',
      'view_analytics',
      'manage_content',
      'manage_events',
      'manage_gamification',
      'view_all_profiles',
      'manage_integrations',
      'view_hr_data',
      'manage_teams',
      'moderate_content'
    ]
  },
  ops: {
    name: 'Operations',
    description: 'Manage content, events, and day-to-day operations',
    color: 'bg-blue-100 text-blue-800',
    icon: Settings,
    defaultPermissions: [
      'view_analytics',
      'manage_content',
      'manage_events',
      'manage_gamification',
      'view_all_profiles',
      'moderate_content'
    ]
  },
  hr: {
    name: 'HR / People Ops',
    description: 'Access to employee data and analytics',
    color: 'bg-purple-100 text-purple-800',
    icon: Users,
    defaultPermissions: [
      'view_analytics',
      'view_all_profiles',
      'view_hr_data',
      'manage_users',
      'manage_teams'
    ]
  },
  team_lead: {
    name: 'Team Lead',
    description: 'Manage team members and team-specific content',
    color: 'bg-green-100 text-green-800',
    icon: Users,
    defaultPermissions: [
      'manage_events',
      'view_analytics',
      'manage_teams'
    ]
  },
  employee: {
    name: 'Employee',
    description: 'Standard employee access',
    color: 'bg-slate-100 text-slate-800',
    icon: Users,
    defaultPermissions: []
  },
  user: {
    name: 'User (Legacy)',
    description: 'Basic user access - deprecated, use Employee',
    color: 'bg-gray-100 text-gray-600',
    icon: Eye,
    defaultPermissions: []
  }
};

const PERMISSION_DESCRIPTIONS = {
  manage_users: 'Invite, suspend, and manage user accounts',
  view_analytics: 'View platform analytics and reports',
  manage_content: 'Create, edit, and delete content (activities, challenges)',
  manage_events: 'Create and manage events',
  manage_gamification: 'Configure badges, rewards, points, challenges',
  view_all_profiles: 'View all employee profiles (respecting privacy settings)',
  manage_integrations: 'Configure external integrations (Slack, Calendar, etc.)',
  view_hr_data: 'Access sensitive HR data (performance, surveys)',
  manage_teams: 'Create and manage teams',
  moderate_content: 'Moderate user-generated content (recognition, posts)'
};

export default function RolePermissionMatrix() {
  const [expandedRole, setExpandedRole] = useState(null);

  return (
    <div className="space-y-6">
      {/* Warning Banner */}
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-orange-900">Role Assignment Security</h3>
              <p className="text-sm text-orange-800 mt-1">
                Only assign Admin role to trusted personnel. Operations and HR roles have elevated permissions.
                Always follow principle of least privilege - grant only necessary permissions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Role Cards */}
      <div className="grid gap-4">
        {Object.entries(ROLE_DEFINITIONS).map(([roleKey, roleDef]) => {
          const Icon = roleDef.icon;
          const isExpanded = expandedRole === roleKey;

          return (
            <Card key={roleKey} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${roleDef.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {roleDef.name}
                        <Badge variant="outline" className="font-mono text-xs">
                          {roleKey}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {roleDef.description}
                      </CardDescription>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedRole(isExpanded ? null : roleKey)}
                  >
                    {isExpanded ? 'Hide' : 'View'} Permissions
                  </Button>
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent>
                  <div className="space-y-3 pl-11">
                    <p className="text-sm font-medium text-slate-700">Default Permissions:</p>
                    {roleDef.defaultPermissions.length > 0 ? (
                      <div className="space-y-2">
                        {roleDef.defaultPermissions.map((perm) => (
                          <div key={perm} className="flex items-start gap-2 text-sm">
                            <Checkbox checked disabled className="mt-0.5" />
                            <div>
                              <div className="font-medium text-slate-900">{perm.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</div>
                              <div className="text-slate-600 text-xs">{PERMISSION_DESCRIPTIONS[perm]}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500 italic">No elevated permissions</p>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Quick Reference */}
      <Card>
        <CardHeader>
          <CardTitle>Beta Tester Roles - Quick Reference</CardTitle>
          <CardDescription>Recommended roles for beta testing scenarios</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-start p-3 bg-slate-50 rounded-lg">
              <div>
                <span className="font-semibold">Admin Beta Testers:</span>
                <span className="text-slate-600 ml-2">Use <code className="bg-slate-200 px-1 rounded">admin</code> role - full access for testing all features</span>
              </div>
            </div>
            <div className="flex justify-between items-start p-3 bg-slate-50 rounded-lg">
              <div>
                <span className="font-semibold">Operations Beta Testers:</span>
                <span className="text-slate-600 ml-2">Use <code className="bg-slate-200 px-1 rounded">ops</code> role - test content management and events</span>
              </div>
            </div>
            <div className="flex justify-between items-start p-3 bg-slate-50 rounded-lg">
              <div>
                <span className="font-semibold">HR Beta Testers:</span>
                <span className="text-slate-600 ml-2">Use <code className="bg-slate-200 px-1 rounded">hr</code> role - test analytics and employee data</span>
              </div>
            </div>
            <div className="flex justify-between items-start p-3 bg-slate-50 rounded-lg">
              <div>
                <span className="font-semibold">Employee Beta Testers:</span>
                <span className="text-slate-600 ml-2">Use <code className="bg-slate-200 px-1 rounded">employee</code> role - test end-user experience</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}