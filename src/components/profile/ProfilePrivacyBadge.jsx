/**
 * PROFILE PRIVACY BADGE
 * Visual indicator of profile visibility settings
 */

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Globe, Users, Lock } from 'lucide-react';

export default function ProfilePrivacyBadge({ visibility = 'team_only', size = 'default' }) {
  const configs = {
    public: {
      icon: Globe,
      label: 'Public',
      className: 'bg-blue-100 text-blue-700',
      description: 'Visible to all employees'
    },
    team_only: {
      icon: Users,
      label: 'Team Only',
      className: 'bg-slate-100 text-slate-700',
      description: 'Visible to your team'
    },
    private: {
      icon: Lock,
      label: 'Private',
      className: 'bg-purple-100 text-purple-700',
      description: 'Only visible to you and admins'
    }
  };

  const config = configs[visibility] || configs.team_only;
  const Icon = config.icon;

  return (
    <Badge className={`${config.className} ${size === 'sm' ? 'text-xs' : ''}`}>
      <Icon className={`${size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} mr-1`} />
      {config.label}
    </Badge>
  );
}