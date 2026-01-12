import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Shield, 
  Users, 
  UserCog,
  Sparkles,
  Check,
  ArrowRight,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  Info
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

// Default roles to create during setup
const DEFAULT_ROLES = [
  {
    role_name: 'Facilitator',
    role_key: 'facilitator',
    description: 'Can create and manage events, activities, and view team analytics',
    hierarchy_level: 50,
    is_system_role: true,
    permissions: {
      events: { create: true, view_all: true, view_own: true, edit_own: true, cancel: true },
      activities: { create: true, view: true, edit: true },
      analytics: { view_basic: true, view_facilitator_metrics: true },
      teams: { manage_own: true, invite_members: true },
      users: { view_all: false },
      gamification: { award_points: true }
    }
  },
  {
    role_name: 'Team Lead',
    role_key: 'team_lead',
    description: 'Manages team members and can view team-level analytics',
    hierarchy_level: 40,
    is_system_role: true,
    permissions: {
      events: { view_all: true, view_own: true },
      activities: { view: true },
      analytics: { view_basic: true },
      teams: { manage_own: true, invite_members: true },
      users: { view_all: false },
      gamification: { award_points: true }
    }
  },
  {
    role_name: 'Participant',
    role_key: 'participant',
    description: 'Regular team member who can attend events and participate in activities',
    hierarchy_level: 10,
    is_system_role: true,
    permissions: {
      events: { view_own: true },
      activities: { view: true },
      analytics: { view_basic: false },
      teams: { invite_members: false },
      users: { view_all: false },
      gamification: {}
    }
  },
  {
    role_name: 'HR Admin',
    role_key: 'hr_admin',
    description: 'Full access to analytics, user management, and platform configuration',
    hierarchy_level: 80,
    is_system_role: true,
    permissions: {
      events: { create: true, view_all: true, edit_all: true, delete: true, cancel: true },
      activities: { create: true, view: true, edit: true, delete: true },
      analytics: { view_basic: true, view_detailed: true, view_facilitator_metrics: true, export: true },
      teams: { create: true, manage_all: true, invite_members: true },
      users: { view_all: true, manage_roles: true, invite: true },
      gamification: { manage_badges: true, manage_rewards: true, award_points: true }
    }
  }
];

const SETUP_STEPS = [
  { id: 'welcome', title: 'Welcome', icon: Sparkles },
  { id: 'roles', title: 'Create Roles', icon: Shield },
  { id: 'assign', title: 'Assign Users', icon: Users },
  { id: 'complete', title: 'Complete', icon: CheckCircle2 }
];

export default function RoleManagementSetup({ onComplete }) {
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedRoles, setSelectedRoles] = useState(
    DEFAULT_ROLES.map(r => r.role_key)
  );
  const [createdRoles, setCreatedRoles] = useState([]);
  const [isCreating, setIsCreating] = useState(false);

  const createRolesMutation = useMutation({
    mutationFn: async (roles) => {
      const created = [];
      for (const role of roles) {
        const result = await base44.entities.UserRole.create(role);
        created.push(result);
      }
      return created;
    },
    onSuccess: (data) => {
      setCreatedRoles(data);
      queryClient.invalidateQueries(['user-roles']);
      toast.success(`${data.length} roles created successfully!`);
      setCurrentStep(2);
    },
    onError: (error) => {
      toast.error('Failed to create roles: ' + error.message);
    }
  });

  const handleCreateRoles = async () => {
    setIsCreating(true);
    const rolesToCreate = DEFAULT_ROLES.filter(r => selectedRoles.includes(r.role_key));
    await createRolesMutation.mutateAsync(rolesToCreate);
    setIsCreating(false);
  };

  const toggleRole = (roleKey) => {
    setSelectedRoles(prev => 
      prev.includes(roleKey) 
        ? prev.filter(k => k !== roleKey)
        : [...prev, roleKey]
    );
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <WelcomeStep onNext={() => setCurrentStep(1)} />;
      case 1:
        return (
          <RolesStep 
            selectedRoles={selectedRoles}
            toggleRole={toggleRole}
            onNext={handleCreateRoles}
            onBack={() => setCurrentStep(0)}
            isCreating={isCreating}
          />
        );
      case 2:
        return (
          <AssignStep 
            createdRoles={createdRoles}
            onNext={() => setCurrentStep(3)}
            onBack={() => setCurrentStep(1)}
          />
        );
      case 3:
        return <CompleteStep onComplete={onComplete} />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4" data-b44-sync="true" data-feature="admin" data-component="rolemanagementsetup">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between relative">
          {/* Progress Line */}
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-slate-200 -z-10" />
          <div 
            className="absolute top-5 left-0 h-0.5 bg-int-orange transition-all duration-500 -z-10"
            style={{ width: `${(currentStep / (SETUP_STEPS.length - 1)) * 100}%` }}
          />
          
          {SETUP_STEPS.map((step, index) => {
            const Icon = step.icon;
            const isComplete = index < currentStep;
            const isCurrent = index === currentStep;
            
            return (
              <div key={step.id} className="flex flex-col items-center">
                <div 
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                    ${isComplete ? 'bg-int-orange text-white' : ''}
                    ${isCurrent ? 'bg-int-navy text-white ring-4 ring-int-orange/20' : ''}
                    ${!isComplete && !isCurrent ? 'bg-slate-100 text-slate-400' : ''}
                  `}
                >
                  {isComplete ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                </div>
                <span className={`
                  mt-2 text-xs font-medium
                  ${isCurrent ? 'text-int-navy' : 'text-slate-500'}
                `}>
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function WelcomeStep({ onNext }) {
  return (
    <Card className="border-0 shadow-xl">
      <CardHeader className="text-center pb-2">
        <div className="w-16 h-16 bg-gradient-to-br from-int-orange to-int-gold rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Shield className="h-8 w-8 text-white" />
        </div>
        <CardTitle className="text-2xl">Role Management Setup</CardTitle>
        <CardDescription className="text-base max-w-lg mx-auto">
          Set up roles and permissions to control who can do what in your INTeract platform.
          This wizard will help you create the essential roles for your organization.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* How it works */}
        <div className="grid md:grid-cols-3 gap-4 py-4">
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            <h4 className="font-semibold text-slate-900 mb-1">Define Roles</h4>
            <p className="text-sm text-slate-600">Create roles like Facilitator, Team Lead, or Participant</p>
          </div>
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <UserCog className="h-6 w-6 text-purple-600" />
            </div>
            <h4 className="font-semibold text-slate-900 mb-1">Set Permissions</h4>
            <p className="text-sm text-slate-600">Control access to events, analytics, and team management</p>
          </div>
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <h4 className="font-semibold text-slate-900 mb-1">Assign Users</h4>
            <p className="text-sm text-slate-600">Assign roles to team members based on their responsibilities</p>
          </div>
        </div>

        {/* Info box */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
          <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900">First-time users</h4>
            <p className="text-sm text-blue-700">
              When new users log in for the first time, they'll be prompted to select their role. 
              Admins can also manually assign roles at any time.
            </p>
          </div>
        </div>

        <div className="flex justify-center pt-4">
          <Button 
            size="lg"
            className="bg-int-orange hover:bg-[#C46322] px-8"
            onClick={onNext}
          >
            Get Started
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function RolesStep({ selectedRoles, toggleRole, onNext, onBack, isCreating }) {
  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle>Select Roles to Create</CardTitle>
        <CardDescription>
          Choose which roles you want to set up. You can customize permissions later.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {DEFAULT_ROLES.map(role => (
          <div 
            key={role.role_key}
            className={`
              p-4 rounded-xl border-2 transition-all cursor-pointer
              ${selectedRoles.includes(role.role_key) 
                ? 'border-int-orange bg-int-orange/5' 
                : 'border-slate-200 hover:border-slate-300'}
            `}
            onClick={() => toggleRole(role.role_key)}
          >
            <div className="flex items-start gap-4">
              <Checkbox 
                checked={selectedRoles.includes(role.role_key)}
                onCheckedChange={() => toggleRole(role.role_key)}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-slate-900">{role.role_name}</h4>
                  <Badge variant="outline" className="text-xs">
                    Level {role.hierarchy_level}
                  </Badge>
                </div>
                <p className="text-sm text-slate-600 mb-3">{role.description}</p>
                
                {/* Permission preview */}
                <div className="flex flex-wrap gap-1">
                  {Object.entries(role.permissions).map(([category, perms]) => {
                    const activePerms = Object.entries(perms).filter(([_, v]) => v);
                    if (activePerms.length === 0) return null;
                    return (
                      <Badge key={category} variant="secondary" className="text-xs">
                        {category}: {activePerms.length}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ))}

        <div className="flex justify-between pt-6">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button 
            className="bg-int-orange hover:bg-[#C46322]"
            onClick={onNext}
            disabled={selectedRoles.length === 0 || isCreating}
          >
            {isCreating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating Roles...
              </>
            ) : (
              <>
                Create {selectedRoles.length} Role{selectedRoles.length !== 1 ? 's' : ''}
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function AssignStep({ createdRoles, onNext, onBack }) {
  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <CardTitle>Roles Created Successfully!</CardTitle>
            <CardDescription>
              {createdRoles.length} roles are now available in your system
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Created roles summary */}
        <div className="grid gap-3">
          {createdRoles.map(role => (
            <div 
              key={role.id}
              className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-int-orange" />
                <span className="font-medium">{role.role_name}</span>
              </div>
              <Badge variant="outline">Level {role.hierarchy_level}</Badge>
            </div>
          ))}
        </div>

        {/* Next steps info */}
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
          <h4 className="font-medium text-amber-900 mb-2">How to assign roles to users:</h4>
          <ol className="text-sm text-amber-800 space-y-2 list-decimal list-inside">
            <li>Go to <strong>Settings → Role Management</strong></li>
            <li>Click <strong>"Assign Role"</strong> button</li>
            <li>Select a user from the dropdown</li>
            <li>Choose the appropriate role</li>
            <li>Click <strong>"Assign Role"</strong> to confirm</li>
          </ol>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
          <h4 className="font-medium text-blue-900 mb-2">Self-registration:</h4>
          <p className="text-sm text-blue-800">
            New users without an assigned role will be prompted to select their role type 
            (Facilitator or Participant) when they first log in. Admins can change this later.
          </p>
        </div>

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button 
            className="bg-int-orange hover:bg-[#C46322]"
            onClick={onNext}
          >
            Continue to Finish
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function CompleteStep({ onComplete }) {
  return (
    <Card className="border-0 shadow-xl text-center">
      <CardContent className="py-12">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
          className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle2 className="h-10 w-10 text-white" />
        </motion.div>
        
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Setup Complete!</h2>
        <p className="text-slate-600 max-w-md mx-auto mb-8">
          Your role management system is now configured. You can manage roles and 
          assign users from the Settings page at any time.
        </p>

        <div className="grid md:grid-cols-2 gap-4 max-w-lg mx-auto mb-8">
          <div className="p-4 bg-slate-50 rounded-xl text-left">
            <h4 className="font-semibold text-slate-900 mb-1">Manage Roles</h4>
            <p className="text-sm text-slate-600">Settings → Role Management</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl text-left">
            <h4 className="font-semibold text-slate-900 mb-1">View Users</h4>
            <p className="text-sm text-slate-600">Settings → Team Members</p>
          </div>
        </div>

        <Button 
          size="lg"
          className="bg-int-orange hover:bg-[#C46322] px-8"
          onClick={onComplete}
        >
          Go to Dashboard
          <ArrowRight className="h-5 w-5 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}