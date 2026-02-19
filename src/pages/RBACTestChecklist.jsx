import { useState } from 'react';
import { useAuth } from '../components/auth/AuthProvider';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, Check, X, Eye, AlertCircle } from 'lucide-react';
import { 
  PUBLIC_ROUTES, 
  ADMIN_ONLY_ROUTES, 
  FACILITATOR_ROUTES, 
  PARTICIPANT_ROUTES, 
  SHARED_AUTHENTICATED_ROUTES,
  canAccessRoute 
} from '../components/auth/RouteConfig';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';

export default function RBACTestChecklist() {
  const { user, normalizedRole } = useAuth();
  const [selectedRole, setSelectedRole] = useState(normalizedRole);

  const roles = ['admin', 'facilitator', 'participant'];

  // Build access matrix for selected role
  const getAccessMatrix = (role) => {
    const accessible = [];
    const blocked = [];

    // Combine all routes
    const allRoutes = [
      ...PUBLIC_ROUTES,
      ...ADMIN_ONLY_ROUTES,
      ...FACILITATOR_ROUTES,
      ...PARTICIPANT_ROUTES,
      ...SHARED_AUTHENTICATED_ROUTES
    ];

    // Deduplicate
    const uniqueRoutes = [...new Set(allRoutes)];

    uniqueRoutes.forEach((pageName) => {
      const hasAccess = canAccessRoute(pageName, role);

      if (hasAccess) {
        let reason = 'Shared route';
        if (PUBLIC_ROUTES.includes(pageName)) reason = 'Public page';
        else if (ADMIN_ONLY_ROUTES.includes(pageName)) reason = 'Admin access';
        else if (FACILITATOR_ROUTES.includes(pageName)) reason = 'Facilitator access';
        else if (PARTICIPANT_ROUTES.includes(pageName)) reason = 'Participant access';
        
        accessible.push({ page: pageName, reason });
      } else {
        let reason = 'Insufficient permissions';
        if (ADMIN_ONLY_ROUTES.includes(pageName)) reason = 'Requires: admin';
        else if (FACILITATOR_ROUTES.includes(pageName)) reason = 'Requires: facilitator';
        else if (PARTICIPANT_ROUTES.includes(pageName)) reason = 'Requires: participant';
        
        blocked.push({ page: pageName, reason });
      }
    });

    return { accessible, blocked };
  };

  const matrix = getAccessMatrix(selectedRole);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="h-8 w-8 text-int-orange" />
          <h1 className="text-3xl font-bold text-slate-900">RBAC Test Checklist</h1>
        </div>
        <p className="text-slate-600">Role-Based Access Control testing matrix for all routes</p>
      </div>

      {/* Current Session Info */}
      <Card className="mb-6 border-int-orange/30 bg-int-orange/5">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Current User</p>
              <p className="text-lg font-semibold text-slate-900">{user?.email}</p>
              <p className="text-sm text-slate-500 mt-1">
                Role: <Badge className="bg-int-orange">{user?.role}</Badge> | 
                Type: <Badge variant="outline">{user?.user_type || 'N/A'}</Badge> | 
                Normalized: <Badge variant="outline">{normalizedRole}</Badge>
              </p>
            </div>
            {user?.role === 'admin' && (
              <div className="text-sm text-slate-600">
                <AlertCircle className="h-4 w-4 inline mr-1" />
                Admin can view all roles
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Role Selector */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Test as Role</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            {roles.map((role) => (
              <Button
                key={role}
                variant={selectedRole === role ? 'default' : 'outline'}
                onClick={() => setSelectedRole(role)}
                className={selectedRole === role ? 'bg-int-orange' : ''}
              >
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </Button>
            ))}
          </div>
          <p className="text-xs text-slate-500 mt-3">
            Select a role to see its access matrix. Your actual session role: <strong>{normalizedRole}</strong>
          </p>
        </CardContent>
      </Card>

      {/* Access Matrix Table */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Accessible Routes */}
        <Card className="border-green-200">
          <CardHeader className="bg-green-50">
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Check className="h-5 w-5" />
              Can Access ({matrix.accessible.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 max-h-96 overflow-y-auto">
            <div className="space-y-2">
              {matrix.accessible.map(({ page, reason }) => (
                <div key={page} className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{page}</p>
                    <p className="text-xs text-slate-500">{reason}</p>
                  </div>
                  <Link to={createPageUrl(page)}>
                    <Button size="sm" variant="ghost">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Blocked Routes */}
        <Card className="border-red-200">
          <CardHeader className="bg-red-50">
            <CardTitle className="flex items-center gap-2 text-red-800">
              <X className="h-5 w-5" />
              Blocked From ({matrix.blocked.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 max-h-96 overflow-y-auto">
            <div className="space-y-2">
              {matrix.blocked.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">
                  This role has access to all routes
                </p>
              ) : (
                matrix.blocked.map(({ page, reason }) => (
                  <div key={page} className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">{page}</p>
                      <p className="text-xs text-red-600">{reason}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Stats */}
      <Card className="mt-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-slate-900">{matrix.accessible.length + matrix.blocked.length}</p>
              <p className="text-sm text-slate-600">Total Routes</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{matrix.accessible.length}</p>
              <p className="text-sm text-slate-600">Accessible</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{matrix.blocked.length}</p>
              <p className="text-sm text-slate-600">Blocked</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Testing Instructions */}
      <Card className="mt-6 border-blue-200 bg-blue-50/50">
        <CardHeader>
          <CardTitle className="text-blue-900">Testing Instructions</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-800 space-y-2">
          <p><strong>1. Manual Role Testing:</strong> Have admin create test users with each role</p>
          <p><strong>2. Login as each user:</strong> Open incognito windows for parallel testing</p>
          <p><strong>3. Verify access:</strong> Click "eye" icon to visit accessible pages</p>
          <p><strong>4. Verify blocks:</strong> Try visiting blocked pages directly (should redirect)</p>
          <p><strong>5. Check RoleGate:</strong> Confirm 403 page shows for unauthorized access</p>
        </CardContent>
      </Card>
    </div>
  );
}